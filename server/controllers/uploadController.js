const fs = require("fs");
const path = require("path");

const {
  Writable,
  Readable,
} = require("stream");

const {
  pipeline,
} = require("stream/promises");

const CSVParser =
  require("../streams/csvParser");

const DataTransformStream =
  require("../streams/transformStream");

const applyMapping =
  require("../utils/applyMapping");

const validateRow =
  require("../services/validateRow");

const validateMapping =
  require("../utils/validateMapping");

const generateAutoMapping =
  require("../utils/autoMapping");

const parseJSONFile =
  require("../utils/jsonParser");

const parseXLSXFile =
  require("../utils/xlsxParser");

const {
  createDataset,
  insertRowsInBulk,
} = require("../services/datasetService");


// ========================================
// GET CSV HEADERS
// ========================================

const getCSVHeaders = async (
  filePath
) => {
  return new Promise(
    (resolve, reject) => {

      const stream =
        fs.createReadStream(
          filePath,
          {
            encoding: "utf8",
          }
        );

      let firstLine = "";
      let resolved = false;

      stream.on(
        "data",
        (chunk) => {

          firstLine += chunk;

          const newlineIndex =
            firstLine.indexOf(
              "\n"
            );

          if (
            newlineIndex !== -1 &&
            !resolved
          ) {
            resolved = true;

            stream.destroy();

            const headerLine =
              firstLine
                .slice(
                  0,
                  newlineIndex
                )
                .replace(
                  /\r$/,
                  ""
                );

            const headers =
              headerLine
                .split(",")
                .map(
                  (header) =>
                    header.trim()
                )
                .filter(Boolean);

            resolve(headers);
          }
        }
      );

      stream.on(
        "error",
        reject
      );

      stream.on(
        "close",
        () => {

          if (
            !resolved &&
            firstLine
          ) {
            resolved = true;

            const headers =
              firstLine
                .replace(
                  /\r$/,
                  ""
                )
                .split(",")
                .map(
                  (header) =>
                    header.trim()
                )
                .filter(Boolean);

            resolve(headers);
          }
        }
      );
    }
  );
};


// ========================================
// COUNT CSV ROWS FOR PROGRESS
// ========================================

const countCSVRows = async (
  filePath
) => {
  return new Promise(
    (resolve, reject) => {

      const stream =
        fs.createReadStream(
          filePath,
          {
            encoding: "utf8",
          }
        );

      let rows = 0;

      stream.on(
        "data",
        (chunk) => {

          for (
            let i = 0;
            i < chunk.length;
            i++
          ) {
            if (
              chunk[i] === "\n"
            ) {
              rows++;
            }
          }
        }
      );

      stream.on(
        "end",
        () => {

          // Remove header row
          resolve(
            Math.max(
              rows - 1,
              0
            )
          );
        }
      );

      stream.on(
        "error",
        reject
      );
    }
  );
};


// ========================================
// CREATE DATABASE WRITER
// ========================================

const createDatabaseWriter = (
  processRow
) => {

  return new Writable({

    objectMode: true,

    write(
      row,
      encoding,
      callback
    ) {

      processRow(row)
        .then(() => {
          callback();
        })
        .catch(
          callback
        );
    },

  });
};


// ========================================
// UPLOAD FILE
// ========================================

const uploadFile = async (
  req,
  res
) => {

  let filePath = null;

  const socketId =
    req.body.socketId;

  const io =
    req.io;


  res.on(
    "finish",
    () => {
      console.log(
        "Response finished with status:",
        res.statusCode
      );
    }
  );


  try {

    console.log(
      "================================="
    );

    console.log(
      "UPLOAD REQUEST RECEIVED"
    );


    // ====================================
    // CHECK FILE
    // ====================================

    if (
      !req.file
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "No file uploaded",
        });
    }


    filePath =
      req.file.path;


    console.log(
      "File name:",
      req.file.originalname
    );

    console.log(
      "File path:",
      filePath
    );


    // ====================================
    // GET FILE EXTENSION
    // ====================================

    const fileExtension =
      path
        .extname(
          req.file.originalname
        )
        .toLowerCase();


    // ====================================
    // CHECK FILE TYPE
    // ====================================

    const supportedTypes = [
      ".csv",
      ".json",
      ".xlsx",
    ];


    if (
      !supportedTypes.includes(
        fileExtension
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only CSV, JSON and XLSX files are supported.",
        });
    }


    // ====================================
    // VARIABLES
    // ====================================

    let originalColumns = [];

    let jsonRows = [];

    let xlsxRows = [];

    let mapping = {};

    const transformCode =
      req.body.transformCode ||
      null;


    // ====================================
    // READ CSV
    // ====================================

    if (
      fileExtension === ".csv"
    ) {

      originalColumns =
        await getCSVHeaders(
          filePath
        );
    }


    // ====================================
    // READ JSON
    // ====================================

    if (
      fileExtension === ".json"
    ) {

      console.log(
        "Starting JSON parsing..."
      );

      const parsedJSON =
        await parseJSONFile(
          filePath
        );

      jsonRows =
        parsedJSON.rows;

      originalColumns =
        parsedJSON.columns;


      if (
        !Array.isArray(
          jsonRows
        ) ||
        jsonRows.length === 0
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "JSON file is empty or invalid.",
          });
      }
    }


    // ====================================
    // READ XLSX
    // ====================================

    if (
      fileExtension === ".xlsx"
    ) {

      console.log(
        "Starting XLSX parsing..."
      );

      const parsedXLSX =
        await parseXLSXFile(
          filePath
        );

      xlsxRows =
        parsedXLSX.rows;

      originalColumns =
        parsedXLSX.columns;


      if (
        !Array.isArray(
          xlsxRows
        ) ||
        xlsxRows.length === 0
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "XLSX file is empty or invalid.",
          });
      }
    }


    // ====================================
    // CHECK COLUMNS
    // ====================================

    if (
      originalColumns.length === 0
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "No columns found in file.",
        });
    }


    // ====================================
    // GET MANUAL MAPPING
    // ====================================

    if (
      req.body.mapping
    ) {

      try {

        mapping =
          JSON.parse(
            req.body.mapping
          );

      } catch (
        error
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid column mapping format.",
          });
      }
    }


    // ====================================
    // AUTO MAPPING
    // ====================================

    if (
      Object.keys(
        mapping
      ).length === 0
    ) {

      mapping =
        generateAutoMapping(
          originalColumns
        );
    }


    // ====================================
    // VALIDATE MAPPING
    // ====================================

    const mappingValidation =
      validateMapping(
        mapping
      );


    if (
      !mappingValidation.isValid
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            mappingValidation.message,
        });
    }


    // ====================================
    // CREATE DATASET
    // ====================================

    const dataset =
      await createDataset({

        datasetName:
          req.body.datasetName ||
          req.file.originalname,

        originalFileName:
          req.file.originalname,

        fileType:
          fileExtension
            .replace(
              ".",
              ""
            ),

        totalRows: 0,

        validRows: 0,

        invalidRows: 0,

        columns: [],

      });


    // ====================================
    // SOCKET START EVENT
    // ====================================

    if (
      socketId &&
      io
    ) {

      io
        .to(
          socketId
        )
        .emit(
          "upload-progress",
          {
            progress: 0,
            message:
              "Processing started",
          }
        );
    }


    // ====================================
    // PROCESSING VARIABLES
    // ====================================

    const BATCH_SIZE =
      1000;

    let totalRows =
      0;

    let validRows =
      0;

    let invalidRows =
      0;

    let batch =
      [];

    const previewRows =
      [];


    // ====================================
    // TOTAL ROWS FOR PROGRESS
    // ====================================

    let totalRowsForProgress =
      0;


    if (
      fileExtension === ".json"
    ) {

      totalRowsForProgress =
        jsonRows.length;
    }


    if (
      fileExtension === ".xlsx"
    ) {

      totalRowsForProgress =
        xlsxRows.length;
    }


    if (
      fileExtension === ".csv"
    ) {

      totalRowsForProgress =
        await countCSVRows(
          filePath
        );
    }


    // ====================================
    // COMMON ROW PROCESSOR
    // ====================================

    const processRow =
      async (
        row
      ) => {

        totalRows++;


        // ==================================
        // REAL-TIME PROGRESS
        // ==================================

        if (
          socketId &&
          io &&
          totalRowsForProgress > 0
        ) {

          const progress =
            Math.min(
              Math.round(
                (
                  totalRows /
                  totalRowsForProgress
                ) *
                100
              ),
              99
            );


          io
            .to(
              socketId
            )
            .emit(
              "upload-progress",
              {
                progress,

                message:
                  `Processing row ${totalRows} of ${totalRowsForProgress}`,
              }
            );
        }


        // ==================================
        // APPLY MAPPING
        // ==================================

        const mappedRow =
          Object.keys(
            mapping
          ).length > 0
            ? applyMapping(
                row,
                mapping
              )
            : row;


        // ==================================
        // VALIDATE ROW
        // ==================================

        const validation =
          validateRow(
            mappedRow
          );


        if (
          validation.isValid
        ) {

          validRows++;

        } else {

          invalidRows++;
        }


        // ==================================
        // STORE PREVIEW
        // ==================================

        if (
          previewRows.length <
          100
        ) {

          previewRows.push({

            data:
              mappedRow,

            isValid:
              validation.isValid,

            errors:
              validation.errors,

          });
        }


        // ==================================
        // ADD TO BATCH
        // ==================================

        batch.push({

          data:
            mappedRow,

          isValid:
            validation.isValid,

          errors:
            validation.errors,

        });


        // ==================================
        // BULK INSERT
        // ==================================

        if (
          batch.length >=
          BATCH_SIZE
        ) {

          await insertRowsInBulk(
            dataset._id,
            batch
          );

          batch =
            [];
        }
      };


    // ====================================
    // PROCESS JSON
    // ====================================

    if (
      fileExtension === ".json"
    ) {

      console.log(
        "Starting JSON processing..."
      );


      const jsonStream =
        Readable.from(
          jsonRows,
          {
            objectMode: true,
          }
        );


      const transformer =
        new DataTransformStream({
          transformCode,
        });


      const databaseWriter =
        createDatabaseWriter(
          processRow
        );


      await pipeline(
        jsonStream,
        transformer,
        databaseWriter
      );


      console.log(
        `JSON processing completed: ${totalRows} rows`
      );
    }


    // ====================================
    // PROCESS XLSX
    // ====================================

    if (
      fileExtension === ".xlsx"
    ) {

      console.log(
        "Starting XLSX processing..."
      );


      const xlsxStream =
        Readable.from(
          xlsxRows,
          {
            objectMode: true,
          }
        );


      const transformer =
        new DataTransformStream({
          transformCode,
        });


      const databaseWriter =
        createDatabaseWriter(
          processRow
        );


      await pipeline(
        xlsxStream,
        transformer,
        databaseWriter
      );


      console.log(
        `XLSX processing completed: ${totalRows} rows`
      );
    }


    // ====================================
    // PROCESS CSV
    // ====================================

    if (
      fileExtension === ".csv"
    ) {

      console.log(
        "Starting CSV processing..."
      );


      const fileStream =
        fs.createReadStream(
          filePath,
          {
            encoding:
              "utf8",

            highWaterMark:
              64 * 1024,
          }
        );


      const parser =
        new CSVParser();


      const transformer =
        new DataTransformStream({
          transformCode,
        });


      const databaseWriter =
        createDatabaseWriter(
          processRow
        );


      await pipeline(
        fileStream,
        parser,
        transformer,
        databaseWriter
      );


      console.log(
        `CSV processing completed: ${totalRows} rows`
      );
    }


    // ====================================
    // INSERT REMAINING BATCH
    // ====================================

    if (
      batch.length > 0
    ) {

      await insertRowsInBulk(
        dataset._id,
        batch
      );

      batch =
        [];
    }


    // ====================================
    // FINAL DATASET COLUMNS
    // ====================================

    const mappedColumns =
      Object.keys(
        mapping
      ).length > 0
        ? Object.values(
            mapping
          )
        : originalColumns;


    // ====================================
    // UPDATE DATASET
    // ====================================

    dataset.totalRows =
      totalRows;

    dataset.validRows =
      validRows;

    dataset.invalidRows =
      invalidRows;

    dataset.columns =
      mappedColumns;

    dataset.mapping =
      mapping;


    console.log(
      "Saving dataset metadata..."
    );


    await dataset.save();


    console.log(
      "Dataset metadata saved successfully"
    );


    // ====================================
    // FINAL SOCKET EVENT
    // ====================================

    if (
      socketId &&
      io
    ) {

      io
        .to(
          socketId
        )
        .emit(
          "upload-progress",
          {
            progress: 100,

            message:
              "Dataset processing completed",
          }
        );
    }


    // ====================================
    // SUCCESS RESPONSE
    // ====================================

    return res
      .status(200)
      .json({

        success:
          true,

        message:
          "Dataset processed successfully",

        dataset: {

          datasetId:
            dataset._id,

          datasetName:
            dataset.datasetName,

          originalFileName:
            req.file.originalname,

          fileType:
            dataset.fileType,

          fileSize:
            req.file.size,

          totalRows,

          validRows,

          invalidRows,

          columns:
            mappedColumns,

          mapping,

          preview:
            previewRows,

        },
      });


  } catch (
    error
  ) {

    console.error(
      "Upload Error:",
      error
    );


    if (
      !res.headersSent
    ) {

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Dataset processing failed",

          error:
            error.message,

        });
    }


  } finally {

    // ====================================
    // DELETE TEMPORARY FILE
    // ====================================

    if (
      filePath
    ) {

      fs.unlink(
        filePath,
        (
          error
        ) => {

          if (
            error
          ) {

            console.error(
              "Temporary file deletion failed:",
              error.message
            );
          }
        }
      );
    }
  }
};


module.exports = {
  uploadFile,
};
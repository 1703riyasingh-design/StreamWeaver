const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { pipeline } = require("stream/promises");

const CSVParser = require("../streams/csvParser");
const DataTransformStream = require("../streams/transformStream");

const applyMapping = require("../utils/applyMapping");
const validateRow = require("../services/validateRow");
const validateMapping = require("../utils/validateMapping");
const generateAutoMapping = require("../utils/autoMapping");
const parseJSONFile = require("../utils/jsonParser");

const {
  createDataset,
  insertRowsInBulk,
} = require("../services/datasetService");


// ========================================
// GET CSV HEADERS
// ========================================

const getCSVHeaders = async (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, {
      encoding: "utf8",
    });

    let firstLine = "";

    stream.on("data", (chunk) => {
      firstLine += chunk;

      const newlineIndex =
        firstLine.indexOf("\n");

      if (newlineIndex !== -1) {
        stream.destroy();

        const headerLine =
          firstLine
            .slice(0, newlineIndex)
            .replace(/\r$/, "");

        const headers =
          headerLine
            .split(",")
            .map((header) =>
              header.trim()
            )
            .filter(Boolean);

        resolve(headers);
      }
    });

    stream.on("error", reject);

    stream.on("close", () => {
      if (!firstLine.includes("\n")) {
        const headers =
          firstLine
            .replace(/\r$/, "")
            .split(",")
            .map((header) =>
              header.trim()
            )
            .filter(Boolean);

        resolve(headers);
      }
    });
  });
};


// ========================================
// UPLOAD FILE
// ========================================

const uploadFile = async (req, res) => {
  let filePath = null;

  try {

    // ------------------------------------
    // CHECK FILE
    // ------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = req.file.path;

    const fileExtension =
      path
        .extname(req.file.originalname)
        .toLowerCase();


    // ------------------------------------
    // CHECK FILE TYPE
    // ------------------------------------

    if (
      fileExtension !== ".csv" &&
      fileExtension !== ".json"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only CSV and JSON files are supported.",
      });
    }


    // ------------------------------------
    // VARIABLES
    // ------------------------------------

    let originalColumns = [];
    let jsonRows = [];
    let mapping = {};


    // ====================================
    // GET COLUMNS FROM CSV
    // ====================================

    if (fileExtension === ".csv") {
      originalColumns =
        await getCSVHeaders(filePath);
    }


    // ====================================
    // GET ROWS + COLUMNS FROM JSON
    // ====================================

    if (fileExtension === ".json") {
      const parsedJSON =
        await parseJSONFile(filePath);

      jsonRows =
        parsedJSON.rows;

      originalColumns =
        parsedJSON.columns;

      if (
        !Array.isArray(jsonRows) ||
        jsonRows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "JSON file is empty or invalid.",
        });
      }
    }


    // ====================================
    // GET MANUAL MAPPING
    // ====================================

    if (req.body.mapping) {
      try {
        mapping =
          JSON.parse(req.body.mapping);
      } catch (error) {
        return res.status(400).json({
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
      Object.keys(mapping).length === 0
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
      validateMapping(mapping);

    if (!mappingValidation.isValid) {
      return res.status(400).json({
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
          fileExtension === ".csv"
            ? "csv"
            : "json",

        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        columns: [],
      });


    // ====================================
    // PROCESSING VARIABLES
    // ====================================

    const BATCH_SIZE = 5000;

    let totalRows = 0;
    let validRows = 0;
    let invalidRows = 0;

    let batch = [];

    const previewRows = [];


    // ====================================
    // COMMON ROW PROCESSOR
    // ====================================

    const processRow = async (
      row
    ) => {

      totalRows++;


      // Apply mapping
      const mappedRow =
        Object.keys(mapping).length > 0
          ? applyMapping(
              row,
              mapping
            )
          : row;


      // Validate row
      const validation =
        validateRow(mappedRow);


      if (validation.isValid) {
        validRows++;
      } else {
        invalidRows++;
      }


      // Preview first 100 rows
      if (
        previewRows.length < 100
      ) {
        previewRows.push({
          data: mappedRow,
          isValid:
            validation.isValid,
          errors:
            validation.errors,
        });
      }


      // Add to batch
      batch.push({
        data: mappedRow,
        isValid:
          validation.isValid,
        errors:
          validation.errors,
      });


      // Bulk insert
      if (
        batch.length >=
        BATCH_SIZE
      ) {
        await insertRowsInBulk(
          dataset._id,
          batch
        );

        batch = [];
      }
    };


    // ====================================
    // PROCESS JSON
    // ====================================

    if (
      fileExtension === ".json"
    ) {

      for (
        const row of jsonRows
      ) {
        await processRow(row);
      }
    }


    // ====================================
    // PROCESS CSV
    // ====================================

    if (
      fileExtension === ".csv"
    ) {

      const fileStream =
        fs.createReadStream(
          filePath,
          {
            encoding: "utf8",
            highWaterMark:
              64 * 1024,
          }
        );


      const parser =
        new CSVParser();


      const transformer =
        new DataTransformStream();


      const databaseWriter =
        new Writable({

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
              .catch((error) => {
                callback(error);
              });
          },
        });


      await pipeline(
        fileStream,
        parser,
        transformer,
        databaseWriter
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

      batch = [];
    }


    // ====================================
    // FINAL DATASET COLUMNS
    // ====================================

    const mappedColumns =
      Object.keys(mapping).length > 0
        ? Object.values(mapping)
        : originalColumns;


    // ====================================
    // UPDATE DATASET METADATA
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


    await dataset.save();


    console.log(
      `${fileExtension.toUpperCase()} processing completed: ${totalRows} rows`
    );


    // ====================================
    // SUCCESS RESPONSE
    // ====================================

    return res.status(200).json({
      success: true,

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


  } catch (error) {

    console.error(
      "Upload Error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,

        message:
          "Dataset processing failed",

        error:
          error.message,
      });
    }

  } finally {

    // ------------------------------------
    // DELETE TEMP FILE
    // ------------------------------------

    if (filePath) {
      fs.unlink(
        filePath,
        (error) => {

          if (error) {
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
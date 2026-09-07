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
const parseXLSXFile = require("../utils/xlsxParser");

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
    let resolved = false;

    stream.on("data", (chunk) => {
      firstLine += chunk;

      const newlineIndex =
        firstLine.indexOf("\n");

      if (
        newlineIndex !== -1 &&
        !resolved
      ) {
        resolved = true;

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
      if (
        !resolved &&
        !firstLine.includes("\n")
      ) {
        resolved = true;

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

const socketId = req.body.socketId;
const io = req.io;

  res.on("finish", () => {
    console.log(
      "Response finished with status:",
      res.statusCode
    );
  });


  try {

    console.log("=================================");
    console.log("UPLOAD REQUEST RECEIVED");

    if (req.file) {
      console.log("File name:", req.file.originalname);
      console.log("File path:", req.file.path);
    }

    console.log("=================================");

    // ====================================
    // CHECK FILE
    // ====================================

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


    // ====================================
    // CHECK FILE TYPE
    // ====================================

    if (
      fileExtension !== ".csv" &&
      fileExtension !== ".json" &&
      fileExtension !== ".xlsx"
    ) {
      return res.status(400).json({
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


    // ====================================
    // READ CSV HEADERS
    // ====================================

    if (
      fileExtension === ".csv"
    ) {
      originalColumns =
        await getCSVHeaders(filePath);
    }


    // ====================================
    // READ JSON
    // ====================================

if (
  fileExtension === ".json"
) {

  console.log("Starting JSON parsing...");

  const parsedJSON =
    await parseJSONFile(
      filePath
    );

  console.log("JSON parsed successfully");

  jsonRows =
    parsedJSON.rows;

  originalColumns =
    parsedJSON.columns;

  console.log(
    "JSON rows found:",
    jsonRows.length
  );

  console.log(
    "JSON columns:",
    originalColumns
  );

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

  console.log(
    "XLSX parsed successfully"
  );

  xlsxRows =
    parsedXLSX.rows;

  originalColumns =
    parsedXLSX.columns;

  console.log(
    "XLSX rows found:",
    xlsxRows.length
  );

  console.log(
    "XLSX columns:",
    originalColumns
  );

  if (
    !Array.isArray(xlsxRows) ||
    xlsxRows.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "XLSX file is empty or invalid.",
    });
  }
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

    if (
      !mappingValidation.isValid
    ) {
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
            : fileExtension === ".json"
            ? "json"
            : "xlsx",

        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        columns: [],
      });

      if (socketId && io) {
  io.to(socketId).emit(
    "upload-progress",
    {
      progress: 0,
      message: "Processing started",
    }
  );
}

    // ====================================
    // PROCESSING VARIABLES
    // ====================================

    const BATCH_SIZE = 5000;

    let totalRows = 0;
    let validRows = 0;
    let invalidRows = 0;

    let batch = [];

    const previewRows = [];


    let totalRowsForProgress = 0;

if (fileExtension === ".json") {
  totalRowsForProgress = jsonRows.length;
}

if (fileExtension === ".xlsx") {
  totalRowsForProgress = xlsxRows.length;
}


    // ====================================
    // COMMON ROW PROCESSOR
    // ====================================

    const processRow = async (
      row
    ) => {

      totalRows++;

    
    // ====================================
// REAL-TIME PROGRESS
// ====================================

if (
  socketId &&
  io &&
  totalRowsForProgress > 0
) {
  const progress =
    Math.round(
      (totalRows /
        totalRowsForProgress) *
        100
    );

  io.to(socketId).emit(
    "upload-progress",
    {
      progress,
      message:
        `Processing row ${totalRows} of ${totalRowsForProgress}`,
    }
  );
}


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


      // Preview

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

  console.log(
    "Starting JSON row processing..."
  );

  for (
    const row of jsonRows
  ) {
    await processRow(
      row
    );
  }

  console.log(
    "JSON row processing completed"
  );
}


    // ====================================
    // PROCESS XLSX
    // ====================================

if (
  fileExtension === ".xlsx"
) {

  console.log(
    "Starting XLSX row processing..."
  );

  for (
    const row of xlsxRows
  ) {
    await processRow(row);
  }

  console.log(
    "XLSX row processing completed"
  );
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


    console.log(
      `${fileExtension.toUpperCase()} processing completed: ${totalRows} rows`
    );

console.log(
  "Preparing success response..."
);

console.log(
  "Sending success response to frontend..."
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

    if (
      !res.headersSent
    ) {
      return res.status(500).json({
        success: false,

        message:
          "Dataset processing failed",

        error:
          error.message,
      });
    }

  } finally {

    if (
      filePath
    ) {
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
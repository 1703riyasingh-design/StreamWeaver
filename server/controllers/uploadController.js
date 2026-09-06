const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { pipeline } = require("stream/promises");

const CSVParser = require("../streams/csvParser");
const DataTransformStream = require("../streams/transformStream");
const applyMapping = require("../utils/applyMapping");
const validateRow = require("../services/validateRow");
const validateMapping =
    require("../utils/validateMapping");
const generateAutoMapping =
  require("../utils/autoMapping");

const {
    createDataset,
    insertRowsInBulk
} = require("../services/datasetService");


const getCSVHeaders = async (filePath) => {

    return new Promise((resolve, reject) => {

        const stream = fs.createReadStream(filePath, {
            encoding: "utf8"
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
                        );

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
                        );

                resolve(headers);

            }

        });

    });

};

const uploadFile = async (req, res) => {
    let filePath = null;

    try {
        // Check uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        filePath = req.file.path;

        const fileExtension = path
            .extname(req.file.originalname)
            .toLowerCase();

        // For now, complete CSV streaming first
        if (fileExtension !== ".csv") {
            return res.status(400).json({
                success: false,
                message:
                    "CSV streaming is implemented first. JSON support will be added next."
            });
        }

let mapping = {};

// Get CSV headers first
const originalColumns =
    await getCSVHeaders(filePath);


// If frontend sends manual mapping,
// use that mapping
if (req.body.mapping) {

    try {

        mapping =
            JSON.parse(req.body.mapping);

    } catch (error) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid column mapping format"
        });

    }

}


// If no mapping is provided,
// generate automatic mapping
if (Object.keys(mapping).length === 0) {

    mapping =
        generateAutoMapping(
            originalColumns
        );

}


// Validate final mapping
const mappingValidation =
    validateMapping(mapping);

if (!mappingValidation.isValid) {

    return res.status(400).json({
        success: false,
        message:
            mappingValidation.message
    });

}

          const dataset = await createDataset({
            datasetName: req.body.datasetName ||
                         req.file.originalname,
            originalFileName: req.file.originalname,
            fileType: "csv",
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            columns: []
        });
        
        // Create file read stream
        const fileStream = fs.createReadStream(filePath, {
            encoding: "utf8",
            highWaterMark: 64 * 1024
        });

        // Create CSV parser
        const parser = new CSVParser();

        // Create transformation stream
        const transformer = new DataTransformStream();

        const BATCH_SIZE = 5000;

        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;

        let batch = [];

        // Keep only first 100 rows for preview
        const previewRows = [];

        const databaseWriter = new Writable({
            objectMode: true,

            write: async (row, encoding, callback) => {
                try {
                    totalRows++;

                      const mappedRow =
                        Object.keys(mapping).length > 0
                            ? applyMapping(
                                row,
                                mapping
                            )
                            : row;

                            const validation = validateRow(mappedRow);

                            if (validation.isValid) {
                                    validRows++;
                                } else {
                                    invalidRows++;
                                }

                    // Keep first 100 rows for preview
                   if (previewRows.length < 100) {
                        previewRows.push({
                            data: mappedRow,
                            isValid: validation.isValid,
                            errors: validation.errors
                        });
                    }

                    // Add row to batch
                    batch.push({
                        data: mappedRow,
                        isValid: validation.isValid,
                        errors: validation.errors
                    });

                    // Insert every 5000 rows
                    if (batch.length >= BATCH_SIZE) {
                        await insertRowsInBulk(
                            dataset._id,
                            batch
                        );

                        // Clear batch after successful insertion
                        batch = [];
                    }

                    callback();

                } catch (error) {
                    callback(error);
                }
            },

            final: async (callback) => {
                try {
                    // Insert remaining rows
                    if (batch.length > 0) {
                        await insertRowsInBulk(
                            dataset._id,
                            batch
                        );

                        batch = [];
                    }

                    callback();

                } catch (error) {
                    callback(error);
                }
            }
        });

        // Connect the streams
        await pipeline(
            fileStream,
            parser,
            transformer,
            databaseWriter
        );

        //   const originalColumns =
        //     parser.headers || [];


        const mappedColumns =
            Object.keys(mapping).length > 0
                ? Object.values(mapping)
                : originalColumns;

        // if (batch.length > 0) {
        //     await insertRowsInBulk(
        //         dataset._id,
        //         batch
        //     );

        //     batch = [];
        // }

        // Update dataset metadata
        dataset.totalRows = totalRows;
        dataset.validRows = validRows;
        dataset.invalidRows = invalidRows;
        dataset.columns = mappedColumns;
        dataset.mapping =
            mapping;

        await dataset.save();

        console.log(
            `CSV processing completed: ${totalRows} rows`
        );

        return res.status(200).json({
            success: true,
            message: "CSV streamed and processed successfully",

            dataset: {
                datasetId: dataset._id,
                datasetName: dataset.datasetName,
                originalFileName: req.file.originalname,
                fileType: "csv",
                fileSize: req.file.size,
                totalRows,
                validRows,
                invalidRows,
                columns:  mappedColumns,
                mapping,
                preview: previewRows
            }
        });

    } catch (error) {
        console.error("Upload Error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "File streaming failed",
                error: error.message
            });
        }

    } finally {
        // Delete temporary uploaded file
        if (filePath) {
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error(
                        "Temporary file deletion failed:",
                        error.message
                    );
                }
            });
        }
    }
};

module.exports = {
    uploadFile
};
const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const { pipeline } = require("stream/promises");

const CSVParser = require("../streams/csvParser");
const DataTransformStream = require("../streams/transformStream");

const {
    createDataset,
    insertRowsInBulk
} = require("../services/datasetService");

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

          const dataset = await createDataset({
            datasetName: req.file.originalname,
            originalFileName: req.file.originalname,
            fileType: "csv",
            totalRows: 0,
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

        let batch = [];

        // Keep only first 100 rows for preview
        const previewRows = [];

        const databaseWriter = new Writable({
            objectMode: true,

            write: async (row, encoding, callback) => {
                try {
                    totalRows++;

                    // Keep first 100 rows for preview
                    if (previewRows.length < 100) {
                        previewRows.push(row);
                    }

                    // Add row to batch
                    batch.push(row);

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

        // if (batch.length > 0) {
        //     await insertRowsInBulk(
        //         dataset._id,
        //         batch
        //     );

        //     batch = [];
        // }

        // Update dataset metadata
        dataset.totalRows = totalRows;
        dataset.columns =
            parser.headers || [];

        await dataset.save();

        console.log(
            `CSV processing completed: ${totalRows} rows`
        );

        return res.status(200).json({
            success: true,
            message: "CSV streamed and processed successfully",

            dataset: {
                datasetId: dataset._id,
                originalFileName: req.file.originalname,
                fileType: "csv",
                fileSize: req.file.size,
                totalRows,
                columns: parser.headers || [],
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
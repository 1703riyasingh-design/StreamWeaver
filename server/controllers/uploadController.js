const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");

const CSVParser = require("../streams/csvParser");
const DataTransformStream = require("../streams/transformStream");

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

        // Create file read stream
        const fileStream = fs.createReadStream(filePath, {
            encoding: "utf8",
            highWaterMark: 64 * 1024
        });

        // Create CSV parser
        const parser = new CSVParser();

        // Create transformation stream
        const transformer = new DataTransformStream();

        let totalRows = 0;

        // Keep only first 100 rows for preview
        const previewRows = [];

        transformer.on("data", (row) => {
            totalRows++;

            if (previewRows.length < 100) {
                previewRows.push(row);
            }
        });

        // Connect the streams
        await pipeline(
            fileStream,
            parser,
            transformer
        );

        console.log(
            `CSV processing completed: ${totalRows} rows`
        );

        return res.status(200).json({
            success: true,
            message: "CSV streamed and processed successfully",

            dataset: {
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
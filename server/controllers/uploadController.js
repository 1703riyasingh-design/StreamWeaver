const { createDataset } = require("../services/datasetService");
const CSVParser = require("../streams/csvParser");
const DataTransformStream = require("../streams/transformStream");

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const parser = new CSVParser();
        const transformer = new DataTransformStream();

        const results = [];

        transformer.on("data", (row) => {
            results.push(row);
        });

      transformer.on("end", async () => {
    try {
        const dataset = await createDataset({
            datasetName: req.file.originalname,
            originalFileName: req.file.originalname,
            fileType: req.file.mimetype,
            totalRows: results.length,
            columns: results.length > 0 ? Object.keys(results[0]) : [],
            data: results
        });

        res.status(200).json({
            success: true,
            message: "CSV processed and saved successfully",
            datasetId: dataset._id,
            totalRows: results.length,
            data: results
        });

    } catch (error) {
        console.error("Database Save Error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to save dataset",
                error: error.message
            });
        }
    }
});

        transformer.on("error", (error) => {
            console.error("Transform Error:", error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Data transformation failed",
                    error: error.message
                });
            }
        });

        parser.on("error", (error) => {
            console.error("CSV Parser Error:", error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "CSV parsing failed",
                    error: error.message
                });
            }
        });

        parser.pipe(transformer);

        parser.end(req.file.buffer);

    } catch (error) {
        console.error("Upload Error:", error);

        res.status(500).json({
            success: false,
            message: "File upload failed",
            error: error.message
        });
    }
};

module.exports = {
    uploadFile
};
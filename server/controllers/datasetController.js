const Dataset = require("../models/Dataset");
const DatasetRow = require("../models/DatasetRow");

// GET all datasets
const getAllDatasets = async (req, res) => {
    try {
        const datasets = await Dataset.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: datasets.length,
            datasets
        });

    } catch (error) {
        console.error("Get Datasets Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch datasets",
            error: error.message
        });
    }
};


// GET dataset by ID
const getDatasetById = async (req, res) => {
    try {
        const dataset = await Dataset.findById(
            req.params.id
        );

        if (!dataset) {
            return res.status(404).json({
                success: false,
                message: "Dataset not found"
            });
        }

        return res.status(200).json({
            success: true,
            dataset
        });

    } catch (error) {
        console.error("Get Dataset Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dataset",
            error: error.message
        });
    }
};


// GET dataset rows with pagination
const getDatasetRows = async (req, res) => {
    try {
        const datasetId = req.params.id;

        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit) || 100,
                1
            ),
            1000
        );

        const skip = (page - 1) * limit;

        const [rows, totalRows] = await Promise.all([
            DatasetRow.find({
                datasetId
            })
                .skip(skip)
                .limit(limit)
                .lean(),

            DatasetRow.countDocuments({
                datasetId
            })
        ]);

        return res.status(200).json({
            success: true,

            pagination: {
                page,
                limit,
                totalRows,
                totalPages: Math.ceil(
                    totalRows / limit
                )
            },

            rows
        });

    } catch (error) {
        console.error("Get Dataset Rows Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dataset rows",
            error: error.message
        });
    }
};


module.exports = {
    getAllDatasets,
    getDatasetById,
    getDatasetRows
};
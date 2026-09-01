const express = require("express");

const {
    getAllDatasets,
    getDatasetById,
    getDatasetRows
} = require("../controllers/datasetController");

const router = express.Router();

// Get all datasets
router.get("/", getAllDatasets);

// Get dataset rows
router.get("/:id/rows", getDatasetRows);

// Get single dataset by ID
router.get("/:id", getDatasetById);

module.exports = router;
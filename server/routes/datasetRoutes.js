const express = require("express");

const {
    getAllDatasets,
    getDatasetById,
    getDatasetRows,
    deleteDataset
} = require("../controllers/datasetController");

const router = express.Router();

// Get all datasets
router.get("/", getAllDatasets);

// Get dataset rows
router.get("/:id/rows", getDatasetRows);


// Delete dataset
router.delete("/:id", deleteDataset);

// Get single dataset by ID
router.get("/:id", getDatasetById);

module.exports = router;
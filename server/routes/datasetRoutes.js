const express = require("express");

const {
    getAllDatasets,
    getDatasetById,
    getDatasetRows,
    getValidationSummary,
    deleteDataset,
    getDashboardStats
} = require("../controllers/datasetController");

const router = express.Router();

// Get all datasets
router.get("/", getAllDatasets);

router.get(
    "/dashboard/stats",
    getDashboardStats
);

// Get dataset rows
router.get("/:id/rows", getDatasetRows);

router.get(
    "/:id/validation-summary",
    getValidationSummary
);

// Delete dataset
router.delete("/:id", deleteDataset);

// Get single dataset by ID
router.get("/:id", getDatasetById);



module.exports = router;
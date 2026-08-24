const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();

// Temporary upload directory
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Store uploaded files on disk instead of RAM
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,

    limits: {
        // 5GB maximum file size
        fileSize: 5 * 1024 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".csv", ".json"];

        const extension = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            return cb(
                new Error("Only CSV and JSON files are supported")
            );
        }

        cb(null, true);
    }
});
router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;
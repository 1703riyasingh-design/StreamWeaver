require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5180",
      "http://localhost:5190",
    ],
    methods: ["GET", "POST"],
  },
});

const uploadRoutes = require("./routes/uploadRoutes");
const datasetRoutes = require("./routes/datasetRoutes");

const upload = multer({
  storage: multer.memoryStorage(),
});

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// CORS with specific origin (not wildcard)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5180",
      "http://localhost:5190",
    ],
    credentials: true,
  })
);

// Body parser with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security headers
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");
  // Permissions Policy
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  next();
});

// Hide server info
app.disable("x-powered-by");

// ============================================================
// SOCKET.IO
// ============================================================

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ============================================================
// ROUTES
// ============================================================

app.use("/api", uploadRoutes);
app.use("/api/datasets", datasetRoutes);

app.get("/", (req, res) => {
  res.send("🚀 StreamWeaver Backend Running...");
});

// Login-page branch upload endpoint
app.post("/api/upload-dataset", upload.single("csvFile"), (req, res) => {
  const { datasetName, columnMapping } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "CSV file is required.",
    });
  }

  if (!datasetName) {
    return res.status(400).json({
      message: "Dataset name is required.",
    });
  }

  if (!columnMapping) {
    return res.status(400).json({
      message: "Column mapping is required.",
    });
  }

  console.log("Received dataset upload:", {
    datasetName,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    columnMapping: JSON.parse(columnMapping),
  });

  return res.status(200).json({
    message: "Dataset uploaded successfully",
    datasetName,
    fileName: file.originalname,
    columnMapping: JSON.parse(columnMapping),
  });
});

// ============================================================
// ERROR HANDLERS
// ============================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large. Maximum size is 5GB.",
    });
  }

  // Multer file type error
  if (err.message && err.message.includes("Only CSV, JSON and XLSX")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============================================================
// SERVER START
// ============================================================

const PORT = process.env.PORT || 5000;

connectDB();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
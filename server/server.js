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

app.use(cors());
app.use(express.json());

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

// Existing routes
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

const PORT = 5000;

connectDB();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
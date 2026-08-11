const express = require("express");
const cors = require("cors");

const app = express();
const uploadRoutes = require("./routes/uploadRoutes");
app.use(cors());
app.use(express.json());

app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
    res.send("🚀 StreamWeaver Backend Running...");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
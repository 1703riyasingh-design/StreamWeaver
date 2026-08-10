const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            file: req.file
        });

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
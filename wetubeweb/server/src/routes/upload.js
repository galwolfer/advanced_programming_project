const express = require("express");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({ url: fileUrl });
    } catch (error) {
        return res.status(500).json({ message: "Failed to upload file" });
    }
});

module.exports = router;

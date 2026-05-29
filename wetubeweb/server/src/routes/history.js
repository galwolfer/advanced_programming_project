const express = require("express");
const History = require("../models/History");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const history = await History.find({ user: req.user.id })
            .sort({ watchedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("video");

        return res.json(history);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch history" });
    }
});

router.delete("/", authMiddleware, async (req, res) => {
    try {
        await History.deleteMany({ user: req.user.id });
        return res.json({ message: "History cleared" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to clear history" });
    }
});

router.delete("/:videoId", authMiddleware, async (req, res) => {
    try {
        await History.findOneAndDelete({ user: req.user.id, video: req.params.videoId });
        return res.json({ message: "Video removed from history" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to remove video from history" });
    }
});

module.exports = router;

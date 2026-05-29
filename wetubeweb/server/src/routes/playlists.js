const express = require("express");
const Playlist = require("../models/Playlist");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user.id }).sort({ createdAt: -1 });
        return res.json(playlists);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch playlists" });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const playlist = await Playlist.create({
            name: name.trim(),
            description: (description || "").trim(),
            isPublic: isPublic !== undefined ? isPublic : true,
            owner: req.user.id,
            videos: []
        });

        return res.status(201).json(playlist);
    } catch (error) {
        return res.status(500).json({ message: "Failed to create playlist" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate("videos.video");
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        // If not public, require auth and owner match
        if (!playlist.isPublic) {
            // Simplified check, normally would use middleware but we allow public access too
            const token = (req.headers.authorization || "").replace("Bearer ", "");
            let currentUserId = null;
            if (token) {
                const jwt = require("jsonwebtoken");
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    currentUserId = decoded.id;
                } catch (e) {}
            }
            if (playlist.owner.toString() !== currentUserId) {
                return res.status(403).json({ message: "Not authorized to view this playlist" });
            }
        }

        return res.json(playlist);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch playlist" });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        const { name, description, isPublic } = req.body;
        if (name) playlist.name = name.trim();
        if (description !== undefined) playlist.description = description.trim();
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();
        return res.json(playlist);
    } catch (error) {
        return res.status(500).json({ message: "Failed to update playlist" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        await playlist.deleteOne();
        return res.json({ message: "Playlist deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete playlist" });
    }
});

router.post("/:id/videos", authMiddleware, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        const { videoId } = req.body;
        if (!videoId) return res.status(400).json({ message: "Video ID is required" });

        const exists = playlist.videos.some(v => v.video.toString() === videoId);
        if (!exists) {
            playlist.videos.push({ video: videoId });
            await playlist.save();
        }

        return res.json(playlist);
    } catch (error) {
        return res.status(500).json({ message: "Failed to add video to playlist" });
    }
});

router.delete("/:id/videos/:videoId", authMiddleware, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        playlist.videos = playlist.videos.filter(v => v.video.toString() !== req.params.videoId);
        await playlist.save();

        return res.json(playlist);
    } catch (error) {
        return res.status(500).json({ message: "Failed to remove video from playlist" });
    }
});

module.exports = router;

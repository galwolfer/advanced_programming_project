const express = require("express");
const User = require("../models/User");
const Video = require("../models/Video");
const Playlist = require("../models/Playlist");
const Subscription = require("../models/Subscription");
const authMiddleware = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const router = express.Router();

function mapVideo(video, currentUserId) {
  const likedByCurrentUser = currentUserId
    ? video.likes.some((userId) => userId.toString() === currentUserId)
    : false;

  return {
    id: video._id.toString(),
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    uploaderName: video.uploaderName,
    uploaderId: video.uploaderId.toString(),
    category: video.category,
    views: video.views,
    likesCount: video.likes.length,
    likedByCurrentUser,
    commentsCount: video.comments.length,
    createdAt: video.createdAt,
  };
}

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-passwordHash");
        if (!user) return res.status(404).json({ message: "User not found" });

        const videoCount = await Video.countDocuments({ uploaderId: user._id });

        return res.json({
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            profilePictureUrl: user.profilePictureUrl,
            description: user.description,
            bannerUrl: user.bannerUrl,
            subscribersCount: user.subscribersCount,
            createdAt: user.createdAt,
            videoCount
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user" });
    }
});

router.get("/:id/videos", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const token = (req.headers.authorization || "").replace("Bearer ", "");
        let currentUserId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUserId = decoded.id;
            } catch (e) {}
        }

        const videos = await Video.find({ uploaderId: req.params.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.json({ videos: videos.map(v => mapVideo(v, currentUserId)) });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user videos" });
    }
});

router.get("/:id/playlists", async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.params.id, isPublic: true }).sort({ createdAt: -1 });
        return res.json(playlists);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user playlists" });
    }
});

router.get("/:id/subscribers", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ subscribersCount: user.subscribersCount });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch subscribers" });
    }
});

router.get("/:id/subscriptions", async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ subscriber: req.params.id }).populate("channel", "username displayName profilePictureUrl subscribersCount");
        return res.json(subscriptions);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
});

router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { displayName, description, profilePictureUrl, bannerUrl } = req.body;

        if (displayName) user.displayName = displayName.trim();
        if (description !== undefined) user.description = description.trim();
        if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl.trim();
        if (bannerUrl !== undefined) user.bannerUrl = bannerUrl.trim();

        await user.save();

        return res.json({
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            profilePictureUrl: user.profilePictureUrl,
            description: user.description,
            bannerUrl: user.bannerUrl,
            subscribersCount: user.subscribersCount,
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update profile" });
    }
});

module.exports = router;

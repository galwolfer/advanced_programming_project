const express = require("express");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Video = require("../models/Video");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/:channelId", authMiddleware, async (req, res) => {
    try {
        const subscriberId = req.user.id;
        const channelId = req.params.channelId;

        if (subscriberId === channelId) return res.status(400).json({ message: "Cannot subscribe to yourself" });

        const channel = await User.findById(channelId);
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        const existing = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });
        if (existing) return res.status(400).json({ message: "Already subscribed" });

        await Subscription.create({ subscriber: subscriberId, channel: channelId });
        await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: 1 } });

        return res.status(201).json({ message: "Subscribed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to subscribe" });
    }
});

router.delete("/:channelId", authMiddleware, async (req, res) => {
    try {
        const subscriberId = req.user.id;
        const channelId = req.params.channelId;

        const sub = await Subscription.findOneAndDelete({ subscriber: subscriberId, channel: channelId });
        if (!sub) return res.status(404).json({ message: "Subscription not found" });

        await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: -1 } });

        return res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to unsubscribe" });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ subscriber: req.user.id }).populate("channel", "username displayName profilePictureUrl subscribersCount");
        return res.json(subscriptions);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
});

router.get("/feed", authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const subscriptions = await Subscription.find({ subscriber: req.user.id });
        const channelIds = subscriptions.map(s => s.channel);

        const videos = await Video.find({ uploaderId: { $in: channelIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.json({ videos });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch feed" });
    }
});

router.get("/check/:channelId", authMiddleware, async (req, res) => {
    try {
        const sub = await Subscription.findOne({ subscriber: req.user.id, channel: req.params.channelId });
        return res.json({ subscribed: !!sub });
    } catch (error) {
        return res.status(500).json({ message: "Failed to check subscription" });
    }
});

module.exports = router;

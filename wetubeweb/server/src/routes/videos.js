const express = require("express");
const jwt = require("jsonwebtoken");
const Video = require("../models/Video");
const User = require("../models/User");
const History = require("../models/History");
const authMiddleware = require("../middleware/auth");

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

router.get("/", async (req, res) => {
  try {
    const { search = "", category = "", sort = "latest", page = 1, limit = 20 } = req.query;
    const token = (req.headers.authorization || "").replace("Bearer ", "");

    let currentUserId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (error) {
        currentUserId = null;
      }
    }

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { uploaderName: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const sortMap = {
      latest: { createdAt: -1 },
      popular: { views: -1 },
      liked: { "likes.length": -1 }, // Mongoose doesn't perfectly sort by array length this way natively, but keeping existing logic as requested.
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // For "liked", we have to fetch all if we rely on JS sort, but we'll try to stick to existing structure.
    // Existing code fetches all and sorts in JS if sort === "liked".
    // This isn't efficient for pagination, but the instructions say "Keep existing search, category filter, sort functionality."
    
    let videosQuery = Video.find(query);
    if (sort !== "liked") {
       videosQuery = videosQuery.sort(sort === "popular" ? sortMap.popular : sortMap.latest);
    }
    
    let allVideos = await videosQuery.exec();
    
    let mapped = allVideos.map((video) => mapVideo(video, currentUserId));

    if (sort === "liked") {
      mapped.sort((a, b) => b.likesCount - a.likesCount);
    }
    
    const totalVideos = mapped.length;
    const totalPages = Math.ceil(totalVideos / parseInt(limit));
    const paginatedVideos = mapped.slice(skip, skip + parseInt(limit));

    // categories from all videos ignoring search/category? The existing code gets it from the returned videos.
    // We will keep getting it from the matching videos before pagination.
    const categories = ["All", ...new Set(allVideos.map((v) => v.category).filter(Boolean))];

    return res.json({ 
        videos: paginatedVideos, 
        categories,
        totalPages,
        currentPage: parseInt(page),
        totalVideos
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch videos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const token = (req.headers.authorization || "").replace("Bearer ", "");
    let currentUserId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (error) {
        currentUserId = null;
      }
    }

    return res.json({
      video: mapVideo(video, currentUserId),
      comments: video.comments
        .map((comment) => ({
          id: comment._id.toString(),
          text: comment.text,
          authorId: comment.authorId.toString(),
          authorName: comment.authorName,
          authorAvatarUrl: comment.authorAvatarUrl,
          createdAt: comment.createdAt,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch video" });
  }
});

router.get("/:id/recommendations", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });

        const token = (req.headers.authorization || "").replace("Bearer ", "");
        let currentUserId = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            currentUserId = decoded.id;
          } catch (error) {}
        }

        // same category first, then same uploader, then most viewed. Limit 10
        let recommendations = await Video.find({
            _id: { $ne: video._id },
            category: video.category
        }).limit(10).exec();

        if (recommendations.length < 10) {
            const sameUploader = await Video.find({
                _id: { $ne: video._id, $nin: recommendations.map(v => v._id) },
                uploaderId: video.uploaderId
            }).limit(10 - recommendations.length).exec();
            recommendations = recommendations.concat(sameUploader);
        }

        if (recommendations.length < 10) {
            const mostViewed = await Video.find({
                _id: { $ne: video._id, $nin: recommendations.map(v => v._id) }
            }).sort({ views: -1 }).limit(10 - recommendations.length).exec();
            recommendations = recommendations.concat(mostViewed);
        }

        return res.json({ recommendations: recommendations.map(v => mapVideo(v, currentUserId)) });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch recommendations" });
    }
});


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, category } = req.body;

    if (!title || !videoUrl || !thumbnailUrl) {
      return res.status(400).json({ message: "Title, video URL and thumbnail URL are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = await Video.create({
      title: title.trim(),
      description: (description || "").trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      category: (category || "General").trim() || "General",
      uploaderId: user._id,
      uploaderName: user.displayName,
      views: 0,
      likes: [],
      comments: [],
    });

    return res.status(201).json({ video: mapVideo(video, req.user.id) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload video" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description, category, thumbnailUrl } = req.body;
        const video = await Video.findById(req.params.id);
        
        if (!video) return res.status(404).json({ message: "Video not found" });
        if (video.uploaderId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        if (title) video.title = title.trim();
        if (description !== undefined) video.description = description.trim();
        if (category) video.category = category.trim();
        if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl.trim();

        await video.save();
        return res.json({ video: mapVideo(video, req.user.id) });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update video" });
    }
});


router.post("/:id/view", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const currentUserId = decoded.id;
            
            // Create history entry
            await History.create({
                user: currentUserId,
                video: video._id
            });
        } catch (error) {
            // Invalid token, do nothing
        }
    }

    return res.json({ views: video.views });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update views" });
  }
});

router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const alreadyLiked = video.likes.some((id) => id.toString() === req.user.id);

    if (alreadyLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      video.likes.push(req.user.id);
    }

    await video.save();

    return res.json({
      likedByCurrentUser: !alreadyLiked,
      likesCount: video.likes.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update likes" });
  }
});

router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.comments.unshift({
      authorId: user._id,
      authorName: user.displayName,
      authorAvatarUrl: user.profilePictureUrl,
      text: text.trim(),
    });

    await video.save();

    const newestComment = video.comments[0];
    return res.status(201).json({
      comment: {
        id: newestComment._id.toString(),
        text: newestComment.text,
        authorId: newestComment.authorId.toString(),
        authorName: newestComment.authorName,
        authorAvatarUrl: newestComment.authorAvatarUrl,
        createdAt: newestComment.createdAt,
      },
      commentsCount: video.comments.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment" });
  }
});

router.delete("/:id/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await video.save();

    return res.json({ commentsCount: video.comments.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.uploaderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only uploader can delete this video" });
    }

    await video.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete video" });
  }
});

module.exports = router;

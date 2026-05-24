const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("./models/User");
const Video = require("./models/Video");
const authMiddleware = require("./middleware/auth");
const seedIfEmpty = require("./utils/seedData");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    profilePictureUrl: user.profilePictureUrl || "",
  };
}

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

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password, displayName, profilePictureUrl } = req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({ message: "Password does not meet complexity requirements" });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existing) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      displayName: displayName.trim(),
      passwordHash,
      profilePictureUrl: profilePictureUrl || "",
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sign up" });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sign in" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get("/api/videos", async (req, res) => {
  try {
    const { search = "", category = "", sort = "latest" } = req.query;
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
      liked: { "likes.length": -1 },
    };

    const videos = await Video.find(query).sort(sort === "popular" ? sortMap.popular : sortMap.latest);
    const mapped = videos.map((video) => mapVideo(video, currentUserId));

    if (sort === "liked") {
      mapped.sort((a, b) => b.likesCount - a.likesCount);
    }

    const categories = ["All", ...new Set(videos.map((v) => v.category).filter(Boolean))];

    return res.json({ videos: mapped, categories });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch videos" });
  }
});

app.get("/api/videos/:id", async (req, res) => {
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

app.post("/api/videos", authMiddleware, async (req, res) => {
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

app.post("/api/videos/:id/view", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.json({ views: video.views });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update views" });
  }
});

app.post("/api/videos/:id/like", authMiddleware, async (req, res) => {
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

app.post("/api/videos/:id/comments", authMiddleware, async (req, res) => {
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

app.delete("/api/videos/:id/comments/:commentId", authMiddleware, async (req, res) => {
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

app.delete("/api/videos/:id", authMiddleware, async (req, res) => {
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

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error("MONGODB_URI and JWT_SECRET are required");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await seedIfEmpty();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});

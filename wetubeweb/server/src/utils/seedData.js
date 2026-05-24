const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Video = require("../models/Video");

async function seedIfEmpty() {
  const existingVideos = await Video.countDocuments();
  if (existingVideos > 0) {
    return;
  }

  let seedUser = await User.findOne({ username: "seed_user" });
  if (!seedUser) {
    const passwordHash = await bcrypt.hash("SeedUser123", 10);
    seedUser = await User.create({
      username: "seed_user",
      email: "seed@example.com",
      displayName: "WeTube Library",
      passwordHash,
      profilePictureUrl: "",
    });
  }

  const videosJsonPath = path.resolve(__dirname, "../../../src/videos.json");
  const raw = fs.readFileSync(videosJsonPath, "utf-8");
  const parsed = JSON.parse(raw);

  const docs = parsed.map((item) => ({
    title: item.title,
    description: item.title,
    videoUrl: item.path,
    thumbnailUrl: item.thumbnailPath,
    uploaderId: seedUser._id,
    uploaderName: item.uploader || "WeTube Library",
    views: Number(String(item.views).replace(/[^\d]/g, "")) || 0,
    category: "General",
    likes: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await Video.insertMany(docs);
}

module.exports = seedIfEmpty;

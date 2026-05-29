const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Video = require("../models/Video");

const CATEGORIES = ["Gaming", "Music", "Nature", "Education", "Entertainment", "Sports", "News", "Technology", "General"];

async function seedIfEmpty() {
  const existingVideos = await Video.countDocuments();
  if (existingVideos > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash("SeedUser123", 10);
  
  const seedUsersData = [
      {
          username: "seed_user",
          email: "seed@example.com",
          displayName: "WeTube Library",
          description: "Official WeTube library account",
          passwordHash,
      },
      {
          username: "gamer_pro",
          email: "gamer@example.com",
          displayName: "Pro Gamer",
          description: "Daily gaming content and streams",
          passwordHash,
      },
      {
          username: "music_vibes",
          email: "music@example.com",
          displayName: "Music Vibes",
          description: "Best music on WeTube",
          passwordHash,
      }
  ];

  const createdUsers = [];
  for (const data of seedUsersData) {
      let u = await User.findOne({ username: data.username });
      if (!u) {
          u = await User.create(data);
      }
      createdUsers.push(u);
  }

  const videosJsonPath = path.resolve(__dirname, "../../../src/videos.json");
  if (fs.existsSync(videosJsonPath)) {
      const raw = fs.readFileSync(videosJsonPath, "utf-8");
      const parsed = JSON.parse(raw);

      const docs = parsed.map((item, index) => {
          const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
          
          return {
            title: item.title,
            description: item.title,
            videoUrl: item.path,
            thumbnailUrl: item.thumbnailPath,
            uploaderId: randomUser._id,
            uploaderName: randomUser.displayName,
            views: Number(String(item.views).replace(/[^\d]/g, "")) || 0,
            category: randomCategory,
            likes: [],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
      });

      await Video.insertMany(docs);
  }
}

module.exports = seedIfEmpty;

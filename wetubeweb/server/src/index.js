const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

const seedIfEmpty = require("./utils/seedData");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Mount routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/videos", require("./routes/videos"));
app.use("/api/users", require("./routes/users"));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/playlists", require("./routes/playlists"));
app.use("/api/history", require("./routes/history"));
app.use("/api/upload", require("./routes/upload"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("MONGODB_URI and JWT_SECRET are required");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

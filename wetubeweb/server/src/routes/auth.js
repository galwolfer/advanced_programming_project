const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

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
    description: user.description || "",
    bannerUrl: user.bannerUrl || "",
    subscribersCount: user.subscribersCount || 0,
  };
}

router.post("/signup", async (req, res) => {
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

router.post("/signin", async (req, res) => {
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

router.get("/me", authMiddleware, async (req, res) => {
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

module.exports = router;

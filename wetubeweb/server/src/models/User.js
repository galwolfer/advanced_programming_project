const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

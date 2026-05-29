const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videos: [
      {
        video: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);

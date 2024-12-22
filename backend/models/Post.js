// models/Post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["progress", "workout", "motivation", "question", "general"],
      default: "general",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String, // URL to media file
        mediaType: {
          type: String,
          enum: ["image", "video"],
        },
      },
    ],
    tags: [String],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
    },
    progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);

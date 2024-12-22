// models/Progress.js
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      weight: Number,
      bodyFat: Number,
      measurements: {
        chest: Number,
        waist: Number,
        hips: Number,
        biceps: Number,
        thighs: Number,
      },
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
    },
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      water: Number,
    },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "bad", "terrible"],
    },
    sleep: {
      duration: Number, // in hours
      quality: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
      },
    },
    notes: String,
    photos: [
      {
        url: String,
        type: {
          type: String,
          enum: ["front", "side", "back"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for querying user's progress
progressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Progress", progressSchema);

// models/ProgressTracker.js
const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  weight: Number,
  bodyFat: Number,
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
  },
  photos: [
    {
      url: String,
      type: String, // front, side, back
    },
  ],
});

const nutritionLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  meals: [
    {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      time: Date,
    },
  ],
  totalWater: Number,
  notes: String,
});

const progressTrackerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    measurements: [measurementSchema],
    nutrition: [nutritionLogSchema],
    goals: [
      {
        type: {
          type: String,
          enum: ["weight", "measurement", "performance", "habit"],
          required: true,
        },
        target: mongoose.Schema.Types.Mixed,
        deadline: Date,
        achieved: {
          type: Boolean,
          default: false,
        },
        achievedDate: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ProgressTracker", progressTrackerSchema);

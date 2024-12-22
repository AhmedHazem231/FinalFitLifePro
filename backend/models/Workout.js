// models/Workout.js
const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  notes: String,
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["strength", "cardio", "flexibility", "hiit", "custom"],
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    exercises: [exerciseSchema],
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    scheduledFor: Date,
    completedAt: Date,
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying user's workouts
workoutSchema.index({ user: 1, scheduledFor: 1 });

module.exports = mongoose.model("Workout", workoutSchema);

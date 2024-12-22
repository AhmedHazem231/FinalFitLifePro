// controllers/workoutController.js
const Workout = require("../models/Workout");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");
const { calculateCaloriesBurned } = require("../utils/calculations");

exports.createWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      status: "success",
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWorkouts = async (req, res, next) => {
  try {
    const { type, completed, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (completed !== undefined) query.completed = completed === "true";
    if (startDate || endDate) {
      query.scheduledFor = {};
      if (startDate) query.scheduledFor.$gte = new Date(startDate);
      if (endDate) query.scheduledFor.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(query).sort({ scheduledFor: 1 });

    res.json({
      status: "success",
      results: workouts.length,
      data: workouts,
    });
  } catch (error) {
    next(error);
  }
};

exports.completeWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return next(new AppError("Workout not found", 404));
    }

    workout.completed = true;
    workout.completedAt = Date.now();
    workout.rating = req.body.rating;
    workout.notes = req.body.notes;

    // Calculate calories burned
    workout.caloriesBurned = calculateCaloriesBurned(
      req.user.metrics.weight,
      workout.duration,
      workout.difficulty,
    );

    await workout.save();

    // Update user progress
    const user = await User.findById(req.user.id);
    user.progress.workoutsCompleted += 1;
    user.progress.points += 10;
    user.progress.lastWorkout = Date.now();

    // Update streak
    const lastWorkoutDate = new Date(user.progress.lastWorkout);
    const today = new Date();
    const diffDays = Math.floor(
      (today - lastWorkoutDate) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 1) {
      user.progress.streakDays += 1;
    } else {
      user.progress.streakDays = 1;
    }

    await user.save();

    res.json({
      status: "success",
      data: {
        workout,
        progress: user.progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!workout) {
      return next(new AppError("Workout not found", 404));
    }

    res.json({
      status: "success",
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return next(new AppError("Workout not found", 404));
    }

    res.json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

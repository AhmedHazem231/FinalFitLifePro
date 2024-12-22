// controllers/progressController.js
const Progress = require("../models/Progress");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

exports.trackProgress = async (req, res, next) => {
  try {
    const { metrics, nutrition, mood, sleep, notes } = req.body;

    // Create progress entry
    const progress = await Progress.create({
      user: req.user.id,
      metrics,
      nutrition,
      mood,
      sleep,
      notes,
    });

    // Update user's current metrics if weight is provided
    if (metrics?.weight) {
      const user = await User.findById(req.user.id);
      user.metrics.weight = metrics.weight;

      // Recalculate BMI if height exists
      if (user.metrics.height) {
        const heightInMeters = user.metrics.height / 100;
        user.metrics.bmi = (
          metrics.weight /
          (heightInMeters * heightInMeters)
        ).toFixed(1);
      }

      await user.save();
    }

    res.status(201).json({
      status: "success",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const progress = await Progress.find(query)
      .sort({ date: -1 })
      .populate("workout", "type duration caloriesBurned");

    // Calculate statistics
    const stats = {
      weightChange: 0,
      averageCalories: 0,
      workoutsCompleted: 0,
      streakDays: 0,
    };

    if (progress.length > 0) {
      const firstWeight = progress[progress.length - 1].metrics?.weight;
      const lastWeight = progress[0].metrics?.weight;
      if (firstWeight && lastWeight) {
        stats.weightChange = lastWeight - firstWeight;
      }

      const caloriesSum = progress.reduce(
        (sum, entry) => sum + (entry.nutrition?.calories || 0),
        0,
      );
      stats.averageCalories = Math.round(caloriesSum / progress.length);

      stats.workoutsCompleted = progress.filter((p) => p.workout).length;
    }

    // Get current streak from user
    const user = await User.findById(req.user.id);
    stats.streakDays = user.progress.streakDays;

    res.json({
      status: "success",
      data: {
        progress,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadProgressPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const progress = await Progress.findOne({
      user: req.user.id,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    const photoUrl = `/uploads/${req.file.filename}`;

    if (progress) {
      progress.photos.push({
        url: photoUrl,
        type: req.body.type || "front",
      });
      await progress.save();
    } else {
      await Progress.create({
        user: req.user.id,
        photos: [
          {
            url: photoUrl,
            type: req.body.type || "front",
          },
        ],
      });
    }

    res.json({
      status: "success",
      data: {
        url: photoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProgressStats = async (req, res, next) => {
  try {
    const stats = await Progress.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: "$nutrition.calories" },
          maxWeight: { $max: "$metrics.weight" },
          minWeight: { $min: "$metrics.weight" },
          totalWorkouts: {
            $sum: { $cond: [{ $ifNull: ["$workout", false] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      status: "success",
      data: stats[0] || {},
    });
  } catch (error) {
    next(error);
  }
};

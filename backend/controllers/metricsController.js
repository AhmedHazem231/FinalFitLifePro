// controllers/metricsController.js
const User = require("../models/User");
const Progress = require("../models/Progress");
const { AppError } = require("../middleware/errorHandler");
const { calculateBMI, calculateTDEE } = require("../utils/calculations");

exports.updateMetrics = async (req, res, next) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body;

    const user = await User.findById(req.user.id);

    // Update metrics
    user.metrics = {
      ...user.metrics,
      weight: weight || user.metrics.weight,
      height: height || user.metrics.height,
      age: age || user.metrics.age,
      gender: gender || user.metrics.gender,
      activityLevel: activityLevel || user.metrics.activityLevel,
      goal: goal || user.metrics.goal,
    };

    // Calculate BMI if weight and height are available
    if (user.metrics.weight && user.metrics.height) {
      user.metrics.bmi = calculateBMI(user.metrics.weight, user.metrics.height);
    }

    // Calculate BMR and TDEE
    if (
      user.metrics.weight &&
      user.metrics.height &&
      user.metrics.age &&
      user.metrics.gender
    ) {
      user.metrics.bmr = user.calculateBMR();
      user.metrics.tdee = calculateTDEE(
        user.metrics.bmr,
        user.metrics.activityLevel,
      );

      // Update daily calorie goal based on user's goal
      const goalMultipliers = {
        lose: 0.8,
        maintain: 1,
        gain: 1.2,
      };
      user.nutrition.dailyCalorieGoal = Math.round(
        user.metrics.tdee * goalMultipliers[user.metrics.goal],
      );

      // Update macro splits
      const protein = user.metrics.weight * 2; // 2g per kg of bodyweight
      const remainingCalories = user.nutrition.dailyCalorieGoal - protein * 4;
      user.nutrition.macros = {
        protein,
        carbs: Math.round((remainingCalories * 0.65) / 4), // 65% of remaining calories from carbs
        fats: Math.round((remainingCalories * 0.35) / 9), // 35% of remaining calories from fats
      };
    }

    await user.save();

    // Create progress entry
    if (weight) {
      await Progress.create({
        user: user._id,
        metrics: {
          weight,
          bodyFat: req.body.bodyFat,
          measurements: req.body.measurements,
        },
      });
    }

    res.json({
      status: "success",
      data: {
        metrics: user.metrics,
        nutrition: user.nutrition,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMetrics = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      status: "success",
      data: {
        metrics: user.metrics,
        nutrition: user.nutrition,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMetricsHistory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const history = await Progress.find(query)
      .select("metrics date")
      .sort({ date: -1 });

    res.json({
      status: "success",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

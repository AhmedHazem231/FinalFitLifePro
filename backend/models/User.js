// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    metrics: {
      height: { type: Number, default: 0 }, // in cm
      weight: { type: Number, default: 0 }, // in kg
      age: { type: Number, default: 0 },
      gender: {
        type: String,
        enum: ["male", "female", "other", ""],
        default: "",
      },
      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "active", "very_active"],
        default: "moderate",
      },
      goal: {
        type: String,
        enum: ["lose", "maintain", "gain"],
        default: "maintain",
      },
      bmi: { type: Number, default: 0 },
      bmr: { type: Number, default: 0 }, // Basal Metabolic Rate
      tdee: { type: Number, default: 0 }, // Total Daily Energy Expenditure
    },
    progress: {
      points: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streakDays: { type: Number, default: 0 },
      lastWorkout: Date,
      badges: [
        {
          name: String,
          description: String,
          dateEarned: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    nutrition: {
      dailyCalorieGoal: { type: Number, default: 0 },
      macros: {
        protein: { type: Number, default: 0 }, // in grams
        carbs: { type: Number, default: 0 }, // in grams
        fats: { type: Number, default: 0 }, // in grams
      },
      waterIntake: { type: Number, default: 0 }, // in ml
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        workout: { type: Boolean, default: true },
        progress: { type: Boolean, default: true },
      },
      measurementUnit: {
        weight: { type: String, enum: ["kg", "lbs"], default: "kg" },
        height: { type: String, enum: ["cm", "ft"], default: "cm" },
      },
    },
    profileImage: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate BMI
userSchema.methods.calculateBMI = function () {
  if (this.metrics.height && this.metrics.weight) {
    const heightInMeters = this.metrics.height / 100;
    return (this.metrics.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return 0;
};

// Method to calculate BMR using Harris-Benedict equation
userSchema.methods.calculateBMR = function () {
  const { weight, height, age, gender } = this.metrics;
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
};

module.exports = mongoose.model("User", userSchema);

// middleware/validation.js
const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
  }
  next();
};

exports.validateSignup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  validateRequest,
];

exports.validateMetrics = [
  body("weight")
    .isFloat({ min: 20, max: 500 })
    .withMessage("Please provide a valid weight"),
  body("height")
    .isFloat({ min: 50, max: 300 })
    .withMessage("Please provide a valid height"),
  body("age")
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage("Please provide a valid age"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Please provide a valid gender"),
  validateRequest,
];

exports.validateWorkout = [
  body("type").notEmpty().withMessage("Workout type is required"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),
  body("exercises").isArray().withMessage("Exercises must be an array"),
  body("exercises.*.name").notEmpty().withMessage("Exercise name is required"),
  body("exercises.*.sets")
    .isInt({ min: 1 })
    .withMessage("Sets must be a positive number"),
  validateRequest,
];

// routes/workout.js
const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");
const { protect } = require("../middleware/auth");
const { validateWorkout } = require("../middleware/validation");

router.use(protect);

router.post("/", validateWorkout, workoutController.createWorkout);
router.get("/", workoutController.getWorkouts);
router.get("/:id", workoutController.getWorkout);
router.patch("/:id", validateWorkout, workoutController.updateWorkout);
router.delete("/:id", workoutController.deleteWorkout);
router.post("/:id/complete", workoutController.completeWorkout);
router.get("/stats/summary", workoutController.getWorkoutStats);

module.exports = router;

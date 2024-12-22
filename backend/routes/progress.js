// routes/progress.js
const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.post("/track", progressController.trackProgress);
router.get("/", progressController.getProgress);
router.get("/stats", progressController.getProgressStats);
router.post(
  "/photo",
  upload.single("photo"),
  progressController.uploadProgressPhoto,
);
router.get("/photos", progressController.getProgressPhotos);

module.exports = router;

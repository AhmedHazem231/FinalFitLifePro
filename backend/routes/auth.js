// routes/metrics.js
const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const { protect } = require("../middleware/auth");
const { validateMetrics } = require("../middleware/validation");

router.use(protect); // Protect all metrics routes

router.post("/update", validateMetrics, metricsController.updateMetrics);
router.get("/current", metricsController.getMetrics);
router.get("/history", metricsController.getMetricsHistory);

module.exports = router;

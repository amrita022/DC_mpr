const express = require("express");
const {
  getSystemStatus,
  simulateBookingWithLoadBalancer,
  simulateNodeFailure,
  simulateNodeRecovery,
  simulateConcurrentBookings,
  resetSystem,
} = require("../controllers/distributedController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/status", getSystemStatus);
router.post("/book", protect, simulateBookingWithLoadBalancer);
router.post("/simulate/failure", protect, adminOnly, simulateNodeFailure);
router.post(
  "/simulate/recovery",
  protect,
  adminOnly,
  simulateNodeRecovery
);
router.post(
  "/simulate/concurrent",
  protect,
  adminOnly,
  simulateConcurrentBookings
);
router.post("/reset", protect, adminOnly, resetSystem);

module.exports = router;

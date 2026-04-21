const express = require("express");
const {
  bookTickets,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, bookTickets);
router.get("/", protect, getUserBookings);
router.get("/all", protect, adminOnly, getAllBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;

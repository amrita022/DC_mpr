const express = require("express");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
} = require("../controllers/eventController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/search", searchEvents);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;

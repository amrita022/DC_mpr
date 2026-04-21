const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  venue: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "cancelled", "sold-out"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", eventSchema);

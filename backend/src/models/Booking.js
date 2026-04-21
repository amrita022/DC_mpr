const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  seats: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "pending"],
    default: "pending",
  },
  bookingTime: {
    type: Date,
    default: Date.now,
  },
  confirmationCode: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);

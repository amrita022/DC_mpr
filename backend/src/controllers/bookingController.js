const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const generateConfirmationCode = require("../utils/generateConfirmationCode");

const bookTickets = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, seats } = req.body;
    const userId = req.user.userId;

    // Validate seats
    if (!seats || seats <= 0 || !Number.isInteger(seats)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Seats must be a positive integer" });
    }

    // Find event
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is active
    if (event.status !== "active") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Event is not active" });
    }

    // Check available seats (atomically)
    if (event.availableSeats < seats) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Atomically decrement availableSeats
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true, session }
    );

    if (!updatedEvent) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Check if event is now sold out
    if (updatedEvent.availableSeats === 0) {
      await Event.findByIdAndUpdate(
        eventId,
        { status: "sold-out" },
        { session }
      );
    }

    // Calculate total amount
    const totalAmount = event.price * seats;

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create booking
    const booking = new Booking({
      userId,
      eventId,
      seats,
      totalAmount,
      status: "confirmed",
      confirmationCode,
    });

    await booking.save({ session });

    await session.commitTransaction();

    // Populate event details for response
    const populatedBooking = await booking.populate("eventId");

    res.status(201).json({
      message: "Booking confirmed successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await Booking.find({ userId })
      .populate("eventId", "name venue date price")
      .sort({ bookingTime: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId).populate(
      "eventId",
      "name venue date price"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to booking" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized access to booking" });
    }

    if (booking.status !== "confirmed") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Only confirmed bookings can be cancelled" });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save({ session });

    // Increment availableSeats
    const event = await Event.findById(booking.eventId).session(session);
    if (event) {
      event.availableSeats += booking.seats;

      // If event is sold-out, set it back to active
      if (event.status === "sold-out") {
        event.status = "active";
      }

      await event.save({ session });
    }

    await session.commitTransaction();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email") // Note: userId is String, not ObjectId
      .populate("eventId", "name venue date price")
      .sort({ bookingTime: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookTickets,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};

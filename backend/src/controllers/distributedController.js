const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const nodeRegistry = require("../utils/nodeRegistry");
const loadBalancer = require("../utils/loadBalancer");
const faultDetector = require("../utils/faultDetector");
const logicalClock = require("../utils/logicalClock");
const generateConfirmationCode = require("../utils/generateConfirmationCode");

const getSystemStatus = async (req, res) => {
  try {
    const allNodes = nodeRegistry.getNodes();
    const systemHealth = faultDetector.getSystemHealth();
    const logicalClockTime = logicalClock.getTime();

    res.json({
      nodes: allNodes,
      systemHealth,
      logicalClockTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const simulateBookingWithLoadBalancer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, seats, strategy } = req.body;
    const userId = req.user.userId;

    // Select node using load balancer
    const selectedNode = loadBalancer.selectNode(strategy || "roundRobin");

    // Tick logical clock
    const timestamp = logicalClock.tick();

    // Simulate processing delay
    const delay = Math.floor(Math.random() * 101) + 100; // 100-200ms
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Validate seats
    if (!seats || seats <= 0 || !Number.isInteger(seats)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Seats must be a positive integer" });
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

    // Check available seats
    if (event.availableSeats < seats) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Not enough seats available" });
    }

    // Atomically decrement availableSeats
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true, session }
    );

    if (!updatedEvent) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Not enough seats available" });
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

    // Populate booking
    const populatedBooking = await booking.populate("eventId");

    res.status(201).json({
      message: "Booking confirmed successfully",
      selectedNode: selectedNode.name,
      nodeId: selectedNode.id,
      logicalClockTimestamp: timestamp,
      processingDelay: delay,
      nodeStats: {
        load: selectedNode.load,
        requestCount: selectedNode.requestCount,
      },
      booking: populatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const simulateNodeFailure = async (req, res) => {
  try {
    const { nodeId } = req.body;

    nodeRegistry.markNodeDown(nodeId);
    const systemHealth = faultDetector.getSystemHealth();

    res.json({
      message: `Node ${nodeId} marked as failed`,
      systemHealth,
      nodes: nodeRegistry.getNodes(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const simulateNodeRecovery = async (req, res) => {
  try {
    const { nodeId } = req.body;

    nodeRegistry.markNodeUp(nodeId);
    const systemHealth = faultDetector.getSystemHealth();

    res.json({
      message: `Node ${nodeId} marked as recovered`,
      systemHealth,
      nodes: nodeRegistry.getNodes(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const simulateConcurrentBookings = async (req, res) => {
  try {
    const { eventId, numberOfRequests } = req.body;
    const userId = req.user.userId;
    const numRequests = numberOfRequests || 10;

    const startTime = Date.now();

    const bookingPromises = Array.from({ length: numRequests }, async (_, index) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Select node using round-robin
        const selectedNode = loadBalancer.selectNode("roundRobin");

        // Tick logical clock
        const timestamp = logicalClock.tick();

        // Find event
        const event = await Event.findById(eventId).session(session);

        if (!event || event.status !== "active") {
          await session.abortTransaction();
          return {
            success: false,
            error: "Event not available",
            nodeId: selectedNode.id,
            nodeName: selectedNode.name,
            timestamp,
          };
        }

        // Try to book 1 seat
        const updatedEvent = await Event.findOneAndUpdate(
          { _id: eventId, availableSeats: { $gte: 1 } },
          { $inc: { availableSeats: -1 } },
          { new: true, session }
        );

        if (!updatedEvent) {
          await session.abortTransaction();
          return {
            success: false,
            error: "No seats available",
            nodeId: selectedNode.id,
            nodeName: selectedNode.name,
            timestamp,
          };
        }

        // Update status if sold out
        if (updatedEvent.availableSeats === 0) {
          await Event.findByIdAndUpdate(
            eventId,
            { status: "sold-out" },
            { session }
          );
        }

        // Create booking
        const booking = new Booking({
          userId,
          eventId,
          seats: 1,
          totalAmount: event.price,
          status: "confirmed",
          confirmationCode: generateConfirmationCode(),
        });

        await booking.save({ session });
        await session.commitTransaction();

        return {
          success: true,
          nodeId: selectedNode.id,
          nodeName: selectedNode.name,
          timestamp,
          confirmationCode: booking.confirmationCode,
        };
      } catch (error) {
        await session.abortTransaction();
        return {
          success: false,
          error: error.message,
          timestamp: logicalClock.getTime(),
        };
      } finally {
        session.endSession();
      }
    });

    const results = await Promise.all(bookingPromises);
    const endTime = Date.now();

    const successfulBookings = results.filter((r) => r.success).length;
    const failedBookings = results.filter((r) => !r.success).length;

    res.json({
      message: "Concurrent booking simulation completed",
      totalRequests: numRequests,
      successfulBookings,
      failedBookings,
      executionTime: endTime - startTime,
      results,
      systemHealth: faultDetector.getSystemHealth(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetSystem = async (req, res) => {
  try {
    nodeRegistry.resetNodes();
    logicalClock.reset();

    res.json({
      message: "System reset successfully",
      nodes: nodeRegistry.getNodes(),
      systemHealth: faultDetector.getSystemHealth(),
      logicalClockTime: logicalClock.getTime(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSystemStatus,
  simulateBookingWithLoadBalancer,
  simulateNodeFailure,
  simulateNodeRecovery,
  simulateConcurrentBookings,
  resetSystem,
};

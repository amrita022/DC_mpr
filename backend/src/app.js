const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const distributedRoutes = require("./routes/distributedRoutes");

const app = express();

// Configure CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "ticket-booking-api" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", eventRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Distributed systems routes
app.use("/api/distributed", distributedRoutes);

module.exports = app;
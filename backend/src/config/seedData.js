const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Event = require("../models/Event");

const seedDatabase = async () => {
  try {
    // Check if events already exist
    const eventCount = await Event.countDocuments();
    if (eventCount > 0) {
      console.log("Database already seeded, skipping seed data...");
      return;
    }

    // Create admin user
    const adminExists = await User.findOne({ email: "admin@ticketapp.com" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const adminUser = new User({
        name: "Admin User",
        email: "admin@ticketapp.com",
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log("Admin user created");
    }

    // Create sample events
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const sampleEvents = [
      {
        name: "Summer Music Festival 2026",
        description: "Join us for an amazing music festival featuring top artists",
        venue: "Central Park, New York",
        date: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        totalSeats: 5000,
        availableSeats: 5000,
        price: 99.99,
        status: "active",
      },
      {
        name: "Tech Conference 2026",
        description: "Latest innovations in technology and AI",
        venue: "San Francisco Convention Center",
        date: new Date(futureDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        totalSeats: 2000,
        availableSeats: 2000,
        price: 149.99,
        status: "active",
      },
      {
        name: "Comedy Night Live",
        description: "Hilarious stand-up comedy from top comedians",
        venue: "The Comedy Club, Los Angeles",
        date: new Date(futureDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        totalSeats: 800,
        availableSeats: 800,
        price: 49.99,
        status: "active",
      },
      {
        name: "Sports Championship 2026",
        description: "National championship finals - basketball",
        venue: "Madison Square Garden, New York",
        date: new Date(futureDate.getTime() + 28 * 24 * 60 * 60 * 1000),
        totalSeats: 20000,
        availableSeats: 20000,
        price: 199.99,
        status: "active",
      },
      {
        name: "Art Exhibition Opening",
        description: "Contemporary art from emerging artists",
        venue: "Modern Art Museum, Chicago",
        date: new Date(futureDate.getTime() + 35 * 24 * 60 * 60 * 1000),
        totalSeats: 500,
        availableSeats: 500,
        price: 25.99,
        status: "active",
      },
    ];

    await Event.insertMany(sampleEvents);
    console.log("5 sample events created");
  } catch (error) {
    console.error("Seed data error:", error.message);
  }
};

module.exports = { seedDatabase };

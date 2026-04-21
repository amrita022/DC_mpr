require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { seedDatabase } = require("./config/seedData");
const { startHeartbeat } = require("./utils/faultDetector");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
    // Seed database
    await seedDatabase();

    // Start fault detection heartbeat
    startHeartbeat();
    console.log("Fault detector heartbeat started");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
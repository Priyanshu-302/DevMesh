const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

// Connect MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info("MongoDB connected sucessfully");
  } catch (error) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Monitor ongoing connection
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected! Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error event: ${err.message}`);
});

module.exports = connectDB;

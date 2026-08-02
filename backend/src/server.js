const http = require("http");
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const { initSocketServer } = require("./websocket/socketServer");
const logger = require("./utils/logger");

/**
 * Connect to database and spin up server
 */
const startServer = async () => {
  // 1. Establish database connection
  await connectDB();

  // 2. Create server wrapper
  const server = http.createServer(app);

  // 3. Attach and initialize Socket.io
  initSocketServer(server);

  // 4. Listen for traffic
  const PORT = env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(
      `🚀 DevMesh Backend running in [${env.NODE_ENV}] mode on port ${PORT}`,
    );
  });

  // Handle graceful process shutdowns
  const handleGracefulShutdown = (signal) => {
    logger.warn(`⚠️ Received ${signal}. Terminating process gracefully...`);
    server.close(() => {
      logger.info("HTTP server and Socket connections closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
};

startServer();

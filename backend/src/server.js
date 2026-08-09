const http = require("http");
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const { initSocketServer } = require("./websocket/socketServer");
const logger = require("./utils/logger");
const { embedder } = require("../../ai-agent");

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
  const selfPing = () => {
    const url = process.env.RENDER_EXTERNAL_URL;
    if (!url) {
      logger.info("No RENDER_EXTERNAL_URL configured, skipping self-ping keep-alive.");
      return;
    }

    logger.info(`Self-ping keep-alive configured for URL: ${url}`);
    setInterval(async () => {
      try {
        const res = await fetch(`${url}/ping`);
        logger.info(`Self-ping status: ${res.status} (${res.statusText})`);
      } catch (err) {
        logger.warn(`Self-ping error: ${err.message}`);
      }
    }, 10 * 60 * 1000); // Every 10 minutes
  };

  server.listen(PORT, () => {
    logger.info(
      `🚀 DevMesh Backend running in [${env.NODE_ENV}] mode on port ${PORT}`,
    );

    // Pre-initialize ONNX embedder in the background
    logger.info("🧠 Pre-initializing ONNX embedder model in background...");
    embedder.initialize()
      .then(() => logger.info("✅ ONNX embedder model pre-loaded successfully!"))
      .catch((err) => logger.warn(`⚠️ Pre-loading ONNX model failed: ${err.message}`));

    // Start self-pinging keep-alive
    selfPing();
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

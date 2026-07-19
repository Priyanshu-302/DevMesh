const { createLogger, format, transports } = require("winston");
const env = require("../config/env");

// Format logs for readable terminal/stdout printing
const customConsoleFormat = format.printf(
  ({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  },
);

const logger = createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(), // Stores clean json logs if writing to files
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), customConsoleFormat),
    }),
  ],
});

module.exports = logger;

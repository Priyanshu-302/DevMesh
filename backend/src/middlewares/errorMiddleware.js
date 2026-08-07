const logger = require("../utils/logger");
const env = require("../config/env");

const errorHandler = async (err, req, res, next) => {
  logger.error(err);

  let statusCode = err.statusCode || 500;

  let message = err.message || "Internal Server Error";

  let details = null;

  if (err.code === 11000) {
    statusCode = 400;
    const duplicateKey = Object.keys(err.keyValue)[0];
    message = `Conflict: '${duplicateKey}' already exists.`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Malformed resource identifier: '${err.value}'`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation constraints failed";
    details = Object.values(err.errors).map((e) => e.message);
  }

  if (env.NODE_ENV === "development" && !details) {
    details = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
    },
  });
};

module.exports = errorHandler;
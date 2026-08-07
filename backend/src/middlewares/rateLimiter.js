const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/apiResponse");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    return errorResponse(
      res,
      options.statusCode || 429,
      "Too many requests. Please try again after 15 minutes.",
    );
  },
});

module.exports = rateLimiter;

const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

const { errorResponse } = require("../utils/apiResponse");

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(
        res,
        401,
        "Authentication failed: JWT token is missing",
      );
    }

    // check token is blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token });

    if (isBlacklisted) {
      return errorResponse(
        res,
        401,
        "Authentication failed: Token is invalidated (logged out)",
      );
    }

    // verify the token payload
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Confirm user still exists or not
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(
        res,
        401,
        "Authentication failed: User no longer exists",
      );
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return errorResponse(
      res,
      401,
      "Authentication failed: Invalid or expired JWT token",
      error.message,
    );
  }
};

module.exports = authMiddleware;

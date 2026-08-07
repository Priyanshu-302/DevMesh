const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");

/**
 * Register a user
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await authService.signup({ name, email, password });
  return successResponse(res, 201, "User registered successfully", result);
});

/**
 * Log in a user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });
  return successResponse(res, 200, "User logged in successfully", result);
});

const User = require("../models/User");

/**
 * Log out a user
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.token;
  await authService.logout(token);
  return successResponse(res, 200, "User logged out successfully");
});

/**
 * Get active user's profile details
 */
const getProfile = asyncHandler(async (req, res) => {
  const userObj = req.user.toObject();
  delete userObj.password;

  return successResponse(res, 200, "Profile retrieved successfully", userObj);
});

/**
 * Update user's profile details
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = req.user;

  if (name) user.name = name;

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: "Email address is already in use" }
      });
    }
    user.email = email.toLowerCase();
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: "Password must be at least 6 characters long" }
      });
    }
    user.password = password;
  }

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;

  return successResponse(res, 200, "Profile updated successfully", updatedUser);
});

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
};

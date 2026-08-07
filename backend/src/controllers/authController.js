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

/**
 * Log out a user
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.token;
  await authService.logout(token);
  return successResponse(res, 200, "User logged out successfully");
});

module.exports = {
  signup,
  login,
  logout,
};

const express = require("express");
const { z } = require("zod");
const authController = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/authMiddleware");
const rateLimiter = require("../middlewares/rateLimiter");

const router = express.Router();

// Define input schemas using Zod
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password is required"),
});

// Endpoints
router.post(
  "/signup",
  rateLimiter,
  validateRequest(signupSchema),
  authController.signup,
);
router.post(
  "/login",
  rateLimiter,
  validateRequest(loginSchema),
  authController.login,
);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;

const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const codebaseRoutes = require("./routes/codebaseRoutes");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

// Custom CORS Configuration
const allowedOrigins = [
  "http://localhost:3000", // Default React / Next.js port
  "http://localhost:5173", // Default Vite port
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, or curl)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS: Origin not allowed"));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

// Apply CORS Middleware
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded ZIPs and extractions statically if needed
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", codebaseRoutes); // Mounts /workspaces/:id/codebase/*
app.use("/api", taskRoutes); // Mounts /workspaces/:id/tasks and /tasks/:taskId/*

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;

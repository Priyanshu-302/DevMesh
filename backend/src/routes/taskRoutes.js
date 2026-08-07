const express = require("express");
const { z } = require("zod");
const taskController = require("../controllers/taskController");
const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define validation schemas
const createTaskSchema = z.object({
  requestText: z
    .string()
    .min(5, "Task request text must be at least 5 characters long"),
});

// Protect all task endpoints
router.use(authMiddleware);

// Workspace-nested task endpoints
// POST /api/workspaces/:id/tasks
router.post(
  "/workspaces/:id/tasks",
  validateRequest(createTaskSchema),
  taskController.createTask,
);

// GET /api/workspaces/:id/tasks
router.get("/workspaces/:id/tasks", taskController.getTasks);

// Standalone task details and historical logs
// GET /api/tasks/:taskId
router.get("/tasks/:taskId", taskController.getTaskById);

// GET /api/tasks/:taskId/logs
router.get("/tasks/:taskId/logs", taskController.getTaskLogs);

module.exports = router;

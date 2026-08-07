const express = require("express");
const { z } = require("zod");
const workspaceController = require("../controllers/workspaceController");
const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define validation schemas
const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  description: z.string().max(500).optional(),
});

// Protect all workspace routes
router.use(authMiddleware);

// CRUD endpoints
router.post(
  "/",
  validateRequest(workspaceSchema),
  workspaceController.createWorkspace,
);
router.get("/", workspaceController.getWorkspaces);
router.get("/:id", workspaceController.getWorkspaceById);
router.put(
  "/:id",
  validateRequest(workspaceSchema),
  workspaceController.updateWorkspace,
);
router.delete("/:id", workspaceController.deleteWorkspace);

module.exports = router;

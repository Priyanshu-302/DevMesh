const express = require("express");
const codebaseController = require("../controllers/codebaseController");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload } = require("../services/codebaseUploadService");

const router = express.Router();

// Protect codebase routes
router.use(authMiddleware);

// POST /api/workspaces/:id/codebase/upload
router.post(
  "/workspaces/:id/codebase/upload",
  upload.single("zipFile"),
  codebaseController.uploadCodebase,
);

// GET /api/workspaces/:id/codebase/status
router.get(
  "/workspaces/:id/codebase/status",
  codebaseController.getIngestionStatus,
);

// POST /api/workspaces/:id/codebase/file
router.post(
  "/workspaces/:id/codebase/file",
  codebaseController.saveFileContent,
);

// GET /api/workspaces/:id/codebase/files
router.get(
  "/workspaces/:id/codebase/files",
  codebaseController.getCodebaseFiles,
);

module.exports = router;

const codebaseUploadService = require("../services/codebaseUploadService");
const codebaseIngestionService = require("../services/codebaseIngestionService");
const Workspace = require("../models/Workspace");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Upload codebase zip file to workspace
 */
const uploadCodebase = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;

  // 1. verify workspace exists
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  // 2. Check if uploaded file is available or not
  if (!req.file) {
    return errorResponse(
      res,
      400,
      "Please upload a valid codebase ZIP archive",
    );
  }

  // 3. Upload contents to workspace
  const updatedWorkspace = await codebaseUploadService.extractAndSaveCodebase(
    workspaceId,
    req.file.path,
  );

  // 4. Ingest the contents of the codebase
  await codebaseIngestionService.triggerCodebaseIngestion(workspaceId);

  return successResponse(
    res,
    200,
    "Codebase archive uploaded and extracted. Ingestion pipeline is running in background.",
    {
      workspaceId: updatedWorkspace._id,
      ingestionStatus: "ingesting",
    },
  );
});

/**
 * Fetch codebase ingestion status
 */
const getIngestionStatus = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  return successResponse(res, 200, "Ingestion status retrieved successfully", {
    workspaceId: workspace._id,
    ingestionStatus: workspace.ingestionStatus,
    ingestionError: workspace.ingestionError,
  });
});

const fs = require("fs");
const path = require("path");

/**
 * Save file content in the workspace codebase
 */
const saveFileContent = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const { filePath, content } = req.body;

  if (!filePath || typeof content === "undefined") {
    return errorResponse(res, 400, "filePath and content are required");
  }

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  if (!workspace.codebasePath) {
    return errorResponse(res, 400, "No codebase associated with this workspace");
  }

  // Resolve safe file path and prevent directory traversal
  const resolvedPath = path.resolve(workspace.codebasePath, filePath);
  if (!resolvedPath.startsWith(path.resolve(workspace.codebasePath))) {
    return errorResponse(res, 403, "Access denied: Path traversal detected");
  }

  // Write file content
  try {
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, content, "utf8");
  } catch (err) {
    return errorResponse(res, 500, "Failed to save file", err.message);
  }

  // Re-trigger ingestion pipeline to update vector search
  try {
    workspace.ingestionStatus = "extracted";
    await workspace.save();
    await codebaseIngestionService.triggerCodebaseIngestion(workspaceId);
  } catch (err) {
    console.error(`Failed to re-trigger ingestion after file edit: ${err.message}`);
  }

  return successResponse(res, 200, "File content saved and ingestion re-triggered successfully");
});

/**
 * Retrieve all files and their contents from the workspace codebase
 */
const getCodebaseFiles = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  if (!workspace.codebasePath || !fs.existsSync(workspace.codebasePath)) {
    return successResponse(res, 200, "No files found", { files: {} });
  }

  const files = {};
  const readDir = (dir) => {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file === "node_modules" || file === ".git" || file === "dist" || file === "build" || file === ".turbo" || file === "logs" || file === "uploads" || file === "temp") {
          continue;
        }
        readDir(fullPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        // Skip memory state files and dot hashes files
        if (file.startsWith("memory_") || file.startsWith(".file-hashes_")) {
          continue;
        }
        // Only load supported text extensions
        const supported = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.html', '.cpp', '.h', '.py', '.cs', '.java'];
        if (supported.includes(ext)) {
          const rel = path.relative(workspace.codebasePath, fullPath).replace(/\\/g, '/');
          files[rel] = fs.readFileSync(fullPath, "utf8");
        }
      }
    }
  };

  try {
    readDir(workspace.codebasePath);
  } catch (err) {
    return errorResponse(res, 500, "Failed to read codebase files", err.message);
  }

  return successResponse(res, 200, "Codebase files retrieved successfully", { files });
});

module.exports = {
  uploadCodebase,
  getIngestionStatus,
  saveFileContent,
  getCodebaseFiles,
};
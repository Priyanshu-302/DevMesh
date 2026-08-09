const fs = require("fs");
const path = require("path");

/**
 * Dynamically resolves the codebase path of a workspace.
 * Prevents OS path mismatch errors (e.g. Windows paths loaded on a Linux container).
 */
const getWorkspaceCodebasePath = (workspace) => {
  if (!workspace) return null;

  // 1. Try the saved path directly (if it exists on this system)
  if (workspace.codebasePath && fs.existsSync(workspace.codebasePath)) {
    return workspace.codebasePath;
  }

  // 2. Fallback: resolve relative to the server's backend/uploads directory
  const resolvedPath = path.join(__dirname, "../../uploads", `workspace_${workspace._id}`);
  return resolvedPath;
};

module.exports = { getWorkspaceCodebasePath };

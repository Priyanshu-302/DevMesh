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

module.exports = {
  uploadCodebase,
  getIngestionStatus,
};
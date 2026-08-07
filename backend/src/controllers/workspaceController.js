const Workspace = require("../models/Workspace");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Create a new workspace
 */
const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user._id,
    ingestionStatus: "none",
  });

  return successResponse(res, 201, "Workspace created successfully", workspace);
});

/**
 * Get all workspaces owned by the user
 */
const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  return successResponse(
    res,
    200,
    "Workspaces retrieved successfully",
    workspaces,
  );
});

/**
 * Get a single workspace by ID
 */
const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  return successResponse(
    res,
    200,
    "Workspace retrieved successfully",
    workspace,
  );
});

/**
 * Update workspace's details
 */
const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const workspace = await Workspace.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    { name, description },
    { new: true, runValidators: true },
  );

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  return successResponse(res, 200, "Workspace updated successfully", workspace);
});

/**
 * Delete a workspace
 */
const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  return successResponse(res, 200, "Workspace deleted successfully");
});

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};

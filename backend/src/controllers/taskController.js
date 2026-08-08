const taskService = require("../services/taskService");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Create task and initiate pipeline execution
 */
const createTask = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const { requestText, parentTaskId } = req.body;

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  // run bg piplines
  const task = await taskService.createAndExecuteTask(workspaceId, requestText, parentTaskId);

  return successResponse(
    res,
    201,
    "Task pipeline triggered successfully",
    task,
  );
});

/**
 * Get all tasks
 */
const getTasks = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: req.user._id,
  });

  if (!workspace) {
    return errorResponse(res, 404, "Workspace not found");
  }

  const tasks = await Task.find({ workspace: workspaceId }).sort({
    createdAt: -1,
  });

  return successResponse(
    res,
    200,
    "Workspace tasks retrieved successfully",
    tasks,
  );
});

/**
 * Get specufuc task details
 */
const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await taskService.getTaskById(taskId);

  if (task.workspace.owner.toString() !== req.user._id.toString()) {
    return errorResponse(
      res,
      403,
      "Forbidden: You do not own the workspace corresponding to this task",
    );
  }

  return successResponse(res, 200, "Task details retrieved successfully", task);
});

/**
 * Retreive logs
 */
const getTaskLogs = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await taskService.getTaskById(taskId);

  if (task.workspace.owner.toString() !== req.user._id.toString()) {
    return errorResponse(
      res,
      403,
      "Forbidden: You do not own the workspace corresponding to this task",
    );
  }

  const logs = await taskService.getTaskLogs(taskId);
  return successResponse(
    res,
    200,
    "Task execution logs retrieved successfully",
    logs,
  );
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  getTaskLogs,
};

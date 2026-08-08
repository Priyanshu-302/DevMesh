const Task = require("../models/Task");
const Workspace = require("../models/Workspace");
const AgentLog = require("../models/AgentLog");
const logger = require("../utils/logger");
const aiAgent = require("../../../ai-agent");
const { broadcastToTaskRoom } = require("../websocket/socketServer");

/**
 * Create and Execute Task
 * If the status is completed the trigger the new AI pipeline
 */
const createAndExecuteTask = async (workspaceId, requestText, parentTaskId = null) => {
  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if ingestion status is completed or not
  if (workspace.ingestionStatus !== "completed") {
    const error = new Error(
      `Task creation rejected: Workspace ingestion status is '${workspace.ingestionStatus}'. Must be 'completed'.`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Create the task with status "pending"
  const task = await Task.create({
    workspace: workspaceId,
    requestText,
    status: "pending",
    parentTask: parentTaskId || null,
  });

  // Execute agent pipeline asynchronously
  process.nextTick(async () => {
    try {
      task.status = "in-progress";
      await task.save();

      logger.info(`Running agent pipeline for Task ${task._id}...`);

      let agentRequestText = task.requestText;
      if (parentTaskId) {
        try {
          const parentTask = await Task.findById(parentTaskId);
          if (parentTask) {
            agentRequestText = `Context from previous conversation/task:\n` +
              `- Previous prompt: "${parentTask.requestText}"\n` +
              `- Previous status: completed\n\n` +
              `Current follow-up instruction to implement now:\n"${task.requestText}"`;
          }
        } catch (err) {
          logger.warn(`Failed to retrieve parent task ${parentTaskId} context: ${err.message}`);
        }
      }

      await aiAgent.runAgentPipeline(
        {
          taskId: task._id.toString(),
          workspaceId: workspace._id.toString(),
          requestText: agentRequestText,
          codebasePath: workspace.codebasePath,
        },
        async (event) => {
          const eventType = event.type || "agent_event";
          const payload = event.data || event;

          // 1. Stroe Agent Logs in MongoDB
          await AgentLog.create({
            task: task._id,
            eventType,
            payload,
          });

          // 2. Broadcast update to websocket room
          broadcastToTaskRoom(task._id.toString(), eventType, payload);

          // Update task data
          if (eventType === "task_completed") {
            task.status = "completed";
            const finalCodeVal = payload.finalCode || payload.data?.finalCode || "";
            task.finalCode = typeof finalCodeVal === "object" ? JSON.stringify(finalCodeVal, null, 2) : finalCodeVal;
            const testSuiteVal = payload.testSuite || payload.data?.testSuite || "";
            task.testSuite = typeof testSuiteVal === "object" ? JSON.stringify(testSuiteVal, null, 2) : testSuiteVal;
            await task.save();
          } else if (eventType === "task_failed") {
            task.status = "failed";
            task.error =
              payload.reason ||
              payload.data?.reason ||
              "Agent execution failed";
            await task.save();
          }
        },
      );
    } catch (error) {
      logger.error(
        `Task pipeline execution failed for task ${task._id}: ${error.message}`,
      );
      task.status = "failed";
      task.error = error.message;
      await task.save();

      const failPayload = { reason: error.message };
      await AgentLog.create({
        task: task._id,
        eventType: "task_failed",
        payload: failPayload,
      });

      broadcastToTaskRoom(task._id.toString(), "task_failed", failPayload);
    }
  });

  return task;
};

/**
 * Get task details by ID
 */
const getTaskById = async (taskId) => {
  // Find the task
  const task = await Task.findById(taskId).populate("workspace");
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

/**
 * Get all audit logs for a task
 */
const getTaskLogs = async (taskId) => {
  return AgentLog.find({ task: taskId }).sort({ timestamp: 1 });
};

module.exports = { createAndExecuteTask, getTaskById, getTaskLogs };

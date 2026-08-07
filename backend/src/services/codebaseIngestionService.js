const Workspace = require("../models/Workspace");
const logger = require("../utils/logger");
const aiAgent = require("../../../ai-agent");

// Triggers the background ingestion codebase via ai agent
const triggerCodebaseIngestion = async (workspaceId) => {
  // Find the workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  if (workspace.ingestionStatus !== "extracted") {
    const error = new Error(
      `Cannot start ingestion. Workspace status must be 'extracted', current status is '${workspace.ingestionStatus}'`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Set status to ingesting
  workspace.ingestionStatus = "ingesting";
  workspace.ingestionError = null;
  await workspace.save();

  /**
   * What process.nextTick() does is it tells Node.js to fully read and execute the file and return the required result and then come back to nextTick() method to run in background.
   * This will let the user see immediate response and the process will run in the background
   */
  process.nextTick(async () => {
    try {
      logger.info(
        `🤖 Triggering ai-agent.ingestCodebase for workspace ${workspaceId}...`,
      );

      await aiAgent.ingestCodebase({
        workspaceId: workspace._id.toString(),
        codebasePath: workspace.codebasePath,
      });

      workspace.ingestionStatus = "completed";
      await workspace.save();

      logger.info(
        `Ingestion completed successfully for workspace ${workspaceId}`,
      );
    } catch (error) {
      logger.error(
        `Ingestion failed for workspace ${workspaceId}: ${error.message}`,
      );
      workspace.ingestionStatus = "failed";
      workspace.ingestionError = error.message;
      await workspace.save();
    }
  });

  return workspace;
};

module.exports = { triggerCodebaseIngestion };

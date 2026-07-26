/**
 * Event Type constants for execution pipeline
 */
const EVENT_TYPES = {
  ARCHITECT_STARTED: "architect_started",
  ARCHITECT_PLAN: "architect_plan",
  DEVELOPER_STARTED: "developer_started",
  DEVELOPER_CODE_CHUNK: "developer_code_chunk",
  QA_STARTED: "qa_started",
  QA_RESULT: "qa_result",
  TASK_COMPLETED: "task_completed",
  TASK_FAILED: "task_failed",
};

module.exports = EVENT_TYPES;

function createInitialState(task, codebaseContext = {}, memory = {}) {
  return {
    taskId: task.taskId || '',
    workspaceId: task.workspaceId || '',
    requestText: task.requestText || '',
    codebasePath: task.codebasePath || '',
    plan: '',
    filesToChange: [],
    currentCode: codebaseContext.currentCode || {},
    qaFeedback: '',
    passed: false,
    retryCount: 0,
    maxRetries: task.maxRetries || 3,
    testSuite: '',
    history: [],
    currentNode: 'architect',
    onEvent: task.onEvent || (() => {})
  };
}

module.exports = {
  createInitialState
};

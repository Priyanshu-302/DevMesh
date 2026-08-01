const { StateGraph } = require('../src/graph/agentGraph');
const { logger } = require('../src/utils/logger');

async function verify() {
  logger.info('VERIFY_PHASE_4', 'Verifying Phase 4: StateGraph Assembly & Transitions...');

  try {
    const testWorkflow = new StateGraph()
      .addNode('architect', async (state) => ({ plan: 'Mock Plan', architectStatus: 'completed' }))
      .addNode('developer', async (state) => ({ proposedChanges: [{ filePath: 'test.js', content: 'x=1' }], developerStatus: 'completed' }))
      .addNode('qa', async (state) => ({ qaPassed: true, qaStatus: 'completed' }))
      .addEdge('architect', 'developer')
      .addEdge('developer', 'qa')
      .addConditionalEdge('qa', (state) => state.qaPassed ? 'end' : 'failed');

    const result = await testWorkflow.run({
      task: 'Mock Task',
      codebaseContext: {},
      memory: {},
      errors: [],
      history: []
    });

    if (result.currentNode !== 'end' || result.architectStatus !== 'completed' || result.developerStatus !== 'completed') {
      throw new Error(`Graph executed incorrectly, final state: ${JSON.stringify(result)}`);
    }

    logger.info('VERIFY_PHASE_4_SUCCESS', 'StateGraph assembled and executed mock pipeline successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('VERIFY_PHASE_4_FAILED', `Phase 4 verification failed: ${error.message}`);
    process.exit(1);
  }
}

verify();

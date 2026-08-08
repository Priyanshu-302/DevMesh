const { embedder } = require('../ingestion/embedder');
const chromaClient = require('../vectorStore/chromaClient');
const { logger } = require('../../utils/logger');

async function retrieveContext(query, workspaceId, limit = 5) {
  logger.info('RETRIEVAL_START', `Retrieving context for query: "${query}" in workspace: ${workspaceId}`);

  try {
    const queryVector = await embedder.embed(query);
    const results = await chromaClient.query(queryVector, workspaceId, limit);

    logger.info('RETRIEVAL_SUCCESS', `Retrieved ${results.length} relevant context chunks.`);
    return results;
  } catch (error) {
    logger.error('RETRIEVAL_FAIL', `Context retrieval failed: ${error.message}`);
    return [];
  }
}

module.exports = {
  retrieveContext
};

const chromaClient = require('../src/rag/vectorStore/chromaClient');
const { retrieveContext } = require('../src/rag/retrieval/retriver');
const { logger } = require('../src/utils/logger');

async function verify() {
  logger.info('VERIFY_PHASE_3', 'Verifying Phase 3: Vector Store Insertion & Query Retrieval...');

  try {
    const dummyChunks = [
      {
        id: 'chunk_1',
        filePath: 'test.js',
        content: 'const x = 10; function getTen() { return x; }',
        embedding: new Array(384).fill(0.1),
        startLine: 1,
        endLine: 2
      }
    ];

    await chromaClient.addChunks(dummyChunks);
    logger.info('VERIFY_PHASE_3', 'Added dummy chunks to vector store.');

    const queryResults = await retrieveContext('function getTen', 1);
    if (queryResults.length === 0) {
      throw new Error('No results returned from query search.');
    }

    logger.info('VERIFY_PHASE_3_SUCCESS', `Successfully retrieved matching chunk: "${queryResults[0].content}"`);
    process.exit(0);
  } catch (error) {
    logger.error('VERIFY_PHASE_3_FAILED', `Phase 3 verification failed: ${error.message}`);
    process.exit(1);
  }
}

verify();

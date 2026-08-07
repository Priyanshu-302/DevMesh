const { chunkFile } = require('../src/rag/ingestion/chunker');
const { embedder } = require('../src/rag/ingestion/embedder');
const { logger } = require('../src/utils/logger');

async function verify() {
  logger.info('VERIFY_PHASE_2', 'Verifying Phase 2: Chunker & Embedder...');

  try {
    const dummyCode = `
      class Calculator {
        add(a, b) {
          return a + b;
        }
      }
    `;
    
    const chunks = chunkFile('test.js', dummyCode);
    if (chunks.length === 0) {
      throw new Error('Chunker generated 0 chunks.');
    }
    logger.info('VERIFY_PHASE_2', `Chunker generated ${chunks.length} chunks successfully.`);

    const embedding = await embedder.embed(chunks[0].content);
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Embedder failed to generate array vector.');
    }
    logger.info('VERIFY_PHASE_2_SUCCESS', `Embedder successfully generated vector of length ${embedding.length}`);
    process.exit(0);
  } catch (error) {
    logger.error('VERIFY_PHASE_2_FAILED', `Phase 2 verification failed: ${error.message}`);
    process.exit(1);
  }
}

verify();

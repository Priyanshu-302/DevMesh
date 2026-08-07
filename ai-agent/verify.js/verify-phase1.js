const path = require('path');
const { parseDirectory } = require('../src/rag/ingestion/fileParser');
const { logger } = require('../src/utils/logger');

async function verify() {
  logger.info('VERIFY_PHASE_1', 'Verifying Phase 1: Codebase Directory Parsing...');
  
  try {
    const results = parseDirectory(path.join(__dirname, '..', 'src'));
    if (results.length > 0) {
      logger.info('VERIFY_PHASE_1_SUCCESS', `Successfully parsed ${results.length} files under src/`);
      console.log('Sample file:', results[0].relativePath);
      process.exit(0);
    } else {
      throw new Error('No files parsed.');
    }
  } catch (error) {
    logger.error('VERIFY_PHASE_1_FAILED', `Phase 1 verification failed: ${error.message}`);
    process.exit(1);
  }
}

verify();

const { throttle } = require('../src/reliability/throttle');
const { logger } = require('../src/utils/logger');

async function verify() {
  logger.info('VERIFY_PHASE_5', 'Verifying Phase 5: Reliability & Throttling...');

  try {
    const startTime = Date.now();
    const delay = 800;
    
    await throttle(delay);
    
    const duration = Date.now() - startTime;
    if (duration < delay - 100) {
      throw new Error(`Throttler returned too quickly. Expected ~${delay}ms, took ${duration}ms.`);
    }

    logger.info('VERIFY_PHASE_5_SUCCESS', `Throttler delayed execution successfully (took ${duration}ms).`);
    process.exit(0);
  } catch (error) {
    logger.error('VERIFY_PHASE_5_FAILED', `Phase 5 verification failed: ${error.message}`);
    process.exit(1);
  }
}

verify();

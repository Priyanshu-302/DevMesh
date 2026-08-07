const { logger } = require('../utils/logger');
const { EVENT_TYPES } = require('../utils/eventTypes');

function routeAfterQA(state) {
  logger.info(EVENT_TYPES.ROUTER_DECISION, `QA routing decision: passed = ${state.passed}, retries = ${state.retryCount}/${state.maxRetries}`);
  
  if (state.passed) {
    return 'end';
  }
  
  if (state.retryCount < state.maxRetries) {
    return 'developer';
  }
  
  return 'failed';
}

module.exports = {
  routeAfterQA
};

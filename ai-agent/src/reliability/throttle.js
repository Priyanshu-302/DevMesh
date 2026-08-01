const { logger } = require('../utils/logger');

function throttle(ms = 1000) {
  logger.info('THROTTLE_DELAY', `Throttling API call: waiting for ${ms}ms...`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  throttle
};

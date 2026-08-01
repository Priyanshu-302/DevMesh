const logger = {
  info(event, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [${event}] ${message}`);
  },

  warn(event, message) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${event}] ${message}`);
  },

  error(event, message) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${event}] ${message}`);
  }
};

module.exports = {
  logger
};

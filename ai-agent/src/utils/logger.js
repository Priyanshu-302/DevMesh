const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../../backend/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'agent.log');

const logger = {
  info(event, message) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [INFO] [${event}] ${message}\n`;
    console.log(formatted.trim());
    try {
      fs.appendFileSync(logFile, formatted, 'utf8');
    } catch (e) {
      // Ignore write errors
    }
  },

  warn(event, message) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [WARN] [${event}] ${message}\n`;
    console.warn(formatted.trim());
    try {
      fs.appendFileSync(logFile, formatted, 'utf8');
    } catch (e) {
      // Ignore write errors
    }
  },

  error(event, message) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [ERROR] [${event}] ${message}\n`;
    console.error(formatted.trim());
    try {
      fs.appendFileSync(logFile, formatted, 'utf8');
    } catch (e) {
      // Ignore write errors
    }
  }
};

module.exports = {
  logger
};

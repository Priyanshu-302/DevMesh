const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

class FileHashTracker {
  constructor(trackerFilePath = null) {
    this.trackerFilePath = trackerFilePath || path.join(process.cwd(), '.file-hashes.json');
    this.hashes = {};
    this.loadHashes();
  }

  loadHashes() {
    try {
      if (fs.existsSync(this.trackerFilePath)) {
        const data = fs.readFileSync(this.trackerFilePath, 'utf8');
        this.hashes = JSON.parse(data);
      }
    } catch (error) {
      logger.error('MEMORY_HASH_LOAD_FAIL', `Failed to load file hashes: ${error.message}`);
      this.hashes = {};
    }
  }

  saveHashes() {
    try {
      fs.writeFileSync(this.trackerFilePath, JSON.stringify(this.hashes, null, 2), 'utf8');
    } catch (error) {
      logger.error('MEMORY_HASH_SAVE_FAIL', `Failed to save file hashes: ${error.message}`);
    }
  }

  computeHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  hasChanged(filePath, content) {
    const currentHash = this.computeHash(content);
    const relativePath = path.relative(process.cwd(), filePath);
    const trackedHash = this.hashes[relativePath];

    if (!trackedHash || trackedHash !== currentHash) {
      this.hashes[relativePath] = currentHash;
      return true;
    }

    return false;
  }

  removeTrackedFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    if (this.hashes[relativePath]) {
      delete this.hashes[relativePath];
    }
  }

  clearAll() {
    this.hashes = {};
    if (fs.existsSync(this.trackerFilePath)) {
      try {
        fs.unlinkSync(this.trackerFilePath);
      } catch (error) {
        // Ignore
      }
    }
  }
}

module.exports = FileHashTracker;

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

class MemoryManager {
  constructor(memoryFilePath = null) {
    this.memoryFilePath = memoryFilePath || path.join(process.cwd(), 'codebase-memory.json');
    this.memory = {
      projectSummary: '',
      fileSummaries: {},
      technologies: [],
      lastUpdated: new Date().toISOString()
    };
    this.loadMemory();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFilePath)) {
        const data = fs.readFileSync(this.memoryFilePath, 'utf8');
        this.memory = JSON.parse(data);
      }
    } catch (error) {
      logger.error('MEMORY_LOAD_FAIL', `Failed to load codebase memory: ${error.message}`);
    }
  }

  saveMemory() {
    try {
      this.memory.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.memoryFilePath, JSON.stringify(this.memory, null, 2), 'utf8');
    } catch (error) {
      logger.error('MEMORY_SAVE_FAIL', `Failed to save codebase memory: ${error.message}`);
    }
  }

  getMemory() {
    return this.memory;
  }

  updateProjectSummary(summary) {
    this.memory.projectSummary = summary;
  }

  updateFileSummary(relativePath, summary) {
    this.memory.fileSummaries[relativePath] = summary;
  }

  removeFileSummary(relativePath) {
    if (this.memory.fileSummaries[relativePath]) {
      delete this.memory.fileSummaries[relativePath];
    }
  }
}

module.exports = MemoryManager;

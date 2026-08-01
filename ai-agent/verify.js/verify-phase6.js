const path = require('path');
const fs = require('fs');
const MemoryManager = require('../src/memory/memoryManager');
const FileHashTracker = require('../src/memory/fileHashTracker');
const { logger } = require('../src/utils/logger');

async function verify() {
  logger.info('VERIFY_PHASE_6', 'Verifying Phase 6: Codebase Memory & Hash Tracking...');

  const tempMemoryFile = path.join(__dirname, 'temp-memory.json');
  const tempHashFile = path.join(__dirname, 'temp-hashes.json');

  try {
    const memoryManager = new MemoryManager(tempMemoryFile);
    memoryManager.updateProjectSummary('Test Project Summary');
    memoryManager.updateFileSummary('src/index.js', 'Core public api interface file');
    memoryManager.saveMemory();

    if (!fs.existsSync(tempMemoryFile)) {
      throw new Error('MemoryManager failed to save JSON file.');
    }

    const testManager = new MemoryManager(tempMemoryFile);
    if (testManager.getMemory().projectSummary !== 'Test Project Summary') {
      throw new Error('MemoryManager failed to persist projectSummary correctly.');
    }
    logger.info('VERIFY_PHASE_6', 'MemoryManager saved, loaded, and updated data correctly.');

    const hashTracker = new FileHashTracker(tempHashFile);
    const mockFilePath = 'mock-file.js';
    const contentV1 = 'const a = 1;';
    const contentV2 = 'const a = 2;';

    const firstCheck = hashTracker.hasChanged(mockFilePath, contentV1);
    if (!firstCheck) {
      throw new Error('FileHashTracker failed to mark untracked file as changed.');
    }

    const secondCheck = hashTracker.hasChanged(mockFilePath, contentV1);
    if (secondCheck) {
      throw new Error('FileHashTracker marked unmodified file as changed.');
    }

    const thirdCheck = hashTracker.hasChanged(mockFilePath, contentV2);
    if (!thirdCheck) {
      throw new Error('FileHashTracker failed to detect content modification.');
    }

    logger.info('VERIFY_PHASE_6_SUCCESS', 'Codebase memory and hash tracking verified successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('VERIFY_PHASE_6_FAILED', `Phase 6 verification failed: ${error.message}`);
    process.exit(1);
  } finally {
    try {
      if (fs.existsSync(tempMemoryFile)) fs.unlinkSync(tempMemoryFile);
      if (fs.existsSync(tempHashFile)) fs.unlinkSync(tempHashFile);
    } catch (e) {
      // Ignore
    }
  }
}

verify();

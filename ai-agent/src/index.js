const path = require('path');
const fs = require('fs');

const { parseDirectory } = require('./rag/ingestion/fileParser');
const { chunkFile } = require('./rag/ingestion/chunker');
const { embedder } = require('./rag/ingestion/embedder');
const chromaClient = require('./rag/vectorStore/chromaClient');

const MemoryManager = require('./memory/memoryManager');
const MemoryUpdater = require('./memory/memoryUpdater');
const FileHashTracker = require('./memory/fileHashTracker');

const { runAgentPipeline } = require('./graph/agentGraph');
const { logger } = require('./utils/logger');

const memoryManager = new MemoryManager();
const memoryUpdater = new MemoryUpdater(memoryManager);
const hashTracker = new FileHashTracker();

async function ingestCodebase(dirPath = process.cwd()) {
  logger.info('INGESTION_START', `Starting codebase ingestion for directory: ${dirPath}`);

  try {
    const parsedFiles = parseDirectory(dirPath);
    logger.info('INGESTION_PARSE', `Found ${parsedFiles.length} files matching supported extensions.`);

    const chunksToEmbed = [];

    for (const file of parsedFiles) {
      const changed = hashTracker.hasChanged(file.filePath, file.content);

      if (changed) {
        logger.info('INGESTION_FILTER', `File changed or untracked: ${file.relativePath}`);

        const fileChunks = chunkFile(file.filePath, file.content);

        for (const chunk of fileChunks) {
          const embedding = await embedder.embed(chunk.content);
          chunksToEmbed.push({
            ...chunk,
            embedding
          });
        }

        await memoryUpdater.updateFileMemory(file.relativePath, file.content);
      }
    }

    if (chunksToEmbed.length > 0) {
      await chromaClient.addChunks(chunksToEmbed);
      hashTracker.saveHashes();
      logger.info('INGESTION_VECTOR_DB', `Uploaded ${chunksToEmbed.length} chunks to vector store.`);
    } else {
      logger.info('INGESTION_NO_CHANGES', 'No codebase changes detected. Skipping embedding generation.');
    }

    await memoryUpdater.updateProjectSummary();
    logger.info('INGESTION_SUCCESS', 'Codebase ingestion completed successfully.');
  } catch (error) {
    logger.error('INGESTION_FAILED', `Codebase ingestion failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  ingestCodebase,
  runAgentPipeline
};

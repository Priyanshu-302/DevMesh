const path = require('path');
const fs = require('fs');

const { parseDirectory } = require('./rag/ingestion/fileParser');
const { chunkFile } = require('./rag/ingestion/chunker');
const { embedder } = require('./rag/ingestion/embedder');
const chromaClient = require('./rag/vectorStore/chromaClient');

const MemoryManager = require('./memory/memoryManager');
const MemoryUpdater = require('./memory/memoryUpdater');
const FileHashTracker = require('./memory/fileHashTracker');

const { runAgentPipeline: executePipeline } = require('./graph/agentGraph');
const { logger } = require('./utils/logger');
const { callWithRetry } = require('./reliability/callWithRetry');

async function ingestCodebase({ workspaceId, codebasePath }) {
  if (!codebasePath) {
    return Promise.reject('Missing required codebasePath');
  }

  logger.info('INGESTION_START', `Starting codebase ingestion for workspace ${workspaceId} at ${codebasePath}`);

  try {
    const parsedFiles = parseDirectory(codebasePath);
    logger.info('INGESTION_PARSE', `Found ${parsedFiles.length} files matching supported extensions.`);

    // Scope memory & hash tracking by workspaceId
    const memoryFile = workspaceId ? path.join(codebasePath, `memory_${workspaceId}.json`) : null;
    const hashFile = workspaceId ? path.join(codebasePath, `.file-hashes_${workspaceId}.json`) : null;

    const memoryManager = new MemoryManager(memoryFile);
    const memoryUpdater = new MemoryUpdater(memoryManager);
    const hashTracker = new FileHashTracker(hashFile);

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
    // Error behavior: reject the promise with a descriptive error string
    throw error.message || String(error);
  }
}

async function runAgentPipeline({ taskId, workspaceId, requestText, codebasePath }, onEvent) {
  // Wrap entire execution in try/catch to satisfy: "On completion or failure, resolves (never rejects)"
  try {
    logger.info('PIPELINE_RUN', `Running agent pipeline for task ${taskId} in workspace ${workspaceId}`);
    
    // Validate inputs
    if (!codebasePath || !requestText) {
      throw new Error('Missing codebasePath or requestText');
    }

    // Set up scoped memory manager & hash tracker
    const memoryFile = workspaceId ? path.join(codebasePath, `memory_${workspaceId}.json`) : null;
    const hashFile = workspaceId ? path.join(codebasePath, `.file-hashes_${workspaceId}.json`) : null;

    const memoryManager = new MemoryManager(memoryFile);
    const hashTracker = new FileHashTracker(hashFile);

    // Call the LangGraph agent graph execution
    const taskInput = {
      taskId,
      workspaceId,
      requestText,
      codebasePath,
      onEvent
    };

    const finalState = await executePipeline(taskInput, { currentCode: {} }, memoryManager.getMemory());

    if (finalState.currentNode === 'end' && finalState.passed) {
      logger.info('PIPELINE_COMPLETE_SUCCESS', `Task ${taskId} finished successfully.`);

      // 1. Write the final changes to disk
      for (const [filePath, content] of Object.entries(finalState.currentCode)) {
        const fullPath = path.resolve(codebasePath, filePath);
        // Ensure folder exists
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
        logger.info('PIPELINE_WRITE_FILE', `Wrote changes to: ${filePath}`);
      }

      // 2. Compare file hashes and compute delta summaries to update memory
      const memoryUpdater = new MemoryUpdater(memoryManager);
      for (const [filePath, content] of Object.entries(finalState.currentCode)) {
        const fullPath = path.resolve(codebasePath, filePath);
        
        // Calculate hash change delta
        const changed = hashTracker.hasChanged(fullPath, content);
        if (changed) {
          logger.info('PIPELINE_DELTA_MEMORY', `Updating memory summary for changed file: ${filePath}`);
          
          // Generate memory summary of the changes
          const deltaPrompt = `
Analyze the changes made to "${filePath}" for the task "${requestText}".
Please summarize the changes in 1-2 sentences.

New Content:
${content}
`;
          try {
            const response = await callWithRetry({
              messages: [
                { role: 'system', content: 'You are a codebase documentation system.' },
                { role: 'user', content: deltaPrompt }
              ]
            });
            const deltaSummary = response.choices[0].message.content.trim();
            memoryManager.updateFileSummary(filePath, deltaSummary);
          } catch (e) {
            logger.warn('PIPELINE_DELTA_FAIL', `Failed to generate delta memory for ${filePath}: ${e.message}`);
          }
        }
      }

      // Save hashes and project summaries
      hashTracker.saveHashes();
      await memoryUpdater.updateProjectSummary();

      // Emit completed event
      if (onEvent) {
        onEvent({
          type: 'task_completed',
          data: {
            finalCode: finalState.currentCode,
            testSuite: finalState.testSuite
          }
        });
      }
    } else {
      // Failed path
      logger.error('PIPELINE_COMPLETE_FAIL', `Task ${taskId} failed. Final node: ${finalState.currentNode}`);
      if (onEvent) {
        onEvent({
          type: 'task_failed',
          data: {
            reason: finalState.qaFeedback || 'QA verification failed max retries.'
          }
        });
      }
    }

  } catch (error) {
    logger.error('PIPELINE_CRITICAL_ERROR', `Pipeline execution threw critical exception: ${error.message}`);
    if (onEvent) {
      onEvent({
        type: 'task_failed',
        data: {
          reason: `Exception: ${error.message}`
        }
      });
    }
  }
}

module.exports = {
  ingestCodebase,
  runAgentPipeline
};

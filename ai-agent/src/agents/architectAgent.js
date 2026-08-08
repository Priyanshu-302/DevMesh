const { callWithRetry } = require('../reliability/callWithRetry');
const { retrieveContext } = require('../rag/retrieval/retriver');
const MemoryManager = require('../memory/memoryManager');
const { ARCHITECT_SYSTEM_PROMPT } = require('../prompts/architectPrompt');
const { logger } = require('../utils/logger');
const { EVENT_TYPES } = require('../utils/eventTypes');

async function architectAgent(state) {
  logger.info(EVENT_TYPES.ARCHITECT_START, 'Architect agent starting technical planning...');
  
  if (state.onEvent) {
    state.onEvent({ type: 'architect_started' });
  }

  // Read memory
  const memoryManager = new MemoryManager(state.workspaceId ? `memory_${state.workspaceId}.json` : null);
  const memory = memoryManager.getMemory();
  const projectSummary = memory.projectSummary || 'No summary available.';

  // Retrieve top-K chunks from vector store using request text
  const chunks = await retrieveContext(state.requestText, state.workspaceId, 5);
  const retrievedCodeContext = chunks.map(c => `File: ${c.filePath}\nLines: ${c.startLine}-${c.endLine}\nContent:\n${c.content}`).join('\n\n---\n\n');

  const userPrompt = `
Task Request: "${state.requestText}"
Workspace ID: "${state.workspaceId}"

Project Summary:
${projectSummary}

Retrieved Codebase Context:
${retrievedCodeContext}
`;

  try {
    const response = await callWithRetry({
      messages: [
        { role: 'system', content: ARCHITECT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const contentText = response.choices[0].message.content.trim();
    let result;
    try {
      result = JSON.parse(contentText);
    } catch (e) {
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Response is not valid JSON');
      }
    }

    logger.info(EVENT_TYPES.ARCHITECT_SUCCESS, `Architect plan generated for files: ${JSON.stringify(result.filesToChange)}`);

    if (state.onEvent) {
      state.onEvent({
        type: 'architect_plan',
        data: { plan: result.plan, filesToChange: result.filesToChange, filesToRead: result.filesToRead || [] }
      });
    }

    return {
      plan: result.plan,
      filesToChange: result.filesToChange,
      filesToRead: result.filesToRead || []
    };
  } catch (error) {
    logger.error(EVENT_TYPES.ARCHITECT_FAIL, `Architect failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  architectAgent
};

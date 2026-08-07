const { callWithRetry } = require('../reliability/callWithRetry');
const { DEVELOPER_SYSTEM_PROMPT } = require('../prompts/developerPrompt');
const { logger } = require('../utils/logger');
const { EVENT_TYPES } = require('../utils/eventTypes');
const fs = require('fs');
const path = require('path');

// Simple line-by-line diff generator
function simpleDiff(oldStr, newStr) {
  if (!oldStr) return `+ (New File Content Added)`;
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  let diff = '';
  diff += `Original length: ${oldLines.length} lines, New length: ${newLines.length} lines.\n`;
  diff += `Showing new contents:\n${newStr.substring(0, 300)}...`;
  return diff;
}

async function developerAgent(state) {
  logger.info(EVENT_TYPES.DEVELOPER_START, 'Developer agent starting coding changes...');
  
  if (state.onEvent) {
    state.onEvent({ type: 'developer_started' });
  }

  // Retrieve current code for files to change
  const currentCode = { ...state.currentCode };
  for (const filePath of state.filesToChange) {
    if (!currentCode[filePath]) {
      const fullPath = path.resolve(state.codebasePath || process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        currentCode[filePath] = fs.readFileSync(fullPath, 'utf8');
      } else {
        currentCode[filePath] = '';
      }
    }
  }

  const fileContext = Object.entries(currentCode)
    .map(([filePath, content]) => `File: ${filePath}\nCurrent Contents:\n${content}`)
    .join('\n\n---\n\n');

  const userPrompt = `
Task: "${state.requestText}"
Technical Plan:
${state.plan}

Files to Modify:
${state.filesToChange.join(', ')}

Current Code for Files:
${fileContext}

${state.qaFeedback ? `Previous QA Feedback to Address:\n${state.qaFeedback}` : ''}
`;

  try {
    const response = await callWithRetry({
      messages: [
        { role: 'system', content: DEVELOPER_SYSTEM_PROMPT },
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

    const updatedCode = { ...state.currentCode };
    
    for (const change of result.proposedChanges || []) {
      const originalContent = currentCode[change.filePath] || '';
      updatedCode[change.filePath] = change.content;
      
      const diff = simpleDiff(originalContent, change.content);
      
      if (state.onEvent) {
        state.onEvent({
          type: 'developer_code_chunk',
          data: {
            filePath: change.filePath,
            diff: diff
          }
        });
      }
    }

    logger.info(EVENT_TYPES.DEVELOPER_SUCCESS, 'Developer agent successfully generated code modifications.');
    
    return {
      currentCode: updatedCode
    };
  } catch (error) {
    logger.error(EVENT_TYPES.DEVELOPER_FAIL, `Developer failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  developerAgent
};

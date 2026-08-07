const { callWithRetry } = require('../reliability/callWithRetry');
const { DEVELOPER_SYSTEM_PROMPT } = require('../prompts/developerPrompt');
const { logger } = require('../utils/logger');
const { EVENT_TYPES } = require('../utils/eventTypes');
const fs = require('fs');
const path = require('path');

// Simple line-by-line diff generator
function simpleDiff(oldStr, newStr) {
  if (!oldStr) {
    // For new files, output the entire content as additions
    return newStr.split('\n').map(line => `+ ${line}`).join('\n');
  }

  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  let diff = '';
  
  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] === newLines[j]) {
        diff += `  ${oldLines[i]}\n`;
        i++; j++;
      } else {
        // Lookahead to check if the old line matches a later line in the new file (indicating additions)
        const nextMatch = newLines.indexOf(oldLines[i], j);
        if (nextMatch !== -1 && nextMatch - j < 10) {
          while (j < nextMatch) {
            diff += `+ ${newLines[j]}\n`;
            j++;
          }
        } else {
          // Line was deleted or modified
          diff += `- ${oldLines[i]}\n`;
          i++;
        }
      }
    } else if (i < oldLines.length) {
      diff += `- ${oldLines[i]}\n`;
      i++;
    } else if (j < newLines.length) {
      diff += `+ ${newLines[j]}\n`;
      j++;
    }
  }
  return diff.trimEnd();
}

async function developerAgent(state) {
  logger.info(EVENT_TYPES.DEVELOPER_START, 'Developer agent starting coding changes...');
  
  if (state.onEvent) {
    state.onEvent({ type: 'developer_started' });
  }

  // Combine files to change and files to read for reference
  const currentCode = { ...state.currentCode };
  const allFilesToLoad = Array.from(new Set([...state.filesToChange, ...(state.filesToRead || [])]));
  
  for (const filePath of allFilesToLoad) {
    if (!currentCode[filePath]) {
      const fullPath = path.resolve(state.codebasePath || process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        currentCode[filePath] = fs.readFileSync(fullPath, 'utf8');
      } else {
        currentCode[filePath] = '';
      }
    }
  }

  // Files targeted for editing or creation
  const fileContext = state.filesToChange
    .map(filePath => `File: ${filePath}\nCurrent Contents:\n${currentCode[filePath] || ''}`)
    .join('\n\n---\n\n');

  // Files provided purely for context / reference (read-only)
  const referenceContext = (state.filesToRead || [])
    .filter(filePath => !state.filesToChange.includes(filePath)) // avoid duplicate display
    .map(filePath => `File (Reference Only): ${filePath}\nContents:\n${currentCode[filePath] || ''}`)
    .join('\n\n---\n\n');

  const userPrompt = `
Task: "${state.requestText}"
Technical Plan:
${state.plan}

Files to Modify/Create:
${state.filesToChange.join(', ')}

Current Code for Files to Modify/Create:
${fileContext}

${referenceContext ? `Reference Files Context (Read-only):\n${referenceContext}` : ''}

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

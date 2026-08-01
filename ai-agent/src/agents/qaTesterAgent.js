const { callWithRetry } = require('../reliability/callWithRetry');
const { QA_SYSTEM_PROMPT } = require('../prompts/qaPrompt');
const { logger } = require('../utils/logger');
const { EVENT_TYPES } = require('../utils/eventTypes');

async function qaTesterAgent(state) {
  logger.info(EVENT_TYPES.QA_START, 'QA tester agent starting verification...');
  
  if (state.onEvent) {
    state.onEvent({ type: 'qa_started' });
  }

  const changesContext = Object.entries(state.currentCode)
    .map(([filePath, content]) => `File: ${filePath}\nProposed Code:\n${content}`)
    .join('\n\n---\n\n');

  const userPrompt = `
Original Task: "${state.requestText}"
Technical Plan:
${state.plan}

Files Changed and their Proposed Code:
${changesContext}

This is QA attempt number ${state.retryCount + 1} of ${state.maxRetries}.
`;

  try {
    const response = await callWithRetry({
      messages: [
        { role: 'system', content: QA_SYSTEM_PROMPT },
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

    logger.info(EVENT_TYPES.QA_SUCCESS, `QA result: passed = ${result.passed}, feedback = "${result.qaFeedback}"`);

    if (state.onEvent) {
      state.onEvent({
        type: 'qa_result',
        data: { passed: result.passed, feedback: result.qaFeedback }
      });
    }

    return {
      passed: result.passed,
      qaFeedback: result.qaFeedback,
      testSuite: result.testSuite || '',
      retryCount: state.retryCount + 1
    };
  } catch (error) {
    logger.error(EVENT_TYPES.QA_FAIL, `QA verification failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  qaTesterAgent
};

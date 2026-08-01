const { callWithRetry } = require('../reliability/callWithRetry');
const { logger } = require('../utils/logger');

class MemoryUpdater {
  constructor(memoryManager) {
    this.memoryManager = memoryManager;
  }

  async updateFileMemory(relativePath, newContent, diff = '') {
    logger.info('MEMORY_UPDATE_START', `Generating summary for: ${relativePath}`);

    const prompt = `
You are an expert developer reviewing a codebase change.
Please write a concise 1-2 sentence summary explaining the purpose and implementation of this file: "${relativePath}".

Current Contents:
${newContent}

${diff ? `Changes applied (diff):\n${diff}` : ''}

Provide only the plain text summary, do not include code formatting, Markdown tags, or conversational intros.
`;

    try {
      const response = await callWithRetry({
        messages: [
          { role: 'system', content: 'You are a technical documentation assistant.' },
          { role: 'user', content: prompt }
        ]
      });

      const summary = response.choices[0].message.content.trim();
      this.memoryManager.updateFileSummary(relativePath, summary);
      this.memoryManager.saveMemory();
      logger.info('MEMORY_UPDATE_SUCCESS', `Successfully updated summary for: ${relativePath}`);
    } catch (error) {
      logger.error('MEMORY_UPDATE_FAIL', `Failed to generate summary for ${relativePath}: ${error.message}`);
    }
  }

  async updateProjectSummary() {
    logger.info('MEMORY_PROJECT_UPDATE_START', 'Updating project summary...');
    const memory = this.memoryManager.getMemory();
    const filesList = Object.entries(memory.fileSummaries)
      .map(([file, summary]) => `- ${file}: ${summary}`)
      .join('\n');

    const prompt = `
You are an expert system designer. Review the following files and their summaries from the project codebase, and provide a single concise paragraph summary of the entire project structure and capabilities.

Files:
${filesList}

Provide only the plain text paragraph summary. Do not add formatting, markdown headers, or introduction.
`;

    try {
      const response = await callWithRetry({
        messages: [
          { role: 'system', content: 'You are a technical writer.' },
          { role: 'user', content: prompt }
        ]
      });

      const summary = response.choices[0].message.content.trim();
      this.memoryManager.updateProjectSummary(summary);
      this.memoryManager.saveMemory();
      logger.info('MEMORY_PROJECT_UPDATE_SUCCESS', 'Project summary successfully updated.');
    } catch (error) {
      logger.error('MEMORY_PROJECT_UPDATE_FAIL', `Failed to update project summary: ${error.message}`);
    }
  }
}

module.exports = MemoryUpdater;

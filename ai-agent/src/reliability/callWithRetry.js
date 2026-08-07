const groq = require('../config/groqClient');
const { throttle } = require('./throttle');
const { MAX_RETRIES, INITIAL_DELAY_MS, MAX_DELAY_MS, THROTTLE_DELAY_MS } = require('../config/retryConfig');
const { logger } = require('../utils/logger');

async function callWithRetry(apiParams) {
  let attempt = 0;
  
  // Throttle sequentially between turns
  await throttle(THROTTLE_DELAY_MS);

  while (attempt < MAX_RETRIES) {
    try {
      const model = apiParams.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      
      const response = await groq.chat.completions.create({
        model,
        ...apiParams
      });
      return response;
    } catch (error) {
      attempt++;
      const isRateLimit = error.status === 429 || 
                          (error.message && error.message.includes('429')) || 
                          (error.message && error.message.includes('Rate limit'));
      
      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = Math.min(Math.pow(2, attempt) * INITIAL_DELAY_MS + Math.random() * 1000, MAX_DELAY_MS);
        logger.warn('GROQ_RATE_LIMIT', `Rate limit hit. Retrying attempt ${attempt}/${MAX_RETRIES} in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error('GROQ_CALL_FAILED', `Failed Groq API call: ${error.message}`);
        throw error;
      }
    }
  }
  throw new Error(`Max retries reached (${MAX_RETRIES}) for Groq API call.`);
}

module.exports = {
  callWithRetry
};

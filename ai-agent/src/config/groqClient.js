const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'mock-api-key',
  timeout: 5000 // 5 seconds timeout limit
});

module.exports = groq;

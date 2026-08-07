require('dotenv').config();
const chromaClient = require('../rag/vectorStore/chromaClient');
const pineconeClient = require('../rag/vectorStore/pineconeClient');

const usePinecone = process.env.VECTOR_DB === 'pinecone';
const vectorDbClient = usePinecone ? pineconeClient : chromaClient;

module.exports = vectorDbClient;

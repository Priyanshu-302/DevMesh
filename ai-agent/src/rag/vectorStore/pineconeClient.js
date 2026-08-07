const { logger } = require('../../utils/logger');

class PineconeClient {
  constructor() {
    this.client = null;
    this.index = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      this.client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || ''
      });
      this.index = this.client.index(process.env.PINECONE_INDEX || 'devmesh-index');
      this.initialized = true;
      logger.info('PINECONE_INIT_SUCCESS', 'Successfully connected to Pinecone service.');
    } catch (error) {
      logger.warn('PINECONE_INIT_FAIL', `Pinecone client unavailable: ${error.message}`);
      this.initialized = true;
    }
  }

  async addChunks(chunks) {
    await this.initialize();

    if (!this.index) {
      logger.error('PINECONE_ADD_FAIL', 'Pinecone client is not initialized or index is not set.');
      return;
    }

    try {
      const records = chunks.map(chunk => ({
        id: chunk.id,
        values: chunk.embedding,
        metadata: {
          filePath: chunk.filePath,
          content: chunk.content,
          startLine: chunk.startLine,
          endLine: chunk.endLine
        }
      }));

      await this.index.upsert(records);
      logger.info('PINECONE_ADD_SUCCESS', `Added ${chunks.length} records to Pinecone.`);
    } catch (error) {
      logger.error('PINECONE_ADD_ERROR', `Error upserting to Pinecone: ${error.message}`);
    }
  }

  async query(queryVector, limit = 5) {
    await this.initialize();

    if (!this.index) {
      logger.error('PINECONE_QUERY_FAIL', 'Pinecone client is not initialized or index is not set.');
      return [];
    }

    try {
      const queryResponse = await this.index.query({
        vector: queryVector,
        topK: limit,
        includeMetadata: true
      });

      if (queryResponse && queryResponse.matches) {
        return queryResponse.matches.map(match => ({
          id: match.id,
          content: match.metadata.content,
          filePath: match.metadata.filePath,
          startLine: match.metadata.startLine,
          endLine: match.metadata.endLine,
          score: match.score
        }));
      }
    } catch (error) {
      logger.error('PINECONE_QUERY_ERROR', `Error querying Pinecone: ${error.message}`);
    }

    return [];
  }
}

const pineconeClient = new PineconeClient();

module.exports = pineconeClient;

const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class ChromaClient {
  constructor(fallbackFilePath = null) {
    this.fallbackFilePath = fallbackFilePath || path.join(process.cwd(), '.vector-store-fallback.json');
    this.client = null;
    this.collection = null;
    this.initialized = false;
    this.fallbackDatabase = [];
    this.loadFallbackDatabase();
  }

  loadFallbackDatabase() {
    try {
      if (fs.existsSync(this.fallbackFilePath)) {
        const data = fs.readFileSync(this.fallbackFilePath, 'utf8');
        this.fallbackDatabase = JSON.parse(data);
      }
    } catch (error) {
      logger.error('CHROMA_FALLBACK_LOAD_FAIL', `Failed to load fallback database: ${error.message}`);
    }
  }

  saveFallbackDatabase() {
    try {
      fs.writeFileSync(this.fallbackFilePath, JSON.stringify(this.fallbackDatabase, null, 2), 'utf8');
    } catch (error) {
      logger.error('CHROMA_FALLBACK_SAVE_FAIL', `Failed to save fallback database: ${error.message}`);
    }
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const { ChromaClient: Chroma } = await import('chromadb');
      this.client = new Chroma({ path: process.env.CHROMA_PATH || 'http://localhost:8000' });
      this.collection = await this.client.getOrCreateCollection({ name: 'devmesh-code' });
      this.initialized = true;
      logger.info('CHROMA_INIT_SUCCESS', 'Successfully connected to ChromaDB server.');
    } catch (error) {
      logger.warn('CHROMA_INIT_FALLBACK', `ChromaDB client unavailable, using local JSON fallback: ${error.message}`);
      this.client = null;
      this.initialized = true;
    }
  }

  async addChunks(chunks) {
    await this.initialize();

    if (this.client && this.collection) {
      try {
        const ids = chunks.map(c => c.id);
        const embeddings = chunks.map(c => c.embedding);
        const documents = chunks.map(c => c.content);
        const metadatas = chunks.map(c => ({ filePath: c.filePath, startLine: c.startLine, endLine: c.endLine }));

        await this.collection.add({ ids, embeddings, documents, metadatas });
        logger.info('CHROMA_ADD_SUCCESS', `Added ${chunks.length} chunks to ChromaDB.`);
        return;
      } catch (error) {
        logger.error('CHROMA_ADD_FAIL', `Failed to add chunks to ChromaDB: ${error.message}`);
      }
    }

    for (const chunk of chunks) {
      const idx = this.fallbackDatabase.findIndex(c => c.id === chunk.id);
      if (idx !== -1) {
        this.fallbackDatabase[idx] = chunk;
      } else {
        this.fallbackDatabase.push(chunk);
      }
    }
    this.saveFallbackDatabase();
    logger.info('CHROMA_FALLBACK_ADD_SUCCESS', `Saved ${chunks.length} chunks in local fallback vector JSON file.`);
  }

  async query(queryVector, limit = 5) {
    await this.initialize();

    if (this.client && this.collection) {
      try {
        const queryResults = await this.collection.query({
          queryEmbeddings: [queryVector],
          nResults: limit
        });

        if (queryResults && queryResults.documents && queryResults.documents[0]) {
          return queryResults.documents[0].map((doc, idx) => ({
            id: queryResults.ids[0][idx],
            content: doc,
            filePath: queryResults.metadatas[0][idx].filePath,
            startLine: queryResults.metadatas[0][idx].startLine,
            endLine: queryResults.metadatas[0][idx].endLine,
            score: queryResults.distances ? queryResults.distances[0][idx] : 1.0
          }));
        }
      } catch (error) {
        logger.error('CHROMA_QUERY_FAIL', `ChromaDB query failed: ${error.message}`);
      }
    }

    const scoredChunks = this.fallbackDatabase
      .map(chunk => {
        const score = cosineSimilarity(queryVector, chunk.embedding || []);
        return { ...chunk, score };
      })
      .sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, limit);
  }

  async clearAll() {
    await this.initialize();
    if (this.collection) {
      try {
        await this.client.deleteCollection({ name: 'devmesh-code' });
        this.collection = await this.client.getOrCreateCollection({ name: 'devmesh-code' });
      } catch (e) {
        // Ignore
      }
    }
    this.fallbackDatabase = [];
    this.saveFallbackDatabase();
  }
}

const chromaClient = new ChromaClient();

module.exports = chromaClient;

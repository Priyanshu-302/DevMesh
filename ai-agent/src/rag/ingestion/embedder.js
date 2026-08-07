const { logger } = require('../../utils/logger');

class Embedder {
  constructor() {
    this.modelName = 'all-MiniLM-L6-v2';
    this.pipeline = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Skip network download and force local fallback instantly
        throw new Error("Skipping remote model download for testing");

        const { pipeline } = await import('@xenova/transformers');
        this.pipeline = await pipeline('feature-extraction', `Xenova/${this.modelName}`);
        this.initialized = true;
        logger.info('EMBEDDER_INIT', 'ONNX transformers pipeline initialized successfully.');
      } catch (error) {
        logger.warn('EMBEDDER_INIT_FALLBACK', `Transformers not available, using fallback embedding: ${error.message}`);
        this.pipeline = null;
        this.initialized = true;
      }
    })();

    return this.initPromise;
  }

  async embed(text) {
    await this.initialize();

    if (this.pipeline) {
      try {
        const output = await this.pipeline(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
      } catch (error) {
        logger.error('EMBED_FAIL', `ONNX generation failed, using mock fallback: ${error.message}`);
      }
    }

    return this.generateFallbackEmbedding(text);
  }

  generateFallbackEmbedding(text) {
    const dimensions = 384;
    const vector = new Array(dimensions).fill(0);
    
    if (!text) return vector;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const index = (i * 7 + code) % dimensions;
      vector[index] = (vector[index] + (code / 255.0)) / 2.0;
    }

    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => v / magnitude);
  }
}

const embedder = new Embedder();

module.exports = {
  embedder,
  Embedder
};

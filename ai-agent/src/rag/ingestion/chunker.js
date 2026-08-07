function chunkFile(filePath, content, maxChunkSize = 2000) {
  const chunks = [];
  const lines = content.split('\n');
  let currentChunk = [];
  let currentLength = 0;
  let chunkIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const isLogicalBoundary = /^(class\s|function\s|const\s\w+\s*=\s*(\(.*?\)|async\s*\(.*?\))\s*=>|async\s*function)/.test(line.trim());

    if (isLogicalBoundary && currentLength > 500) {
      chunks.push({
        id: `${filePath}_chunk_${chunkIndex++}`,
        filePath,
        content: currentChunk.join('\n'),
        startLine: i - currentChunk.length + 1,
        endLine: i
      });
      currentChunk = [];
      currentLength = 0;
    }

    currentChunk.push(line);
    currentLength += line.length + 1; 

    if (currentLength >= maxChunkSize) {
      chunks.push({
        id: `${filePath}_chunk_${chunkIndex++}`,
        filePath,
        content: currentChunk.join('\n'),
        startLine: i - currentChunk.length + 1,
        endLine: i
      });
      currentChunk = [];
      currentLength = 0;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      id: `${filePath}_chunk_${chunkIndex++}`,
      filePath,
      content: currentChunk.join('\n'),
      startLine: lines.length - currentChunk.length + 1,
      endLine: lines.length
    });
  }

  return chunks;
}

module.exports = {
  chunkFile
};

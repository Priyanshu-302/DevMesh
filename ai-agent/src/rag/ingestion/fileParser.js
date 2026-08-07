const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
];

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.html'];

function parseDirectory(dir, ignoreDirs = DEFAULT_IGNORE, extensions = DEFAULT_EXTENSIONS) {
  let results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (ignoreDirs.includes(file)) {
        continue;
      }
      results = results.concat(parseDirectory(filePath, ignoreDirs, extensions));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          results.push({
            filePath: path.resolve(filePath),
            relativePath: path.relative(process.cwd(), filePath),
            content
          });
        } catch (error) {
        }
      }
    }
  }

  return results;
}

module.exports = {
  parseDirectory
};

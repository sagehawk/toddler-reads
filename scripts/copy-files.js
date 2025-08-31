import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const source = path.resolve(projectRoot, 'server', 'package.json');
const destinationDir = path.resolve(projectRoot, 'dist');
const destinationFile = path.resolve(destinationDir, 'package.json');

try {
  // Ensure destination directory exists
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(source, destinationFile);

  console.log('Successfully copied server/package.json to dist/package.json');
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}

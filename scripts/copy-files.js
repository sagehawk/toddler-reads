import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const source = path.resolve(projectRoot, 'package.json');
const destinationDir = path.resolve(projectRoot, 'dist');
const destinationFile = path.resolve(destinationDir, 'package.json');

try {
  // Log current directory and contents
  console.log('Current working directory:', process.cwd());
  console.log('Project root:', projectRoot);
  console.log('Files in project root:', fs.readdirSync(projectRoot));
  
  // Ensure destination directory exists
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(source, destinationFile);

  console.log('Successfully copied package.json to dist/package.json');
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}

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

  // Stamp the service worker with a unique build id so every deploy ships a
  // byte-different sw.js — that's what makes browsers install the update and
  // purge the previous deploy's cache (see client/public/sw.js).
  const swFile = path.resolve(destinationDir, 'sw.js');
  if (fs.existsSync(swFile)) {
    const buildId = `build-${Date.now()}`;
    const sw = fs.readFileSync(swFile, 'utf8').replace(/%BUILD_ID%/g, buildId);
    fs.writeFileSync(swFile, sw);
    console.log(`Stamped dist/sw.js with ${buildId}`);
  } else {
    console.warn('dist/sw.js not found — skipping service worker build stamp');
  }
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}

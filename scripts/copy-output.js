const fs = require('fs-extra');
const path = require('path');

// Define paths
const outDir = path.join(__dirname, '../out');
const rendererDir = path.join(__dirname, '../electron/renderer');

// Ensure renderer directory exists
fs.ensureDirSync(rendererDir);

// Copy files from out to renderer
try {
  console.log('Copying Next.js output to electron/renderer...');
  fs.copySync(outDir, rendererDir);
  console.log('Files copied successfully!');
} catch (err) {
  console.error('Error copying files:', err);
  process.exit(1);
}
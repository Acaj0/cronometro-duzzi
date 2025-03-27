const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Define the renderer directory
const rendererDir = path.join(__dirname, '../electron/renderer');

// Find all HTML files
const htmlFiles = glob.sync(`${rendererDir}/**/*.html`);

console.log(`Found ${htmlFiles.length} HTML files to process`);

htmlFiles.forEach(file => {
  console.log(`Processing ${file}`);
  
  // Read the HTML file
  let html = fs.readFileSync(file, 'utf8');
  
  // Fix paths for scripts and stylesheets
  // Replace paths that start with / to be relative
  html = html.replace(/src="\/(_next\/static\/[^"]+)"/g, 'src="./$1"');
  html = html.replace(/href="\/(_next\/static\/[^"]+)"/g, 'href="./$1"');
  
  // Also fix paths for other assets
  html = html.replace(/src="\/(images\/[^"]+)"/g, 'src="./$1"');
  html = html.replace(/href="\/(images\/[^"]+)"/g, 'href="./$1"');
  
  // Write the modified HTML back to the file
  fs.writeFileSync(file, html);
  
  console.log(`Fixed paths in ${file}`);
});

console.log('All HTML files processed successfully');
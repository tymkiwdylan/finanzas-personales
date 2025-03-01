// This is a helper script to generate PWA icons
// To use it, you'll need to install sharp:
// npm install --save-dev sharp

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_SVG_192 = path.join(__dirname, '../public/icons/icon-192x192.svg');
const SOURCE_SVG_512 = path.join(__dirname, '../public/icons/icon-512x512.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons-png');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate 192x192 PNG
sharp(SOURCE_SVG_192)
  .resize(192, 192)
  .png()
  .toFile(path.join(OUTPUT_DIR, 'icon-192x192.png'))
  .then(() => {
    console.log('✅ Generated 192x192 PNG icon');
  })
  .catch(err => {
    console.error('Error generating 192x192 icon:', err);
  });

// Generate 512x512 PNG
sharp(SOURCE_SVG_512)
  .resize(512, 512)
  .png()
  .toFile(path.join(OUTPUT_DIR, 'icon-512x512.png'))
  .then(() => {
    console.log('✅ Generated 512x512 PNG icon');
  })
  .catch(err => {
    console.error('Error generating 512x512 icon:', err);
  });

console.log('Starting icon generation...');

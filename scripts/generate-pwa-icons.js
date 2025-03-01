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

console.log('Starting icon generation...');

// Define standard sizes
const sizes = [
  { size: 192, source: SOURCE_SVG_192 },
  { size: 512, source: SOURCE_SVG_512 },
];

// Add other common sizes that Chrome might expect
const otherSizes = [96, 128, 144, 152, 167, 180, 384].map(size => ({
  size, 
  source: size < 400 ? SOURCE_SVG_192 : SOURCE_SVG_512
}));

// Process all icons
[...sizes, ...otherSizes].forEach(({ size, source }) => {
  // Regular icon
  sharp(source)
    .resize(size, size)
    .png()
    .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`))
    .then(() => {
      console.log(`✅ Generated ${size}x${size} PNG icon`);
    })
    .catch(err => {
      console.error(`Error generating ${size}x${size} icon:`, err);
    });
  
  // Maskable icon (with padding for safe zone)
  const padding = Math.floor(size * 0.1); // 10% padding
  const safeSize = size - (padding * 2);
  
  sharp(source)
    .resize(safeSize, safeSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 2, g: 132, b: 199, alpha: 1 } // Sky-600 color (#0284c7)
    })
    .png()
    .toFile(path.join(OUTPUT_DIR, `maskable-${size}x${size}.png`))
    .then(() => {
      console.log(`✅ Generated maskable ${size}x${size} icon`);
    })
    .catch(err => {
      console.error(`Error generating maskable ${size}x${size} icon:`, err);
    });
});

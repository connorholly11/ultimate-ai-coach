const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple AI Coach icon using SVG
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0f172a" rx="100"/>
  <circle cx="256" cy="180" r="80" fill="#3b82f6" opacity="0.2"/>
  <circle cx="256" cy="180" r="60" fill="#3b82f6" opacity="0.4"/>
  <circle cx="256" cy="180" r="40" fill="#3b82f6"/>
  <path d="M 256 240 Q 180 280 180 360 Q 180 400 256 400 Q 332 400 332 360 Q 332 280 256 240" fill="#3b82f6" opacity="0.6"/>
  <circle cx="240" cy="170" r="8" fill="white"/>
  <circle cx="272" cy="170" r="8" fill="white"/>
  <path d="M 236 190 Q 256 200 276 190" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Generating AI Coach icons...');
  
  // Convert SVG to PNG for each size
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }
  
  // Generate maskable icons with padding
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svgIcon))
      .resize(Math.round(size * 0.8), Math.round(size * 0.8))
      .extend({
        top: Math.round(size * 0.1),
        bottom: Math.round(size * 0.1),
        left: Math.round(size * 0.1),
        right: Math.round(size * 0.1),
        background: '#0f172a'
      })
      .png()
      .toFile(path.join(__dirname, `icon-maskable-${size}x${size}.png`));
    console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
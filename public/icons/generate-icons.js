#!/usr/bin/env node

/**
 * Icon generator script for PWA
 * 
 * Usage: node generate-icons.js <source-image-path>
 * 
 * The source image should be at least 512x512px PNG with transparent background.
 * This script generates all required PWA icon sizes.
 * 
 * Install dependencies first:
 * npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

async function generateIcons(inputPath) {
  if (!inputPath) {
    console.error('Please provide input image path');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error('Input file does not exist:', inputPath);
    process.exit(1);
  }

  console.log('Generating icons from:', inputPath);

  // Generate regular icons
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons with padding
  for (const size of maskableSizes) {
    const paddedSize = Math.floor(size * 0.8);
    await sharp(inputPath)
      .resize(paddedSize, paddedSize)
      .extend({
        top: Math.floor((size - paddedSize) / 2),
        bottom: Math.floor((size - paddedSize) / 2),
        left: Math.floor((size - paddedSize) / 2),
        right: Math.floor((size - paddedSize) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, `icon-maskable-${size}x${size}.png`));
    console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
  }

  console.log('\nAll icons generated successfully!');
}

// Run if called directly
if (require.main === module) {
  generateIcons(process.argv[2]);
}
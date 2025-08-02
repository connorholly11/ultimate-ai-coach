const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#0f172a"/>
      
      <g transform="scale(${size / 200})">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#A78BFA" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#C084FC" stop-opacity="0.7"/>
          </linearGradient>
          
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#93C5FD" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#DDD6FE" stop-opacity="0.4"/>
          </linearGradient>
          
          <linearGradient id="g3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#E0E7FF" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#FBBF24" stop-opacity="0.6"/>
          </linearGradient>
          
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.3"/>
            <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/>
          </radialGradient>
        </defs>
        
        <!-- Outer glow -->
        <circle cx="100" cy="100" r="80" fill="url(#glow)"/>
        
        <!-- Outer ring -->
        <path d="M100 30 L150 70 L150 130 L100 170 L50 130 L50 70 Z"
              fill="none" stroke="url(#g1)" stroke-width="2" opacity="0.5"/>
        
        <!-- Middle crystal -->
        <path d="M100 50 L135 80 L135 120 L100 150 L65 120 L65 80 Z"
              fill="url(#g2)" opacity="0.7"/>
        
        <!-- Inner crystal -->
        <path d="M100 65 L120 85 L120 115 L100 135 L80 115 L80 85 Z"
              fill="url(#g3)"/>
        
        <!-- Center highlight -->
        <path d="M100 75 L110 85 L110 95 L100 105 L90 95 L90 85 Z"
              fill="white" opacity="0.9"/>
        
        <!-- Sparkles -->
        <circle cx="140" cy="60" r="2" fill="#FBBF24" opacity="0.8"/>
        <circle cx="60" cy="140" r="1.5" fill="#F59E0B" opacity="0.7"/>
        <circle cx="150" cy="100" r="1" fill="#FBBF24" opacity="0.6"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(__dirname, `../public/icons/icon-${size}x${size}.png`));
  
  console.log(`Generated icon-${size}x${size}.png`);
}

async function generateMaskableIcon(size) {
  // Maskable icons need extra padding (safe zone)
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#0f172a"/>
      
      <g transform="translate(${padding}, ${padding}) scale(${innerSize / 200})">
        <defs>
          <linearGradient id="m1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#A78BFA" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#C084FC" stop-opacity="0.7"/>
          </linearGradient>
          
          <linearGradient id="m2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#93C5FD" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#DDD6FE" stop-opacity="0.4"/>
          </linearGradient>
          
          <linearGradient id="m3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#E0E7FF" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#FBBF24" stop-opacity="0.6"/>
          </linearGradient>
        </defs>
        
        <!-- Simplified for maskable (no glow/sparkles) -->
        <path d="M100 30 L150 70 L150 130 L100 170 L50 130 L50 70 Z"
              fill="none" stroke="url(#m1)" stroke-width="2" opacity="0.5"/>
        
        <path d="M100 50 L135 80 L135 120 L100 150 L65 120 L65 80 Z"
              fill="url(#m2)" opacity="0.7"/>
        
        <path d="M100 65 L120 85 L120 115 L100 135 L80 115 L80 85 Z"
              fill="url(#m3)"/>
        
        <path d="M100 75 L110 85 L110 95 L100 105 L90 95 L90 85 Z"
              fill="white" opacity="0.9"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(__dirname, `../public/icons/icon-maskable-${size}x${size}.png`));
  
  console.log(`Generated icon-maskable-${size}x${size}.png`);
}

async function main() {
  // Ensure icons directory exists
  await fs.mkdir(path.join(__dirname, '../public/icons'), { recursive: true });

  // Generate regular icons
  for (const size of sizes) {
    await generateIcon(size);
  }

  // Generate maskable icons for PWA
  await generateMaskableIcon(192);
  await generateMaskableIcon(512);

  console.log('All icons generated successfully!');
}

main().catch(console.error);
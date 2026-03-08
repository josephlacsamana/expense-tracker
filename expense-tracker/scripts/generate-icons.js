// Run: cd expense-tracker && npm install canvas && node scripts/generate-icons.js
// Generates PWA icon PNGs from the logo design

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gold gradient background with rounded corners (draw as full square, browser handles masking)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#F5B526');
  grad.addColorStop(1, '#D4960E');

  const r = size * 0.22; // corner radius
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // "RX" text
  const fontSize = Math.round(size * 0.5);
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#1A1A2E';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RX', size / 2, size / 2 + size * 0.02);

  return canvas.toBuffer('image/png');
}

const outDir = path.join(__dirname, '..', 'public');

sizes.forEach(({ name, size }) => {
  const buf = drawIcon(size);
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${name} (${size}x${size})`);
});

console.log('Done! All icons generated in public/');

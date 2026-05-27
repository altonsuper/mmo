import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputFile = process.argv[2]; // client/assets/mobs/slime_walk.png
const frameW = parseInt(process.argv[3]) || 64; // lebar 1 frame
const frameH = parseInt(process.argv[4]) || 64; // tinggi 1 frame

if (!inputFile) {
  console.log('Usage: node tools/anim_gen.js <path/to/sheet.png> [frameW] [frameH]');
  console.log('Example: node tools/anim_gen.js client/assets/mobs/slime_walk.png 64 64');
  process.exit(1);
}

const fullPath = path.join(__dirname, '..', inputFile);
if (!fs.existsSync(fullPath)) {
  console.error(`[ANIMGEN] File not found: ${fullPath}`);
  process.exit(1);
}

const img = await loadImage(fullPath);
const cols = Math.floor(img.width / frameW);
const rows = Math.floor(img.height / frameH);
const totalFrames = cols * rows;

console.log(`[ANIMGEN] Splitting ${inputFile} ${img.width}x${img.height}`);
console.log(`[ANIMGEN] Frame size: ${frameW}x${frameH}, Total: ${totalFrames} frames`);

const baseName = path.basename(inputFile, path.extname(inputFile)); // slime_walk
const outDir = path.dirname(fullPath);
let count = 0;

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const canvas = createCanvas(frameW, frameH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, x*frameW, y*frameH, frameW, frameH, 0, 0, frameW, frameH);
    
    const outName = `${baseName}_${count}.png`;
    const outPath = path.join(outDir, outName);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`[GEN] ${outName}`);
    count++;
  }
}

console.log(`\n[ANIMGEN] Done. Generated ${count} frames`);
console.log(`[ANIMGEN] Client will auto-load: ${baseName}_0.png to ${baseName}_${count-1}.png`);

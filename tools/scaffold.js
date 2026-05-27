import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix Windows: /C:/Ag/... -> C:\Ag\...
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('=== MindbloxCore Project Scaffold ===\n');
console.log('Root:', root, '\n');

// 1. Tree structure max 3 level biar ga spam
function tree(dir, prefix = '', depth = 0) {
  if (depth > 3) return;
  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch(e) {
    console.log(prefix + '└── [ERROR] ' + e.message);
    return;
  }
  
  files = files.filter(f =>!f.startsWith('.') && f!== 'node_modules');
  files.forEach((file, i) => {
    const p = path.join(dir, file);
    const isLast = i === files.length - 1;
    let stat;
    try {
      stat = fs.statSync(p);
    } catch { return; }
    
    console.log(prefix + (isLast? '└── ' : '├── ') + file);
    if (stat.isDirectory()) tree(p, prefix + (isLast? '    ' : '│   '), depth + 1);
  });
}
tree(root);

// 2. Database counts
console.log('\n=== Database Counts ===');
const dataDir = path.join(root, 'data');
if (fs.existsSync(dataDir)) {
  fs.readdirSync(dataDir).forEach(folder => {
    const p = path.join(dataDir, folder);
    if (fs.statSync(p).isDirectory()) {
      const count = fs.readdirSync(p).filter(f=>f.endsWith('.json')).length;
      console.log(`${folder.padEnd(10)}: ${count} files`);
    }
  });
} else {
  console.log('No /data folder yet');
}

// 3. Modified today
console.log('\n=== Modified Today ===');
const today = new Date().toDateString();
let found = false;
function findModified(dir) {
  try {
    fs.readdirSync(dir).forEach(f => {
      if (f === 'node_modules' || f.startsWith('.')) return;
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) findModified(p);
      else if (stat.mtime.toDateString() === today) {
        console.log('M', path.relative(root, p));
        found = true;
      }
    });
  } catch {}
}
findModified(root);
if (!found) console.log('No files modified today');

console.log('\nCommands: npm start | npm run detect | node tools/gen_placeholder.js');

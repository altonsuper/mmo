const deps = ['express', 'socket.io', 'socket.io-client', 'chokidar'];
let ok = true;
for (const d of deps) {
  try { await import(d); console.log('[OK]', d); }
  catch { console.log('[MISSING]', d); ok = false; }
}
if (!ok) console.log('\nJalanin: npm install express socket.io socket.io-client chokidar');
else console.log('\nSemua dependency aman.');

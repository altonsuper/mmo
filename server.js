import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { loadAllData } from './data/index.js';
import { World, gainExp } from './engine/world.js';
import { Bus } from './engine/bus.js';
import { REGISTRY } from './engine/schema.js';

const app = express();
const http = createServer(app);
const io = new Server(http, { cors: { origin: "*" } });
const PORT = 3000;

app.use(express.static('client'));

console.log('MindbloxCore Booting...');
await loadAllData();
console.log('Loaded templates:', Object.keys(REGISTRY).map(k=>`${k}:${Object.keys(REGISTRY[k]).length}`));

io.on('connection', socket => {
  console.log('[IO] Client connected:', socket.id);
  socket.emit('registry', REGISTRY);
  socket.emit('world:sync', [...World.entities.values()]);
});

http.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));

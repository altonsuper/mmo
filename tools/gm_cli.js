import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
const [,,cmd,...args] = process.argv;

socket.on('connect', () => {
  if (cmd === 'spawn') {
    socket.emit('gm:spawn', {type: args[0], id: args[1], x: Number(args[2])||0, y: Number(args[3])||0});
    console.log('Sent spawn command');
  }
  if (cmd === 'create') {
    const [type, id,...json] = args;
    const data = JSON.parse(json.join(' '));
    socket.emit('gm:create', {type, id, data});
    console.log('Sent create command');
  }
  setTimeout(() => process.exit(0), 500);
});

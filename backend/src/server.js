import 'dotenv/config';
import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { registerSockets } from './sockets/index.js';
import { corsOrigin } from './utils/cors.js';

if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET en el .env');

const port = process.env.PORT || 4000;
const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: corsOrigin, credentials: true } });

app.set('io', io);
registerSockets(io);

server.listen(port, () => console.log(`API HIIT Coach escuchando en http://localhost:${port}`));

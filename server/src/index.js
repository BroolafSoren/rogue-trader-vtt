import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow Vite frontend
    methods: ["GET", "POST"]
  }
});

// Track game state in memory (replace with Redis later)
let tokens = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Sync existing tokens to new clients
  socket.emit('tokens-update', tokens);

  // Handle token movements
  socket.on('move-token', (token) => {
    tokens = tokens.map(t => t.id === token.id ? token : t);
    socket.broadcast.emit('tokens-update', tokens);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Add to Socket.IO connection handler
    socket.on('create-token', (newToken) => {
        tokens.push(newToken);
        console.log('token created');
        io.emit('token-created', newToken); // Broadcast to all clients
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
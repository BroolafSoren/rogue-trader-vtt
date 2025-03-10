import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize tokens array
let tokens = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('tokens-update', tokens);

  socket.on('create-token', (newToken) => {
    tokens.push(newToken);
    io.emit('token-created', newToken); // Broadcast to all clients
  });

  socket.on('move-token', (token) => {
    tokens = tokens.map(t => t.id === token.id ? token : t);
    io.emit('tokens-update', tokens);
  });

  socket.on('confirm-movement', ({ tokenId, newX, newY }) => {
    tokens = tokens.map(token => {
      if (token.id === tokenId) {
        return { ...token, x: newX, y: newY, waypoints: [] };
      }
      return token;
    });
    io.emit('token-moved', tokens.find(t => t.id === tokenId));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
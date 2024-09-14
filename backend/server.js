import express from 'express';
import http from 'http';
import { Server } from'socket.io';
import { databaseInit } from './database/connection.js';
import { getMessage, saveMessage } from './controller/message.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


databaseInit();
let connectedUsers = 0;

io.on('connection', async (socket) => {
  connectedUsers++;
  io.emit('updateUserCount', connectedUsers);

  console.log('A user connected. Total users:', connectedUsers);

  const chatHistory = await getMessage();
  socket.emit('chatHistory', chatHistory);

  socket.on('sendMessage', async (messageData) => {
    console.log('Message received:', messageData);
    await saveMessage(messageData.name, messageData.message);
    io.emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    connectedUsers--;
    io.emit('updateUserCount', connectedUsers);
    console.log('A user disconnected. Total users:', connectedUsers);
  });
});



server.listen(5000, () => {
  console.log('Server is running on port 5000');
});

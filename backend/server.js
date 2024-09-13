const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const connectionString = 'postgresql://postgres.xxudsifdeaologsnlyfi:Aiman4588Aiman@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: connectionString,
});

const saveMessageToDb = async (name, message) => {
  try {
    await pool.query(
      'INSERT INTO messages (name, message) VALUES ($1, $2)',
      [name, message]
    );
  } catch (err) {
    console.error('Error saving message to database:', err);
  }
};

const getMessagesFromDb = async () => {
  try {
    const res = await pool.query('SELECT name, message FROM messages ORDER BY created_at ASC');
    return res.rows;
  } catch (err) {
    console.error('Error fetching messages from database:', err);
    return [];
  }
};

let connectedUsers = 0;

io.on('connection', async (socket) => {
  connectedUsers++;
  io.emit('updateUserCount', connectedUsers);

  console.log('A user connected. Total users:', connectedUsers);

  const chatHistory = await getMessagesFromDb();
  socket.emit('chatHistory', chatHistory);

  socket.on('sendMessage', async (messageData) => {
    console.log('Message received:', messageData);
    await saveMessageToDb(messageData.name, messageData.message);
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

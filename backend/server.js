const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// PostgreSQL connection string
const connectionString = 'postgresql://postgres.xxudsifdeaologsnlyfi:Aiman4588Aiman@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: connectionString,
});

// Function to save message to the database
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

// Function to fetch all messages from the database
const getMessagesFromDb = async () => {
  try {
    const res = await pool.query('SELECT name, message FROM messages ORDER BY created_at ASC');
    return res.rows;
  } catch (err) {
    console.error('Error fetching messages from database:', err);
    return [];
  }
};

io.on('connection', async (socket) => {
  console.log('A user connected');

  // Send the chat history to the user on connection
  const chatHistory = await getMessagesFromDb();
  socket.emit('chatHistory', chatHistory);

  // Handle incoming messages from clients
  socket.on('sendMessage', async (messageData) => {
    console.log('Message received:', messageData);
    
    // Save the message to the database
    await saveMessageToDb(messageData.name, messageData.text);

    // Broadcast the message to all connected clients
    io.emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});

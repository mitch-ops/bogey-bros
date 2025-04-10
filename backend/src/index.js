// index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes/routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Your HTTP routes (including game and auth endpoints)
app.use(routes);

// Create the HTTP server from the Express app
const server = http.createServer(app);

// Create the Socket.IO server and configure CORS as needed
const io = new Server(server, {
  cors: {
    origin: "*",  // For production, restrict to your allowed client origin(s)
    methods: ["GET", "POST"]
  }
});

// Listen for new Socket.IO connections
io.on('connection', (socket) => {
  console.log(`New client connected with socket id: ${socket.id}`);

  // Listen for a client joining a game room
  // The client can emit a "joinGame" event with the unique game identifier (like gameName)
  socket.on('joinGame', (gameIdentifier) => {
    socket.join(gameIdentifier);
    console.log(`Socket ${socket.id} joined room: ${gameIdentifier}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Make the Socket.IO instance available to your controllers
app.set('socketio', io);

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server running`);
});

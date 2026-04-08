require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const connectDB = require('./config/db');

// Import routes
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');

const http = require('http');
const { Server } = require('socket.io');

// Initialize the Express app
const app = express();
const cors = require('cors');

// --- CORS FIX ---
// We place this at the AT THE VERY TOP of the Express Stack!
// This stops the Browser from blocking localhost:5001 from talking to localhost:5173
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'], // Support Production Vercel Link!
  credentials: true
}));

// Wrap Express with native HTTP so Socket.io can bind to it
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your Vercel URL
    methods: ["GET", "POST", "PUT"]
  }
});

// A real-time tracking map: Link MongoDB 'userId' to volatile browser 'socketId'
const connectedUsers = new Map();

io.on('connection', (socket) => {
  // When a React user connects, they emit their database user ID
  socket.on('register_user', (userId) => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    // Remove the user from our tracking map if they close their browser tab
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });

  // --- Real-time Direct Messaging System ---
  // Rather than forcing users to hit standard REST APIs, we listen for a raw binary socket event!
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, text } = data;
      
      // 1. Instantly save the chat to the database for persistence
      const Message = require('./models/Message');
      const savedMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text: text
      });

      // 2. Check if the exact person they are texting is currently logged in!
      const receiverSocketId = connectedUsers.get(receiverId);

      // 3. Fire the event live across the internet directly to their device screen!
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', savedMessage);
      }
      
      // Send a ping back to the sender so their UI can show a "Delivered" checkmark instantly
      socket.emit('message_sent_success', savedMessage);
    } catch (error) {
      console.error("Socket Chat Error:", error);
    }
  });
});

// Make io globally accessible to our controllers so we can trigger events anywhere!
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Connect to the MongoDB database
connectDB();

// Middleware to parse JSON payloads in incoming requests
app.use(express.json());

// Routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload-resume', uploadRoutes);
app.use('/api/ai', aiRoutes);

// Simple root route
app.get('/', (req, res) => {
  res.send('Job Portal API is running!');
});

// Setup server to listen on a specific port
const PORT = process.env.PORT || 5001;

// CRITICAL: We must start the 'server' (HTTP), NOT 'app' (Express) directly!
server.listen(PORT, () => {
  console.log(`System is fully online on port ${PORT} (Express + Sockets!)`);
});

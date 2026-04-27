const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO SETUP =================
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set("io", io);

app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public', {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/stories', require('./routes/story.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// fallback route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(__dirname + '/public/index.html');
});


// ================= SOCKET LOGIC =================
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('newMessage', {
        senderId,
        content,
        time: new Date()
      });
    }
  });

  // optional: reels/posts rooms
  socket.on("joinReel", (reelId) => socket.join(reelId));
  socket.on("joinPost", (postId) => socket.join(postId));

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log("User disconnected:", socket.id);
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

// ================= DB + SERVER =================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
  });
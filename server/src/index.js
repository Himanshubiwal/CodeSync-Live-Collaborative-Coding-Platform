import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import roomRoutes from './routes/room.js';
import executeRoutes from './routes/execute.js';
import { setupYjsSocketHandlers } from './ws/yjsServer.js';
import { setupChatSocketHandlers } from './ws/chatServer.js';
import { setupExecuteSocketHandlers } from './ws/executeServer.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Support multiple comma-separated origins (e.g. "http://localhost:5173,https://codesync.vercel.app")
const allowedOrigins = CLIENT_URL.split(',').map((url) => url.trim());

// --- Middleware ---
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

// --- REST Routes ---
app.use('/api/room', roomRoutes);
app.use('/api/execute', executeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- HTTP + Socket.IO Server ---
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  // Delegate all Yjs CRDT room synchronization events to modular handler
  setupYjsSocketHandlers(io, socket);
  // Delegate stateless room chat messages to modular handler
  setupChatSocketHandlers(io, socket);
  // Delegate real-time code execution & output sharing
  setupExecuteSocketHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO + Yjs CRDT server ready`);
  console.log(`❤️  Create room endpoint: POST http://localhost:${PORT}/api/room\n`);
});

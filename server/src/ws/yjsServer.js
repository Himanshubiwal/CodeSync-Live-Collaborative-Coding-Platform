import * as Y from 'yjs';

// Vibrant distinct colors for collaborator cursors and badges
export const CURSOR_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#3b82f6', // Blue
];

const DEFAULT_CODE = `// Welcome to CodeSync Live Collaborative Room (Powered by Yjs CRDT)
// Share the Room Link with friends to edit together in real-time!

function calculateTeamSpeed(collaborators) {
  console.log("Connected developers:", collaborators.length);
  return collaborators.length * 10;
}

// Start coding below:
console.log("Session connected!");
`;

// In-memory store of active rooms
// rooms[roomId] = { ydoc: Y.Doc, users: Map<socketId, userInfo> }
const rooms = new Map();

/**
 * Get or create the authoritative Y.Doc state for a room.
 */
export function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco');
    ytext.insert(0, DEFAULT_CODE);

    rooms.set(roomId, {
      ydoc,
      users: new Map(),
    });
  }
  return rooms.get(roomId);
}

/**
 * Encode current room Y.Doc state as binary update array.
 */
export function getRoomStateAsUpdate(roomId) {
  const roomData = rooms.get(roomId);
  if (!roomData) return [];
  return Array.from(Y.encodeStateAsUpdate(roomData.ydoc));
}

/**
 * Apply an incoming CRDT binary update to the authoritative room Y.Doc.
 */
export function applyRoomUpdate(roomId, updateArray) {
  const roomData = rooms.get(roomId);
  if (roomData && updateArray) {
    Y.applyUpdate(roomData.ydoc, new Uint8Array(updateArray));
  }
}

/**
 * Register Socket.IO listeners for room awareness and Yjs CRDT synchronization.
 */
export function setupYjsSocketHandlers(io, socket) {
  // User joins a room
  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    const roomData = getOrCreateRoom(roomId);

    const colorIndex = roomData.users.size % CURSOR_COLORS.length;
    const userInfo = {
      id: socket.id,
      name: userName || 'Anonymous Dev',
      color: CURSOR_COLORS[colorIndex],
    };

    roomData.users.set(socket.id, userInfo);
    console.log(`[Room ${roomId}] User joined: ${userInfo.name} (${socket.id})`);

    // Send encoded Yjs state and online collaborators to joining client
    socket.emit('room-state', {
      stateUpdate: getRoomStateAsUpdate(roomId),
      users: Array.from(roomData.users.values()),
      localUser: userInfo,
    });

    // Announce newcomer to peers
    socket.to(roomId).emit('user-joined', {
      user: userInfo,
      users: Array.from(roomData.users.values()),
    });
  });

  // Handle incoming real-time Yjs CRDT document updates
  socket.on('yjs-update', ({ roomId, update }) => {
    applyRoomUpdate(roomId, update);
    socket.to(roomId).emit('yjs-update', { update });
  });

  // Handle incoming real-time Yjs Awareness (cursor & selection) updates
  socket.on('awareness-update', ({ roomId, update }) => {
    socket.to(roomId).emit('awareness-update', { update });
  });

  // Handle socket disconnection & room cleanup
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    for (const [roomId, roomData] of rooms.entries()) {
      if (roomData.users.has(socket.id)) {
        const leftUser = roomData.users.get(socket.id);
        roomData.users.delete(socket.id);
        console.log(`[Room ${roomId}] User left: ${leftUser?.name}`);

        io.to(roomId).emit('user-left', {
          socketId: socket.id,
          users: Array.from(roomData.users.values()),
        });

        // Clean up empty room memory after 5 minutes of inactivity
        if (roomData.users.size === 0) {
          setTimeout(() => {
            const currentRoom = rooms.get(roomId);
            if (currentRoom && currentRoom.users.size === 0) {
              currentRoom.ydoc.destroy();
              rooms.delete(roomId);
              console.log(`[Room ${roomId}] Cleaned up inactive room`);
            }
          }, 5 * 60 * 1000);
        }
        break;
      }
    }
  });
}

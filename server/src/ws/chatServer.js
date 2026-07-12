/**
 * Stateless Real-Time WebSocket Chat Relay
 * Completely decoupled from Yjs CRDT synchronization.
 */

export function setupChatSocketHandlers(io, socket) {
  // Join chat channel for a room
  socket.on('chat:join', ({ roomId, userName }) => {
    socket.join(`chat_${roomId}`);
    console.log(`[Chat Room ${roomId}] User joined chat: ${userName} (${socket.id})`);
  });

  // Relay chat message to peers in the room
  socket.on('chat:send', ({ roomId, message }) => {
    if (!roomId || !message) return;
    
    // Broadcast message to everyone else in the chat room
    socket.to(`chat_${roomId}`).emit('chat:message', message);
  });
}

/**
 * WebSocket handlers for Code Execution & Output Sharing across collaborators in a room
 */
export function setupExecuteSocketHandlers(io, socket) {
  /**
   * Share terminal execution results with everyone in the room
   * Payload: { roomId, result: { stdout, stderr, code, language, executedBy } }
   */
  socket.on('execute:share_output', ({ roomId, result }) => {
    if (!roomId || !result) return;
    // Broadcast the execution output to all other collaborators in the room
    socket.to(`room_${roomId}`).emit('execute:output_shared', {
      ...result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  });

  /**
   * Notify collaborators that someone started executing code
   */
  socket.on('execute:started', ({ roomId, language, userName }) => {
    if (!roomId) return;
    socket.to(`room_${roomId}`).emit('execute:status', {
      status: 'running',
      language,
      userName: userName || 'A collaborator',
    });
  });
}

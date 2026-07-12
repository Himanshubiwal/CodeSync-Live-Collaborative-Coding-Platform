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

// Language-specific default starter templates
const LANGUAGE_TEMPLATES = {
  javascript: `// Welcome to CodeSync Live Collaborative Room
// Language: JavaScript

function calculateTeamSpeed(collaborators) {
  console.log("Connected developers:", collaborators.length);
  return collaborators.length * 10;
}

console.log("Session connected!");
`,
  python: `# Welcome to CodeSync Live Collaborative Room
# Language: Python

def calculate_team_speed(collaborators):
    print(f"Connected developers: {len(collaborators)}")
    return len(collaborators) * 10

print("Session connected!")
`,
  java: `// Welcome to CodeSync Live Collaborative Room
// Language: Java

public class Main {
    public static void main(String[] args) {
        System.out.println("Session connected!");
    }
}
`,
  cpp: `// Welcome to CodeSync Live Collaborative Room
// Language: C++

#include <iostream>
using namespace std;

int main() {
    cout << "Session connected!" << endl;
    return 0;
}
`,
  typescript: `// Welcome to CodeSync Live Collaborative Room
// Language: TypeScript

interface Collaborator {
  id: string;
  name: string;
}

function calculateTeamSpeed(collaborators: Collaborator[]): number {
  console.log("Connected developers:", collaborators.length);
  return collaborators.length * 10;
}

console.log("Session connected!");
`,
  c: `// Welcome to CodeSync Live Collaborative Room
// Language: C

#include <stdio.h>

int main() {
    printf("Session connected!\\n");
    return 0;
}
`,
  go: `// Welcome to CodeSync Live Collaborative Room
// Language: Go

package main

import "fmt"

func main() {
    fmt.Println("Session connected!")
}
`,
  rust: `// Welcome to CodeSync Live Collaborative Room
// Language: Rust

fn main() {
    println!("Session connected!");
}
`,
  html: `<!-- Welcome to CodeSync Live Collaborative Room -->
<!-- Language: HTML -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CodeSync</title>
</head>
<body>
    <h1>Session connected!</h1>
</body>
</html>
`,
  css: `/* Welcome to CodeSync Live Collaborative Room */
/* Language: CSS */

body {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: #0f1117;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}
`,
  json: `{
  "project": "CodeSync Live Collaborative Room",
  "language": "JSON",
  "status": "connected"
}
`,
};

const DEFAULT_LANGUAGE = 'javascript';

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
    ytext.insert(0, LANGUAGE_TEMPLATES[DEFAULT_LANGUAGE]);

    rooms.set(roomId, {
      ydoc,
      users: new Map(),
      language: DEFAULT_LANGUAGE,
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

    // Send encoded Yjs state, language, and online collaborators to joining client
    socket.emit('room-state', {
      stateUpdate: getRoomStateAsUpdate(roomId),
      users: Array.from(roomData.users.values()),
      localUser: userInfo,
      language: roomData.language,
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

  // Handle language change for the room
  socket.on('language-change', ({ roomId, language }) => {
    const roomData = rooms.get(roomId);
    if (roomData) {
      roomData.language = language;
      console.log(`[Room ${roomId}] Language changed to: ${language}`);
      socket.to(roomId).emit('language-change', { language });
    }
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

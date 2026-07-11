<div align="center">

# ⚡ CodeSync — Live Collaborative Coding Platform

**Real-time collaborative code editor powered by Yjs CRDT, Monaco Editor & Socket.IO**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-6366f1)](https://yjs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🎯 What is CodeSync?

CodeSync is a **real-time collaborative coding platform** where multiple developers can write code together simultaneously — just like Google Docs, but for code. Create a room, share the link, and start coding together with live cursors, instant sync, and zero conflicts.

### ✨ Key Features

- 🔴 **Live Cursors & Name Tags** — See every collaborator's cursor position and name floating in the editor in real-time
- 🔄 **Conflict-Free Editing (CRDT)** — Powered by Yjs, edits from multiple users merge seamlessly without conflicts or data loss
- 🖥️ **Monaco Editor** — The same powerful editor that powers VS Code, with syntax highlighting, IntelliSense, and minimap
- 👥 **Collaborator Sidebar** — See who's online in your room with colored avatar badges
- 🔗 **Instant Room Sharing** — Create a room and share the link with one click
- 💾 **Persistent Username** — Your display name is saved to localStorage across sessions
- 🌙 **Premium Dark UI** — Sleek, modern dark theme with glassmorphism and smooth animations

---

## 🏗️ Architecture

```
┌──────────────────────────────┐       ┌──────────────────────────────┐
│     CLIENT (Vercel)          │       │      SERVER (Render)         │
│                              │       │                              │
│  React + Vite + Tailwind v4  │◄─────►│  Node.js + Express           │
│  Monaco Editor               │  WS   │  Socket.IO                   │
│  Yjs (CRDT Doc)              │◄─────►│  Yjs (Authoritative Doc)     │
│  y-monaco (Editor Binding)   │       │  Room Management             │
│  y-protocols (Awareness)     │       │  Awareness Relay              │
│                              │       │                              │
└──────────────────────────────┘       └──────────────────────────────┘
```

---

## 📂 Project Structure

```
CodeSync-Live-Collaborative-Coding-Platform/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing/
│   │   │   │   └── LandingPage.jsx  # Hero landing page
│   │   │   └── Room/
│   │   │       ├── RoomPage.jsx     # Main editor + Socket.IO + Yjs
│   │   │       ├── JoinModal.jsx    # Display name entry modal
│   │   │       └── UserList.jsx     # Online collaborators sidebar
│   │   ├── pages/
│   │   │   ├── LandingPageContainer.jsx
│   │   │   └── RoomPageContainer.jsx
│   │   ├── config.js                # Centralized backend URL config
│   │   ├── App.jsx                  # React Router SPA routes
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Tailwind + live cursor styles
│   ├── vercel.json                  # SPA rewrite rules for Vercel
│   ├── vite.config.js               # Vite config with Yjs dedupe
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── index.js                 # Express + Socket.IO entry point
│   │   ├── routes/
│   │   │   └── room.js              # POST /api/room (create room)
│   │   ├── ws/
│   │   │   └── yjsServer.js         # Yjs CRDT state + awareness relay
│   │   └── utils/
│   │       └── generateId.js        # nanoid room ID generator
│   └── package.json
│
├── DEPLOY.md                        # Deployment guide (Vercel + Render)
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/Himanshubiwal/CodeSync-Live-Collaborative-Coding-Platform.git
cd CodeSync-Live-Collaborative-Coding-Platform
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Start the development servers

```bash
# Terminal 1 — Start the backend server (port 3001)
cd server
npm run dev

# Terminal 2 — Start the frontend client (port 5173)
cd client
npm run dev
```

### 4. Open and collaborate!

1. Open **http://localhost:5173** in your browser
2. Click **"Create New Room"**
3. Enter your display name
4. Open the same room URL in a **second browser tab** with a different name
5. Start typing — watch the magic happen! ✨

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Editor** | Monaco Editor | VS Code-grade code editing with syntax highlighting |
| **CRDT Engine** | Yjs + y-monaco | Conflict-free real-time document synchronization |
| **Live Cursors** | y-protocols/awareness | Colored cursor positions & name tags for each user |
| **Real-time Transport** | Socket.IO | WebSocket connection for Yjs updates & awareness |
| **Frontend** | React 19 + Vite 8 | Fast SPA with hot module replacement |
| **Routing** | React Router DOM | Client-side SPA navigation (`/` and `/room/:roomId`) |
| **Styling** | Tailwind CSS v4 | Utility-first dark theme with glassmorphism |
| **Backend** | Node.js + Express | REST API for room creation + Socket.IO server |
| **Room IDs** | nanoid | URL-safe 8-character unique room identifiers |

---

## 🌐 Deployment

Deploy the client to **Vercel** and the server to **Render** for production.

See the full step-by-step guide in **[DEPLOY.md](./DEPLOY.md)**.

| Service | Directory | Environment Variable |
|---------|-----------|---------------------|
| **Vercel** (Client) | `client/` | `VITE_BACKEND_URL` = your Render URL |
| **Render** (Server) | `server/` | `CLIENT_URL` = your Vercel URL |

---

## 🔑 Environment Variables

### Client (`client/.env`)
```env
VITE_BACKEND_URL=https://your-server.onrender.com
```

### Server (`server/.env`)
```env
PORT=3001
CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
```

---

## 🤝 How It Works

1. **User creates a room** → `POST /api/room` generates an 8-char ID via nanoid
2. **User enters room** → Socket.IO connects, Yjs `Y.Doc` is initialized
3. **User types code** → Local `Y.Doc` update is broadcast via `yjs-update` event
4. **Peers receive update** → `Y.applyUpdate()` merges changes conflict-free
5. **Cursor moves** → Awareness protocol broadcasts position via `awareness-update`
6. **Peer cursors render** → `y-monaco` MonacoBinding paints colored cursors + name tags
7. **User disconnects** → Server cleans up user from room, notifies remaining peers

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Himanshu Biwal](https://github.com/Himanshubiwal)**

</div>

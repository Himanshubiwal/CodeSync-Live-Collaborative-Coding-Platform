import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import { BACKEND_URL } from '../../config.js';
import JoinModal from './JoinModal.jsx';
import UserList from './UserList.jsx';

export default function RoomPage({ roomId, onLeaveRoom }) {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('codesync_username') || '';
  });
  const [showJoinModal, setShowJoinModal] = useState(() => {
    return !localStorage.getItem('codesync_username');
  });
  const [editorMounted, setEditorMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [localUserId, setLocalUserId] = useState(null);

  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);

  // Setup Socket.IO + Yjs CRDT Synchronization after display name is entered
  useEffect(() => {

    if (!userName || !editorRef.current) return;

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText('monaco');

    const awareness = new Awareness(ydoc);
    const CURSOR_COLORS = [
      '#6366f1', '#ec4899', '#10b981', '#f59e0b',
      '#06b6d4', '#8b5cf6', '#ef4444', '#3b82f6',
    ];
    const myColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

    awareness.setLocalStateField('user', {
      name: userName || 'Anonymous Dev',
      color: myColor,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId: roomId || 'demo', userName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Receive initial room state and collaborator list
    socket.on('room-state', ({ stateUpdate, users: roomUsers, localUser }) => {
      if (stateUpdate && stateUpdate.length > 0) {
        Y.applyUpdate(ydoc, new Uint8Array(stateUpdate), 'remote');
      }
      setUsers(roomUsers || []);
      if (localUser) setLocalUserId(localUser.id);

      // Bind Yjs CRDT document and live Awareness cursors directly to Monaco Editor
      if (editorRef.current && !bindingRef.current) {
        bindingRef.current = new MonacoBinding(
          ytext,
          editorRef.current.getModel(),
          new Set([editorRef.current]),
          awareness
        );
      }
    });

    // Handle incoming real-time Yjs CRDT updates from peers
    socket.on('yjs-update', ({ update }) => {
      if (update) {
        Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
      }
    });

    // Broadcast local Yjs CRDT document changes to the server
    ydoc.on('update', (update, origin) => {
      if (origin !== 'remote') {
        socket.emit('yjs-update', {
          roomId: roomId || 'demo',
          update: Array.from(update),
        });
      }
    });

    // Handle real-time Awareness (cursor & selection) changes
    awareness.on('update', ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated, removed);
      const awarenessUpdate = encodeAwarenessUpdate(awareness, changedClients);
      socket.emit('awareness-update', {
        roomId: roomId || 'demo',
        update: Array.from(awarenessUpdate),
      });
    });

    socket.on('awareness-update', ({ update }) => {
      if (update) {
        applyAwarenessUpdate(awareness, new Uint8Array(update), 'remote');
      }
    });

    // Handle peer joins/leaves
    socket.on('user-joined', ({ users: updatedUsers }) => {
      setUsers(updatedUsers || []);
    });

    socket.on('user-left', ({ users: updatedUsers }) => {
      setUsers(updatedUsers || []);
    });

    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      awareness.destroy();
      ydoc.destroy();
      socket.disconnect();
    };
  }, [userName, roomId, editorMounted]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    setEditorMounted(true);
  };

  const handleJoin = (enteredName) => {
    setUserName(enteredName);
    setShowJoinModal(false);
  };

  const handleCopyLink = () => {
    const link = window.location.origin + '/room/' + (roomId || 'demo');
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen w-screen bg-[#0f1117] text-slate-100 flex flex-col overflow-hidden relative">
      {showJoinModal && (
        <JoinModal
          roomId={roomId || 'xK9f2pQm'}
          initialName={userName}
          onJoin={handleJoin}
        />
      )}

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/20">
              CS
            </div>
            <span className="font-bold text-base text-white tracking-tight">CodeSync Room</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 font-mono text-indigo-300">
              #{roomId || 'xK9f2pQm'}
            </span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              title="Copy Shareable Link"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Share Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
            />
            <span>{isConnected ? 'Connected (Yjs CRDT)' : 'Offline Local Mode'}</span>
          </div>

          <button
            onClick={onLeaveRoom}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Main Workspace: Editor + Collaborators Sidebar */}
      <main className="flex-1 flex min-h-0 relative">
        <div className="flex-1 h-full bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              padding: { top: 16 },
            }}
          />
        </div>

        <UserList users={users} localUserId={localUserId} />
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-7 border-t border-slate-800/80 bg-slate-900 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">Engine:</span> Yjs CRDT + Monaco
          </span>
          <span>&bull;</span>
          <span>JavaScript</span>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Click to change display name"
            >
              <span>Editing as: {userName}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
                Rename
              </span>
            </button>
          )}
          <span>&bull;</span>
          <span>CodeSync Collaborative Environment</span>
        </div>
      </footer>
    </div>
  );
}

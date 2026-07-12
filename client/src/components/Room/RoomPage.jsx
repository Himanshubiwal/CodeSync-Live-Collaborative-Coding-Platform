import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import { BACKEND_URL } from '../../config.js';
import JoinModal from './JoinModal.jsx';
import UserList from './UserList.jsx';
import ChatSidebar from './ChatSidebar.jsx';
import OutputPanel from './OutputPanel.jsx';

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
  const [language, setLanguage] = useState('javascript');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Execution states
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stdinInput, setStdinInput] = useState('');

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

    // Join dedicated chat room
    socket.emit('chat:join', { roomId: roomId || 'demo', userName });

    // Listen for incoming chat messages
    socket.on('chat:message', (incomingMsg) => {
      setChatMessages((prev) => [...prev, incomingMsg]);
      setShowChat((isShowing) => {
        if (!isShowing) setUnreadChatCount((cnt) => cnt + 1);
        return isShowing;
      });
    });

    // Receive initial room state and collaborator list
    socket.on('room-state', ({ stateUpdate, users: roomUsers, localUser, language: roomLang }) => {
      if (stateUpdate && stateUpdate.length > 0) {
        Y.applyUpdate(ydoc, new Uint8Array(stateUpdate), 'remote');
      }
      setUsers(roomUsers || []);
      if (localUser) setLocalUserId(localUser.id);
      if (roomLang) setLanguage(roomLang);

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
    // IMPORTANT: Only emit LOCAL awareness changes, skip remote ones to prevent echo loop
    awareness.on('update', ({ added, updated, removed }, origin) => {
      if (origin === 'remote') return; // ← Prevents infinite echo loop
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

    // Handle language change from peers
    socket.on('language-change', ({ language: newLang }) => {
      if (newLang) setLanguage(newLang);
    });

    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      awareness.destroy();
      ydoc.destroy();
      socket.disconnect();
    };
  }, [userName, roomId, editorMounted]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorMounted(true);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const runBtn = document.querySelector('[data-run-btn="true"]');
      if (runBtn) runBtn.click();
    });
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

  const LANGUAGES = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'c', label: 'C' },
  ];

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socketRef.current) {
      socketRef.current.emit('language-change', {
        roomId: roomId || 'demo',
        language: newLang,
      });
    }
  };

  const handleSendChatMessage = (text) => {
    const myColor = users.find((u) => u.id === localUserId)?.color || '#6366f1';
    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: localUserId || socketRef.current?.id,
      senderName: userName || 'You',
      senderColor: myColor,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    if (socketRef.current) {
      socketRef.current.emit('chat:send', {
        roomId: roomId || 'demo',
        message: newMsg,
      });
    }
  };

  const handleRunCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    if (!code.trim()) return;

    setIsOutputOpen(true);
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language,
          code: code,
          stdin: stdinInput,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setExecutionResult(data.run);
      } else {
        setExecutionResult({
          stdout: '',
          stderr: data.error || 'Execution failed',
          code: 1,
        });
      }
    } catch (err) {
      setExecutionResult({
        stdout: '',
        stderr: 'Error connecting to Piston execution server: ' + err.message,
        code: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col overflow-hidden relative">
      {showJoinModal && (
        <JoinModal
          roomId={roomId || 'xK9f2pQm'}
          initialName={userName}
          onJoin={handleJoin}
        />
      )}

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-[#2b2b2b] bg-[#181818] px-5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e639c] flex items-center justify-center font-bold text-white text-sm shadow-sm">
              CS
            </div>
            <span className="font-bold text-base text-[#cccccc] tracking-tight">CodeSync Room</span>
          </div>

          <div className="h-4 w-px bg-[#2b2b2b]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#252526] border border-[#333333] font-mono text-[#9cdcfe]">
              #{roomId || 'xK9f2pQm'}
            </span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#313131] hover:bg-[#383838] border border-[#3f3f3f] text-xs font-medium text-[#cccccc] transition-colors cursor-pointer"
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
                  <svg className="w-3.5 h-3.5 text-[#aaaaaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Share Link
                </>
              )}
            </button>
          </div>

          <div className="h-4 w-px bg-[#2b2b2b]" />

          {/* Language Selector */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-2.5 py-1 rounded-lg bg-[#313131] border border-[#3f3f3f] text-xs font-medium text-[#cccccc] cursor-pointer focus:outline-none focus:border-[#0e639c] transition-colors appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23aaaaaa\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '24px' }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Run Code Button */}
          <button
            data-run-btn="true"
            onClick={handleRunCode}
            disabled={isRunning}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-sm ${
              isRunning
                ? 'bg-[#1e4868] text-[#cccccc] cursor-wait'
                : 'bg-[#0e639c] hover:bg-[#1177bb] text-white active:scale-95'
            }`}
            title="Compile & Run Code inside self-hosted Piston container"
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>▶ Run Code</span>
              </>
            )}
          </button>

          {/* Terminal Toggle Button */}
          <button
            onClick={() => setIsOutputOpen(!isOutputOpen)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              isOutputOpen
                ? 'bg-[#252526] border-[#0e639c] text-[#9cdcfe]'
                : 'bg-[#313131] hover:bg-[#383838] border-[#3f3f3f] text-[#cccccc]'
            }`}
            title="Toggle Terminal Output Drawer"
          >
            <span>&gt;_ Output</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#cccccc] bg-[#252526] px-3 py-1.5 rounded-lg border border-[#333333]">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
            />
            <span>{isConnected ? 'Connected (Yjs CRDT)' : 'Offline Local Mode'}</span>
          </div>

          {/* Chat Toggle Button */}
          <button
            onClick={() => {
              setShowChat(!showChat);
              if (!showChat) setUnreadChatCount(0);
            }}
            className={`relative px-3 py-1.5 rounded-lg border font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              showChat
                ? 'bg-[#0e639c] border-[#1177bb] text-white shadow-sm'
                : 'bg-[#313131] hover:bg-[#383838] border-[#3f3f3f] text-[#cccccc]'
            }`}
            title="Toggle Room Chat Panel"
          >
            <span>💬 Chat</span>
            {unreadChatCount > 0 && !showChat && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </button>

          <button
            onClick={onLeaveRoom}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Main Workspace: Editor + Collaborators Sidebar */}
      <main className="flex-1 flex min-h-0 min-w-0 relative overflow-hidden">
        <div className="flex-1 h-full min-w-0 bg-[#1e1e1e] flex flex-col">
          <div className="flex-1 min-h-0 min-w-0">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                automaticLayout: true,
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
          <OutputPanel
            isOpen={isOutputOpen}
            onClose={() => setIsOutputOpen(false)}
            isRunning={isRunning}
            result={executionResult}
            stdin={stdinInput}
            onStdinChange={setStdinInput}
            onClear={() => setExecutionResult(null)}
          />
        </div>

        {showChat ? (
          <ChatSidebar
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            localUserId={localUserId}
            userName={userName}
          />
        ) : (
          <UserList users={users} localUserId={localUserId} />
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-7 border-t border-[#2b2b2b] bg-[#007acc] px-4 flex items-center justify-between text-[11px] text-white select-none shrink-0 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold">Engine:</span> Yjs CRDT + Monaco
          </span>
          <span>&bull;</span>
          <span>{LANGUAGES.find((l) => l.id === language)?.label || 'JavaScript'}</span>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="text-white hover:text-white/80 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Click to change display name"
            >
              <span>Editing as: {userName}</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded border border-white/20 text-white">
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

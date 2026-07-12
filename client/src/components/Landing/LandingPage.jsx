import React, { useState } from 'react';

export default function LandingPage({ onCreateRoom, onJoinRoom }) {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomIdInput.trim()) {
      setError('Please enter a valid Room ID');
      return;
    }
    setError('');
    if (onJoinRoom) {
      onJoinRoom(roomIdInput.trim());
    } else {
      console.log('Joining room:', roomIdInput.trim());
    }
  };

  const handleCreate = () => {
    if (onCreateRoom) {
      onCreateRoom();
    } else {
      console.log('Creating new room...');
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-[#2b2b2b] bg-[#181818] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0e639c] flex items-center justify-center shadow-md font-bold text-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">CodeSync</span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[#252526] text-[#9cdcfe] border border-[#333333]">
              Live Collaboration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-[#aaaaaa] font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            VS Code Studio Powered
          </span>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          {/* Studio Card */}
          <div className="bg-[#252526] border border-[#333333] rounded-2xl p-8 sm:p-10 shadow-2xl relative">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#3f3f3f] text-[#9cdcfe] text-xs font-semibold uppercase tracking-wider mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Real-time Shared Editor
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Live Collaborative Coding
            </h1>
            <p className="text-[#aaaaaa] text-sm sm:text-base leading-relaxed mb-8">
              Create a room instantly, share the link with your collaborators, and edit code together in real-time inside a native VS Code desktop environment.
            </p>

            {/* Create Room Button */}
            <button
              onClick={handleCreate}
              className="w-full group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#0e639c] hover:bg-[#1177bb] text-white font-semibold text-base shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Room
            </button>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#333333]" />
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">
                Or Join Existing Room
              </span>
              <div className="h-px flex-1 bg-[#333333]" />
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoin} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => {
                      setRoomIdInput(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter Room ID (e.g. xK9f2pQm)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e1e1e] border border-[#3f3f3f] text-white placeholder-[#888888] text-sm focus:outline-none focus:border-[#0e639c] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#313131] hover:bg-[#383838] text-white font-medium text-sm transition-colors border border-[#3f3f3f] active:scale-[0.99] cursor-pointer"
                >
                  Join Room
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 font-medium pl-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Feature Highlights below card */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-[#252526] border border-[#333333] text-center">
              <div className="text-[#9cdcfe] font-semibold text-sm mb-1">Low Latency</div>
              <div className="text-[#888888] text-xs">Real-time WebSocket sync</div>
            </div>
            <div className="p-4 rounded-xl bg-[#252526] border border-[#333333] text-center">
              <div className="text-[#4ec9b0] font-semibold text-sm mb-1">Live Cursors</div>
              <div className="text-[#888888] text-xs">Multi-user colored tags</div>
            </div>
            <div className="p-4 rounded-xl bg-[#252526] border border-[#333333] text-center">
              <div className="text-[#ce9178] font-semibold text-sm mb-1">Instant Share</div>
              <div className="text-[#888888] text-xs">No account required</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#2b2b2b] bg-[#181818] py-4 px-8 text-center text-xs text-[#888888]">
        CodeSync VS Code Collaborative Environment &bull; Built with React & Tailwind CSS
      </footer>
    </div>
  );
}

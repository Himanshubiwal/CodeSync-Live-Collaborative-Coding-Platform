import React, { useState } from 'react';

export default function JoinModal({ roomId, onJoin, initialName = '' }) {
  const [name, setName] = useState(() => {
    return initialName || localStorage.getItem('codesync_username') || '';
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a display name');
      return;
    }
    const cleanName = name.trim();
    localStorage.setItem('codesync_username', cleanName);
    onJoin(cleanName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="max-w-md w-full bg-[#252526] border border-[#333333] rounded-2xl p-7 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#0e639c] flex items-center justify-center text-white font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Join Room</h2>
            <p className="text-xs text-[#aaaaaa]">
              Room ID: <span className="font-mono text-[#9cdcfe] font-semibold">{roomId}</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-[#cccccc] mb-6 leading-relaxed">
          Enter your display name below so your collaborators can identify your live cursor in real-time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaaaaa] mb-2">
              Your Display Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Alex Rivera"
              className="w-full px-4 py-3 rounded-xl bg-[#1e1e1e] border border-[#3f3f3f] text-white placeholder-[#888888] text-sm focus:outline-none focus:border-[#0e639c] transition-colors"
            />
            {error && (
              <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#333333] flex items-center justify-between text-xs text-[#aaaaaa]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0e639c] shadow-sm" />
              Assigned Cursor Color
            </span>
            <span className="font-medium text-[#cccccc]">Auto-assigned on entry</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#0e639c] hover:bg-[#1177bb] text-white font-semibold text-sm shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            Enter Room &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}

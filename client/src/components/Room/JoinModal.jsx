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
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-7 shadow-2xl shadow-black/80 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Join Room</h2>
            <p className="text-xs text-slate-400">
              Room ID: <span className="font-mono text-indigo-300 font-semibold">{roomId}</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Enter your display name below so your collaborators can identify your live cursor in real-time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
              Assigned Cursor Color
            </span>
            <span className="font-medium text-slate-300">Auto-assigned on entry</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99] cursor-pointer"
          >
            Enter Room &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}

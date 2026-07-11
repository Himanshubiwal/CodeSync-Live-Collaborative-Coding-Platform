import React from 'react';

export default function UserList({ users, localUserId }) {
  return (
    <aside className="w-64 border-l border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex flex-col h-full select-none">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Collaborators
        </span>
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
          {users.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {users.map((user) => {
          const isLocal = user.id === localUserId;
          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                isLocal
                  ? 'bg-indigo-500/10 border-indigo-500/25'
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40'
              }`}
            >
              {/* Color dot avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                style={{ backgroundColor: user.color || '#6366f1' }}
              >
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'DE'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {user.name}
                  </span>
                  {isLocal && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400 truncate">Connected</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-center">
        <p className="text-xs text-slate-500">
          Live cursor sync active
        </p>
      </div>
    </aside>
  );
}

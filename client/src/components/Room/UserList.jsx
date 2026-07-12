import React from 'react';

export default function UserList({ users, localUserId }) {
  return (
    <aside className="w-64 border-l border-[#2b2b2b] bg-[#252526] flex flex-col h-full select-none">
      <div className="p-4 border-b border-[#2b2b2b] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#cccccc]">
          Collaborators
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#313131] border border-[#3f3f3f] text-[#cccccc] text-xs font-bold">
          {users.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-vscode-scrollbar">
        {users.map((user) => {
          const isLocal = user.id === localUserId;
          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                isLocal
                  ? 'bg-[#37373d] border-[#0e639c]'
                  : 'bg-[#2d2d30] border-[#3e3e42] hover:bg-[#37373d]'
              }`}
            >
              {/* Color dot avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                style={{ backgroundColor: user.color || '#3f3f46' }}
              >
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'DE'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {user.name}
                  </span>
                  {isLocal && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-[#0e639c] px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-[#aaaaaa] truncate">Connected</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#2b2b2b] bg-[#1e1e1e] text-center">
        <p className="text-xs text-[#888888]">
          Live cursor sync active
        </p>
      </div>
    </aside>
  );
}

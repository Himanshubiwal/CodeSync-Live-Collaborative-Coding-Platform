import React, { useState } from 'react';

export default function OutputPanel({
  isOpen,
  onClose,
  isRunning,
  result,
  stdin,
  onStdinChange,
  onClear,
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'stdin'

  if (!isOpen) return null;

  return (
    <div className="border-t border-[#333333] bg-[#1e1e1e] flex flex-col h-64 shrink-0 transition-all animate-fade-in">
      {/* Drawer Header Bar */}
      <div className="bg-[#181818] border-b border-[#2b2b2b] px-4 py-1.5 flex items-center justify-between select-none">
        {/* Left Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 text-xs font-semibold rounded-t flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'output'
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#0e639c]'
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M4 15h16a1 1 0 001-1V6a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1z" />
            </svg>
            TERMINAL OUTPUT
          </button>

          <button
            onClick={() => setActiveTab('stdin')}
            className={`px-3 py-1 text-xs font-semibold rounded-t flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'stdin'
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#0e639c]'
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            STDIN INPUT {stdin.trim() ? '(Set)' : ''}
          </button>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Execution Status Badge */}
          {isRunning && (
            <span className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Compiling & Executing...
            </span>
          )}

          {!isRunning && result && (
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  result.code === 0
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    result.code === 0 ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                Exit Code: {result.code !== undefined ? result.code : '-'}
              </span>
            </div>
          )}

          {/* Clear Output */}
          <button
            onClick={onClear}
            title="Clear Terminal Output"
            className="p-1 text-[#888888] hover:text-white rounded hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Close Drawer */}
          <button
            onClick={onClose}
            title="Close Terminal Drawer"
            className="p-1 text-[#888888] hover:text-white rounded hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm custom-vscode-scrollbar">
        {activeTab === 'output' ? (
          <div>
            {isRunning ? (
              <p className="text-[#888888] italic animate-pulse">
                &gt; Executing script inside self-hosted Piston container...
              </p>
            ) : result ? (
              <div className="space-y-2">
                {result.stdout && (
                  <pre className="text-[#4ec9b0] whitespace-pre-wrap break-all">
                    {result.stdout}
                  </pre>
                )}
                {result.stderr && (
                  <pre className="text-[#f48771] whitespace-pre-wrap break-all font-semibold">
                    {result.stderr}
                  </pre>
                )}
                {!result.stdout && !result.stderr && (
                  <p className="text-[#777777] italic">&gt; Program completed with no terminal output.</p>
                )}
              </div>
            ) : (
              <p className="text-[#666666] italic">
                &gt; Click the &quot;▶ Run Code&quot; button in the toolbar to compile and execute your script.
              </p>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <p className="text-xs text-[#888888] mb-2 font-sans">
              Enter custom standard input (stdin) values below. These will be fed to your program when executed:
            </p>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="e.g. 42&#10;hello world"
              className="flex-1 w-full bg-[#141414] border border-[#333333] rounded p-3 text-[#cccccc] placeholder-[#555555] text-sm font-mono focus:outline-none focus:border-[#0e639c] resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

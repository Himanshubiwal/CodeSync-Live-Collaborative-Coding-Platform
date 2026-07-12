import React, { useState, useRef, useEffect } from 'react';

export default function ChatSidebar({
  isOpen,
  onClose,
  messages = [],
  onSendMessage,
  localUserId,
  userName,
}) {
  const [width, setWidth] = useState(340);
  const [inputText, setInputText] = useState('');
  const isResizingRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle horizontal resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 260 && newWidth <= 650) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ width: `${width}px` }}
      className="h-full bg-[#252526] border-l border-[#2b2b2b] flex flex-col relative shrink-0 z-20 shadow-2xl transition-shadow"
    >
      {/* Draggable Vertical Resize Divider */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-[#0e639c] active:bg-[#1177bb] transition-colors z-30"
        title="Drag to resize sidebar width"
      />

      {/* Top Header */}
      <div className="h-12 border-b border-[#2b2b2b] px-4 flex items-center justify-between shrink-0 bg-[#181818] select-none">
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <span className="font-bold text-xs text-[#cccccc] tracking-wide uppercase">
            Room Discussion
          </span>
          <span className="text-[10px] font-semibold bg-[#313131] text-[#cccccc] px-2 py-0.5 rounded-full border border-[#3f3f3f]">
            {messages.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#313131] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
          title="Close Chat Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Feed */}
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 [&::-webkit-scrollbar]:hidden"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-[#313131] border border-[#3f3f3f] flex items-center justify-center text-lg mb-2.5">
              💬
            </div>
            <p className="text-xs font-medium text-[#cccccc]">No messages yet</p>
            <p className="text-[11px] text-[#888888] mt-1">
              Start the conversation with your team in real-time!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === localUserId;
            return (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}
              >
                {/* Sender Tag & Timestamp */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {!isOwn && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: msg.senderColor || '#0e639c' }}
                    />
                  )}
                  <span className="text-[11px] font-semibold text-[#cccccc]">
                    {isOwn ? 'You' : msg.senderName || 'Collaborator'}
                  </span>
                  <span className="text-[10px] text-[#888888]">
                    {msg.timestamp || ''}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[88%] break-words shadow-sm ${
                    isOwn
                      ? 'bg-[#0e639c] text-white font-medium rounded-tr-xs shadow-sm'
                      : 'bg-[#313131] text-[#eaeaea] border border-[#3f3f3f] rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Dock */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-[#2b2b2b] bg-[#181818] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message as ${userName || 'you'}...`}
          className="flex-1 bg-[#1e1e1e] border border-[#3f3f3f] focus:border-[#0e639c] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#888888] focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-xl bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#2d2d30] disabled:text-[#666666] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed font-bold"
          title="Send Message"
        >
          <svg className="w-3.5 h-3.5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react';

export default function ChatInput({ onSend, disabled }: { onSend: (t: string) => void; disabled?: boolean; }) {
  const [text, setText] = useState('');
  return (
    <div className="flex">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { onSend(text.trim()); setText(''); } }}
        placeholder="Type your message..."
        className="flex-1 bg-navy-700/60 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold border border-white/10 placeholder:text-white/50"
        disabled={disabled}
      />
      <button
        onClick={() => { if (text.trim()) { onSend(text.trim()); setText(''); } }}
        className="bg-brand-blue hover:bg-brand-blue/80 text-white px-4 py-2 rounded-r-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-gold"
        disabled={disabled}
      >
        Send
      </button>
    </div>
  );
}

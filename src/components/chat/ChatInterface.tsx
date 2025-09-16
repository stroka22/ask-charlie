import { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatInput from './ChatInput';
import ChatBubble from './ChatBubble';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

export default function ChatInterface() {
  const { persona, messages, isTyping, sendMessage, debateMode, setDebateMode } = useChat();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, isTyping]);

  if (!persona) return null;

  return (
    <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:gap-6">
    {/* Main chat area */}
    <Card className="backdrop-blur-lg bg-navy-800/70">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold">CK</div>
          <h2 className="ml-3 text-xl font-extrabold text-white">
            Chat with {persona.name}
            <span className="block h-0.5 w-full bg-gradient-to-r from-brand-red via-brand-gold to-brand-blue mt-1" />
            {/* patriotic accent stripe */}
            <div className="accent-tricolor rounded-full mt-1" style={{ height: '2px' }} />
          </h2>
        </div>
        <div className="flex rounded-full overflow-hidden border border-brand-blue/50" role="group" aria-label="Mode toggle">
          <Button
            size="sm"
            variant={debateMode === 'Debate' ? 'primary' : 'ghost'}
            aria-pressed={debateMode === 'Debate'}
            onClick={() => setDebateMode('Debate')}
          >
            Debate
          </Button>
          <Button
            size="sm"
            variant={debateMode === 'Lecture' ? 'primary' : 'ghost'}
            aria-pressed={debateMode === 'Lecture'}
            onClick={() => setDebateMode('Lecture')}
          >
            Lecture
          </Button>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {messages.filter(m => m.role !== 'system').map((m) => (
          <ChatBubble key={m.id} role={m.role as 'user'|'assistant'} content={m.content} />
        ))}
        {isTyping && <div className="text-white/70 text-sm">{persona.name} is typing…</div>}
        <div ref={endRef} />
      </div>

      <ChatInput onSend={(t) => sendMessage(t)} disabled={isTyping} />
    </Card>

    {/* Side panel (hidden on small screens) */}
    <Card
      className="hidden lg:block navy-panel h-fit backdrop-blur-md"
      aria-label="Sources and outline panel"
    >
      <h3 className="text-lg font-bold mb-2 faith-heading">Sources &amp; Outline</h3>
      <p className="text-sm text-white/70">
        Relevant references and a structured outline will appear here once
        available.
      </p>
    </Card>
    </div>
  );
}

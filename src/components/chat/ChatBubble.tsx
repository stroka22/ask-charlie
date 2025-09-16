export default function ChatBubble({ role, content }: { role: 'user'|'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-xl p-4 leading-relaxed text-[15px]
        ${isUser
          ? 'bg-brand-red/90 text-white shadow-lg ring-1 ring-brand-red/70'
          : 'bg-gradient-to-br from-brand-blue/70 via-navy-800/70 to-navy-900/70 text-white border border-brand-gold/30 shadow'}`
        }
      >
        {content}
      </div>
    </div>
  );
}

export default function ChatBubble({ role, content }: { role: 'user'|'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg p-3
        ${isUser
          ? 'bg-brand-red text-white shadow-lg ring-1 ring-brand-red/60'
          : 'bg-gradient-to-br from-brand-blue via-navy-800 to-navy-900 text-white border border-brand-blue/40 shadow'}`
        }
      >
        {content}
      </div>
    </div>
  );
}

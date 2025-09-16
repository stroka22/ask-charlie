import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DebateMode, Persona, RagSnippet } from '../types/persona';
import { generateCharacterResponse } from '../services/openai';
import { retrieve as ragRetrieve } from '../services/rag';
import { Store } from '../services/store'; // localStorage-backed admin store

interface ChatMessage { id: string; role: 'user'|'assistant'|'system'; content: string; }
interface ChatContextValue {
  persona: Persona | null;
  messages: ChatMessage[];
  debateMode: DebateMode;
  isTyping: boolean;
  selectPersona: (p: Persona | null) => void;
  sendMessage: (content: string) => Promise<void>;
  setDebateMode: (m: DebateMode) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [debateMode, setDebateMode] = useState<DebateMode>('Debate');
  const [isTyping, setIsTyping] = useState(false);

  const selectPersona = useCallback((p: Persona | null) => {
    if (!p) {
      // Clear current chat state
      setPersona(null);
      setMessages([]);
      return;
    }
    setPersona(p);
    setMessages(
      p.systemPrompt
        ? [{ id: 'sys-1', role: 'system', content: p.systemPrompt }]
        : [],
    );

    // Seed into admin Store if not present (by name)
    try {
      const existing = Store.personas.all().find(per => per.name === p.name);
      if (!existing) {
        Store.personas.save([
          ...Store.personas.all(),
          {
            id: p.id ?? Math.random().toString(36).slice(2),
            name: p.name,
            avatarUrl: (p as any).avatarUrl || '',
            featureImageUrl: (p as any).featureImageUrl || '',
            systemPrompt: p.systemPrompt || '',
            defaultMode: 'Debate',
          },
        ]);
      }
    } catch { /* ignore localStorage errors */ }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!persona || !content) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build message history without full system prompt (just user/assistant) for clarity
      const apiMsgs = [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({ role: m.role, content: m.content }));

      // Optional RAG
      let ragContext: RagSnippet[] | undefined = undefined;
      try {
        if (import.meta.env?.VITE_ENABLE_RAG === 'true') {
          ragContext = await ragRetrieve(userMsg.content, 5);
        }
      } catch {}

      const reply = await generateCharacterResponse(
        persona.name,
        persona.systemPrompt,
        apiMsgs,
        { mode: debateMode, ragContext }
      );

      const SUFFIX = debateMode === 'Debate' ? "What's your next argument?" : '';
      const finalText = (reply || '').trim() + (SUFFIX && !reply.endsWith(SUFFIX) ? `\n\n${SUFFIX}` : '');

      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: finalText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: 'Sorry, I could not respond right now.' }]);
    } finally {
      setIsTyping(false);
    }
  }, [persona, messages, debateMode]);

  return (
    <ChatContext.Provider value={{ persona, messages, debateMode, isTyping, selectPersona, sendMessage, setDebateMode }}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

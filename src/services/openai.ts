import type { DebateMode, RagSnippet } from '../types/persona';

export interface GenerateOptions {
  mode?: DebateMode;
  ragContext?: RagSnippet[];
}

export async function generateCharacterResponse(
  characterName: string,
  characterPersona: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: GenerateOptions = {}
): Promise<string> {
  const resp = await fetch('/api/openai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterName,
      characterPersona,
      messages,
      mode: options.mode,
      ragContext: options.ragContext,
    }),
  });

  if (!resp.ok) {
    throw new Error(`OpenAI proxy error: ${resp.status}`);
  }
  const data = await resp.json().catch(() => ({}));
  return String(data?.text ?? '');
}

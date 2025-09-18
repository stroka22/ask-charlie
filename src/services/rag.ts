import type { RagSnippet } from '../types/persona';

/**
 * RAG retrieval stub.
 * Replace with calls to your vector DB (e.g., Supabase pgvector) later.
 */
export async function retrieve(query: string, topK = 5): Promise<RagSnippet[]> {
  if (!query || typeof fetch === 'undefined') return [];

  try {
    const resp = await fetch(
      `/api/rag/search?q=${encodeURIComponent(query)}&k=${topK}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!resp.ok) {
      console.warn('[rag] /api/rag/search returned', resp.status);
      return [];
    }

    const data = await resp.json().catch(() => ({}));
    const items: any[] = Array.isArray(data?.items) ? data.items : [];

    return items.map((entry) => {
      if (entry && typeof entry === 'object') {
        return {
          content: String(entry.content ?? entry.text ?? ''),
          source: entry.source ?? entry.url ?? '',
        } as RagSnippet;
      }
      // fallback for string-only arrays
      return { content: String(entry), source: '' } as RagSnippet;
    });
  } catch (err) {
    console.warn('[rag] retrieval error:', err);
    return [];
  }
}

import type { RagSnippet } from '../types/persona';

/**
 * Retrieves relevant content snippets based on a query string.
 * Returns empty array if API is unavailable or not configured.
 */
export async function retrieve(query: string, topK = 5): Promise<RagSnippet[]> {
  if (!query) return [];
  try {
    const resp = await fetch(`/api/rag/search?q=${encodeURIComponent(query)}&k=${topK}`);
    if (!resp.ok) return [];
    const data = await resp.json().catch(() => ({}));
    const items: any[] = Array.isArray(data?.items) ? data.items : [];
    return items.map((e) => ({ content: String(e?.content ?? e ?? ''), source: e?.source ?? '' }));
  } catch {
    return [];
  }
}

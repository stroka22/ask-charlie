import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (req.method === 'HEAD') return res.status(200).end();

  const q = req.query?.q || '';
  const k = parseInt(req.query?.k || '5', 10);
  if (!q) return res.status(200).json({ items: [] });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(200).json({ items: [] });
  }

  try {
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await client
      .from('transcript_chunks')
      .select('id, transcript_id, content, source_url')
      .ilike('content', `%${q}%`)
      .limit(k);

    if (error) return res.status(200).json({ items: [] });

    const items = (data || []).map((d) => ({
      id: d.id,
      content: d.content,
      source: d.source_url || `Transcript #${d.transcript_id}`,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(200).json({ items: [] });
  }
}

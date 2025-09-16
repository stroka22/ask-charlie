export default async function handler(req, res) {
  if (req.method !== 'POST') {
    if (req.method === 'GET' || req.method === 'HEAD') return res.status(200).json({ ok: true });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
    if (!body || typeof body !== 'object') body = {};

    const { characterName, characterPersona, messages, mode, ragContext } = body;
    if (!characterName || !characterPersona || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing characterName, characterPersona or messages' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({ text: 'OpenAI not configured. (Demo mode response)' });
    }

    const modeLine = typeof mode === 'string' && mode ? `Mode: ${mode}.` : '';

    let sourcesBlock = '';
    if (Array.isArray(ragContext) && ragContext.length > 0) {
      const lines = ragContext.slice(0, 5).map((e) => {
        if (!e) return '';
        if (typeof e === 'string') return `- ${e.slice(0,160)}...`;
        const src = e.source || 'source';
        const snip = typeof e.content === 'string' ? e.content.slice(0,160) : '';
        return `- ${src}: ${snip}...`;
      });
      if (lines.length > 0) sourcesBlock = `\n\nSOURCES (for grounding)\n${lines.join('\n')}`;
    }

    const systemMessage = {
      role: 'system',
      content: `${modeLine}\nYou are ${characterName}. ${characterPersona}\nKeep replies concise; stay respectful and on-topic.${sourcesBlock}`,
    };

    const payload = {
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(502).json({ error: `OpenAI error ${resp.status}`, details: txt.slice(0,200) });
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

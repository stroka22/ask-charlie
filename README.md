# Ask Charlie — Debate Charlie Kirk 🇺🇸✝️

Patriotic & faith-inspired chat application that lets users  
1. Debate Charlie Kirk in an adversarial mode or  
2. Switch to Lecture mode for structured explanations,  

optionally grounded with Retrieval-Augmented Generation (RAG) snippets from Supabase pgvector.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (auto-selects an open port, e.g. 5185)
npm run dev

# 3. Production build
npm run build

# 4. Preview production bundle locally
npm run preview
```

---

## 🔑 Environment Variables

| Scope | Variable | Purpose |
|-------|----------|---------|
| API   | `OPENAI_API_KEY`        | Used by `/api/openai/chat` proxy |
| API   | `SUPABASE_URL`          | Supabase REST endpoint |
| API   | `SUPABASE_ANON_KEY`     | Supabase anon key for `/api/rag/search` |
| FE    | `VITE_ENABLE_RAG=true`  | Turn on RAG retrieval in `ChatContext` |

_(If Supabase vars are absent the RAG endpoint gracefully returns `[]`.)_

---

## 🗂️ Key Files & Folders

| Area | Path | Notes |
|------|------|-------|
| App shell & Hero CTA | `src/App.tsx` | Header, stripe, hero, routing to chat |
| Chat state | `src/contexts/ChatContext.tsx` | Debate/Lecture mode, message flow, optional RAG |
| Chat UI | `src/components/chat/ChatInterface.tsx`<br>`src/components/chat/ChatInput.tsx`<br>`src/components/chat/ChatBubble.tsx` | Toggle pill, bubbles, input |
| Persona | `src/types/persona.ts`<br>`src/data/personas/charlieKirk.ts`<br>`src/data/personas/charlie-kirk.md` | Type defs, config, system prompt |
| OpenAI proxy | `api/openai/chat.mjs` | Accepts `mode` and `ragContext` |
| RAG | `src/services/rag.ts`<br>`api/rag/search.mjs` | Client fetch + naive Supabase search |
| Data schema | `sql/rag-schema.sql` | pgvector tables & indexes |

---

## 🎨 Design Notes

* **Palette** – navy/indigo backgrounds, red primary CTA, blue accents, gold focus outlines.  
* **Header** – “Ask Charlie” word-mark with patriotic red/white/blue stripe.  
* **Textures** – optional faint flag overlay & radial light-beams.  
* **Faith touches** – small cross/star separators, inspirational quotes.  
* **Accessibility** – ≥ 4.5 : 1 contrast, focus rings (`gold`).  
* **Assets optional** – If real photos aren’t available, avatar falls back to initials, feature image hides and shows a gradient card.

---

## 🛠 Local Development Tips

1. **Tailwind playground** – tweak colors in `tailwind.config.js → theme.extend.colors`.  
2. **Switch modes** – Debate/Lecture toggle lives in `ChatInterface`.  
3. **RAG testing** – set `VITE_ENABLE_RAG=true` but leave Supabase vars empty to test empty array path.  
4. **Supabase setup** – run `sql/rag-schema.sql`, embed transcripts, then supply environment keys.  
5. **Build size** – current prod bundle ≈ 197 kB gzip; adjust chunking in `vite.config.ts` if needed.

---

## 📜 License

MIT — see `LICENSE` file (or update to your preferred license).

Enjoy debating Charlie Kirk! 🇺🇸

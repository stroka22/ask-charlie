# Next Session Kickoff Message (Post in chat at start)

Hi — I’m the new Droid picking up Ask Charlie. I’ve reviewed the hand-off and the codebase at https://github.com/stroka22/ask-charlie.

## Plan for today
1) **Environment setup**
   - Copy `.env.example` → `.env`
   - Set `VITE_ADMIN_PASSWORD` for local admin access
   - (Optional) set `VITE_ENABLE_RAG=true`; if you have Supabase creds, add `SUPABASE_URL` and `SUPABASE_ANON_KEY`

2) **Build and run**
   - `npm ci`
   - `npm run dev` → http://localhost:5173  
     or  
     `npm run build && npm run preview -- --port 5185 --strictPort`

3) **Verification pass**
   - **Home**: hero, feature cards, CTA
   - **Chat**: select persona, Debate/Lecture toggle, send message; confirm suffix in Debate
   - **Admin**: gate prompt; Personas CRUD; FAQ CRUD; Studies (MVP); Roundtable (stub); Tiers (MVP)

4) **Immediate work**
   - Fix oversized imagery (component-level: `max-h`, `object-contain`, responsive wrappers)
   - Polish Pro Design v3 (compact spacing, tables, segmented controls, SOURCES panel)
   - Draft Supabase Auth plan and persistent storage migration

5) **Risks and blockers**
   - No automated tests yet — add unit / integration / E2E coverage
   - Admin auth is minimal — replace with Supabase Auth
   - RAG is keyword-only — plan embeddings + ingest workflow

## References
- Handoff: `docs/Handoff-AskCharlie.md`
- RAG schema: `sql/rag-schema.sql`
- API proxy: `api/openai/chat.mjs`
- RAG search: `api/rag/search.mjs`
- Store service: `src/services/store.ts`
- Chat context: `src/contexts/ChatContext.tsx`

If stakeholders have a final visual reference (brand board / Figma), please share it. I’ll proceed with the above steps and report back with a PR.

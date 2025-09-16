# Ask Charlie – Full Project Handoff (Droid-to-Droid)

Owner / POC: **B MS** ( @stroka22 )  
Primary repo: https://github.com/stroka22/ask-charlie  
Local path: `/Users/brian/ask-charlie`  
Legacy (context only): `/Users/brian/bot360ai` – separate codebase, **do not edit here**

---

## 1. What this project is
Ask Charlie is a standalone Vite + React + TypeScript application that lets users **debate or learn** from a persona (initially Charlie Kirk).  
It ships with an MVP **Admin Dashboard** to manage personas, FAQs, studies, roundtables, and account tiers; a simple password gate; and minimal **RAG** wiring via Supabase pgvector.  
OpenAI is proxied by serverless endpoints under `api/`.

---

## 2. Architecture overview
* **App shell** Vite 7 · React 19 · TypeScript 5.8 · Tailwind 4  
* **Routing** react-router-dom 7 (Home → Chat → Admin)  
* **UI kit** Tailwind utilities + `Button`, `Card`, `Sidebar` components  
* **State / Storage** `ChatContext` (React state) + localStorage-backed `Store` service  
* **AI** `/api/openai/chat` proxy → OpenAI Chat Completions  
* **RAG (optional)** `/api/rag/search` + Supabase client; schema in `sql/rag-schema.sql`  
* **Feature flags** `VITE_ENABLE_RAG` (boolean) ; `VITE_ADMIN_PASSWORD` (simple auth)

Key entry flow  
`index.html` → `src/main.tsx` → `src/App.tsx`  
Chat: `src/contexts/ChatContext.tsx` → `src/components/chat/*`  
Admin: `src/admin/AdminPage.tsx` + `src/admin/tabs/*`  
Serverless API: `api/openai/chat.mjs`, `api/rag/search.mjs`

---

## 3. Install, build, run
```bash
# prerequisites: Node 18+ (20+ preferred), npm
npm ci            # install
npm run dev       # http://localhost:5173
npm run build     # prod bundle
npm run preview -- --port 5185 --strictPort   # serve dist → http://localhost:5185
npm run lint
```
Scripts (package.json):  
`dev` vite · `build` `tsc -b && vite build` · `preview` vite preview · `lint` eslint .

---

## 4. Environment configuration
Copy `.env.example` ➜ `.env` in repo root.

Frontend (Vite):  
* `VITE_ADMIN_PASSWORD` – password for admin gate (leave blank to disable prompt)  
* `VITE_ENABLE_RAG` – `"true"` to enable retrieval in chat

Serverless / Vercel env:  
* `OPENAI_API_KEY` – required for `/api/openai/chat`  
* `SUPABASE_URL`, `SUPABASE_ANON_KEY` – optional, for `/api/rag/search`

Code that reads these vars:  
`api/openai/chat.mjs`, `api/rag/search.mjs`, `src/admin/AuthGate.tsx`, `src/contexts/ChatContext.tsx`.

---

## 5. Data model & persistence (MVP)
LocalStorage keys (see `src/services/store.ts`):
* `askcharlie_personas`
* `askcharlie_faqs`
* `askcharlie_studies`
* `askcharlie_tiers`

Persona CSV columns (import/export):  
`id, name, avatar_url, feature_image_url, default_mode, system_prompt`

---

## 6. Features implemented
### End-user
* Patriotic Home page – gradient hero, feature cards, CTA
* Chat page  
  * Persona auto-seed (Charlie Kirk)  
  * Mode toggle: **Debate / Lecture**  
  * Debate suffix enforcement (“What’s your next argument?”)  
  * Optional RAG grounding (flag controlled)

### Admin (password-gated)
* **Personas** – CRUD + CSV import/export
* **FAQ** – CRUD Q/A pairs
* **Studies** – title / description / outline (MVP)
* **Roundtable** – persona multi-select + topic (stub)
* **Account Tiers** – set messages-per-day limits (MVP)
* **Superadmin** – placeholder for orgs / users / invites / analytics

### API / AI
* `/api/openai/chat.mjs` – model proxy, supports `mode` + `ragContext`
* `/api/rag/search.mjs` – keyword fallback, Supabase pgvector ready
* `sql/rag-schema.sql` – transcripts & chunks with `vector(1536)` embeddings

### UI components & styling
* `Button`, `Card`, `Sidebar` with variants
* `src/index.css` v3 utilities – navy gradient, tricolor stripe, media constraints, starfield, etc.

---

## 7. Known issues / QA items
1. **Oversized imagery** on certain screens – need object-fit / max-height in components.  
2. **Design polish** – still plain on some breakpoints; see Pro Design v3 plan.  
3. **No automated tests** – unit, integration, E2E needed.  
4. **Admin auth** – replace prompt with proper Supabase Auth.  
5. **Accessibility** – review color contrast, ARIA labels.

---

## 8. Pro Design v3 plan (distinct, high polish)
* **Visual language** – royal blue gradient, balanced red/gold, subtle motion
* **Components** – improved buttons, inputs, segmented controls, tables
* **Pages** –  
  * Home: responsive hero, real imagery with object-contain  
  * Chat: SOURCES / Outline side panel, better empty & typing states  
  * Admin: counts in sidebar, toast notifications, sortable tables

---

## 9. RAG & ingestion roadmap
* **Phase 1** (done) – keyword `.ilike` search  
* **Phase 2** – embeddings  
  * Endpoint to embed (`text-embedding-3-small`)  
  * Ingest script to split transcripts → store embeddings  
  * Update search to pgvector similarity  
* **Phase 3** – citations UI + moderation

---

## 10. Future improvements
* **Audio / video debates & lectures** – WebRTC / LiveKit rooms, recordings  
* **Multilingual support** – i18n library + model prompting  
* **Auth & orgs** – Supabase Auth, RLS, superadmin org mgmt  
* **Payments** – Stripe tiers, usage metering  
* **Deployment** – Vercel staging / prod, protected envs  
* **Accessibility & performance** – Lighthouse budgets, ARIA, keyboard flows

---

## 11. Contribution workflow
* Branches: `main` default → `feature/*`, `fix/*`, `chore/*`  
* Conventional commits recommended (`feat:`, `fix:` …)  
* PRs: screenshots / GIFs + required env list

---

## 12. New Droid – quick start
1. Clone repo & `npm ci`  
2. Copy `.env.example` → `.env`, set `VITE_ADMIN_PASSWORD`  
3. `npm run dev` → visit Home, Chat, Admin  
4. Seed or create persona via Admin → Personas  
5. Set `VITE_ENABLE_RAG=true`, test retrieval (mock Supabase OK)  
6. Work through **Known issues** & **Pro Design v3** tasks  
7. Draft backend plan for persistent auth / storage

---

## 13. File map (core paths)
```
index.html                base HTML / fonts
src/main.tsx              React root + BrowserRouter
src/App.tsx               routes + layout
src/contexts/ChatContext  chat logic + RAG
src/components/chat/*     Chat UI pieces
src/admin/AdminPage.tsx   admin shell
src/admin/tabs/*          personas, faq, studies, ... tiers, superadmin
src/services/openai.ts    frontend proxy client
api/openai/chat.mjs       OpenAI proxy
api/rag/search.mjs        RAG search
sql/rag-schema.sql        pgvector schema
src/services/store.ts     localStorage store
src/ui/*                  Button / Card / Sidebar
src/index.css             theme & utilities
```

---

## 14. Testing recommendations
* **Unit** – ChatContext modes & suffix, Store service  
* **Integration** – CSV import/export round-trip  
* **E2E** – Playwright: Home → Chat → Admin happy path  
* **API mocks** – msw for `/api/openai/chat`, `/api/rag/search`

---

## 15. Open questions
* Final visual direction (mood-board or Figma spec?)  
* Persona catalog scope – one public vs multi-persona marketplace  
* RAG source ownership & update cadence  
* Payment tier limits & enforcement strategy  

---

_End of handoff – ready for the next Droid 🚀_

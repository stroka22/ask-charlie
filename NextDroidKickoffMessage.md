# Next Droid Kickoff Message

Hi — I’m picking up “Debate with Charlie.” Full handoff is here:
- docs/HANDOFF-Complete.md (this repo)
- Repo: https://github.com/stroka22/ask-charlie
- Production: https://ask-charlie.vercel.app/

Plan for today
1) Setup: create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (optionally `VITE_OWNER_SLUG`, `VITE_AUTH_DEBUG=true`).
2) Install/build: `npm ci`; `npm run dev` (or `npm run build` and `npm run preview`).
3) Verify:
   - Home hero shows top area (background-position: left 15%).
   - Auth login works; “My Debates” visible while logged in.
   - Admin Characters: CSV import, create/edit/delete, visibility toggle, search.
   - Groups tab: group CRUD and assignments.
   - Superadmin Users: filters, role change, org assignment, create org.
4) File landmarks: `src/contexts/AuthContext.tsx`, `src/pages/AdminPage.tsx`, `src/pages/admin/SuperadminUsersPage.jsx`, `src/components/chat/*`, `src/components/ScalableCharacterSelection*.{jsx,tsx}`, `src/components/Bot360Logo.jsx`, `index.html`.
5) Next: expand opponents, beautify cards/info panels, plan video/audio debates, i18n, Stripe flows, RAG embeddings.

Access
- Supabase + Vercel env values are required; ask the owner (B MS) if you don’t have them.

I’ll start with verification passes and open a PR for any fixes.

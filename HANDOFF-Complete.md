# Debate with Charlie — Comprehensive Handoff

Last updated: 2025-09-22  
Owner: B MS (stroka22)  
Maintainer: Droid (Factory)

## Overview
“Debate with Charlie” is a Vite + React + TypeScript single-page app themed for a patriotic/Christian brand with a gold cross icon and a debate-centric lexicon (Opponents, Debates, “preparing a rebuttal”). It replicates Bot360AI’s admin capabilities while transforming the public UX into debates with opponents. Centerpiece persona: Charlie Kirk; plan to add dozens of historical thinkers.

Production: https://ask-charlie.vercel.app/  
Repo: https://github.com/stroka22/ask-charlie

## Where to find things
- Source: repo root
- Public assets: `/public` (hero.jpg, favicon.svg)
- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`
- Pages: `src/pages/*`
- Components: `src/components/*`
- Chat UI: `src/components/chat/*`
- Contexts: `src/contexts/*`
- Services/Repos: `src/services/*`, `src/repositories/*`
- Admin hub: `src/pages/AdminPage.tsx`
- Superadmin: `src/pages/admin/SuperadminUsersPage.jsx`
- Docs: `/docs`

## Tech stack
- Vite ^6.3, TypeScript ~5.8, React ^19, React Router DOM ^7.6
- Tailwind CSS ^3.3 (+ @tailwindcss/postcss)
- Supabase JS ^2.51 (auth + DB access)
- Stripe (services present; limited UI)
- OpenAI client + RAG scaffolding
- ESLint 9

Scripts (package.json):
- `dev` → Vite dev server
- `build` → Vite build
- `preview` → serve dist
- `lint` → ESLint

## Environment configuration
Create `.env.local` at repo root (do not commit):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Optional: `VITE_OWNER_SLUG=default`, `VITE_AUTH_DEBUG=true`

Used in:
- Supabase client: `src/services/supabase.ts`
- Auth/session: `src/contexts/AuthContext.tsx`
- Org/tier helpers: `src/services/tierSettingsService.*`

## Install, run, build
- Prereq: Node 20+, npm
- Install: `npm ci`
- Dev: `npm run dev` → http://localhost:5173
- Build: `npm run build` → `dist/`
- Preview: `npm run preview`

## Routing and layout
- Routes in `src/App.tsx`
- Home: full‑bleed hero from `/public/hero.jpg`, focal point “left 15%” to reveal image top
- Global Footer (full‑bleed; positioned outside padded containers)
- Admin pages under `/admin`, superadmin console under `/admin` → Users

## Branding & theming
- Brand text: “Debate with Charlie” (header/footer/logo)
- Logo: `src/components/Bot360Logo.jsx` (gold cross icon + brand text)
- Favicon: `/public/favicon.svg` (gold cross)
- Title/meta: `index.html` updated
- Colors: patriotic red/white/blue, brightened reds, cyan scrubbed → blue

## Auth and subscription
- AuthContext (`src/contexts/AuthContext.tsx`): manages session/user/profile/role (Supabase)
- Subscription: `getActiveSubscription` from `src/services/stripe.ts`; sets `subscription` and `isPremium`
- `refreshSubscription` called on signIn/signOut/refreshSession
- Header shows “My Debates” when `isAuthenticated` is true

## Services, repositories, data
- Supabase client: `src/services/supabase.ts`
- Stripe: `src/services/stripe.ts` (subscription lookup)
- RAG scaffolding: `src/services/rag.ts`
- FAQs, invites, tier settings, leads: `src/services/*`
- Characters repository (used by AdminPage): CRUD, bulk create, visibility toggle

## Debate lexicon transformation
- Assistant/Leader → Opponent
- Conversation/Chat → Debate
- Typing: “is responding…” → “is preparing a rebuttal…”
- “My Conversations” → “My Debates”
- Legacy route: `/my-walk` → `/my-debates` redirect in `App.tsx`

Applied across:
- `src/components/chat/*` (ChatInterface*.js/ts, SimpleChatWithHistory.js, indicators)
- `src/components/CharacterSelection*.{jsx,tsx}`, `src/components/ScalableCharacterSelection*.{jsx,tsx}`
- `src/pages/HomePage.*`, `src/pages/HowItWorksPage.jsx`, and more

## User features
- Home: full‑bleed hero, CTA into selection/debate
- Selection: scalable, searchable opponents grid/list (debate lexicon copy)
- Chat/Debate: headers/placeholders updated; typing indicator says “is preparing a rebuttal”
- “My Debates” visible on login

## Admin features
- `src/pages/AdminPage.tsx`:
  - Characters (Opponents) management:
    - CSV bulk upload (parseCSV): name, avatar_url, feature_image_url, persona_prompt, description, visibility, insights fields (timeline_period, historical_context, geographic_location, key_scripture_references, theological_significance, relationships, study_questions)
    - Manual create/edit/delete; opening line, reference tag, persona prompt
    - Visibility toggle (is_visible)
    - Search by name/description/reference
  - Groups tab (GroupManagement): group CRUD and character assignments
- Featured character per org via localStorage

## Superadmin features
- `src/pages/admin/SuperadminUsersPage.jsx`:
  - View profiles (email/name/role/org/created)
  - Filters: search, role, organization; pagination/page size
  - Role changes: user/admin (superadmin-protected)
  - Organization assignment (owner_slug)
  - Create organization modal (slug + display name)

## Files to review first
- `src/contexts/AuthContext.tsx`
- `src/pages/AdminPage.tsx`
- `src/pages/admin/SuperadminUsersPage.jsx`
- `src/components/chat/*`
- `src/components/ScalableCharacterSelection*.{jsx,tsx}`
- `src/components/Footer.jsx`, `src/components/Header.jsx`
- `src/components/Bot360Logo.jsx`
- `index.html`

## Testing plan
Functional
- Auth: login/logout; session refresh; “My Debates” visibility
- Admin — Characters: CSV import (valid/invalid), create/edit/delete, visibility toggle, search
- Admin — Groups: create/edit/delete groups; map/unmap characters
- Superadmin — Users: filter/search; role change; org assignment; create org
- Home/Chat: hero top not clipped; debate lexicon across components

Non-functional
- Build/preview succeed
- Mobile/responsive audit (iOS Safari, small laptops)
- Accessibility basics (contrast, focus, aria)
- Bundle size acceptable (chunk warnings OK)

## Current status
Implemented
- Branding/title/meta; gold cross favicon/logo; full debate lexicon
- Auth + subscription integration; “My Debates” on login
- Admin characters: CSV + CRUD + visibility + search; Groups tab
- Superadmin users/orgs console; featured character storage
- Footer full‑bleed; hero focal point set to show more top

Verify next
- E2E on CSV/CRUD/visibility
- Superadmin filters/actions UX polish
- Cross-device hero/footer

Known tidy-ups
- Footer copyright string may still read “Ask Charlie” (trivial copy)
- Remove any remaining cyan accents in legacy components
- No automated tests yet; Stripe UI limited

## Roadmap (owner requested)
- Add dozens of debate partners with rich bios/insights
- Beautify opponent cards and background info panels
- Rich media debates: video/audio (Zoom-like) with recordings; focus on Charlie Kirk; WebRTC stack (LiveKit/Agora) candidates
- Multilingual i18n for UI and prompting; localized content
- Payments: full Stripe flows, portal, metering, webhooks
- RAG: embeddings, ingestion pipeline, similarity search, citations UI, moderation
- Observability: Sentry, analytics, audit logs
- Automated testing: unit/integration/E2E with deploy gates

## Security & workflow
- Never commit `.env.local`; store secrets in Vercel/Supabase
- Review diffs before commits (especially configs)
- Branch naming: `feature/*`, `fix/*`, `chore/*`; PRs with summaries/screenshots

---
End of HANDOFF-Complete.

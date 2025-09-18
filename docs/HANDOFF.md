# Ask Charlie – Project Handoff (Comprehensive)

Last updated: 2025-09-18  
Owner: B MS  
Assistance: Droid (Factory.ai)

## 0) TL;DR for the next Droid
- Codebase: vite + react + typescript + tailwind v4.
- Auth: Supabase (magic link). Admin gate falls back to password prompt if Supabase not configured.
- DB: Supabase Postgres. Full Bot360AI-compatible schema is included and idempotent.
- Admin features: Assistants/Characters CRUD, Groups & mapping, FAQ editor, Tiers, Roundtable settings, Studies (CRUD + CSV import/export), Featured Assistant, Favorites placeholder.
- Branch with latest shell fix: `fix/admin-surface-overrides`.
- Deployment: Vercel (SPA rewrites). Ensure you deploy the correct branch.

Start here:
1) Create `.env.local` and set Vite + Supabase vars (see Section 3). Run: `npm i && npm run dev`.
2) Run the SQL migration in Supabase (`sql/ask-charlie-bot360ai-migrations.sql`).
3) Visit `/login` → magic link → `/admin`.
4) If not seeing the light admin shell, you’re on an old deploy. Deploy `fix/admin-surface-overrides` or merge to main.

---

## 1) Project overview
Ask Charlie is a Vite + React + TypeScript web app that simulates debates/lectures with a Charlie Kirk persona, with a full Bot360AI-style admin backend for managing assistants (characters), groups, studies, FAQs, and account tier/roundtable settings.

Key goals:
- Feature parity with Bot360AI admin (exact behavior; design now aligned to Bot360AI, continuing polish).
- Secure auth via Supabase magic links; fallback local password gate for development/testing.
- Clean repository/service structure with repositories wrapping Supabase queries.

Repo root: this repository.  
Primary admin entry: `src/admin/AdminPage.tsx` (route `/admin`).

## 2) Tech stack & tools
- Runtime/build: Vite 7, TypeScript ~5.8, React 19, React Router 7.9, Tailwind CSS v4 (+ @tailwindcss/forms), PostCSS, Autoprefixer
- Backend services:
  - Supabase (Auth + Postgres + RLS)
  - Stripe – planned/in schema, not wired in UI
- Deployment: Vercel, SPA rewrites via `vercel.json`
- Linting: ESLint 9

See `package.json` for exact versions and scripts.

## 3) Environment configuration
Create `.env.local` at repo root (Vite style). **Do NOT commit secrets.**

Required:
- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon key

Optional:
- `VITE_OWNER_SLUG` – multi-tenant owner (defaults to `default`)
- `VITE_ADMIN_PASSWORD` – simple fallback password for admin gate when Supabase auth is not configured

Where used:
- Supabase client: `src/services/supabase.ts`
- Auth helpers: `src/services/supabaseClient.ts`
- Admin gate: `src/admin/AuthGate.tsx`
- Owner slug utils: `src/services/tierSettingsService.ts`

## 4) Install, run, build
| Action | Command |
|--------|---------|
| Install | `npm i` |
| Dev server | `npm run dev` → http://localhost:5173 |
| Prod build | `npm run build` |
| Preview build | `npm run preview` |

## 5) Data layer & schema
- Canonical SQL: `sql/ask-charlie-bot360ai-migrations.sql`
  - Idempotent; safe to run multiple times.
  - Creates/extends: users, profiles (role enum: user, pastor, admin, superadmin), characters (+insights fields & visibility), chats, messages, character_groups, character_group_mappings, tier_settings, roundtable_settings, bible_studies, bible_study_lessons, user_study_progress, ai_outlines, faqs, subscriptions (for Stripe), owners.
  - RLS policies included for each table with sensible admin/superadmin overrides.

Repositories (Supabase wrappers):
- `src/repositories/characterRepository.ts` – CRUD, search, bulk create, visibility toggle, safe image URLs.
- `src/repositories/groupRepository.ts` – Groups CRUD, character mapping CRUD, sorting, joins.
- `src/repositories/bibleStudiesRepository.ts` – Studies & lessons CRUD, progress, helpers.
- `src/repositories/roundtableSettingsRepository.ts` – Roundtable defaults/limits/locks get/upsert.

Services:
- `src/services/supabase.ts` – singleton client; hardened env handling; shared types.
- `src/services/supabaseClient.ts` – auth helpers (magic link sign-in, session management, code-exchange).
- `src/services/tierSettingsService.ts` – Tier settings (Supabase + localStorage fallback, per-org cache key).
- `src/services/faqs.ts` – FAQ list/upsert/delete/reorder.
- `src/services/openai.ts`, `src/services/rag.ts`, `src/services/store.ts` – scaffolding/placeholders for AI/kv.

## 6) Routing & app shell
- SPA routing: `src/App.tsx` (React Router). Routes: `/`, `/chat`, `/admin`, `/login`.
- Light vs Navy shell: App shell applies light, Bot360AI-style chrome to all `/admin` routes using `clsx` + location detection.
  - Source: `src/App.tsx` + `src/index.css` (`body.admin-surface, .admin-surface`).
- SPA rewrites (Vercel): `vercel.json` → fallback to `/`.

## 7) Auth
- Supabase magic link:
  - Sign-in: `src/admin/LoginPage.tsx` → `supabaseClient.signIn()` with `emailRedirectTo: /login`.
  - On return: `/login?code=<...>` → `exchangeCodeForSession(code)` → redirect `/admin`.
  - Session guard: `src/admin/AuthGate.tsx`; if Supabase configured & no session, redirects to `/login`.
- Fallback admin gate: If Supabase not configured, sessionStorage/password prompt (`VITE_ADMIN_PASSWORD`).

## 8) Admin UI (feature parity with Bot360AI)
Entry: `src/admin/AdminPage.tsx` (tabs)

| Tab | Key features | Data tables |
|-----|--------------|-------------|
| Assistants | CSV bulk upload; full create/edit form; list/search; visibility toggle | `characters` |
| Groups | Create/edit/delete groups; assign/unassign characters; reorder | `character_groups`, `character_group_mappings` |
| Featured Assistant | Select featured assistant (localStorage per org) | localStorage |
| User Favorites | Placeholder | — |
| FAQ Editor | CRUD; categories; order index; published toggle | `faqs` |
| Account Tiers | Free-tier limits; featured assistant UI | `tier_settings` |
| Roundtable | Defaults/limits/locks with validation | `roundtable_settings` |
| Content Studies | Studies & lessons CRUD; CSV import/export | `bible_studies`, `bible_study_lessons` |

Design system:
- Light “admin surface” theme with Tailwind blue-* palette & Inter font.
- Global styles/utilities in `src/index.css`; Tailwind config in `tailwind.config.js`.

## 9) User-facing features
- Hero/landing with debate CTA (`src/App.tsx` → `Hero`).
- Chat context & interface (`src/contexts/ChatContext`, `src/components/chat/ChatInterface`).
- Charlie Kirk persona sample in `src/data/personas`.

## 10) Deployment (Vercel)
- SPA rewrites in `vercel.json`.
- Preview deployments per branch; verify commit matches expected branch.
- Cache-bust with `?v=<timestamp>` if CSS appears stale.

## 11) Current status
Implemented:
- Supabase auth flow & fallback password gate
- Full Bot360AI admin modules (see Section 8)
- Supabase schema migration
- Tailwind v4 upgrade + forms plugin
- Light admin shell enforced on `/admin`

In progress / needs verification:
- Ensure Vercel deploy uses `fix/admin-surface-overrides` (light shell)
- Final design polish to pixel-match Bot360AI

Deferred:
- Stripe UI
- `/admin/superadmin` dashboard
- Multimedia (video/audio) debate features
- i18n scaffolding

## 12) Testing plan
Functional:
1. Auth: magic link flow & fallback password gate.
2. Admin shell: `/admin` light theme; non-admin routes navy.
3. CRUD flows for Characters, Groups, FAQ, Tier, Roundtable, Studies/Lessons.
4. CSV import/export (Characters & Studies/Lessons).
5. RLS sanity (admin vs anonymous).

Non-functional:
- Build passes (`npm run build`), no GoTrue duplicate warnings.
- Vercel deep links resolve via SPA rewrites.

## 13) Known issues & resolutions
- “Multiple GoTrueClient instances”: fixed via singleton Supabase client.
- Admin dark theme conflicts: solved by removing dark classes & adding `admin-surface` CSS + conditional shell.
- “No change” after deploy: ensure correct branch; use cache-bust query.

## 14) Future roadmap
- Pixel-perfect Bot360AI design polish.
- Multimedia (WebRTC) debates/lectures with recording.
- Multilingual UI & content.
- Stripe subscription UI & webhook plumbing.
- Superadmin org/user management dashboard.
- Full roundtable UX.
- Observability: Sentry, analytics, audit logs.
- Automated tests (unit + e2e).

## 15) File map (selected)
- App shell & routes: `src/App.tsx`
- Global styles & admin surface: `src/index.css`
- Auth Gate: `src/admin/AuthGate.tsx`
- Login: `src/admin/LoginPage.tsx`
- Admin root & tabs: `src/admin/AdminPage.tsx`
- Admin components: `src/components/admin/*`
- Repos: `src/repositories/*`
- Services: `src/services/*`
- SQL migrations: `sql/ask-charlie-bot360ai-migrations.sql`
- Vercel rewrites: `vercel.json`

## 16) External references
- Bot360AI (design parity): https://github.com/stroka22/bot360ai
- Vercel project: ask-charlie (check dashboard for exact URL)
- Supabase project: use values in `.env.local`

## 17) Handoff checklist for next session
- [ ] `.env.local` with real Supabase creds; magic-link login works.
- [ ] Run SQL migration; verify tables & RLS.
- [ ] `/admin` renders in light theme.
- [ ] CRUD test each admin tab.
- [ ] Deploy correct branch; verify preview commit.
- [ ] Capture UI diffs vs Bot360AI; plan polish tasks.
- [ ] Scope multimedia, i18n, Stripe, superadmin UI tasks.

*End of handoff.*

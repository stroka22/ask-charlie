# Design & UX Specification  
**Debate with Charlie**  
Web + Mobile ‑ Implementation Ready

---

## 1 · Vision & Design Principles
* Patriotic & Christian-spiritual tone ‑ faith, freedom, reasoned debate  
* Professional, modern, accessible; zero-clutter, high-contrast  
* “Iron sharpens iron” – encourage respectful argument & discovery  
* Mobile-first, performance-minded, keyboard-friendly

---

## 2 · Brand System

### 2.1 Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-navy` | `#0B1020` | App background |
| `--blue` | `#1E3A8A` | Primary surfaces / links |
| `--red` | `#B91C1C` | Primary CTA / user bubbles |
| `--gold` | `#D4AF37` | Accents / focus rings |
| `--white` | `#FFFFFF` | Text / highlights |
| `--gray-600` | `#4B5563` | Sub copy |

Gradients  
```css
.bg-stripe  {background-image:linear-gradient(90deg,#B91C1C,#FFFFFF,#1E3A8A);}
.bg-navy-grad{background:radial-gradient(ellipse at 50% 20%,#0B1020 0%,#0B1020CC 50%,#1E3A8A99 100%);}
```

Elevation  
| Level | Shadow |
|-------|--------|
| 1 | `0 1px 2px rgb(0 0 0 / .05)` |
| 2 | `0 2px 6px rgb(0 0 0 / .08)` |
| 3 | `0 4px 12px rgb(0 0 0 / .12)` (modal/panel) |

### 2.2 Typography
* **Manrope** – headings & CTA (400-800)  
* **Rubik** – body & UI (400-600)  
Scale (rem): `12,14,16(base),18,20,24,30,36,48`

### 2.3 Spacing & Radii
* 4-pt scale: `0.25,0.5,1,1.5,2,3,4rem`  
* Radii: `rounded` 4 px, `rounded-lg` 8 px, `rounded-full` (avatars/buttons)

---

## 3 · Component Library (Tailwind flavored)

| Component | Key Classes / Notes |
|-----------|---------------------|
| **Button** | `inline-flex items-center gap-2 font-semibold rounded-full px-5 py-2 transition` variants → `bg-red text-white`, `bg-blue`, `ghost` |
| **Input** | `w-full bg-navy-700/60 rounded px-3 py-2 border border-white/10 focus:ring-2` |
| **Select** | same as input + `appearance-none` caret |
| **SegmentedControl** | `inline-flex overflow-hidden rounded-lg border` child buttons with `aria-pressed` |
| **Tabs** | `flex gap-4 border-b` active underline |
| **Card** | `navy-panel p-4 rounded-xl shadow-[level2]` |
| **Panel** | glass overlay for sidebars / modals |
| **Table** | condensed rows, zebra navy/gray, responsive stack on `<sm>` |
| **Modal** | fixed inset-0 backdrop-blur-sm flex-center animate-scaleIn |
| **Toast** | bottom-center stacked, slide-in/out |
| **Tooltip** | small navy tooltip with arrow, delay 250 ms |
| **Badge** | pill, `bg-blue/20 text-blue` sizes sm/md |
| **Avatar** | `w-10 h-10 rounded-full object-cover bg-blue flex-center text-white` |
| **EmptyState** | icon + headline + subcopy + CTA |

---

## 4 · Layouts & Pages

### 4.1 Public
1. **Home**
   * Hero panel (navy glass)  
   * Headline: “Debate Charlie Kirk”  
   * Subcopy & CTA (“Start the Debate”)  
   * 3 feature cards  
2. **Chat**
   * Two-pane (`lg:grid-cols-[2fr_1fr]`)  
   * Left: message stream + input  
   * Right: **Sources / Outline** panel (sticky)  
   * Toggle SegmentedControl (Debate / Lecture)

### 4.2 Admin (Supabase Auth)
* **Sidebar**: Personas • FAQ • Studies • Tiers • Users • Analytics  
* Each tab uses Table + Modal CRUD flow  
* Users & Analytics are R/O for v1 (placeholder charts)

### 4.3 Auth
* Supabase Magic-Link; simple `/login` page → redirect

---

## 5 · Responsive & Adaptive
| Breakpoint | Width | Notes |
|------------|-------|-------|
| `sm` | 640 px | One-column, panel stacks below chat |
| `md` | 768 | 56 px header, tighter paddings |
| `lg` | 1024 | Two-pane chat; admin sidebar permanent |
| `xl` | 1280 | Center content max-width 1200 |

Hero images:  
```css
.img-hero { @apply img-constrained mx-auto max-h-[55vh] sm:max-h-[60vh]; }
```

---

## 6 · Image & Media Rules
* `img,video,canvas {max-width:100%; height:auto; object-fit:contain;}`  
* Additional wrapper `.aspect-video` for 16:9 clips  
* Feature/hero images: `max-height:55vh (sm 65vh)`  
* Avatars: fixed square 40 / 64 / 96 sizes  
* Use `object-cover` only for decorative background fills

---

## 7 · Accessibility
* Target **WCAG AA**  
* Color contrast ≥ 4.5:1 body; 3:1 large text  
* `:focus-visible` → 2 px `--gold` outline + offset  
* Full keyboard nav; skip-link to main; ARIA labels on toggles  
* Motion-safe: reduce-motion media query disables fancy transitions

---

## 8 · Motion & States
* 150-200 ms ease-out fades & slides  
* Chat bubble appear: fade-in + slight translate-y  
* Loading: skeleton bars; Error: Card with red icon & retry  
* Toasts auto-dismiss 4 s

---

## 9 · Information Architecture & Navigation
```
/               (Home)
/chat           (after selecting persona)
/admin
    /personas
    /faq
    /studies
    /tiers
    /users
    /analytics
/login          (auth gate)
```
Top nav: Home • Admin • Theme toggle (future)

---

## 10 · Key User Flows
1. **Start Debate** → Select persona (default Charlie) → `/chat`
2. **Send Message** → adds bubble → OpenAI proxy → assistant bubble (+“Next argument?” if Debate)
3. **Switch Mode** → toggle updates suffix logic
4. **View Sources** → rag snippets listed in side panel, click → open source link
5. **Admin CRUD**  
   * Table → “New” → Modal → validate → save (localStorage/Supabase)
6. **Auth** (Supabase)  
   * /login → email → magic link → return → session stored

---

## 11 · API & Integration Notes
* `/api/openai/chat` ‑ passes `mode`, `ragContext` → GPT-4o-mini  
* `/api/rag/search` ‑ Supabase `ilike` fallback; **future**: `match(vector)`  
* Side panel shows top-k snippets with `source_url`

---

## 12 · Performance Budgets
* Lighthouse ≥ 90 perf / 100 a11y / 90 best-practices  
* JS ≤ 300 kB gzip initial; CSS ≤ 15 kB gzip  
* Largest Contentful Paint ≤ 2.5 s on 3G

---

## 13 · Roll-out Plan & Milestones

| Phase | Branch | Deliverable |
|-------|--------|-------------|
| 1 | `design-system` | Color tokens, fonts, components |
| 2 | `feature/hero-chat` | Home hero & Chat two-pane |
| 3 | `feature/admin-v2` | Admin redesign + Supabase Auth |
| 4 | `qa-polish` | A11y, perf, copy pass |
| 5 | `main` merge & production deploy |

* Each phase: PR → Vercel Preview → review → squash-merge  
* Keep `docs/CHANGELOG.md` updated; tag v1.0 when complete

---

## 14 · Copy Snippets

*Hero*  
**Headline:** “Iron Sharpens Iron—Debate Charlie Kirk”  
_Subcopy_: “Challenge ideas, defend your worldview, or switch to lecture mode for guided insight on faith, freedom, and America.”  
**Primary CTA:** “Start the Debate”  
**Secondary CTA:** “Explore Admin”

*FAQ Examples*  
1. **What model powers Charlie?**  
   GPT-4o-mini via OpenAI, with a custom conservative persona prompt.  
2. **Is the debate unbiased?**  
   Charlie advocates conservative positions; you are encouraged to push back.  

---

_End of spec – ready for implementation._

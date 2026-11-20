# 2026-11-20 — v3: client feedback restructure

Branch: `feature/client-feedback-v3` (from `master` @ 5e5f050). Not merged,
not deployed. Spec: `docs/superpowers/specs/2026-11-20-client-feedback-v3-design.md`
· Plan: `docs/superpowers/plans/2026-11-20-client-feedback-v3.md`.

## Why

MASRA reviewed the live v2 "Seven Moods" site and asked for a clearer
agency structure plus faster scrolling (feedback received in Arabic; the
site stays English-only by decision).

## What changed

### Structure (home)
- **Fixed header**: About · Work · Services · Clients · Contact + a
  **Start your project** button → WhatsApp (prefilled). Mobile: menu
  button → full-screen panel (scroll-locked, Escape closes, links `inert`
  while closed). Active-section underline. Solid palette-aware background
  after the hero.
- **Hero**: unchanged except the "Seven moods" line is gone; eyebrow now
  "Visual production & photography — Riyadh, KSA".
- **About** (was the manifesto): the client's definition — "A visual
  production studio focused on the professional execution of photography
  — from concept to final delivery." Stats: **Brands 200+ · Since 2023 ·
  Riyadh, KSA** ("7 Color worlds" removed).
- **Work**: All / Artistic / Lifestyle / Menu tabs over 7 client cards.
  Artistic = PETI, La Bonté, Shaya · Lifestyle = Mamola, IDMI · Menu =
  Riyadh, Maqsoud (one `category` field per campaign).
- **Services**: six services, each with a one-line "what it includes".
  ⚠️ **Descriptions are DRAFTS** — the client asked to approve the final
  services list before it goes live.
- **Featured clients**: fixed 24-cell logo grid (6/4/3 columns, always
  full rows). Roster in `src/config/clients.config.ts` (how-to-update
  header; `npx pnpm test` enforces 24 + Work clients first). 4 real
  logos (IDMI, 1/2 M, Shawarma House, Musa & Palm); the rest show a text
  wordmark until logo files arrive. Logo sources:
  `assets/logos-staging/SOURCES.md` (local, git-ignored).
- **Contact**: "Let's work on your project." + big Start your project
  button + email (click-to-copy) + Instagram.
- **Removed**: Seven Moods index, the 7-chapter run, the "Production log"
  numbers section, curtains, FLIP, marquee.

### One page per client — `/work/<id>`
- New entry `work.html` + `src/work-main.ts`; one "standard" template
  (`src/pages/client/`): back link, category · year, name, tags,
  description → that client's existing bespoke gallery layout → Next
  project → contact. Client palette takes over the page.
- Templates are registry-driven (`campaign.template`) so new templates can
  be added later (client request).
- Routing: `public/_redirects` (`/work/* /work 200` — extensionless on purpose, see Review fixes) for Cloudflare;
  a Vite dev/preview middleware mirrors it. Unknown ids → friendly
  not-found block.

### Scrolling (feedback: "slow on mouse and phone")
- Root cause measured: v2's home page was ~25,000px tall, 20,511px of it
  pinned chapter scenes (3–5 viewports each) — on phones, dozens of flicks
  that only advanced an animation. Plus wheel smoothing at lerp 0.09
  (below Lenis' 0.1 default).
- Fix: chapters moved to client pages; pinned runways cut to 1.5–2.5
  viewports; Lenis lerp 0.09 → 0.15.
- Measured (1440×900): home **≈ 7,600px** (was ≈ 25,000px); client pages
  3,640–4,540px (Maqsoud's flowing essay 7,150px).

### Other
- Meta/OG copy, `public/llms.txt`: 200+ brands, no Seven Moods.
- Pure logic now tested with Node's built-in runner (no new deps):
  `npx pnpm test` → 22 tests (routing, category filter, client roster).
- Bundle: home ≈ 54 KB gz JS, client page ≈ 55 KB (v2: 56 KB).
- New tokens: header, buttons, logo wall, service type size.

## Verification
- `npx pnpm test` → 25/25 pass. `npx pnpm build` → passes (two entries +
  `_redirects` in `dist/`).
- Chrome via DevTools MCP (the Browser pane was hidden):
  - Desktop 1440×900: every home section; galleries PETI, IDMI (strip
    reaches its last frame), La Bonté, Mamola, Riyadh, Shaya (scrub reaches
    F 068/068).
  - Mobile 390×844: header, menu open/close, About, Work, Services,
    Clients, Contact, PETI intro and gallery, Maqsoud essay.
  - All nav jumps land at the header edge; tab filtering (7/3/2/2); every
    `/work/<id>`, `/work/nope`, `/work/PETI`, `/work/constructor`.
  - Production routing via Cloudflare's real handler (`wrangler pages dev
    dist`); reduced motion on home and on a client page; Back button with
    bfcache forced off; console clean.
- **Not verified:** how the wheel and touch scrolling *feel* on a real
  mouse or phone (Lenis lerp 0.15 is a judgement call; one-line change).

## Review fixes (fresh whole-branch review)
- **Critical — production routing:** `_redirects` targeted `/work.html`;
  Cloudflare normalises `.html` and answered every `/work/<id>` with a 308
  to `/work` → "Project not found". Target is now `/work`. Reproduced and
  verified with `wrangler pages dev dist` (Cloudflare's real handler):
  `/work/peti`, `/work/peti/`, `/work/nope`, `/work/PETI` → 200, no redirect.
- `/work/constructor` crashed the page (prototype key matched
  `id in campaignById`) → new tested `resolveClientId` (25 tests now).
- Mobile menu: `<main>` + skip link become `inert` while open; focus moves
  to the first link; rotating across the breakpoint no longer unlocks
  scroll under the preloader.
- Logo wall: hover no longer removes the monochrome filter (black "1/2 M"
  artwork vanished on the dark cell).
- `public/_headers`: `/images/clients/*` cached 1 day (not immutable) so
  logos can be replaced in place — verified via wrangler.
- Back button: if the browser reloads home instead of resuming it from
  bfcache, the saved scroll offset is restored and the preloader skipped
  (verified with bfcache forced off).
- Light client pages tint the mobile browser bar immediately.

## Open items for the client
1. Approve / edit the six service descriptions (drafts).
2. Send vector logos (SVG) — 20 of 24 cells are text placeholders; app
   icons found online are opaque squares and were not used.
3. Confirm the category mapping and the 24 featured clients (Qishtya,
   Shawrma Albalad, Ablaze are currently not shown).
4. Optional: new photography from the Drive folders (needs local
   download → `npx pnpm images`).

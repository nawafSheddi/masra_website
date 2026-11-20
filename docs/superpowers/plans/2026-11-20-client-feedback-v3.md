# MASRA v3 — Client Feedback Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the MASRA one-pager into a navigable agency site (header nav, About, Work by category, Services, Featured clients, Contact) with one page per client at `/work/<id>`, and make scrolling feel native.

**Architecture:** Two Vite entries share one boot module: `index.html` (home sections) and `work.html` (client-page template that mounts the existing chapter layout for one campaign). Cloudflare `_redirects` + a Vite dev/preview middleware rewrite `/work/*` → `/work.html`. All copy in `strings.ts`, all structure in config files, pure logic in small tested modules.

**Tech Stack:** Vite 7, vanilla TypeScript 5.9, motion 12, Lenis 1.3.25, Node 23 built-in test runner (`node --test`, native type stripping — no new dependencies).

**Spec:** `docs/superpowers/specs/2026-11-20-client-feedback-v3-design.md`

## Global Constraints

- English-only copy; Arabic only where it already exists as brand accent (wordmark, Maqsoud captions, Arabic client names).
- Every user-facing string lives in `src/config/strings.ts` (i18n rule) — including nav labels, CTA, aria labels, page titles.
- No raw hex / px font sizes / beziers in component CSS — tokens from `src/styles/tokens.css` only (add new tokens there).
- Arabic text animates by whole word (`revealWords`), never `revealChars`.
- Never put a clip-path on a palette-observed wrapper (`.chapter`, top-level `main > section`).
- Heavy comments on every function/module (user rule).
- Exact copy: About sentence **"A visual production studio focused on the professional execution of photography — from concept to final delivery."**; stats **"200+" / "Brands"**, **"2023" / "Since"** (rendered "Since 2023"), **"RUH" / "Riyadh, KSA"**; CTA **"Start your project"**; contact headline **"Let's work on your project."**; nav **About · Work · Services · Clients · Contact**; categories **Artistic · Lifestyle · Menu**; clients title **"Featured clients"**.
- Category mapping: artistic = peti, labonte, shaya · lifestyle = mamola, idmi · menu = riyadh, maqsoud.
- Featured clients roster = exactly 24 entries, the 7 work clients first.
- No `git commit` / push / deploy — the user approves commits at the end (global rule). "Checkpoint" steps below only run `git status` / `git diff --stat`.
- Use `npx pnpm`; never bare `npx tsc` (lesson 2026-11-20).

## Review Focus

1. Deep link / refresh on `/work/peti` (and `/work/peti/`) in **dev and `vite preview`** → client page renders, not the home page or a 404. (Task 9 middleware test + browser check.)
2. Unknown or uppercase id (`/work/nope`, `/work/PETI`) → friendly not-found block linking to `/#work`, no console error. (Task 1 tests + Task 9 browser check.)
3. Nav click to `#work` etc. lands with the section heading **below** the fixed header, both with Lenis and under reduced motion. (Task 3.)
4. Category tab with reduced motion / keyboard only → tabs are buttons with `aria-pressed`, filtering is instant, focus stays visible. (Task 5.)
5. A logo file missing or failing to load → the cell falls back to the text wordmark, grid stays 24 equal cells. (Task 7 `onerror` fallback.)

---

### Task 1: Test harness + pure routing/filter core

**Files:**
- Modify: `package.json` (add `"test": "node --test \"src/**/*.test.ts\""`), `tsconfig.json` (add `"exclude": ["src/**/*.test.ts"]` — test files use `node:` modules without @types/node)
- Create: `src/shared/routing/client-route.ts`, `src/shared/routing/client-route.test.ts`
- Create: `src/sections/work/filter.ts`, `src/sections/work/filter.test.ts`

**Interfaces:**
- Produces:
  - `parseClientRoute(pathname: string): string | null` — returns the id for `/work/<id>` or `/work/<id>/` where id matches `^[a-z0-9-]+$`; otherwise `null`.
  - `clientHref(id: string): string` → `"/work/" + id`.
  - `nextId(ids: readonly string[], current: string): string` — next id with wrap-around; returns `ids[0]` if `current` not found.
  - `type WorkCategory = "artistic" | "lifestyle" | "menu"`; `type WorkFilter = WorkCategory | "all"` (exported from `filter.ts`).
  - `filterByCategory<T extends { category: WorkCategory }>(items: readonly T[], filter: WorkFilter): T[]` — `"all"` returns a copy of all, order preserved.
- Modules are import-free except `import type` (Node strips types; relative imports in tests use the `.ts` extension).

- [ ] **Step 1: Write failing tests** (`node:test` + `node:assert/strict`):
  - `parseClientRoute("/work/peti") === "peti"`, `("/work/peti/") === "peti"`, `("/work/la-bonte") === "la-bonte"`, `("/work/PETI") === null`, `("/work/") === null`, `("/") === null`, `("/work/peti/extra") === null`.
  - `clientHref("idmi") === "/work/idmi"`.
  - `nextId(["a","b","c"], "c") === "a"`, `nextId(["a","b"], "a") === "b"`, `nextId(["a"], "zzz") === "a"`.
  - `filterByCategory(items, "all").length === items.length` and is a new array; `filterByCategory(items, "menu")` returns only menu items in original order.
- [ ] **Step 2:** `npx pnpm test` → FAIL (modules missing).
- [ ] **Step 3:** Implement the four functions + types.
- [ ] **Step 4:** `npx pnpm test` → all pass; `npx pnpm build` → passes.
- [ ] **Step 5: Checkpoint** `git status --short`.

### Task 2: Config + copy

**Files:**
- Modify: `src/config/campaigns.config.ts` — add `category: WorkCategory` and `template: ClientTemplate` (`export type ClientTemplate = "standard"`) to `Campaign`; set categories per Global Constraints, `template: "standard"` for all; shrink `sceneHeight`: peti 2, idmi 2, labonte 2, mamola 2, shaya 2.5, riyadh 1.5 (maqsoud unchanged — flows).
- Modify: `src/config/strings.ts`:
  - `meta.title` "MASRA Studio — Visual Production & Photography, Riyadh"; `meta.description` mentions 200+ brands, Artistic/Lifestyle/Menu, no "Seven moods"/"23+".
  - `nav`: `{ about, work, services, clients, contact, cta: "Start your project", menuOpen, menuClose, homeLabel }`.
  - `hero`: remove `moods`/`moodsAr`.
  - Rename `manifesto` → `about`: `{ eyebrow: "About MASRA", statement: <exact sentence>, stats: [ {value:"200+",label:"Brands"}, {value:"2023",label:"Since"}, {value:"RUH",label:"Riyadh, KSA"} ] }` (stat render order: label-first for "Since 2023" handled in Task 4 via an optional `prefix` flag: `{ value: "2023", label: "Since", labelFirst: true }`).
  - `work`: `{ eyebrow: "Our work", title: "WORK", tabs: { all: "All", artistic: "Artistic", lifestyle: "Lifestyle", menu: "Menu" }, categoryLabel: { artistic, lifestyle, menu }, tabsLabel, viewProject: "View project" }`.
  - `services.items` → array of `{ name, description }` (6, drafts) + a comment `/* DRAFT — pending client approval */`.
  - `clients`: `{ eyebrow: "Trusted by", title: "Featured clients", count: "200+", countLabel: "brands and counting" }` (names move to `clients.config.ts`).
  - `contact`: `title: "Let's work on your project."`, `cta: "Start your project"`, keep email/instagram link labels; remove `titleAccent` / whatsapp row.
  - `clientPage`: `{ back: "All work", next: "Next project", notFoundTitle, notFoundBody, notFoundLink, titleSuffix: " — MASRA Studio" }`.
  - Remove `indexNav`, `numbers`; drop `mood`/`moodAr` usage only (keep the fields if layouts read them — grep first; remove if unused).
- Modify: `src/config/site.config.ts` — `sectionOrder = ["hero","about","work","services","clients","contact"]`; `navItems: readonly { id: SectionAnchor; labelKey: keyof typeof strings.nav }[]` for about/work/services/clients/contact; `headerOffset` px value read by Lenis anchors (or a token read at runtime); remove `serviceThumbs` if Task 6 drops hover thumbs (keep — Task 6 keeps them).
- Modify: `index.html` raw `<title>`, description, og tags (200+, no Seven moods). Modify: `public/llms.txt`.

- [ ] **Step 1:** Edit configs/strings as above.
- [ ] **Step 2:** `npx pnpm build` → expected FAIL only in section modules that read removed keys (list them; they are rewritten in Tasks 3–10). Temporarily keep build green by doing Task 2 and Task 10's main.ts rewiring together if needed — the gate for Task 2 is `npx pnpm test` passing and the type errors confined to sections slated for change.
- [ ] **Step 3: Checkpoint** `git diff --stat`.

### Task 3: Header (nav + CTA + mobile menu)

**Files:** Create `src/sections/header/header.ts`, `src/sections/header/header.css`; Modify `src/styles/tokens.css` (`--header-h`, `--z-header: 80`), `src/shared/motion/smooth-scroll.ts`.

**Interfaces:**
- Produces: `initHeader(parent: HTMLElement, ctx: MotionContext, opts: { home: boolean }): void` — mounts `<header class="site-header">` **before `<main>`** (outside palette targets). On home, links are `#about` etc.; on client pages they are `/#about`. CTA `<a class="btn btn--cta">` → `links.whatsapp`, `target=_blank rel=noopener`.
- Produces: `scrollToHash(hash: string): void` in smooth-scroll.ts (Lenis `scrollTo(target, { offset: -headerHeight })`, native `scrollIntoView` + CSS `scroll-margin-top: var(--header-h)` fallback).
- Behavior: transparent over hero; gains `--chapter-bg` background + hairline after `scrollY > 40` (class toggle). Mobile (<768px): links collapse behind a `button[aria-expanded][aria-controls]` toggling a full-screen panel; CTA stays visible in the bar; Escape and link click close it; body scroll locked while open via `setScrollLocked`. Active link: IntersectionObserver on sections sets `aria-current="true"`.
- Lenis: in `initSmoothScroll` enable `anchors: { offset: -headerHeight }` OR handle clicks in header — pick one (header click handler calling `scrollToHash`, simpler to reason about), plus `history.replaceState` to keep the hash.

- [ ] **Step 1:** Implement; add `scroll-margin-top: var(--header-h)` on `main > section` in base.css.
- [ ] **Step 2:** `npx pnpm build` passes (if Task 2 left errors, after Task 10).
- [ ] **Step 3:** Browser: desktop + 375px screenshots of header over hero and after scroll; open/close mobile menu; click "Work" → `#work` heading visible below header.

### Task 4: Hero trim + About section

**Files:** Modify `src/sections/hero/hero.ts`, `hero.css` (remove moods line); rename `src/sections/manifesto/*` → `src/sections/about/about.ts|css` (`initAbout`, `section#about`), reading `strings.about`.

- Stats render `labelFirst` entries as label above value ("Since" / "2023").
- [ ] **Step 1:** Implement. **Step 2:** build. **Step 3:** browser screenshot of About desktop + mobile.

### Task 5: Work section (category tabs + client cards)

**Files:** Create `src/sections/work/work.ts`, `work.css`.

**Interfaces:**
- Consumes: `filterByCategory`, `WorkFilter` (Task 1), `clientHref` (Task 1), `campaigns` with `category` (Task 2), `buildPicture`.
- Produces: `initWork(root: HTMLElement, ctx: MotionContext): void` → `section#work`.
- Tabs: `div[role=group][aria-label=strings.work.tabsLabel]` of `<button aria-pressed>`; order All, Artistic, Lifestyle, Menu. Cards: `<a class="work-card" href=clientHref(id)>` with lead image (`buildPicture(campaign.images.lead, { sizes: "(min-width: 900px) 30vw, (min-width: 600px) 45vw, 100vw" })`), client name (`strings.chapters[id].name`), category label, year. Grid: 3 cols ≥900px, 2 cols ≥600px, 1 col below.
- Filtering: toggle `hidden` on non-matching cards; with motion, fade/scale-in the shown cards (`animate`, `durations.fast`); reduced motion: instant. Selected filter persisted in `location.hash`? No — keep state in memory only (YAGNI).
- [ ] **Step 1:** Implement. **Step 2:** build. **Step 3:** browser: click each tab → correct card counts (7 / 3 / 2 / 2) via `read_page`; card click → `/work/<id>`.

### Task 6: Services with descriptions

**Files:** Modify `src/sections/services/services.ts`, `services.css`.
- Each row: index, name, one-line description (dim ink, wraps on mobile). Keep desktop hover thumb. Reads `strings.services.items[i].name/description`.
- [ ] Implement → build → screenshot desktop + mobile.

### Task 7: Featured clients grid

**Files:** Create `src/config/clients.config.ts`, `src/config/clients.config.test.ts`; rewrite `src/sections/clients/clients.ts`, `clients.css`; create `public/images/clients/` (logos copied from `assets/logos-staging/` — high-confidence only, SVG preferred; raster resized to ≤ 400px wide WebP via a one-off sharp command); tokens `--logo-max-h`.

**Interfaces:**
- Produces: `export interface FeaturedClient { slug: string; name: string; logo?: string }` and `export const featuredClients: readonly FeaturedClient[]` (24 entries; first 7 slugs: peti, idmi, labonte, mamola, shaya, riyadh, maqsoud). `logo` is a path like `/images/clients/peti.svg`. Header comment: how to add/replace/reorder (user requirement "easy to replace and update").
- Section `section#clients`: eyebrow, title "Featured clients", "200+ brands and counting" line, `<ul class="logo-grid">` 6 / 4 / 3 columns (≥1024 / ≥640 / below), equal aspect cells, `img` `object-fit: contain; max-height: var(--logo-max-h)`, monochrome via CSS filter, full color on hover/focus. Missing `logo` or `img.onerror` → `<span class="logo-grid__wordmark">name</span>` (Arabic names get `lang=ar dir=rtl`).
- [ ] **Step 1: Failing test** in `clients.config.test.ts`: length === 24; slugs unique; first 7 slugs exactly as above; every `logo` (if set) starts with `/images/clients/`. (`clients.config.ts` must have no non-type imports.)
- [ ] **Step 2:** `npx pnpm test` → FAIL. **Step 3:** implement config (fill from logo agent's SOURCES.md: drop the 6 of the 23 names with no logo, else the last ones). **Step 4:** test passes.
- [ ] **Step 5:** Implement section + copy logos; build; screenshot desktop + mobile; rename one logo path in devtools to confirm wordmark fallback.

### Task 8: Contact

**Files:** Modify `src/sections/contact/contact.ts`, `contact.css`.
- Headline `strings.contact.title` revealed with `revealWords` (handles any future Arabic copy); big `<a class="btn btn--cta btn--xl">` "Start your project" → WhatsApp; email (keep click-to-copy) + Instagram links; footer unchanged. Shared `.btn` styles live in `src/styles/base.css` (used by header too).
- [ ] Implement → build → screenshot.

### Task 9: Client page template (`/work/<id>`)

**Files:**
- Create: `work.html` (copy of index.html head, generic meta, no hero preload; `<script type="module" src="/src/work-main.ts">`).
- Create: `src/work-main.ts`; `src/pages/client/client-page.ts`, `client-page.css`.
- Modify: `src/sections/chapters/chapters.ts` — extract `export function mountChapter(root: HTMLElement, ctx: MotionContext, campaign: Campaign): HTMLElement` (builds the article/stage/layout without the old mood shell; `initChapters` removed). Delete `chapter-shell.ts` mood title usage (keep `pad2` if used elsewhere). `curtain.ts` no longer used → delete.
- Modify: `vite.config.ts` — `build.rollupOptions.input = { main: "index.html", work: "work.html" }`; plugin `clientRouteRewrite()` with `configureServer` + `configurePreviewServer` middleware: if `parseClientRoute(url.pathname)` is non-null, set `req.url = "/work.html"`.
- Create: `public/_redirects` with `/work/* /work.html 200`.

**Interfaces:**
- Consumes: `parseClientRoute`, `nextId`, `clientHref` (Task 1); `campaignById`, `campaigns` (Task 2); `initHeader` (Task 3); `initContact` (Task 8); `boot()` (Task 10).
- Produces: `renderClientPage(main: HTMLElement, ctx: MotionContext, id: string | null): void` — template switch on `campaign.template` (`"standard"` only; a `Record<ClientTemplate, Builder>` so new templates = new entry). Standard: intro (back link → `/#work`, name, category label, tags, year, description), `mountChapter`, next-project link (`nextId` over campaign ids), contact section. Sets `document.title = name + strings.clientPage.titleSuffix` and meta description. Unknown id → not-found block.
- Palette: wire `initPaletteTakeover` with the chapter wrapper + base sentinels (same rule as home).
- [ ] **Step 1:** Implement. **Step 2:** build; confirm `dist/work.html` exists and `dist/_redirects` copied.
- [ ] **Step 3:** Browser (dev): `/work/peti`, `/work/shaya` (frame-sequence scrub), `/work/maqsoud`, `/work/peti/`, `/work/nope`, `/work/PETI` → screenshots/`read_page`; console clean. Then `npx pnpm preview` (via launch config) → refresh `/work/idmi` works.

### Task 10: Boot module, home wiring, scroll feel, cleanup

**Files:**
- Create: `src/shared/boot.ts` — `boot(): { ctx: MotionContext; main: HTMLElement }` (imports global styles + fonts, motion context, reduced-motion watch, smooth scroll, skip link, `<main id=main>`, header, cursor).
- Modify: `src/main.ts` — use `boot()`, mount sections per `sectionOrder` (`about, work, services, clients, contact` with hero first), palette sentinels (all base now), preloader.
- Modify: `src/shared/motion/smooth-scroll.ts` — `lerp: 0.15` (from 0.09; Lenis default is 0.1, higher = snappier), keep `wheelMultiplier: 1`, add comment with rationale + measured page heights. If wheel still feels laggy in testing, set `smoothWheel: false` and note it.
- Delete: `src/sections/index-nav/*`, `src/sections/numbers/*`, `src/shared/motion/flip.ts` if now unused (grep first), `marqueeDurations` etc. from motion.config if unused (tsc `noUnusedLocals` won't catch unused exports — grep).
- [ ] **Step 1:** Record baseline: home `document.documentElement.scrollHeight` on master build ≈ 25k px (already measured: chapters 20,511 px).
- [ ] **Step 2:** Implement. `npx pnpm test` + `npx pnpm build` pass.
- [ ] **Step 3:** Browser: measure new home scrollHeight (expect < 8k px at 1280×800); client page heights; console clean; reduced-motion emulation pass on home + one client page.

### Task 11: Verification, docs, changelog

- [ ] `npx pnpm test` and `npx pnpm build` output captured (bundle size vs v2's ≤56KB gz).
- [ ] Browser screenshots: every home section desktop (1280) + mobile (375); one client page desktop + mobile; mobile menu open; category tab "Menu".
- [ ] Update `README.md` (v3 structure, how to add a client / category / logo / template), `public/llms.txt`.
- [ ] `changelogs/2026-11-20-client-feedback-v3.md` (what + why, draft-services flag, logo sources pointer, measured scroll heights).
- [ ] `lessons-learned/` entry if anything bit us; update INDEX.md.
- [ ] Final whole-branch review (fresh reviewer), then propose commit message to the user — no commit without approval.

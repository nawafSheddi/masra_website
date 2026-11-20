# MASRA v3 — client feedback restructure (design)

Date: 2026-11-20 · Branch: `feature/client-feedback-v3` (from `master` @ 5e5f050)

## Intent and why

The client (MASRA) reviewed the live v2 "Seven Moods" site and asked for a
clearer agency structure: a real navigation, an About block with current
facts, work grouped by **type of photography** instead of by mood, a
services section that explains each service, a featured-clients logo wall,
a stronger contact call-to-action, and **scrolling that feels normal and
responsive** on mouse and phone. The work lands on a branch so the user can
review it before it replaces `master` / the live site.

The feedback arrived in Arabic, but **the site stays English-only** (user
decision). Arabic stays only where it already is a brand accent
(wordmark, Maqsoud captions, Arabic client names).

## Goals

1. Fixed header nav: **About · Work · Services · Clients · Contact** + a
   **"Start your project"** button that opens WhatsApp (prefilled).
2. Hero: keep the opening image + MASRA name; drop the "Seven moods" line.
3. About: the client's sentence verbatim (translated by the client's
   intent): *"A visual production studio focused on the professional
   execution of photography — from concept to final delivery."* Stats:
   **200+ brands**, **Since 2023**, Riyadh. "7 Color worlds" removed.
4. Work: three categories — **Artistic**, **Lifestyle**, **Menu** — as
   filter tabs (All / Artistic / Lifestyle / Menu) over a grid of client
   cards. Mapping (user-approved, one config line each):
   Artistic = PETI, La Bonté, Shaya · Lifestyle = Mamola, IDMI ·
   Menu = Riyadh, Maqsoud.
5. **One page per client** at `/work/<id>` so a single client can be shown
   on its own (shareable link). Built from **one template** now; the
   design must let new templates be added later (user decision).
6. Services: standalone section, six services from the company profile
   (Photography, Videography, Phone Photography, Food Styling, Art
   Direction, Graphic Design), each with a short "what it includes" line.
   Descriptions are **drafts pending client approval** (client asked to
   approve the final list first) — flagged in strings + changelog.
7. Featured clients: fixed, ordered logo grid with balanced sizing,
   clear on desktop and mobile. Logos sourced from the internet (user
   decision) into `assets/logos-staging/` with a SOURCES.md for review;
   any client without a verified logo renders a text wordmark fallback in
   the same cell size.
8. Contact: headline **"Let's work on your project."**, a clear
   **Start your project** WhatsApp button, email and Instagram.
9. Scroll: natural and responsive on mouse wheel and touch.

## Non-goals

- No Arabic locale / RTL, no language toggle.
- No photo re-curation from Drive in this round (photos stay; Drive used
  only as direction — it confirms the client's own split of each shoot into
  "Menu" packshots on white and "Social Media" lifestyle frames). A second
  pass can swap images once the folders are downloaded locally.
- No deploy, no commit, no push without explicit approval.

## Anti-goals (failure even if it "works")

- Scroll still feels laggy or the home page still contains long pinned
  scenes.
- Copy hardcoded in components (all copy → `strings.ts`; i18n rule).
- Hardcoded colors/sizes (tokens only).
- A logo grid with wildly uneven logo sizes.
- Breaking the existing a11y/perf baseline (Lighthouse a11y ≥ 95, CLS ≈ 0,
  reduced-motion support).

## Constraints (from the codebase)

- Vite 7 + vanilla TS, motion.dev, Lenis. Static, Cloudflare Pages
  (CLI upload; `public/_headers` already used).
- Config-driven: `strings.ts` (copy), `campaigns.config.ts` (roster),
  `site.config.ts` (links/order), `motion.config.ts` (motion numbers).
- Palette system: `body[data-chapter]` + IntersectionObserver on wrappers;
  never clip-path an observed wrapper (Chromium deadlock).
- Arabic text animates by whole word only (no glyph splitting).

## Root cause of the slow scroll (measured)

- Home page height is dominated by the chapter run: **20,511 px** of
  sticky scenes at 3–5 viewport heights each — on a phone that is
  dozens of flicks of "nothing moving but an animation".
- Lenis `lerp: 0.09` adds wheel latency (each wheel tick eases in over
  many frames). Touch is already native (Lenis does not smooth touch).

Fix: (a) chapters leave the home page entirely (they move to client
pages); (b) client-page scene heights shrink to ~1.5–2 viewports
(config); (c) Lenis wheel smoothing tightened toward native
(higher lerp ≈ 0.15–0.2 after checking current Lenis docs) — or disabled
if it still feels sluggish. Measure page height + feel before/after.

## Approaches considered (client pages)

- **A. One template page + rewrite (chosen).** `work.html` is a second
  Vite entry; it reads `<id>` from `/work/<id>`, renders the shared
  client-page template, and mounts that client's chapter layout as the
  gallery. Cloudflare `_redirects`: `/work/* /work.html 200`; a tiny Vite
  dev/preview middleware does the same locally. Trade-off: per-client
  `<title>`/description set by JS; link previews (WhatsApp) show the
  site-wide OG card.
- **B. Generated HTML per client.** Per-client meta in raw HTML, better
  link previews; needs a build plugin. Deferred — can be layered on top of
  A later without changing the template.
- **C. In-page expand / overlay.** No shareable URL, contradicts "show one
  client on its own". Rejected.

"Templates" (user wording) map onto the existing layout registry:
`campaign.layout` already selects a builder. v3 adds a `template` field
to each campaign (`"standard"` for all seven now) so a future bespoke page
template is one new module + one config value.

## Design

### Home page (`index.html`, order in `site.config.sectionOrder`)

```
[Header — fixed]  MASRA   About Work Services Clients Contact  [Start your project]
Hero              MASRA / STUDIO + PETI still (unchanged minus "Seven moods")
About   #about    eyebrow · client sentence · stats 200+ | Since 2023 | Riyadh
Work    #work     tabs All|Artistic|Lifestyle|Menu → card grid (lead image,
                  client name, category, year) → /work/<id>
Services #services 6 rows: name + one-line "includes" (draft)
Clients #clients  "Featured clients" fixed grid (logo or wordmark per cell)
Contact #contact  "Let's work on your project." [Start your project] email, IG
```

- Header lives **outside `<main>`** so it is not a palette target. It uses
  the base palette tokens; mobile collapses links into a menu button,
  keeping the CTA visible. Nav links smooth-scroll (Lenis `scrollTo`, with
  header offset) and set `aria-current` via an IntersectionObserver.
- The manifesto section becomes **About** (reuses its word-highlight
  statement mechanic with the new sentence; stats row updated).
- Removed from home: index-nav (Seven Moods table), chapters run, numbers
  "Production log" section. Their modules remain only where reused.
- Category tabs: `aria-pressed` buttons; filtering hides cards with a short
  FLIP/opacity transition (reduced motion: instant). Category membership
  comes from a `category` field on each campaign.

### Client page (`work.html` → `/work/<id>`)

- Same header. Template "standard": intro block (back link "All work",
  client name, category, tags, year, description from strings), then the
  client's existing chapter layout mounted via the registry, then
  "Next project" link + the contact block. Palette takeover still works
  per page (one chapter).
- Unknown id → friendly not-found block linking back to `/#work`.
- `document.title` + meta description updated per client from strings.

### Featured clients

- Roster (user decision): **exactly 24 cells** — the 7 Work clients first
  (PETI, IDMI, La Bonté, Mamola, Shaya, Riyadh, Maqsoud), then 17 from
  the existing 23-name list. (3 of those 23 — La Bonté, Mamola, IDMI — are
  already Work clients, so 20 remain and 3 are dropped: those with no logo
  found, else from the end of the list.) 24 fills
  every row evenly at 6/4/3 columns.
- **Easy to replace/update (user requirement):** the roster is one array
  in `clients.config.ts`; swapping a logo = drop a file in
  `public/images/clients/<slug>.<svg|png|webp>` and set `logo` on that
  line; reordering = moving lines; a header comment documents the steps
  and the recommended file format/size.
- Logo review (builder call): high-confidence logos from the online
  search are wired in on this branch — the branch itself is the user's
  review checkpoint, with `assets/logos-staging/SOURCES.md` listing the
  source of each. Unverified/missing → text wordmark fallback.
- Data: `clients.config.ts` (new) — ordered list `{ name, logo? }`;
  `logo` is a path under `public/images/clients/`. Grid:
  CSS grid, 6 cols desktop / 4 tablet / 3 mobile, every cell same aspect
  box; logos `object-fit: contain` within a fixed max-height token so
  visual weight is balanced; monochrome treatment (CSS filter to the
  foreground token) so mixed-color logos read as one wall, color on hover.
- Count "200+" is a string, decoupled from list length.

### Copy changes (all in `strings.ts`)

meta title/description (also `index.html` raw meta + OG) → drop "Seven
moods"/"23+", use 200+; nav labels; CTA "Start your project"; about
sentence + stats; work tabs; services descriptions (draft); clients title
"Featured clients"; contact headline. Also update `public/llms.txt` and
README.

### Scroll

As in "Root cause". Plus: no velocity-driven marquees remain on home.

## Verification

- `npx pnpm build` passes (tsc + vite).
- Browser pane: desktop + mobile screenshots of every home section, a
  client page, the category filter, the mobile menu, a `/work/unknown`.
- Measure home `document.body.scrollHeight` before (≈25k px) and after.
- Console clean; reduced-motion pass.

## Left to the builder

Exact service description wording (draft, flagged), tab transition
details, header scroll-hide behavior (keep simple: always visible, gains
a background after the hero), card hover treatment, final Lenis lerp
value after testing.

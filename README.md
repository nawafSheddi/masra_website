# MASRA Studio — Portfolio Site (v3)

Dark cinematic site for [MASRA Studio](https://masra.sa), a Riyadh visual
production studio. Home: About · Work (Artistic / Lifestyle / Menu) ·
Services · Featured clients · Contact, with a fixed header and a "Start
your project" WhatsApp CTA. Every client also has its own page at
`/work/<id>`, where that campaign's bespoke layout and color world play
out. Static site built with Vite + vanilla TypeScript, animated with
[motion.dev](https://motion.dev), smooth scrolling by
[Lenis](https://lenis.darkroom.engineering/). No frameworks, no WebGL.

## Commands

```bash
npx pnpm install       # install dependencies
npx pnpm dev           # dev server at http://localhost:5173
npx pnpm test          # unit tests (node --test; routing, filter, client roster)
npx pnpm build         # typecheck + production build → dist/
npx pnpm preview       # serve the production build locally
npx pnpm images        # regenerate optimized images from assets/ (needs the raw photo folders)
npx pnpm videos        # regenerate loops + frame sequence from assets/ (needs ffmpeg)
```

## Project layout

```
assets/                raw photography (~5 GB, gitignored — sources for the pipelines)
brand_assets/          official brand kit: logos, Ambit fonts, guidelines (gitignored sources)
scripts/
├─ optimize-images.mjs   sharp pipeline → public/images + src/generated/image-manifest.json
└─ optimize-videos.mjs   ffmpeg pipeline → public/video + seq frames + video-manifest.json
public/images/         optimized AVIF/WebP derivatives + the Shaya scrub frame sequence
public/video/          stop-motion loops (AV1/WebM + H.264) with AVIF/WebP posters
public/fonts/          Ambit + TheYearofHandicrafts woff2
index.html · work.html  two Vite entries: home, and the /work/<id> client-page template
src/
├─ main.ts · work-main.ts   entry scripts (both start with shared/boot.ts)
├─ config/             strings.ts (ALL copy + alt text) · campaigns.config.ts (client roster:
│                      category, template, layout, images) · clients.config.ts (24-logo wall)
│                      site.config.ts (links, section order, nav) · motion.config.ts
├─ styles/             tokens.css (design tokens) · chapters.css (per-client palettes)
│                      base.css (buttons, palette cross-fade) · fonts.css
├─ shared/boot.ts      shared shell: styles, Lenis, skip link, header, <main>, cursor
├─ shared/routing/     client-route.ts — the tested /work/<id> rules
├─ shared/motion/      motion-context · Lenis wrapper · reveals · splitter · palette takeover
├─ shared/ui/          picture builder · video loop builder · cursor · magnetic
├─ shared/media/       frame-sequence.ts (scroll-scrubbed stop-motion canvas)
├─ pages/client/       client-page template registry ("standard")
└─ sections/           header · preloader · hero · about · work (tabs + cards) · services
                       · clients (logo grid) · contact · chapters (7 bespoke gallery layouts)
```

### Everyday edits

- **Copy:** `src/config/strings.ts` only.
- **Move a client to another category:** change `category` in
  `campaigns.config.ts` (`artistic` | `lifestyle` | `menu`).
- **Logos:** drop `public/images/clients/<slug>.svg` and set `logo` on that
  line in `clients.config.ts` (instructions at the top of the file). Keep 24
  entries — `npx pnpm test` checks it.
- **Add a client page template:** add a member to `ClientTemplate` in
  `campaigns.config.ts` and a builder to `TEMPLATES` in
  `src/pages/client/client-page.ts`.

### Client pages (`/work/<id>`)

- `public/_redirects` rewrites `/work/*` to `work.html` on Cloudflare; a
  Vite middleware (vite.config.ts) does the same in dev/preview.
  `work-main.ts` validates the id; unknown ids get a not-found block.

### How the palette system works

- `campaigns.config.ts` is the single roster; sections map over it.
- `styles/chapters.css` holds every campaign color as `:root
  --palette-<id>-*` tokens and maps them onto the live `--chapter-*` roles
  via `body[data-chapter]`.
- `shared/motion/palette.ts` watches each chapter wrapper at the viewport
  centerline (one IntersectionObserver, `-50%` root margins) and flips the
  body attribute; `base.css` cross-fades the consuming properties.
  **Never put a clip-path on an observed wrapper** — Chromium counts an
  element's own clip-path in its intersection area and the takeover
  deadlocks (clips belong on inner children; see `reveals.ts`).
- Arabic display type animates by whole word only (`revealWords`) —
  connected script must never be glyph-split.
- Reduced motion: palettes snap, loops become posters, the film-strip
  becomes a native swipe, everything stays readable.

Every section builds its DOM from the config files — no copy or image
assignments live inside section code.

## Deploying to Cloudflare Pages

- Build command: `npx pnpm build`
- Output directory: `dist`
- No environment variables or functions needed. `public/_headers` sets
  immutable caching for images, video, fonts and hashed assets;
  `public/_redirects` serves the client-page template for `/work/*`.

## Swapping imagery / video

Images: edit the curation list at the top of `scripts/optimize-images.mjs`
(one line per photo: source file → slug + role), run `npx pnpm images`, add
alt text in `src/config/strings.ts` (the `ImageSlug` type enforces it), and
reference the slug from `campaigns.config.ts`. Video: edit `LOOPS` /
`SEQUENCE` in `scripts/optimize-videos.mjs` and run `npx pnpm videos`.

## Docs

- `docs/inspiration-research.md` — every site reviewed for v1 + v2, the
  techniques taken from each, and the two rejected design concepts.
- `changelogs/` — one entry per work session, including measured
  performance numbers for this redesign.

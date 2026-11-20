# MASRA Studio — Portfolio Site (v2 "Seven Moods")

Dark cinematic one-pager for [MASRA Studio](https://masra.sa), a Riyadh food
& product photography studio. Seven brand campaigns, each a bilingual
(AR/EN) mood-world that takes over the entire site palette as you scroll.
Static site built with Vite + vanilla TypeScript, animated with
[motion.dev](https://motion.dev), smooth scrolling by
[Lenis](https://lenis.darkroom.engineering/). No frameworks, no WebGL.

## Commands

```bash
npx pnpm install       # install dependencies
npx pnpm dev           # dev server at http://localhost:5173
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
src/
├─ config/             strings.ts (ALL copy + alt text) · campaigns.config.ts (the Campaign[] roster)
│                      site.config.ts (links, section order) · motion.config.ts (motion vocabulary)
├─ styles/             tokens.css (design tokens) · chapters.css (the 7 campaign palettes)
│                      base.css (incl. the palette cross-fade) · fonts.css
├─ shared/motion/      motion-context · Lenis wrapper · reveals · splitter · palette takeover · FLIP
├─ shared/ui/          picture builder · video loop builder · cursor · magnetic
├─ shared/media/       frame-sequence.ts (scroll-scrubbed stop-motion canvas)
└─ sections/           preloader · hero · manifesto · index-nav (Overview⇄Index) · chapters
                       (orchestrator + 7 layout builders + curtains) · numbers · services
                       · clients · contact
```

### How the "Seven Moods" system works

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
  becomes a native swipe, curtains/tickers disappear, everything stays
  readable.

Every section builds its DOM from the config files — no copy or image
assignments live inside section code.

## Deploying to Cloudflare Pages

- Build command: `npx pnpm build`
- Output directory: `dist`
- No environment variables or functions needed. `public/_headers` sets
  immutable caching for images, video, fonts and hashed assets.

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

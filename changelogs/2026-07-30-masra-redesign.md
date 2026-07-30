# 2026-07-30 — MASRA Studio site redesign (initial build)

## What changed

Built the complete MASRA Studio one-page portfolio site from scratch,
replacing the current Squarespace template at masra.sa with a dark cinematic
editorial design driven by motion.dev.

### Foundation
- Vite + vanilla TypeScript scaffold; static output for Cloudflare Pages
  (build `npx pnpm build`, output `dist/`, cache policy in `public/_headers`).
- Design-token system (`src/styles/tokens.css`) built from the official MASRA
  brand guidelines: vermilion #F9512C, mint #66EDA6, brand gray, darkroom
  near-black canvas. Ambit (the studio's licensed typeface) self-hosted as
  woff2 for all display/body text; Space Mono for camera-metadata labels.
- All copy lives in `src/config/strings.ts` (i18n-ready); links, section
  order and image-role assignments in `src/config/site.config.ts`; shared
  springs/eases/staggers in `src/config/motion.config.ts`.

### Image pipeline
- `scripts/optimize-images.mjs` (sharp): 17 curated photographs from the
  1 GB `assets/` originals → AVIF + WebP at 480/960/1600(/2400) widths with
  inline blur placeholders and a generated manifest — 5.4 MB total output.
- Official calligraphic wordmark extracted from the brand kit (trimmed,
  orange + generated white variants).

### Sections & choreography (motion.dev)
- Preloader: 000→100 counter, wordmark clip reveal, curtain wipe gated on
  the hero image decode (3 s hard timeout).
- Hero: character spring-stagger type at ~16vw, PETI film-still z-sandwiched
  between the type lines, scroll-out "camera settle" parallax.
- Manifesto: scroll-scrubbed word-by-word highlight plus stat row.
- Work: three distinct case layouts — PETI (parallax lead + offset grid),
  IDMI (300vh sticky horizontal film-strip), LEVO (200vh pinned slow zoom
  with title-plate crossfade + 3-up grid).
- Services: six index rows with staggered reveal and a spring-following
  hover thumbnail per discipline (desktop only).
- Clients: all 23 brands in three infinite marquees (middle row reversed,
  vermilion outline), speed reactive to scroll velocity, mint count-up.
- Contact: magnetic oversized links (WhatsApp deep link with prefilled
  message, mailto, Instagram) and the wordmark rising off the page edge.
- Full `prefers-reduced-motion` support: static fully-visible layout, no
  pins/marquees/cursor; Lenis smooth scroll only in the motion path.

## Notable bugs found and fixed during verification
- `clip-path` on the default-inline `<picture>` element resolves against a
  degenerate inline box and hides the image entirely → all generated
  pictures now render as blocks (`.pic { display: block }`).
- Chromium factors an element's own clip-path into IntersectionObserver
  areas, which deadlocked clip-reveals AND blocked native lazy-loading →
  reveals observe the unclipped tile and images flip to eager on approach.
- Character/word splitters used `aria-label` on generic spans (prohibited
  ARIA) → replaced with visually-hidden `.sr-only` text copies.

## Why
The existing site undersold world-class photography. This build makes the
studio's own imagery the star with awwwards-level motion, uses the genuine
brand identity (logo art, Ambit type, exact palette), and ships as a fast
static site: Lighthouse a11y 95 / best-practices 100 / SEO 100, LCP 532 ms,
CLS 0.00, 41 kB gzipped JS.

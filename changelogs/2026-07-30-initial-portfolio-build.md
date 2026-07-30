# 2026-07-30 — Initial MASRA Studio portfolio build

Initial commit of the masra.sa redesign: a static, dark cinematic editorial
one-pager built with Vite + TypeScript and motion.dev.

## Added

### Project scaffold
- Vite 7 + TypeScript project (`vite.config.ts`, `tsconfig.json`, `package.json`)
  with a pnpm workspace (`pnpm-workspace.yaml`).
- `build` script runs `tsc --noEmit` before `vite build`, so type errors fail the
  build rather than shipping silently.

### Design system
- `src/styles/tokens.css` — design tokens derived from the MASRA brand
  guidelines: vermilion `#F9512C`, mint `#66EDA6`, type scale, spacing, easing.
- `src/styles/fonts.css` — Ambit served as WOFF2, converted from the brand OTFs.
- `src/styles/base.css` — reset and global element styling.

### Motion system (`src/shared/motion/`)
- `smooth-scroll.ts` — Lenis-driven smooth scrolling.
- `split.ts` — text splitting for per-line/per-character reveals.
- `reveals.ts` — scroll-triggered reveal primitives.
- `motion-context.ts` — shared motion configuration and reduced-motion handling.
- `src/shared/ui/` — custom cursor, magnetic hover, and responsive `<picture>` helper.

### Sections (`src/sections/`)
Vertical slices, each owning its own `.ts` + `.css`: preloader, hero, manifesto,
work (with `case-header`, `case-peti`, `case-idmi`, `case-levo`), services,
clients, contact.

### Content and configuration
- `src/config/site.config.ts`, `src/config/motion.config.ts` — central config.
- `src/config/strings.ts` — all user-facing copy in a single source of truth,
  ready for additional locales.

### Image pipeline
- `scripts/optimize-images.mjs` — sharp-based pipeline that reads the 1 GB raw
  originals from `assets/` (gitignored) and emits AVIF + WebP derivatives at
  480/960/1600/2400 widths into `public/images`, plus a manifest at
  `src/generated/image-manifest.json`. Output is 5.5 MB total.

### Brand source material
- `brand_assets/` — brand guidelines, stylescape, company profile, moodboard and
  post templates, logos, and original font files, committed as the reference
  source of truth.

## Fixed
- Hero z-index stacking bug: the scroll-parallax `transform` on the hero wrapper
  created a stacking context that trapped its children. `hero.ts` now animates
  each line individually instead of the wrapper.
- Images clipped away entirely by reveal animations: `<picture>` is
  `display: inline` by default, so `clip-path` resolved against its near-zero
  line box rather than the image. `.pic { display: block }` in `base.css` gives
  the clip a real box to work with.

## Notes
- `.gitignore` covers `node_modules/`, `dist/`, the raw `assets/` originals,
  `.DS_Store`, and `.env*`.
- `brand_assets/` adds ~142 MB of binary design sources to history. This was a
  deliberate choice to keep the originals versioned alongside the site; shrinking
  the repo later would require rewriting history.

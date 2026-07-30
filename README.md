# MASRA Studio — Portfolio Site

Dark cinematic editorial one-pager for [MASRA Studio](https://masra.sa),
a Riyadh food & product photography studio. Static site built with Vite +
vanilla TypeScript, animated with [motion.dev](https://motion.dev), smooth
scrolling by [Lenis](https://lenis.darkroom.engineering/).

## Commands

```bash
npx pnpm install       # install dependencies
npx pnpm dev           # dev server at http://localhost:5173
npx pnpm build         # typecheck + production build → dist/
npx pnpm preview       # serve the production build locally
npx pnpm images        # regenerate optimized images from assets/ (needs the raw photo folders)
```

## Project layout

```
assets/                raw photography (1 GB, gitignored — sources for the pipeline)
brand_assets/          official brand kit: logos, Ambit fonts, guidelines (gitignored sources)
scripts/optimize-images.mjs   sharp pipeline → public/images + src/generated/image-manifest.json
public/images/         optimized AVIF/WebP derivatives (committed, ~5.4 MB)
public/fonts/          Ambit woff2 (converted from the brand kit OTFs)
src/
├─ config/             strings.ts (ALL copy) · site.config.ts (links, image roles) · motion.config.ts
├─ styles/             tokens.css (design tokens) · base.css · fonts.css
├─ shared/motion/      motion-context, Lenis wrapper, reveal utilities, text splitter
├─ shared/ui/          picture builder, custom cursor, magnetic hover
└─ sections/           preloader · hero · manifesto · work (3 cases) · services · clients · contact
```

Every section builds its DOM from the config files — no copy or image
assignments live inside section code. Reduced-motion users get the complete
static layout with zero animation.

## Deploying to Cloudflare Pages

- Build command: `npx pnpm build`
- Output directory: `dist`
- No environment variables or functions needed. `public/_headers` sets
  immutable caching for images, fonts and hashed assets.

## Swapping imagery

Edit the curation list at the top of `scripts/optimize-images.mjs` (one line
per photo: source file → slug + role), run `npx pnpm images`, and update the
slug assignments in `src/config/site.config.ts` if slots changed. Alt text
lives in `src/config/strings.ts`.

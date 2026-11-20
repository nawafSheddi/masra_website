# MASRA Studio website

The website for [MASRA Studio](https://masra.sa), a visual production and
photography studio in Riyadh.

## For the owner: how to change the site

You don't need to code. Open this folder in **Claude Code** (or Codex) and
ask in plain words, for example:

- "Change the About text to: …"
- "Replace the third photo on the Mamola page with this one" (attach it or
  point to the Drive file)
- "Add a new client called … in the Lifestyle category"
- "Put the new IDMI logo on the clients wall" (attach the SVG)
- "Update the WhatsApp number to …"

The assistant knows where everything lives (the rules are in `AGENTS.md`),
shows you a preview screenshot, and asks before saving (committing) the
change. Once it's saved and pushed to GitHub, the live site updates
(see *Deploying to Cloudflare* below).

Good habits:
- One change per request is easiest to check.
- Always look at the screenshot it shows you before saying yes.
- Original photos stay in Google Drive; only the web-optimized copies are
  stored here.

---

## For developers and AI agents

Dark cinematic site: Home has About · Work (Artistic / Lifestyle / Menu) ·
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
npx pnpm images        # optimize photos listed in scripts/optimize-images.mjs (keeps ones whose raw file isn't here)
npx pnpm videos        # regenerate loops + frame sequence from assets/ (needs ffmpeg)
```

## Project layout

```
assets/                raw photos you download from Drive to process (gitignored, never committed)
brand_assets/          official brand kit: guidelines, logo masters, fonts (tracked)
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

## Deploying to Cloudflare

**Moving the site to the studio's own Cloudflare account** (one time):

1. Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* →
   *Connect to Git* → pick this GitHub repo.
2. Production branch `master`, build command `npx pnpm build`, output
   directory `dist`. Save and deploy.
3. *Custom domains* → add `masra.sa` (the domain must be in the same
   Cloudflare account).

From then on, every push to `master` publishes the site automatically
(about a minute), and every other branch gets its own preview URL.

Settings reference:

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

- `AGENTS.md`: rules and step-by-step recipes for AI agents (`CLAUDE.md`
  imports it).
- `lessons-learned/`: traps already hit once, and how to avoid them.
- `changelogs/`: one entry per work session (what changed and why).

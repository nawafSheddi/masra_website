# AGENTS.md — how to work on the MASRA website

This file is for AI coding agents (Claude Code, Codex, and others). `CLAUDE.md`
imports it, so both read the same rules.

## Who you are working for

The owner of this repo runs **MASRA Studio**, a photography studio in Riyadh.
**He does not write code.** He will ask in plain words ("change the services
text", "add these photos to Mamola", "add a new client"). Your job:

1. Make the change in the right file (see the map below). Never hardcode
   copy, colors, or image paths inside section code.
2. Run `npx pnpm test` and `npx pnpm build`. Both must pass.
3. **Preview it and look at it.** Start the dev server (`npx pnpm dev`, or the
   `masra-dev` entry in `.claude/launch.json`), open the page you changed,
   take a screenshot, and check it on desktop **and** mobile width (390px).
4. Tell him what changed in plain, non-technical words, with the screenshot.
   Say clearly if anything is unfinished or unverified.
5. Ask before committing. Write a short, plain commit message. Never
   force-push. Never rewrite history.

If a request is ambiguous ("make it nicer"), ask one short question with
2–3 concrete options. Don't guess on content: names, prices, claims, and
client lists must come from him.

## Commands

```bash
npx pnpm install --frozen-lockfile  # first time on a machine
npx pnpm dev                        # live preview → http://localhost:5173
npx pnpm test                       # unit tests (routing, filters, logo roster)
npx pnpm build                      # typecheck + production build → dist/
npx pnpm preview                    # serve the production build → http://localhost:4173
```

`pnpm` is not installed globally; always use `npx pnpm`. Never run a bare
`npx <tool>` for a tool that is not in `node_modules` (it can download an
unrelated package; see `lessons-learned/`).

## Where everything lives (the content map)

| He wants to change… | Edit this | Notes |
|---|---|---|
| Any text on the site (headlines, about, services, contact, button labels, SEO title/description, image alt text) | `src/config/strings.ts` | **All** visible text lives here. English only. |
| WhatsApp number, email, Instagram link | `src/config/site.config.ts` (`links`) | The WhatsApp prefill message is in `strings.ts → contact`. |
| Menu order / which links show | `src/config/site.config.ts` (`navItems`) | |
| A client's category (Artistic / Lifestyle / Menu), year, which photos show | `src/config/campaigns.config.ts` | One entry per client. Order = order on the Work grid. |
| A client's name, tagline, description, tags | `src/config/strings.ts → chapters.<id>` | |
| A client's colors | `src/styles/chapters.css` (`--palette-<id>-*`) | Colors are only ever defined there or in `src/styles/tokens.css`. |
| Featured-clients logo wall (24 cells) | `src/config/clients.config.ts` + logo file in `public/images/clients/` | Must stay exactly 24 entries (the test checks it). |
| Global colors, spacing, type sizes | `src/styles/tokens.css` | Design tokens; never hardcode a hex or px value in a component. |
| Animation timings | `src/config/motion.config.ts` | |

Section code lives in `src/sections/<name>/` and builds the page from the
config files above. You rarely need to touch it for content changes.

## Recipes

### Change text
Edit the string in `src/config/strings.ts`. Keep the tone: short, confident,
studio voice. Then preview.

### Swap or add a photo for an existing client
The site uses pre-optimized images in `public/images/<client>/` (AVIF + WebP
at several widths) described by `src/generated/image-manifest.json`. Raw
photos are **not** in this repo; the owner keeps them in Google Drive.

1. Get the photo from him (or from the Drive folder he points you to) and
   put it in `assets/<client>/` (this folder is git-ignored, never commit it).
2. Add one line to the `CURATED` list in `scripts/optimize-images.mjs`:
   `{ src: "<client>/<file>.jpg", shoot: "<client>", slug: "<client>-frame-7", role: "grid" }`
   (`role: "feature"` for big, full-width images).
3. Run `npx pnpm images`. Images whose raw file isn't on this machine are
   kept as they are ("kept (raw source not on this machine)"); only the new
   one is processed. Check the git diff: the manifest should only gain lines.
4. Add alt text for the new slug in `strings.ts → imageAlt`.
5. Reference the slug in that client's `images.frames` in
   `campaigns.config.ts`.
6. Commit the new files in `public/images/<client>/` and the manifest.

Layout minimums: the PETI (theatrical) and Shaya (scrub) layouts need at
least 3 frames.

### Add a logo to the logo wall
Follow the box at the top of `src/config/clients.config.ts`. Prefer SVG.

### Add a brand-new client
This touches several files today: `campaigns.config.ts` (new entry +
layout), `strings.ts` (`chapters.<id>` copy + alt text), `chapters.css`
(palette block), photos (recipe above), and `clients.config.ts`. Ask the
owner which existing client's look (layout) the new one should follow.

## Hosting

Static site. Build command `npx pnpm build`, output folder `dist/`.
Cloudflare Pages reads `public/_headers` (caching) and `public/_redirects`
(serves the client-page template for `/work/<id>`; the target must stay
`/work`, not `/work.html`).

## Never do

- Never commit `assets/`, `.env`, `.wrangler/`, or anything with a password,
  token or API key.
- Never force-push, rewrite history, or delete branches.
- Never put a CSS `clip-path` on an element the palette observer watches
  (see `README.md → palette system`); it silently breaks color changes.
- Never letter-split Arabic text in animations (whole words only).
- Never say "done" without a build that passes and a screenshot you looked at.

## Background reading (only when relevant)

- `README.md`: architecture, palette system, deploy details.
- `lessons-learned/INDEX.md`: traps already hit once (Lenis scrolling,
  npx). Read the index at the start of a session.
- `changelogs/`: what changed and why, per work session. Add an entry
  `changelogs/YYYY-MM-DD-<short-name>.md` for every set of changes.

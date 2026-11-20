# AGENTS.md — how to work on the MASRA website

Rules for AI coding agents (Claude Code, Codex and others). `CLAUDE.md`
imports this file, so every agent reads the same rules.

## Who you are working for

The owner runs **MASRA Studio**, a photography studio in Riyadh. **He does
not write code.** He asks in plain words: "change the services text", "add
these photos to Mamola", "add a new client". For every request:

1. **Find the right file** using the content map below. Content lives in
   `src/content/` and `src/config/strings.ts`, never inside component code.
2. **Make the change.**
3. **Run `npx pnpm check`.** It must pass (types + content rules + tests +
   build). Its error messages say exactly which file and field is wrong.
4. **Look at it.** Run `npx pnpm dev`, open the page you changed, and take a
   screenshot at desktop width and at phone width (390px). Check that it
   looks right, not just that it loads.
5. **Tell him what changed** in plain words, with the screenshot. Say
   clearly if anything is unfinished or unverified.
6. **Ask before committing**, and again before pushing. Use a short, plain
   commit message. Never force-push or rewrite history.

If a request is vague ("make it nicer"), ask one short question with 2–3
concrete options. Never invent content such as client names, claims,
numbers or prices. They must come from him.

## First time on a new computer

1. Install **Node.js 24** (nodejs.org → LTS, or `fnm install 24`). Node
   23+ also works; Node 22 doesn't.
2. In this folder: `npx pnpm install --frozen-lockfile`
3. `npx pnpm check`: if it passes, everything is set up.

## Commands

```bash
npx pnpm install --frozen-lockfile   # first time on a machine (Node 24, see .node-version)
npx pnpm dev                         # live preview → http://localhost:5173
npx pnpm check                       # everything: types, content rules, tests, build
npx pnpm build                       # production build → dist/
npx pnpm preview                     # serve the production build
npx pnpm media:add --client <id> --file <photo> [--lead] [--role feature]
npx pnpm media:remove <image-name>
npx pnpm media:upload                # copy images/video to the R2 bucket (see docs/guides)
```

**Dev server and agents:** when Astro detects an AI agent, `npx pnpm dev`
starts the server in the background and returns immediately, printing its
URL. `npx pnpm exec astro dev status|logs|stop` manages it. The dev server
keeps showing the last valid content when a content file has a mistake (the
error only appears in its logs), so **always run `npx pnpm check`** after
editing content.

`pnpm` isn't installed globally, so always use `npx pnpm`. Never run a bare
`npx <tool>` for a tool that isn't in `node_modules`: it can download an
unrelated package (see `lessons-learned/`).

## Content map (where everything lives)

| The owner wants to change… | Edit this |
|---|---|
| A client: name, category, year, tags, description, colors, photos, alt text, gallery look | `src/content/clients/<id>.yaml` (one file = one page at `/work/<id>`) |
| Order of clients on the Work grid / "Next project" | `order:` in each client file |
| Services list (names, descriptions, hover photo) | `src/content/services.yaml` (file order = page order) |
| Featured-clients logo wall (exactly 24) | `src/content/featured-clients.yaml` + logo files in `public/images/clients/` |
| Any other text: headlines, about, button labels, contact copy, SEO title/description, hero photo alt | `src/config/strings.ts` |
| WhatsApp number, email, Instagram handle | `src/config/site.config.ts` → `contact` |
| Menu links / order of home sections | `src/config/site.config.ts` |
| Global colors, spacing, type sizes | `src/styles/tokens.css` (design tokens; never hardcode a hex or px in a component) |
| Animation timings | `src/config/motion.config.ts` |
| Site address (for share cards) | `astro.config.mjs` → `site` |

Every content field is explained in `src/content.config.ts` (the schema).
Read it when unsure what a field accepts.

## Recipes

### Change text
Edit the string in `src/config/strings.ts`, or the field in the client,
services or logo-wall file. Keep the tone: short, confident, studio voice.
English only, though Arabic accents (client Arabic names, documentary
captions) are fine.

### Add photos to a client
Photos come from the owner (attached, or a Google Drive file he points to).
Originals are never committed.

1. `npx pnpm media:add --client mamola --file "/path/to/photo.jpg"`
   - Big or full-width shots: add `--role feature`.
   - A new **main** photo for the client: add `--lead`. This also makes the
     client's share card. If the card crops badly, add `--crop top`,
     `--crop bottom` or `--crop entropy`.
2. The command prints a YAML snippet. Add it to that client's `frames:`
   list (or replace `lead:`) in `src/content/clients/<id>.yaml`, and write
   real alt text describing the photo.
3. `npx pnpm check`, then preview the page.
4. Commit the new files under `public/images/<id>/`, the updated
   `src/generated/image-manifest.json` and the YAML.

To remove a photo: delete it from the YAML first, then
`npx pnpm media:remove <image-name>`. The command refuses while the photo
is still used anywhere.

### Replace a photo
Import the new one (above), point the YAML at the new name, then remove the
old one. Image names are never reused: browsers and the CDN cache them
forever, so a reused name would keep showing the old photo.

### Add a new client
1. Copy the closest existing client file in `src/content/clients/` to
   `<new-id>.yaml`. The id becomes the URL, so use lowercase letters and
   dashes, e.g. `jan-burger`.
2. Import photos with `media:add --client <new-id>` (one `--lead`, then the
   frames).
3. Fill in every field: name, `order` (a number no other client uses),
   category, year, tags, description, palette, lead and frames with alt text.
4. Pick the gallery `layout.type`. Each has a minimum photo count, and
   `check` enforces it:

   | Layout | Look | Frames | Notes |
   |---|---|---|---|
   | `theatrical` | Spotlight stage, lead + 3 drifting photos | exactly 3 | |
   | `strip` | Horizontal film strip | 3–8 | needs `label` |
   | `stilllife` | Lead zooms like a painting, details rise | 2–4 | |
   | `picnic` | Tilted prints drifting (good for light palettes) | 3–8 | |
   | `gift` | Quiet, centered, lots of space | 2–8 | |
   | `documentary` | Flowing essay, Arabic + English captions | 2–30 | every photo needs `caption: { ar, en }` |
   | `scrub` | Stop-motion canvas + 2 videos + 2 photos | exactly 2 | needs a video frame sequence: Shaya only for now |

   The limits are what fits on screen at desktop and phone size; `check`
   enforces them. If he wants more photos than a layout shows, suggest a
   layout that shows more (strip, picnic, gift or documentary). A client
   with only photos can use any layout except `scrub`.
5. Palette: 5 hex colors. Keep `ink` readable on `bg` (aim for 4.5:1
   contrast) and `inkDim` readable too. Light pages (pale `bg`) need dark
   `ink`.
6. Add the client to the logo wall if he wants (keep it at 24 entries).
7. `npx pnpm check`, preview `/work/<new-id>` and the Work grid, commit.

### Logo wall
Follow the comment at the top of `src/content/featured-clients.yaml`. Prefer
SVG. Replacing a logo file in place is fine, because those files are cached
for one day only.

### Publish
Pushing to `master` publishes the site once the Cloudflare project is
connected to the repo (see `docs/guides/deploy.md`). Ask before every push.

## How the code is organized (when you must touch it)

```
src/
├─ content/            ← CONTENT (YAML). Most requests end here.
├─ content.config.ts   ← the rules for content files (schemas, plain-English errors)
├─ config/             ← strings.ts (UI copy), site.config.ts (links, nav), motion.config.ts
├─ pages/              ← routes: index.astro, work/[id].astro (one per client), 404.astro
├─ layouts/            ← BaseLayout.astro: <head>, share card, header, motion gate
├─ sections/<name>/    ← each section = Name.astro (markup) + name.ts (behavior) + name.css
│  └─ gallery/         ← the 7 client-page layouts, same pattern
├─ entries/            ← page behavior entry points (home.ts, client.ts)
├─ shared/             ← cross-cutting: motion helpers, media URLs, picture, content access
├─ styles/             ← tokens.css (design tokens), base.css, fonts.css
└─ generated/          ← image/video manifests (written by scripts, never by hand)
scripts/               ← media-add / media-remove / media-upload (+ tested pure core in lib/)
public/                ← images/, video/, fonts/, _headers, _redirects (served as-is)
```

Pages are static HTML built at deploy time. Markup lives in `.astro`
files; the matching `.ts` file only adds motion and interaction. Elements
that animate in carry `data-reveal`: they stay hidden until their reveal
runs, with a failsafe (see the comment at the top of `BaseLayout.astro`).

## Never do

- Never commit `assets/`, `.env`, `.wrangler/`, or anything with a password,
  token or API key.
- Never force-push, rewrite history, or delete branches.
- Never edit `src/generated/*.json` by hand. Use the media scripts.
- Never put a CSS `clip-path` on an element the palette observer watches (a
  client page's `.chapter` or `#intro`): it silently breaks the color
  change. See `README.md` → palette system.
- Never letter-split Arabic text in animations (whole words only).
- Never hardcode visible text in components. It goes in `strings.ts` or
  `src/content/`.
- Never say "done" without `npx pnpm check` passing and a screenshot you
  looked at.

## Background reading (only when relevant)

- `README.md`: overview, palette system, hosting.
- `docs/guides/deploy.md`: putting the site on the studio's Cloudflare account.
- `docs/guides/move-images-to-r2.md`: serving images from an R2 bucket.
- `lessons-learned/INDEX.md`: traps already hit once. Read the index at the
  start of a session.
- `changelogs/`: what changed and why. Add
  `changelogs/YYYY-MM-DD-<short-name>.md` for every set of changes.

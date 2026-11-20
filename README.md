# MASRA Studio website

The website for [MASRA Studio](https://masra.sa), a visual production and
photography studio in Riyadh.

## For the owner: how to change the site

👉 **Read [EDITING-GUIDE.md](EDITING-GUIDE.md)**: setup, example requests
for every kind of change, publishing, and undoing.

You don't need to code. Open this folder in **Claude Code** (or Codex) and
ask in plain words, for example:

- "Change the About text to: …"
- "Add these photos to the Mamola page" (attach them, or point to the Drive files)
- "Make this photo the main image for Shaya"
- "Add a new client called … in the Lifestyle category"
- "Put the new IDMI logo on the clients wall" (attach the SVG)
- "Update the WhatsApp number to …"
- "Publish the changes"

The assistant knows where everything lives (its rules are in `AGENTS.md`).
It checks the change, shows you a screenshot, and asks before saving
(committing) or publishing (pushing).

Good habits:

- One change per request is easiest to check.
- Look at the screenshot before saying yes.
- Original photos stay in Google Drive. Only the web-optimized copies are
  stored here.

**Where things are**, if you're curious: every client page is one small
text file in `src/content/clients/`. The services list and the logo wall
are in `src/content/`. Other site text is in `src/config/strings.ts`.

---

## For developers and AI agents

Static site built with [Astro](https://astro.build) 7. Pages are plain HTML
generated at build time from content files. Motion uses
[motion.dev](https://motion.dev), and [Lenis](https://lenis.darkroom.engineering/)
smooths wheel scrolling. No UI framework, no WebGL.

- **Home:** About · Work (Artistic / Lifestyle / Menu tabs) · Services ·
  Featured clients · Contact, under a fixed header with a "Start your
  project" WhatsApp CTA.
- **Client pages (`/work/<id>`):** one per client file. Each wears that
  client's color palette and shows the photos in one of 7 bespoke gallery
  layouts.

### Commands

```bash
npx pnpm install --frozen-lockfile   # Node 24 (.node-version)
npx pnpm dev                         # http://localhost:5173
npx pnpm check                       # astro check (types + content schemas) + tests + build
npx pnpm build                       # → dist/
npx pnpm preview                     # serve dist/
npx pnpm media:add --client <id> --file <photo> [--lead] [--role feature] [--crop top]
npx pnpm media:remove <image-name>
npx pnpm media:upload [--dry-run]    # images/video → R2 (docs/guides/move-images-to-r2.md)
npx pnpm videos                      # re-encode video loops (needs ffmpeg + raw clips in assets/)
```

### Project layout

```
src/
├─ content/              content as YAML: clients/<id>.yaml, services.yaml, featured-clients.yaml
├─ content.config.ts     content schemas (Zod) with plain-English errors: photo counts per
│                        layout, alt text, palette contrast, image names that must exist
├─ config/               strings.ts (all other copy) · site.config.ts (contact, nav) · motion.config.ts
├─ pages/                index.astro · work/[id].astro (getStaticPaths over clients) · 404.astro
├─ layouts/BaseLayout.astro   <head>, SEO + share card, header, motion gate
├─ sections/<name>/      Name.astro (markup) + name.ts (behavior) + name.css
│  └─ gallery/           the 7 layouts: theatrical, strip, stilllife, picnic, scrub, gift, documentary
├─ entries/              per-page behavior entry points (home.ts, client.ts, boot.ts)
├─ shared/               motion/ (reveals, Lenis, palette, split) · media/ (URLs, manifest,
│                        frame sequence) · ui/ (Picture, Loop, CtaLink, cursor) · content/
├─ styles/               tokens.css (design tokens) · base.css · fonts.css · chapters.css
└─ generated/            image + video manifests (written by scripts only)
scripts/                 media-add · media-remove · media-upload · optimize-videos · lib/ (tested core)
public/                  images/ · video/ · fonts/ · _headers · _redirects · llms.txt
docs/guides/             deploy.md · move-images-to-r2.md
```

### How it fits together

- **Content → pages.** `getStaticPaths` in `pages/work/[id].astro` makes one
  page per `src/content/clients/*.yaml`. The schema in
  `src/content.config.ts` rejects bad content at build time with a
  message naming the file and field.
- **Images.** `media:add` writes AVIF + WebP width ladders into
  `public/images/<client>/` and an entry in
  `src/generated/image-manifest.json` (size, aspect, blur placeholder).
  `<Picture>` renders `<picture>` from the manifest with explicit
  dimensions, so the layout never jumps. Image names are never reused,
  because `/images/*` is cached as immutable.
- **R2 switch.** Every media URL goes through `mediaUrl()`
  (`src/shared/media/media-url.ts`). Set `PUBLIC_MEDIA_BASE_URL` at build
  time to serve from a bucket.
- **Markup vs motion.** `.astro` files render the HTML. The matching `.ts`
  enhances it: reveals, scroll scenes, filters, the menu. Elements that
  animate in carry `data-reveal`. While `<html class="js-motion">` is set
  (an inline head script, only without reduced motion), CSS keeps them
  hidden until their reveal helper runs. A failsafe timer and `<noscript>`
  guarantee content never stays hidden.

### The palette system

- Each client's colors (`palette:` in its YAML) become a
  `body[data-chapter="<id>"]` rule in that page's `<head>`
  (`shared/content/clients-pure.ts → paletteCss`), mapping them onto the
  `--chapter-*` roles every component paints with.
- `shared/motion/palette.ts` watches sections at the viewport centerline
  (one IntersectionObserver, `-50%` root margins) and flips
  `body[data-chapter]`. The intro and gallery wear the client's colors; the
  closing sections return to the darkroom base. `base.css` cross-fades the
  change.
- **Never put a clip-path on an observed element** (`#intro`, `.chapter`).
  Chromium counts an element's own clip-path in its intersection area, and
  the takeover silently stops. Clips belong on inner children (see
  `reveals.ts`).
- Arabic display type animates by whole word only (`revealWords`).
  Connected script must never be glyph-split.
- **Reduced motion:** palettes snap, loops show posters, the scrub canvas
  shows one still, and everything stays readable.

### Hosting

Cloudflare Workers static assets (`wrangler.jsonc`), or Pages with build
command `npx pnpm build` and output directory `dist`. Full setup in
`docs/guides/deploy.md`.

- `build.format: "file"` serves `/work/peti` directly, with no trailing-slash
  redirect.
- `404.astro` is served with a real 404 status.
- `public/_redirects` sends bare `/work` to the Work grid.

### More

- `AGENTS.md`: rules and recipes for AI agents (`CLAUDE.md` imports it).
- `lessons-learned/`: traps already hit once.
- `changelogs/`: what changed and why, per work session.

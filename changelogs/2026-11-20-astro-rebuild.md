# 2026-11-20 — Rebuild on Astro 7: content files, real HTML, media tools

Branch: `feature/astro-rebuild` (from `master` @ 5f13f9e, which is v3).

## Why

The owner will maintain the site through AI agents (Claude Code / Codex)
without writing code, and will later host it on the studio's own Cloudflare
account with images in R2. Before this rebuild:

- **Adding a client meant code edits in about 5 files.**
- **Pages were built by JavaScript in the browser.** Search engines, AI
  crawlers and link previews saw an empty page, and every client link shared
  one generic share card.
- **The image script needed the 5 GB of raw photos**, which only existed on
  the developer's machine.

## What changed

- **Astro 7, fully static** (`astro build` → `dist/`, no server). Node 24 is
  pinned (`.node-version`); the build also works on Node 23.
- **Content as files, checked by schemas** (`src/content.config.ts`):
  - `src/content/clients/<id>.yaml`: one file per client = one page at
    `/work/<id>`. It holds name, category, year, tags, description,
    palette, photos with alt text, and gallery layout.
  - `src/content/services.yaml` and `src/content/featured-clients.yaml`
    (file order = page order).
  - Plain-English build errors for:
    - missing alt text;
    - unknown image names;
    - too few photos for a layout;
    - documentary photos without captions;
    - text colors with contrast under 4.5:1;
    - two clients with the same `order`;
    - a logo wall that isn't 24 entries.
- **Every section and gallery layout is `.astro` markup plus a small
  behavior script.** The v3 motion code is reused unchanged in spirit. A
  CSS "motion gate" (`data-reveal` + `html.js-motion`) stops content from
  flashing before its entrance animation, with a failsafe timer and a
  `<noscript>` rule.
- **Each client page has its own** title, description, canonical URL and a
  1200×630 share card (`public/images/og/<id>.jpg`).
- **Palettes come from content.** Each page emits its palette rule in
  `<head>` and paints in its colors from the first frame (v3 flashed the
  dark base color first).
- **Real 404 page** with a 404 status. `/work` → `/#work` (302). Client
  URLs serve directly with no redirect (`build.format: "file"`).
- **Media tools:**
  - `media:add`: imports one photo from anywhere (e.g. a Drive download),
    writes AVIF + WebP ladders and the manifest entry, `--lead` writes the
    share card, and it prints the YAML to paste.
  - `media:remove`: refuses while a photo is still in use.
  - `media:upload`: copies images and video to R2.
  - The pure rules are tested (`scripts/lib/media-core.test.mjs`).
- **R2 switch:** every media URL goes through `mediaUrl()`. Setting
  `PUBLIC_MEDIA_BASE_URL` at build time serves everything from a bucket.
- **Hosting:** `wrangler.jsonc` for Cloudflare Workers static assets
  (Cloudflare's recommendation for new projects).
  `docs/guides/deploy.md` and `docs/guides/move-images-to-r2.md` give
  dashboard steps for the owner's account.
- **Generated at build:** `/llms.txt` and `/sitemap.xml`, so new clients
  appear in both automatically. `robots.txt` points to the sitemap.
- **For agents:**
  - `AGENTS.md` rewritten with a content map, recipes (photos, new client,
    layouts table with photo minimums), commands and never-do rules.
  - `CLAUDE.md` imports it.
  - Claude Code skills: `add-photos`, `add-client`, `publish`.
  - `.claude/launch.json` now runs Astro.
- **Removed:** Vite entry HTML files, `campaigns.config.ts`,
  `clients.config.ts`, the client-side routing module, and the old CURATED
  image pipeline (kept locally by the developer).

## Second pass (gaps found in review)

- **Photo limits per layout.** The schema now enforces how many frames each
  layout shows, measured at 1440 and 390 px:
  - theatrical: exactly 3;
  - strip, picnic, gift: 3–8 (gift 2–8);
  - still-life: 2–4;
  - documentary: 2–30;
  - scrub: exactly 2.

  Before this, PETI's 4th frame and five of Shaya's seven were listed but
  never displayed (in v3 too), so "add a photo" could pass and show
  nothing. Scrub now uses its 2 frames directly.
- **Removed images the site never showed** (keeping only used images in
  git): `peti-wide`, `shaya-frame-2/4/5/6`, `shaya-wide`, and the unused
  white logo.
- **Dev server.** Astro 7 backgrounds `astro dev` when it detects an AI
  agent. `.claude/launch.json` sets `ASTRO_DEV_BACKGROUND=0` for the
  desktop preview, and `AGENTS.md` explains the daemon and why to run
  `check` (dev keeps serving the last valid content).
- **`media:add`** gives a plain message for unreadable files (HEIC: export
  as JPG first).
- **`AGENTS.md`** gains a "first time on a new computer" section.

Extra checks for this pass:

- **Live editing:** in `astro dev`, a YAML edit showed up in 2 s.
- **Behavior on the built site:**
  - Work tabs 3/2/2/7 with `aria-pressed`;
  - the services hover preview, which loads only on desktop;
  - email click-to-copy;
  - Back from a client page with bfcache disabled restores the exact
    offset (1517 px) and skips the preloader.
- **Upload dry run:** `media:upload --dry-run` lists 332 files with the
  right cache rules.
- **Preview build** (`astro build --site https://masra-v2.pages.dev`)
  under `wrangler pages dev`, with `wrangler.jsonc` present:
  - every route as expected;
  - share cards point at the preview host.

## Verification

- `npx pnpm check`: `astro check` 0 errors, 18/18 tests, build OK.
- **Parity with the live v3** (masra-v2.pages.dev), measured in Chrome:
  - Desktop 1440×900: identical page heights and section heights on all
    8 pages, with the same image, canvas and video counts.
  - Mobile 390×844: identical page and section heights on all 8 pages.
- **Visual:** home, Shaya (scrub reaches F 045/068 and both loops play),
  Mamola, Riyadh and Maqsoud; reduced motion (nothing hidden, palette
  from first paint).
- **Raw HTML contains all text:** client names, descriptions and
  documentary captions are readable without JavaScript.
- **Tonight's v3 review fixes, re-checked on the new build:**
  - no overflow at 320px;
  - the menu toggle stays on screen and the landscape menu scrolls;
  - focus moves to the section after a jump;
  - decorative images inside links;
  - arrows hidden from screen readers;
  - a malformed hash doesn't throw;
  - 404 has a real status and noindex;
  - deep links land under the header.
- **Routing**, under both `wrangler pages dev` and `wrangler dev` (Workers):
  - `/work/<id>` → 200;
  - `/work/peti/` and `.html` → redirect to the clean URL;
  - unknown → 404 page;
  - `/work` → 302 to `/#work`;
  - cache headers as in `_headers`.
- **R2 switch:** built with the base URL pointing at a second local server
  and removed `images/` and `video/` from `dist/`. Zero media requests
  reached the site origin, 76 went to the "bucket", the canvas scrub
  worked cross-origin, and the videos played.
- **Acceptance test (fresh clone):** added a throwaway 8th client by
  following `AGENTS.md` (`media:add` ×4 + one YAML file).
  - The deliberate mistakes each produced a clear error.
  - The fixed version built the page with its own palette and appeared on
    the Work grid and in "Next project".
  - The test client was then deleted.
- **Performance:** home LCP 517 ms (v3 547 ms), CLS 0.00. JS ≈ 36 KB gz
  per page (v3 ≈ 55 KB), because the image manifest no longer ships to the
  browser. Lighthouse mobile: Accessibility 96 (the intentionally dim
  read-along words, which are `aria-hidden`), Best Practices 100, SEO 100.

## Not verified

- **The owner's Cloudflare account and R2 bucket:** the setup is written
  and the switch tested locally, but not run on his account.
- **Workers Builds (git-connected deploys)** on his account.
- **How scrolling feels on a real phone or mouse:** unchanged from v3.

# 2026-07-31 — v2 "Seven Moods" full redesign

Branch: `v2-seven-moods`. Complete redesign of the one-pager around seven
brand campaigns (up from three), under the approved "Seven Moods" concept:
each campaign is a named bilingual (AR/EN) mood-world that takes over the
entire site palette, typography accent, and motion vocabulary on scroll.

## What changed

### Campaign roster (3 → 7)

| # | Campaign | Mood | Layout | Source folder |
|---|---|---|---|---|
| 01 | PETI | Crimson قِرمِزي | theatrical spotlight | `assets/01` (v1 slugs kept) |
| 02 | IDMI | Roast مُحَمَّص | horizontal film-strip | `assets/After` (v1 slugs kept) |
| 03 | La Bonté | Candlelight ضَوء الشُّموع | pinned still-life zoom | `assets/After 02` (re-slugged `levo-*` → `labonte-*`) |
| 04 | Mamola | Picnic نُزهَة | light-palette drift band | `assets/mamola/01` (7 of 67 curated) |
| 05 | Shaya | Steeped مَنقوع | **scroll-scrubbed stop-motion canvas** + 2 loops | `assets/shaya/*` (8 of 82 + 3 of 7 clips) |
| 06 | Riyadh | Golden ذَهَبي | quiet whitespace | `assets/riyadh/03` (5 of 6) |
| 07 | Maqsoud | The Old Quarter الدِّيرَة | **documentary photo essay** | `assets/maqsoud` (8 of 13) |

### Architecture

- **`src/config/campaigns.config.ts` (new)** — central `Campaign[]`; every
  consumer (chapter orchestrator, palette observer, index table, numbers)
  maps over it. Replaces v1's hand-wired case modules (`sections/work/`
  deleted).
- **Palette takeover (new)** — `shared/motion/palette.ts`: one
  IntersectionObserver at the viewport centerline flips
  `body[data-chapter]`; `styles/chapters.css` holds all campaign hexes as
  `:root --palette-<id>-*` tokens mapped onto `--chapter-*` roles;
  `base.css` cross-fades the consuming properties over 750ms.
  **Chromium rule preserved:** observed wrappers never carry clip-paths
  (clips live on children) or the IO deadlocks.
- **Chapters system (new `sections/chapters/`)** — orchestrator + shared
  bilingual shell + seven layout builders registered via a layout registry;
  sticky scenes (`sceneHeight × 100vh` wrapper, `100dvh` sticky stage,
  `scroll()` progress); curtain wipes between chapters (child overlays in
  the next chapter's palette, last 12% of runway).
- **Video pipeline (new `scripts/optimize-videos.mjs`)** — ffmpeg loops
  (AV1/WebM ~70KB + H.264 fallback ~107KB, 720p 30fps, muted) + AVIF/WebP
  posters + a 68-frame WebP sequence (880px, 2.3MB) for the Shaya scrub;
  emits `src/generated/video-manifest.json`. `shared/ui/video.ts` plays
  loops only near the viewport with a global cap of 2 decoders;
  `shared/media/frame-sequence.ts` scrubs the canvas with
  nearest-loaded-frame fallback and decode catch-up.
- **Index/Overview nav (new `sections/index-nav/`)** — editorial stack ⇄
  dense numbered catalog via a FLIP toggle (`shared/motion/flip.ts`),
  cursor-following lead-image previews, row click → Lenis `scrollTo`.
- **Numbers (new `sections/numbers/`)** — count-up production stats +
  velocity-reactive vocabulary marquee.
- **Section upgrades** — preloader: mirrored counters + crimson exit tint;
  hero: bilingual "Seven moods / سبعة أمزجة" line; manifesto: `*word*`
  emphasis markers render italic vermilion; contact: click-to-copy email
  with "Copied" spring tick; services thumbs re-pointed at the seven leads.
- **Arabic motion rule** — new `revealWords` animates Arabic display type
  by whole word only (connected script is never glyph-split).
- **Reduced-motion parity** — palette swaps instantly, loops become
  posters, strip becomes a native swipe, curtains/ticker removed, all
  content authored-visible.

### Assets

- 29 new curated images (45 slugs total) through the sharp AVIF/WebP
  pipeline; stale `public/images/levo/` removed; `public/video/shaya/` new;
  `_headers` caches `/video/*` immutable; `llms.txt` added.

## Why

The studio shot four new brand campaigns (Mamola, Shaya, Riyadh, Maqsoud).
Rather than bolt them onto the v1 layout, the site was redesigned so the
*range* of moods — luxury theatrical to street documentary — becomes the
concept itself. Research across 2025–26 award winners (see
`docs/inspiration-research.md`, including the two rejected concepts)
converged on the palette-takeover + register-shift pattern.

## Measured (production build, local preview)

- **LCP 547ms · CLS 0.00** (Chrome DevTools trace, desktop)
- **Lighthouse: 96 accessibility · 100 best practices · 100 SEO**
  (the one contrast flag — manifesto resting words — was fixed after the
  run by raising resting opacity 0.30 → 0.45)
- **JS 56.2KB gzip** (budget ≤70KB) · CSS 5.5KB gzip
- **Full-page transfer ≈ 4.1MB** scrolling top→bottom with every chapter,
  all 68 sequence frames and both loops (budget ≤12MB); zero video/sequence
  bytes fetched before the Shaya chapter approaches
- Palette takeover verified firing in **both** scroll directions across all
  seven chapters; zero console errors; no horizontal overflow at 375px

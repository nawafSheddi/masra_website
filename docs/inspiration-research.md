# Inspiration research — MASRA v2 "Seven Moods"

Research performed 2026-07-31 before designing v2. Sites were visited live in
the browser and studied for motion/layout techniques; this document records
**every** reference reviewed across both the v1 build and the v2 redesign
pass, plus the two design concepts that were considered and rejected.

---

## v2 research pass (2025–2026, visited & verified)

| Site | URL | What it is | Takeaways applied to v2 |
|---|---|---|---|
| **Podium** (San Rita) | podium.global | Montreal sports photo/video studio — Awwwards SOTD + Dev Award Jun 2026 | Behind-the-scenes grid as its own section; hover-to-play video thumbs; **mirrored preloader counters** (adopted); grid/list view toggle; b/w chrome letting photography carry all color |
| **Gregor Collienne** | gregorcollienne.com | Belgian commercial photographer — Awwwards HM Jul 2026 | The verified **Overview/Index dual nav with Grid–List toggle** (adopted); radical no-captions continuous scroll; `/focus/?rel=N` lightbox-as-URL-state; one thumbnail width = fast grid |
| **Brady Perron** | bradyperron.com | Brooklyn videographer — HM Jun 2026 | Homepage-as-index **marquee ticker of project titles**; About as overlay, not route |
| **Kenichi Aikawa** | aikawakenichi.com | Japanese photographer — HM Jun 2026 | **Mood-first taxonomy** ("Work/Fashion/Journey/Mode") → v2's mood names; email **copy-to-clipboard microinteraction** (adopted) |
| **Meech213** (by The Blackpepper Studio) | meech213.com | LA fashion/celebrity photographer | Photo vs Video parallel portfolio trees; pure image mosaic, captions only in slugs |
| **Tamaki Yoshida** (D2C Inc.) | tamakiyoshida.com | Japanese fine-art photographer | **Mixed-script bilingual titles** (adopted for the AR/EN mood titles); filterable archive (Category/Year); AVIF via CMS |
| **Madar** (Vide Infra) | madarplatform.com | Saudi logistics platform — **SOTD Sep 2025 + Dev Award**, the Saudi bilingual benchmark | True mirrored RTL; Arabic-primary routes with `/en/` namespace; parallel-route language switch |
| **Normal is Boring** | normalisboring.es | Spanish luxury developer — SOTD + Dev Award Jul 2026 | **Numbered catalog 01–05** with year/location metadata (adopted as the Index table); *selective italic* word emphasis inside display headlines (adopted in the manifesto); proof this tier is reachable with zero WebGL |
| **La Revoltosa** (Waka) | larevoltosa.es | Spanish sparkling-drink brand — SOTD + Dev Award May 2026 | Awarded "view mode switch"; first-person brand voice as a design element; red-orange on warm off-white palette validation |
| **Linka** | linkaproduction.com | French audiovisual agency — HM Jun 2026 | Work as five thematic "Univers" with taglines; showreel as hero object |
| **Son Daven** (The First The Last) | sondaven.com | Carpathian hotel — **SOTM Jun 2026** + Dev Award, Webflow, no WebGL | **SVG transition curtains between sections** (adopted as the between-chapter wipes); summer/winter content-state toggle; `00/00` counter pagination |
| **Price & Pierce** (Fhoke) | price-pierce.co.uk | Global food/produce trading co — HM May 2026 | The "quiet" photography-led food benchmark; muted gold + forest palette (cousin of the Shaya chapter) |
| **sakazuki** (Shun Kudo) | sakazuki.io | Japanese sake membership — SOTD Jun 2026 | Culture-storytelling food site; red + warm beige palette (Riyadh-chapter reference); graphic-design-led, not shader-led |

### Referenced (verified via award/press coverage, not deep-visited)

- **Bafoods** + **Bite Toothpaste Bits** — Awwwards Inspiration's canonical
  **scroll-driven stop-motion** examples → the Shaya frame-sequence scrub
- **Noxediem** — fullscreen sticky case-study scroll → sticky chapter scenes
- **Diriyah Season** (uxbertlabs) — Awwwards-nominated Saudi bilingual events site
- **Mux "Best practices for video playback" (2025)**, **ImageKit video
  optimization guide**, **ignite.video autoplay guide** — loop encoding /
  autoplay / poster best practices behind `scripts/optimize-videos.mjs`
- **ghosh.dev video-scrubbing analysis** — why `<video>` scrubbing needs
  dense keyframes; motivated the frame-sequence-on-canvas approach
- **Cruip scroll-color-change pattern** — the `-50% rootMargin`
  IntersectionObserver centerline trick behind the palette takeover
- **Shorthand scrollytelling examples** + **Creative Bloq "Snowfall"
  retrospective** — documentary photo-essay pacing → the Maqsoud register break
- **Voxire "Arabic RTL typography 2026"** et al. — Arabic display sizing
  (~10–20% up), Western numerals in Saudi digital convention, and the
  animate-by-word-never-by-glyph rule for connected script

## v1 references (carried over)

| Site | What it is | What v1 took (and v2 keeps) |
|---|---|---|
| **The Blackpepper Studio** — theblackpepperstudio.com | Branding studio, SOTD + Dev Award | Movie-credits preloader with counter; fixed HUD-frame idea; hard section color flips (seed of the palette takeover) |
| **Cédric Grolet** — cedric-grolet.com | Pastry chef, canonical food+motion site | Pure-dark canvas; oversized display type; food photographed like jewelry |
| **basement.studio** — basement.studio | Dark heavy-motion studio benchmark | Oversized grotesque type as the design itself; attitude copy |
| **Unveil** — unveil.fr | Photography agency | Overview/Index dual-navigation seed |
| **Æbele Interiors** — aebeleinteriors.com | Luxury interiors SOTD | Slide-based scroll pacing; slow-luxury rhythm |
| **Awwwards photography winners gallery** — awwwards.com/websites/photography/ | Genre survey | Huge type + image-led layouts; muted chrome around vivid imagery |
| **La Negrita** — lanegrita.es | Reviewed and **rejected** in v1 | Generic digital-studio portfolio, not food-relevant |
| **Mat Voyce** (SOTD) | Type-in-motion | Manifesto word-reveal |
| **By-Kin** (SOTD + Dev Award) | Weighted smooth scroll | Lenis pacing |
| **Grit Pictures** | Scrapbook/collage textures | Mamola picnic-scatter chapter |
| **Gianluca Gradogna** | Infinite scroll transitions | Marquee language |
| **motion.dev examples** — examples.motion.dev | Library reference | `scroll()`, `inView`, springs, tickers |

---

## The chosen concept — "Seven Moods"

One continuous page whose **palette, typography accent, and motion
vocabulary re-skin per chapter**. Each of the seven campaigns is a named
bilingual mood-world (Crimson قِرمِزي, Roast مُحَمَّص, Candlelight ضَوء الشُّموع,
Picnic نُزهَة, Steeped مَنقوع, Golden ذَهَبي, The Old Quarter الدِّيرَة) that takes
over the entire site as it crosses the viewport centerline. Sticky cinematic
scenes per chapter; a scroll-scrubbed stop-motion canvas for Shaya; a quiet
documentary essay register for Maqsoud; Overview/Index dual navigation;
curtain wipes between chapters; MASRA vermilion #F9512C as the constant
voice and the finale.

## Rejected concepts

### "The Studio Set" (rejected)

A film-production metaphor: the page as one continuous studio set that
redresses itself between "takes" — clapperboard counters, contact-sheet
grids, film-strip HUD, BTS interludes. **Strengths:** playful, strong
narrative device, natural home for BTS material. **Why it lost:** the
metaphor risks reading as a gimmick next to luxury campaigns like PETI and
La Bonté, and it centers the studio's process over the clients' imagery —
the photographs, not the apparatus, are the product.

### "Editorial Catalog 01–07" (rejected)

A numbered luxury catalog: restrained type-led index (Normal is Boring
lineage), marquee-ticker navigation (Brady Perron lineage), focus-lightbox
per image. **Strengths:** most timeless and elegant; easiest to scale to
future campaigns; least engineering risk. **Why it lost:** it is the least
"heavy motion" of the three directions, and the brief explicitly asked for
eye-catching heavy motion; its best ideas (the numbered catalog metadata,
the Index view) were absorbed into Seven Moods anyway.

## Technique feasibility notes (constraints that shaped the build)

All load-bearing techniques run on vanilla TypeScript + motion.dev
(`scroll()`, `inView()`, `animate()`, springs) + Lenis + CSS custom
properties. **No WebGL/Three.js** — every 2025–26 winner studied confined
shaders to decorative hero/footer objects, so nothing essential was lost.

- **Palette takeover:** custom properties don't interpolate → transition the
  *consuming* properties (`background-color`, `color`) and flip
  `body[data-chapter]` from one IntersectionObserver with
  `rootMargin: -50% 0px -50% 0px`. The observed wrapper must never carry a
  clip-path (Chromium counts an element's own clip-path in its intersection
  area — a clipped wrapper deadlocks the takeover; learned in v1).
- **Stop-motion scrub:** `<video>` seeking is keyframe-bound (Firefox needs
  a keyframe every ~2 frames; `-g 1` encodes balloon). A WebP frame
  sequence painted to `<canvas>` from `scroll()` progress sidesteps it, and
  discrete frame-stepping *is* the stop-motion aesthetic.
- **FLIP index toggle:** measure → class swap → inverted transform →
  animate to identity; instant swap under reduced motion.
- **Curtains:** child overlay divs driven by the last 12% of each chapter's
  scroll progress; colors borrowed from `:root --palette-<id>-bg` tokens so
  no hex ever leaves `styles/chapters.css`.
- **Reduced-motion parity:** every effect either no-ops with content fully
  visible (reveals), swaps to a static equivalent (loops → posters, strip →
  native swipe), or is removed outright (curtains, ticker).

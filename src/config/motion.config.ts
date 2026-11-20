/**
 * Shared motion vocabulary. Every animation on the site pulls its numbers
 * from here so the whole page moves with one consistent "hand" — same
 * springs, same eases, same stagger rhythm (design-token rule, applied
 * to motion).
 *
 * Duration values mirror the --dur-* tokens in tokens.css; if one changes,
 * change both.
 */

/** Cubic beziers (as motion.dev array form). */
export const eases = {
  /** expo-out — fast start, long elegant settle. Reveals, wipes-in. */
  outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** cinematic in-out — used for the preloader curtain and big transitions. */
  inOutCine: [0.83, 0, 0.17, 1] as [number, number, number, number],
} as const;

/** Durations in seconds. */
export const durations = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
  wipe: 0.8,
  counter: 1.6, // preloader 000→100 count
} as const;

/** Spring presets — passed as { type: spring, ...preset }. */
export const springs = {
  /** Character/line entrances: snappy but weighty. */
  type: { stiffness: 180, damping: 22 },
  /** Cursor ring + services hover thumb: tight follow. */
  follow: { stiffness: 300, damping: 30 },
  /** Magnetic hover pull: soft. */
  magnetic: { stiffness: 150, damping: 15 },
} as const;

/** Stagger intervals in seconds. */
export const staggers = {
  chars: 0.028, // per-character type reveals
  items: 0.1, // grid tiles, list rows
  rows: 0.09, // service rows
} as const;

/** Parallax / scroll-choreography ranges. */
export const scrollRanges = {
  /** Inner-image travel inside a parallax window (fraction of height). */
  parallaxShift: 0.1,
  /** Hero image settles from this scale to 1 while scrolling out. */
  heroSettleScale: 1.15,
  /** LEVO pinned centerpiece pushes in to this scale. */
  centerpieceZoom: 1.25,
  /** Hero type lifts by this many px during scroll-out. */
  heroTypeLift: 120,
} as const;

/** Marquee loop durations (s) per clients-wall row; middle row reversed. */
export const marqueeDurations = [40, 48, 44] as const;

/** v2 chapter-system numbers. */
export const chapterMotion = {
  /** Palette takeover cross-fade (s) — mirrors --dur-palette in tokens.css. */
  paletteTransition: 0.75,
  /** Final fraction of a chapter's scroll range that drives its exit
   *  curtain wipe (0.12 = last 12%). */
  curtainRange: 0.12,
  /** Overview ⇄ Index FLIP transition duration (s). */
  flipDuration: 0.6,
  /** Sticky-scene image drift: max lateral travel as a fraction of stage
   *  width (strip/picnic layouts). */
  driftShift: 0.08,
  /** How early (viewport multiples) the Shaya frame sequence starts
   *  prefetching before its chapter scrolls into view. */
  sequencePrefetchMargin: 1,
} as const;

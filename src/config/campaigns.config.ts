import { strings, type ImageSlug, type VideoId } from "./strings";
import type { WorkCategory } from "../sections/work/filter";

/**
 * The central campaign (client project) roster — single source of truth
 * for every client MASRA showcases. Every consumer (Work cards + category
 * tabs, the /work/<id> client page, its chapter layout, palette takeover,
 * "next project" order) maps over this array; no section hardcodes
 * campaign knowledge.
 *
 * v3 (client feedback): each campaign now carries a `category`
 * (artistic / lifestyle / menu) and a client-page `template`. The bespoke
 * chapter layouts from v2 live on as each client page's gallery, with
 * shorter pinned runways (`sceneHeight`) so scrolling stays responsive.
 *
 * Structure only: display copy lives in strings.chapters, palette hexes
 * live in styles/chapters.css keyed by `body[data-chapter="<id>"]` (design
 * tokens rule — JS never touches a color value).
 */

export type CampaignId = keyof Strings_Chapters;
type Strings_Chapters = typeof strings.chapters;

/** Client-page template → one builder in src/pages/client/. v3 ships a
 *  single "standard" template; adding a bespoke one later = add a member
 *  here + register its builder (client asked to start with one template
 *  and possibly add more). */
export type ClientTemplate = "standard";

/** Layout variant → one builder module in src/sections/chapters/. Mounted
 *  as the gallery body of the client page. */
export type ChapterLayout =
  | "theatrical"   // PETI — spotlight entrance, staggered grid
  | "strip"        // IDMI — horizontal film-strip scrub
  | "stilllife"    // La Bonté — pinned centerpiece zoom
  | "picnic"       // Mamola — multi-rate parallax drift (light palette)
  | "scrub"        // Shaya — canvas stop-motion scrub + loops
  | "gift"         // Riyadh — quiet, whitespace-led (light palette)
  | "documentary"; // Maqsoud — flowing photo essay, register break

export interface Campaign {
  id: CampaignId;
  /** 1-based catalog number (roster order; Work cards follow it). */
  index: number;
  layout: ChapterLayout;
  /** Work-section category (All / Artistic / Lifestyle / Menu tabs). */
  category: WorkCategory;
  /** Which client-page template renders /work/<id>. */
  template: ClientTemplate;
  /** Sticky-scene wrapper height in viewport-height multiples. The inner
   *  stage is 100dvh sticky; scroll progress maps over the whole wrapper.
   *  Documentary is the exception: it flows normally (no pin).
   *  v3: cut from 3–5 to 1.5–2.5 — long pinned runways were the main cause
   *  of the "scrolling feels slow" feedback (a wheel flick moved nothing
   *  but an animation). Keep new values ≤ 2.5. */
  sceneHeight: number;
  /** True for the two light-palette chapters — sections that need to know
   *  read this instead of sniffing colors (unused in v3; kept as palette
   *  metadata for future templates). */
  light: boolean;
  images: { lead: ImageSlug; frames: readonly ImageSlug[] };
  video?: { loops?: readonly VideoId[]; sequence?: "shaya" };
  meta: { year: string };
}

export const campaigns: readonly Campaign[] = [
  {
    id: "peti",
    index: 1,
    layout: "theatrical",
    category: "artistic",
    template: "standard",
    sceneHeight: 2,
    light: false,
    images: {
      lead: "peti-lead",
      frames: ["peti-grid-1", "peti-grid-2", "peti-grid-3", "peti-wide"],
    },
    meta: { year: "2025" },
  },
  {
    id: "idmi",
    index: 2,
    layout: "strip",
    category: "lifestyle",
    template: "standard",
    sceneHeight: 2,
    light: false,
    images: {
      lead: "idmi-strip-1",
      frames: ["idmi-strip-1", "idmi-strip-2", "idmi-strip-3", "idmi-strip-4", "idmi-strip-5"],
    },
    meta: { year: "2025" },
  },
  {
    id: "labonte",
    index: 3,
    layout: "stilllife",
    category: "artistic",
    template: "standard",
    sceneHeight: 2,
    light: false,
    images: {
      lead: "labonte-centerpiece",
      frames: ["labonte-grid-1", "labonte-grid-2", "labonte-grid-3", "labonte-accent"],
    },
    meta: { year: "2025" },
  },
  {
    id: "mamola",
    index: 4,
    layout: "picnic",
    category: "lifestyle",
    template: "standard",
    sceneHeight: 2,
    light: true,
    images: {
      lead: "mamola-lead",
      frames: [
        "mamola-frame-1", "mamola-frame-2", "mamola-frame-3",
        "mamola-frame-4", "mamola-frame-5", "mamola-frame-6",
      ],
    },
    meta: { year: "2026" },
  },
  {
    id: "shaya",
    index: 5,
    layout: "scrub",
    category: "artistic",
    template: "standard",
    sceneHeight: 2.5,
    light: false,
    images: {
      lead: "shaya-lead",
      frames: [
        "shaya-frame-1", "shaya-frame-2", "shaya-frame-3",
        "shaya-frame-4", "shaya-frame-5", "shaya-frame-6", "shaya-wide",
      ],
    },
    video: { loops: ["shaya-loop-1", "shaya-loop-2"], sequence: "shaya" },
    meta: { year: "2026" },
  },
  {
    id: "riyadh",
    index: 6,
    layout: "gift",
    category: "menu",
    template: "standard",
    sceneHeight: 1.5,
    light: true,
    images: {
      lead: "riyadh-lead",
      frames: ["riyadh-frame-1", "riyadh-frame-2", "riyadh-frame-3", "riyadh-frame-4"],
    },
    meta: { year: "2026" },
  },
  {
    id: "maqsoud",
    index: 7,
    layout: "documentary",
    category: "menu",
    template: "standard",
    sceneHeight: 4, // used as a rough length hint only — this chapter flows
    light: false,
    images: {
      lead: "maqsoud-lead",
      frames: [
        "maqsoud-essay-1", "maqsoud-essay-2", "maqsoud-essay-3", "maqsoud-essay-4",
        "maqsoud-essay-5", "maqsoud-essay-6", "maqsoud-essay-7",
      ],
    },
    meta: { year: "2026" },
  },
] as const;

/** Convenience lookup by id (client page, "next project", palette wiring).
 *  Only index it with an id validated by resolveClientId — it is a plain
 *  object, so `id in campaignById` would also match "constructor" etc. */
export const campaignById = Object.fromEntries(
  campaigns.map((c) => [c.id, c])
) as Record<CampaignId, Campaign>;

import type { MotionContext } from "../../shared/motion/motion-context";
import type { Campaign, ChapterLayout } from "../../config/campaigns.config";
import { strings } from "../../config/strings";
import { buildPicture } from "../../shared/ui/picture";
import { revealClip } from "../../shared/motion/reveals";
import "./chapters.css"; // wrapper/stage + layout styles (was imported by v2 main.ts)

/**
 * Chapter mounting — v3.
 *
 * In v2 all seven campaign "chapters" ran back-to-back on the home page
 * (~20,000px of pinned scenes — the root cause of the slow-scroll
 * feedback). In v3 each chapter is the gallery body of its own client page
 * (/work/<id>), mounted once by `mountChapter`. The bespoke layout
 * builders are unchanged; the old mood-title shell and between-chapter
 * curtains are gone (the client page's intro block replaces the shell).
 *
 * A chapter is:
 *
 *   <article class="chapter themed" data-chapter-id="…">   ← palette target
 *     <div class="chapter__stage">                          ← sticky viewport
 *       (layout-built canvas)
 *     </div>
 *   </article>
 *
 * The wrapper's height (sceneHeight × 100vh) creates the scroll runway;
 * the stage pins for its duration and the layout builder choreographs
 * against the wrapper's scroll progress. The documentary layout opts out
 * of pinning (chapter--flow) and reads as a normal flowing essay.
 *
 * PALETTE RULE: the <article> wrapper is what the palette
 * IntersectionObserver watches — it must NEVER carry a clip-path (Chromium
 * counts an element's own clip-path in its intersection area; a clipped
 * wrapper would deadlock the takeover). Clips stay on inner children.
 */

/** The copy fields every chapter guarantees (strings.chapters.* entries
 *  are structurally wider — some carry captions, strip labels, etc.). */
export interface ChapterCopy {
  name: string;
  nameAr?: string;
  tags: readonly string[];
  description: string;
}

export interface ChapterBuildArgs {
  ctx: MotionContext;
  campaign: Campaign;
  copy: ChapterCopy;
  /** The sticky (or flowing) stage to fill with imagery. */
  stage: HTMLElement;
  /** The tall wrapper — scroll-progress target for scrubbing layouts. */
  wrapper: HTMLElement;
}

export type ChapterBuilder = (args: ChapterBuildArgs) => void;

/** Layout registry — phases 4–6 register the bespoke builders; anything
 *  unregistered falls back to the basic editorial stack so the page always
 *  renders complete. */
const builders: Partial<Record<ChapterLayout, ChapterBuilder>> = {};

export function registerChapterLayout(layout: ChapterLayout, builder: ChapterBuilder): void {
  builders[layout] = builder;
}

/** Fallback layout: lead image + frame grid with clip reveals. Also the
 *  reduced-motion-friendly baseline every bespoke layout degrades toward. */
const buildBasic: ChapterBuilder = ({ ctx, campaign, stage }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas container";

  const lead = document.createElement("div");
  lead.className = "chapter__lead";
  lead.appendChild(buildPicture(campaign.images.lead, { sizes: "(min-width: 900px) 60vw, 100vw" }));
  revealClip(ctx, lead);
  canvas.appendChild(lead);

  const grid = document.createElement("div");
  grid.className = "chapter__grid";
  for (const [i, slug] of campaign.images.frames.entries()) {
    const cell = document.createElement("div");
    cell.className = "chapter__cell";
    cell.appendChild(buildPicture(slug, { sizes: "(min-width: 900px) 30vw, 50vw" }));
    revealClip(ctx, cell, i * 0.08);
    grid.appendChild(cell);
  }
  canvas.appendChild(grid);

  stage.appendChild(canvas);
};

/**
 * Mount one campaign's chapter (palette-observed wrapper + stage + bespoke
 * layout) into `root`. Returns the wrapper so the caller can register it
 * with the palette takeover.
 */
export function mountChapter(root: HTMLElement, ctx: MotionContext, campaign: Campaign): HTMLElement {
  const copy = strings.chapters[campaign.id] as ChapterCopy;

  const wrapper = document.createElement("article");
  const flows = campaign.layout === "documentary";
  wrapper.className = `chapter themed${flows ? " chapter--flow" : ""}`;
  wrapper.id = `chapter-${campaign.id}`;
  wrapper.dataset.chapterId = campaign.id; // palette takeover hook
  // Scroll runway for pinned scenes; flowing chapters size to content.
  if (!flows) wrapper.style.setProperty("--scene-h", String(campaign.sceneHeight));

  const stage = document.createElement("div");
  stage.className = "chapter__stage";
  (builders[campaign.layout] ?? buildBasic)({ ctx, campaign, copy, stage, wrapper });

  wrapper.appendChild(stage);
  root.appendChild(wrapper);
  return wrapper;
}

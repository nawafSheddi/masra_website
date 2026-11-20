import type { Campaign } from "../../config/campaigns.config";

/**
 * Chapter palette takeover — the keystone of the "Seven Moods" concept.
 *
 * One IntersectionObserver watches every chapter's OUTER wrapper with a
 * rootMargin that collapses the observation band to the viewport's exact
 * vertical centerline (-50% top and bottom). A chapter "owns" the page
 * while it straddles that line; whichever wrapper intersects sets
 * body[data-chapter], styles/chapters.css re-points the --chapter-* roles,
 * and base.css cross-fades every consumer. Scrolling back up re-fires
 * entries symmetrically, so takeover works in both directions.
 *
 * CHROMIUM DEADLOCK RULE (learned in v1, documented in the changelogs):
 * Chromium factors an element's OWN clip-path into its IntersectionObserver
 * area. The observed element here must therefore NEVER carry a clip-path —
 * all clip choreography (image reveals, curtain wipes) lives on inner
 * children. Keep it that way or takeovers will silently stop firing.
 *
 * Reduced motion: the observer stays active (a palette swap is information,
 * not motion) — base.css drops the cross-fade so it snaps instead.
 */

/** Sections outside the chapter run restore the base palette by carrying
 *  data-chapter-id="base" (hero side and numbers side of the run). */
export const BASE_CHAPTER = "base";

/** Update the browser-chrome color alongside the page palette (mobile
 *  address bar tints with the chapter — small free win). */
function syncThemeColor(): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) return;
  // Read the resolved token AFTER the data-chapter flip.
  const bg = getComputedStyle(document.body).getPropertyValue("--chapter-bg").trim();
  if (bg) meta.content = bg;
}

/**
 * Observe chapter wrappers (plus any base-palette sentinels) and drive
 * body[data-chapter]. `sections` maps element → chapter id ("base" or a
 * campaign id from the roster).
 */
export function initPaletteTakeover(
  sections: ReadonlyArray<{ el: HTMLElement; id: Campaign["id"] | typeof BASE_CHAPTER }>
): void {
  const idByEl = new Map<Element, string>(sections.map((s) => [s.el, s.id]));

  const observer = new IntersectionObserver(
    (entries) => {
      // With a centerline band exactly one element intersects at a time,
      // so last-write-wins across a batch is safe.
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = idByEl.get(entry.target);
        if (!id || document.body.dataset.chapter === id) continue;
        document.body.dataset.chapter = id;
        syncThemeColor();
      }
    },
    // Collapse the observation root to the viewport centerline.
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );

  for (const { el } of sections) observer.observe(el);
}

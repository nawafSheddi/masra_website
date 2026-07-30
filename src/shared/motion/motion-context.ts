/**
 * Motion context — the single gate every animation consults.
 *
 * Two environment facts decide how the site moves:
 *   - prefers-reduced-motion: when set, ALL choreography is skipped and the
 *     fully-styled static layout (which is the authored default) is shown.
 *   - pointer fineness: the custom cursor, magnetic pulls and hover
 *     thumbnails only exist for mouse-driven desktop sessions.
 *
 * Sections receive this object at init and branch once, up front — never
 * mid-animation.
 */

export interface MotionContext {
  /** True → skip every animation; content is already visible by default. */
  reducedMotion: boolean;
  /** True → mouse + hover available; enables cursor/magnetic/hover-thumb. */
  desktopPointer: boolean;
}

const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");

export function createMotionContext(): MotionContext {
  return {
    reducedMotion: reducedQuery.matches,
    desktopPointer: pointerQuery.matches,
  };
}

/** React to a live toggle of the OS reduced-motion setting: a full reload is
 *  the honest response — choreography can't be safely unwound mid-flight. */
export function watchReducedMotion(): void {
  reducedQuery.addEventListener("change", () => window.location.reload());
}

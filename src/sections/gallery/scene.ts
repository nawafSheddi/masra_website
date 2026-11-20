import { scroll } from "motion";

/**
 * Sticky-scene progress driver shared by the pinned chapter layouts.
 *
 * The chapter wrapper is `sceneHeight × 100vh` tall and its stage pins for
 * the whole runway, so mapping scroll progress over the WRAPPER gives each
 * layout a normalized 0→1 timeline for its choreography.
 */
export function sceneProgress(
  wrapper: HTMLElement,
  onProgress: (progress: number) => void
): void {
  scroll((progress: number) => onProgress(progress), {
    target: wrapper,
    offset: ["start start", "end end"],
  });
}

/** Map a 0→1 timeline value into a [from→to] sub-range, clamped. */
export function seg(progress: number, from: number, to: number): number {
  if (to === from) return progress >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (progress - from) / (to - from)));
}

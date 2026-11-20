import type { MotionContext } from "../../shared/motion/motion-context";
import { revealFade } from "../../shared/motion/reveals";

/**
 * "documentary" motion (Maqsoud · The Old Quarter). The register break:
 * no pinning, no scrubbing, no clip curtains — photographs surface with
 * slow opacity-only fades, like prints in a developer tray. Photos in a
 * pair fade in one after the other.
 */
export function initDocumentary(stage: HTMLElement, _wrapper: HTMLElement, ctx: MotionContext): void {
  for (const fig of stage.querySelectorAll<HTMLElement>(".docu__figure")) {
    const row = fig.parentElement?.classList.contains("docu__row") ? fig.parentElement : null;
    const delay = row ? Array.from(row.children).indexOf(fig) * 0.15 : 0;
    revealFade(ctx, fig, delay);
  }
}

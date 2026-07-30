import { animate, spring } from "motion";
import type { MotionContext } from "../motion/motion-context";
import { springs } from "../../config/motion.config";
import { strings } from "../../config/strings";

/**
 * Custom cursor — desktop-pointer sessions only, pure enhancement.
 *
 * Two layers:
 *   - dot: 6px brand dot glued to the pointer (instant)
 *   - ring: 36px circle that spring-follows with lag, and inflates into a
 *     "VIEW" pill while hovering case-study imagery ([data-cursor="view"])
 *
 * The native cursor stays visible (we don't hide it) — the ring is an
 * accent, not a replacement, so usability never regresses.
 */
export function initCursor(ctx: MotionContext): void {
  if (!ctx.desktopPointer || ctx.reducedMotion) return;

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  const label = document.createElement("span");
  label.className = "cursor-ring__label";
  label.textContent = strings.cursor.view;
  ring.appendChild(label);
  ring.setAttribute("aria-hidden", "true");
  dot.setAttribute("aria-hidden", "true");
  document.body.append(dot, ring);

  window.addEventListener("pointermove", (e) => {
    // Dot: pinned to the pointer.
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    // Ring: springs toward the pointer for the trailing-camera feel.
    animate(ring, { x: e.clientX, y: e.clientY }, { type: spring, ...springs.follow });
  });

  // Inflate over any element opting in via data-cursor="view".
  document.addEventListener("pointerover", (e) => {
    const target = (e.target as HTMLElement).closest("[data-cursor='view']");
    ring.classList.toggle("cursor-ring--view", Boolean(target));
  });
}

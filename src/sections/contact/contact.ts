import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealGroup, revealWords } from "../../shared/motion/reveals";
import { makeMagnetic } from "../../shared/ui/magnetic";

/**
 * Contact / footer — behavior for Contact.astro.
 *
 * "Let's work on your project." rises word by word (word reveal, never
 * glyph-split — safe if this copy is ever localized to Arabic); the CTA and
 * the email / Instagram links are magnetic; the email link copies the
 * address on click; the calligraphic wordmark rises from the bottom edge
 * as the visitor reaches the end — the brand signs the page.
 */
export function initContact(section: HTMLElement, ctx: MotionContext): void {
  const eyebrow = section.querySelector<HTMLElement>(".eyebrow")!;
  const title = section.querySelector<HTMLElement>(".contact__title")!;
  const cta = section.querySelector<HTMLElement>(".contact__cta")!;
  const anchors = Array.from(section.querySelectorAll<HTMLAnchorElement>(".contact__link"));
  const footer = section.querySelector<HTMLElement>(".contact__footer")!;
  const wordmark = section.querySelector<HTMLElement>(".contact__wordmark")!;

  // Email: click copies the address (the mailto stays on the href for
  // middle-click / long-press). The label flashes "Copied" with a spring
  // tick, then settles back — small trust-building microinteraction.
  for (const a of anchors) {
    const value = a.dataset.copy;
    if (!value || !("clipboard" in navigator)) continue;
    const label = a.querySelector<HTMLElement>(".contact__link-label")!;
    a.title = a.dataset.copyHint ?? "";
    let revertTimer: ReturnType<typeof setTimeout> | undefined;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      void navigator.clipboard.writeText(value).then(() => {
        label.textContent = a.dataset.copied ?? "";
        if (!ctx.reducedMotion) {
          animate(label, { scale: [1, 1.15, 1] }, { duration: 0.35, ease: "easeOut" });
        }
        clearTimeout(revertTimer);
        revertTimer = setTimeout(() => {
          label.textContent = a.dataset.copyLabel ?? "";
        }, 1600);
      });
    });
  }

  // Choreography (all helpers no-op under reduced motion).
  revealBlock(ctx, eyebrow);
  revealWords(ctx, title);
  revealBlock(ctx, cta, { delay: 0.25 });
  revealGroup(ctx, anchors);
  for (const a of [cta, ...anchors]) makeMagnetic(ctx, a);

  if (ctx.reducedMotion) return;

  // Wordmark rise: scrubbed by the footer's approach to the page end.
  scroll(
    animate(wordmark, { y: [140, 0], opacity: [0, 1] }, { ease: "linear" }),
    { target: footer, offset: ["start end", "end end"] }
  );
}

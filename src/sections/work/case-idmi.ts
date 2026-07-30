import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { buildPicture } from "../../shared/ui/picture";
import { strings } from "../../config/strings";
import { imageRoles } from "../../config/site.config";
import { buildCaseHeader } from "./case-header";

/** Below this width the film-strip collapses to a vertical stack. */
const STACK_BREAKPOINT = "(max-width: 47.9rem)";

/**
 * Case 02 — IDMI. The horizontal film-strip:
 * a 300vh scroll runway pins a full-viewport window while the strip of
 * square frames slides horizontally, each frame counter-drifting inside
 * its clip for parallax-within-parallax. On mobile or reduced motion the
 * whole thing is a plain vertical stack (CSS class toggle, no JS branching
 * mid-animation).
 */
export function buildCaseIdmi(ctx: MotionContext): HTMLElement {
  const article = document.createElement("article");
  article.className = "case-idmi";

  article.appendChild(buildCaseHeader(ctx, strings.work.cases.idmi));

  const track = document.createElement("div");
  track.className = "case-idmi__track";
  const viewport = document.createElement("div");
  viewport.className = "case-idmi__viewport";
  const strip = document.createElement("div");
  strip.className = "case-idmi__strip";

  // Frames 1-2, then the type card, then frames 3-5 — the card rides the
  // strip like a title frame spliced into film.
  const slugs = imageRoles.idmi.strip;
  const frames: HTMLElement[] = [];

  const buildFrame = (slug: (typeof slugs)[number]) => {
    const frame = document.createElement("div");
    frame.className = "case-idmi__frame";
    frame.dataset.cursor = "view";
    frame.appendChild(buildPicture(slug, { sizes: "(min-width: 768px) 60vh, 80vw" }));
    frames.push(frame);
    return frame;
  };

  strip.append(buildFrame(slugs[0]), buildFrame(slugs[1]));

  const card = document.createElement("div");
  card.className = "case-idmi__card";
  const cardName = document.createElement("p");
  cardName.className = "case-idmi__card-name display";
  cardName.textContent = strings.work.cases.idmi.name;
  const cardLabel = document.createElement("p");
  cardLabel.className = "eyebrow";
  cardLabel.textContent = strings.work.cases.idmi.stripLabel;
  card.append(cardName, cardLabel);
  strip.appendChild(card);

  strip.append(buildFrame(slugs[2]), buildFrame(slugs[3]), buildFrame(slugs[4]));

  viewport.appendChild(strip);
  track.appendChild(viewport);
  article.appendChild(track);

  const stacked = ctx.reducedMotion || window.matchMedia(STACK_BREAKPOINT).matches;
  if (stacked) {
    article.classList.add("case-idmi--stacked");
    return article;
  }

  // Horizontal slide: strip travels its overflow width across the 300vh
  // runway. Distance depends on layout, so bind after mount (rAF) and
  // rebind on resize.
  let cancelStrip: (() => void) | null = null;
  const bindStrip = () => {
    cancelStrip?.();
    const distance = strip.scrollWidth - viewport.clientWidth;
    if (distance <= 0) return;
    cancelStrip = scroll(
      animate(strip, { x: [0, -distance] }, { ease: "linear" }),
      { target: track, offset: ["start start", "end end"] }
    );

    // Counter-drift inside each frame: images lead/lag slightly against
    // the strip's travel — parallax within the film frame.
    for (const frame of frames) {
      const img = frame.querySelector("img");
      if (img) {
        scroll(
          animate(img, { x: ["0%", "-8%"] }, { ease: "linear" }),
          { target: track, offset: ["start start", "end end"] }
        );
      }
    }
  };

  requestAnimationFrame(bindStrip);
  let resizeTimer: number;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(bindStrip, 200);
  });

  return article;
}

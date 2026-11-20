import { animate, inView } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { strings } from "../../config/strings";
import { scrollVelocity } from "../../shared/motion/smooth-scroll";
import "./numbers.css";

/**
 * Production log — the studio's numbers as camera-room telemetry.
 *
 * Each stat counts up from zero when it enters the viewport (the
 * preloader's counter language, reused as proof-of-work), and a single
 * production-vocabulary marquee runs underneath, its pace nudged by
 * Lenis scroll velocity like the clients wall.
 *
 * Sits right after the chapter run, restoring the base palette.
 */
export function initNumbers(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "numbers";

  const inner = document.createElement("div");
  inner.className = "container";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.numbers.eyebrow;
  inner.appendChild(eyebrow);

  const list = document.createElement("dl");
  list.className = "numbers__stats";
  for (const stat of strings.numbers.stats) {
    const item = document.createElement("div");
    item.className = "numbers__stat";

    const dd = document.createElement("dd");
    dd.className = "numbers__value";
    dd.textContent = `${stat.value}${stat.suffix}`; // authored-visible final value

    const dt = document.createElement("dt");
    dt.className = "numbers__label";
    dt.textContent = stat.label;

    item.append(dd, dt);
    list.appendChild(item);

    // Count-up on first arrival (skipped under reduced motion — the final
    // value is already in the DOM, so nothing is ever hidden).
    if (!ctx.reducedMotion) {
      inView(
        item,
        () => {
          animate(0, stat.value, {
            duration: 1.4,
            ease: "circOut",
            onUpdate: (v) => {
              dd.textContent = `${Math.round(v)}${stat.suffix}`;
            },
          });
        },
        { amount: 0.6 }
      );
    }
  }
  inner.appendChild(list);
  section.appendChild(inner);

  // Production-vocabulary marquee: two identical copies → x: -50% loops
  // seamlessly; speed breathes with scroll velocity.
  const marquee = document.createElement("div");
  marquee.className = "numbers__marquee";
  marquee.setAttribute("aria-hidden", "true");
  const buildCopy = () => {
    const copy = document.createElement("div");
    copy.className = "numbers__marquee-inner";
    for (const word of strings.numbers.marquee) {
      const span = document.createElement("span");
      span.textContent = word;
      const sep = document.createElement("span");
      sep.className = "numbers__sep";
      sep.textContent = "✳";
      copy.append(span, sep);
    }
    return copy;
  };
  marquee.append(buildCopy(), buildCopy());
  section.appendChild(marquee);

  root.appendChild(section);

  if (ctx.reducedMotion) {
    marquee.remove(); // decorative ticker only — the stats carry the info
    return;
  }

  const loop = animate(
    marquee,
    { x: ["0%", "-50%"] },
    { duration: 36, ease: "linear", repeat: Infinity }
  );
  // Velocity nudge: fast scrolling hurries the ticker (clients-wall trick).
  function tick() {
    loop.speed = 1 + Math.min(2.5, Math.abs(scrollVelocity()) * 0.04);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

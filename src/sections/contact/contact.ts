import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealGroup, revealWords } from "../../shared/motion/reveals";
import { makeMagnetic } from "../../shared/ui/magnetic";
import { strings } from "../../config/strings";
import { links } from "../../config/site.config";
import { buildCtaLink } from "../header/header";
import "./contact.css";

/**
 * Contact / footer — the closing frame (v3, client feedback item 6).
 *
 * "Let's work on your project." rises word by word (word reveal, never
 * glyph-split — safe if this copy is ever localized to Arabic), a large
 * "Start your project" WhatsApp button (same builder as the header CTA),
 * then email (click-to-copy) and Instagram as oversized magnetic links,
 * and the official calligraphic wordmark rises from the bottom edge as
 * the visitor reaches the end — the brand literally signs the page.
 */
export function initContact(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "contact container";
  section.id = "contact";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.contact.eyebrow;

  const title = document.createElement("h2");
  title.className = "contact__title display";
  title.textContent = strings.contact.title;

  // Primary CTA — the clearest action on the page.
  const cta = buildCtaLink(strings.contact.cta);
  cta.classList.add("btn--xl", "contact__cta");

  // Secondary channels — endpoint URLs come from site.config.
  const linkDefs = [
    { ...strings.contact.links.email, href: links.email },
    { ...strings.contact.links.instagram, href: links.instagram },
  ];

  const list = document.createElement("ul");
  list.className = "contact__links";
  const anchors: HTMLElement[] = [];
  for (const def of linkDefs) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "contact__link";
    a.href = def.href;
    a.target = "_blank";
    a.rel = "noopener";

    const label = document.createElement("span");
    label.className = "contact__link-label";
    label.textContent = def.label;
    const value = document.createElement("span");
    value.className = "contact__link-value";
    value.textContent = def.value;

    a.append(label, value);

    // Email: click copies the address (the mailto stays on the href for
    // middle-click / long-press). The label flashes "Copied" with a spring
    // tick, then settles back — small trust-building microinteraction.
    if (def.label === strings.contact.links.email.label && "clipboard" in navigator) {
      a.title = strings.contact.copyHint;
      let revertTimer: ReturnType<typeof setTimeout> | undefined;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        void navigator.clipboard.writeText(def.value).then(() => {
          label.textContent = strings.contact.copied;
          if (!ctx.reducedMotion) {
            animate(label, { scale: [1, 1.15, 1] }, { duration: 0.35, ease: "easeOut" });
          }
          clearTimeout(revertTimer);
          revertTimer = setTimeout(() => {
            label.textContent = def.label;
          }, 1600);
        });
      });
    }

    li.appendChild(a);
    list.appendChild(li);
    anchors.push(a);
  }

  // Footer strip: locator + copyright + rising wordmark art.
  const footer = document.createElement("footer");
  footer.className = "contact__footer";

  const meta = document.createElement("div");
  meta.className = "contact__footer-meta";
  const note = document.createElement("span");
  note.textContent = strings.contact.footerNote;
  const copyright = document.createElement("span");
  copyright.textContent = strings.contact.copyright;
  meta.append(note, copyright);

  const wordmark = document.createElement("img");
  wordmark.className = "contact__wordmark";
  wordmark.src = "/images/brand/masra-logo-orange.png";
  wordmark.alt = strings.brand.wordmarkEn;
  wordmark.loading = "lazy";
  wordmark.decoding = "async";

  footer.append(meta, wordmark);
  section.append(eyebrow, title, cta, list, footer);
  root.appendChild(section);

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

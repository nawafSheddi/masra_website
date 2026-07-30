import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { makeMagnetic } from "../../shared/ui/magnetic";
import { strings } from "../../config/strings";
import { links } from "../../config/site.config";
import "./contact.css";

/**
 * Contact / footer — the pitch's closing frame.
 *
 * Giant "LET'S SHOOT." springs in, three oversized links (WhatsApp deep
 * link with a prefilled message, mailto, Instagram) get magnetic hover,
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
  const titleMain = document.createElement("span");
  titleMain.textContent = `${strings.contact.title} `;
  const titleAccent = document.createElement("span");
  titleAccent.className = "contact__title-accent";
  titleAccent.textContent = strings.contact.titleAccent;
  title.append(titleMain, titleAccent);

  // The three contact channels — endpoint URLs come from site.config.
  const linkDefs = [
    { ...strings.contact.links.whatsapp, href: links.whatsapp },
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
  section.append(eyebrow, title, list, footer);
  root.appendChild(section);

  // Choreography. The two title spans split separately so the accent span
  // keeps its vermilion color class through the character split.
  revealBlock(ctx, eyebrow);
  revealChars(ctx, titleMain);
  revealChars(ctx, titleAccent, { delay: 0.2 });
  revealGroup(ctx, anchors);
  for (const a of anchors) makeMagnetic(ctx, a);

  if (ctx.reducedMotion) return;

  // Wordmark rise: scrubbed by the footer's approach to the page end.
  scroll(
    animate(wordmark, { y: [140, 0], opacity: [0, 1] }, { ease: "linear" }),
    { target: footer, offset: ["start end", "end end"] }
  );
}

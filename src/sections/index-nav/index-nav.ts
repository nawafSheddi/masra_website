import { animate } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { campaigns } from "../../config/campaigns.config";
import { strings } from "../../config/strings";
import { springs } from "../../config/motion.config";
import { buildPicture } from "../../shared/ui/picture";
import { revealChars, revealGroup } from "../../shared/motion/reveals";
import { scrollTo } from "../../shared/motion/smooth-scroll";
import { flip } from "../../shared/motion/flip";
import { pad2 } from "../chapters/chapter-shell";
import "./index-nav.css";

/**
 * Index / Overview — dual navigation over the seven chapters.
 *
 * Overview: an editorial stack — each campaign is one giant mood-name line.
 * Index: the same rows compressed into a dense numbered catalog
 * (no. / brand / mood / year / frames). The toggle FLIPs the shared row
 * elements between the two layouts so the switch reads as one continuous
 * motion, not a re-render.
 *
 * Rows are real anchors to their chapter; clicking smooth-scrolls (Lenis).
 * On desktop pointers a floating preview thumb spring-follows the cursor
 * over whichever row is hovered (the services-section pattern).
 */
export function initIndexNav(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "index-nav container";
  section.id = "work";

  // --- Header row: eyebrow + view toggle --------------------------------
  const head = document.createElement("div");
  head.className = "index-nav__head";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.indexNav.eyebrow;

  const toggle = document.createElement("div");
  toggle.className = "index-nav__toggle";
  toggle.setAttribute("role", "group");
  toggle.setAttribute("aria-label", strings.a11y.indexToggleLabel);

  const modes = [
    { id: "overview", label: strings.indexNav.toggle.overview },
    { id: "index", label: strings.indexNav.toggle.index },
  ] as const;

  const buttons = modes.map((mode) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "index-nav__mode";
    btn.textContent = mode.label;
    btn.dataset.mode = mode.id;
    btn.setAttribute("aria-pressed", mode.id === "overview" ? "true" : "false");
    toggle.appendChild(btn);
    return btn;
  });

  head.append(eyebrow, toggle);

  // --- Title ------------------------------------------------------------
  const title = document.createElement("h2");
  title.className = "index-nav__title";
  const titleEn = document.createElement("span");
  titleEn.textContent = `${strings.indexNav.title} ${strings.indexNav.titleAccent}`;
  const titleAr = document.createElement("span");
  titleAr.className = "index-nav__title-ar";
  titleAr.dir = "rtl";
  titleAr.lang = "ar";
  titleAr.textContent = strings.indexNav.titleAr;
  title.append(titleEn, titleAr);
  revealChars(ctx, titleEn);

  // --- Rows -------------------------------------------------------------
  const list = document.createElement("ol");
  list.className = "index-nav__list";
  list.dataset.mode = "overview";

  const flipTargets: HTMLElement[] = [];
  const rows = campaigns.map((campaign) => {
    const copy = strings.chapters[campaign.id];

    const li = document.createElement("li");
    li.className = "index-nav__row themed";

    const link = document.createElement("a");
    link.className = "index-nav__link";
    link.href = `#chapter-${campaign.id}`;
    link.setAttribute("aria-label", `${copy.name} — ${strings.indexNav.rowHint}`);

    const no = document.createElement("span");
    no.className = "index-nav__no";
    no.textContent = pad2(campaign.index);

    const mood = document.createElement("span");
    mood.className = "index-nav__mood";
    mood.textContent = copy.mood;

    const brand = document.createElement("span");
    brand.className = "index-nav__brand";
    brand.textContent = copy.name;

    const year = document.createElement("span");
    year.className = "index-nav__year";
    year.textContent = campaign.meta.year;

    const frames = document.createElement("span");
    frames.className = "index-nav__frames";
    frames.textContent = pad2(campaign.images.frames.length + 1);

    link.append(no, mood, brand, year, frames);
    li.appendChild(link);
    list.appendChild(li);

    flipTargets.push(no, mood, brand);

    // Row click → smooth scroll to the chapter (anchor href is the a11y
    // and no-JS fallback).
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector<HTMLElement>(`#chapter-${campaign.id}`);
      if (target) scrollTo(target);
    });

    return { li, campaign };
  });

  revealGroup(ctx, rows.map((r) => r.li));

  // --- Mode toggle (FLIP) -----------------------------------------------
  function setMode(mode: "overview" | "index"): void {
    if (list.dataset.mode === mode) return;
    flip(ctx, flipTargets, () => {
      list.dataset.mode = mode;
    });
    for (const btn of buttons) {
      btn.setAttribute("aria-pressed", btn.dataset.mode === mode ? "true" : "false");
    }
  }
  for (const btn of buttons) {
    btn.addEventListener("click", () => setMode(btn.dataset.mode as "overview" | "index"));
  }

  // --- Hover preview thumb (desktop pointer only) -----------------------
  if (ctx.desktopPointer && !ctx.reducedMotion) {
    const thumb = document.createElement("div");
    thumb.className = "index-nav__thumb";
    thumb.setAttribute("aria-hidden", "true");
    section.appendChild(thumb);

    // One <picture> per campaign, mounted once; hovering swaps visibility
    // (cheaper than rebuilding, and images lazy-load on first paint).
    const pics = new Map(
      rows.map(({ campaign }) => {
        const pic = buildPicture(campaign.images.lead, { sizes: "18vw", className: "index-nav__thumb-pic" });
        pic.style.display = "none";
        thumb.appendChild(pic);
        return [campaign.id, pic] as const;
      })
    );

    let raf = 0;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const followTick = () => {
      // Spring-ish lerp follow (same feel as the services thumb).
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      thumb.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      raf = requestAnimationFrame(followTick);
    };

    section.addEventListener("pointermove", (e) => {
      const rect = section.getBoundingClientRect();
      target.x = e.clientX - rect.left + 24;
      target.y = e.clientY - rect.top - 40;
    });

    for (const { li, campaign } of rows) {
      li.addEventListener("pointerenter", () => {
        for (const [id, pic] of pics) pic.style.display = id === campaign.id ? "block" : "none";
        animate(thumb, { opacity: [0, 1], scale: [0.85, 1] }, { type: "spring", ...springs.follow });
        if (!raf) followTick();
      });
      li.addEventListener("pointerleave", () => {
        animate(thumb, { opacity: 0, scale: 0.85 }, { duration: 0.2 });
      });
    }
  }

  section.append(head, title, list);
  root.appendChild(section);
}

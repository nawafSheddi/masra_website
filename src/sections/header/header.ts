import type { MotionContext } from "../../shared/motion/motion-context";
import { scrollToHash, setScrollLocked } from "../../shared/motion/smooth-scroll";
import { strings } from "../../config/strings";
import { links, navItems } from "../../config/site.config";
import "./header.css";

/**
 * Site header — v3 (client feedback item 1).
 *
 *   [MASRA mark]   About  Work  Services  Clients  Contact   [Start your project →]
 *
 * - Fixed to the top. Transparent over the hero; once the page scrolls it
 *   gains the active palette's background + a hairline (`.is-scrolled`),
 *   so it stays legible over every client palette, light ones included.
 * - Mounted OUTSIDE <main>: the palette takeover only observes main's
 *   sections, so the header never becomes a palette target.
 * - Home page: links jump in-page (Lenis, header-offset aware) and the
 *   link for the section under the viewport centre gets aria-current.
 *   Client pages: links point to "/#<section>" (normal navigation).
 * - Mobile (< 768px): links collapse behind a menu button into a
 *   full-screen panel; the CTA stays in the bar. Escape, a link click or
 *   the button closes it; page scroll is locked while open; links are
 *   `inert` while the panel is closed so keyboard focus can't reach them.
 */

/** Mobile breakpoint — mirrors the media query in header.css. */
const MOBILE_QUERY = "(max-width: 767px)";

/** Scroll distance (px) after which the header takes its solid background. */
const SOLID_AFTER = 40;

export interface HeaderOptions {
  /** True on the home page (in-page anchors); false on client pages. */
  home: boolean;
}

export function initHeader(parent: HTMLElement, _ctx: MotionContext, opts: HeaderOptions): HTMLElement {
  const header = document.createElement("header");
  header.className = "site-header";

  // --- Brand mark → home (top of page on home, "/" elsewhere) -------------
  const home = document.createElement("a");
  home.className = "site-header__home";
  home.href = opts.home ? "#main" : "/";
  home.setAttribute("aria-label", strings.nav.homeLabel);
  const logo = document.createElement("img");
  logo.className = "site-header__logo";
  logo.src = "/images/brand/masra-logo-orange.png";
  logo.alt = ""; // decorative — the link's aria-label names it
  logo.width = 1385; // intrinsic size → no layout shift while it loads
  logo.height = 520;
  home.appendChild(logo);

  // --- Nav links (shared by desktop row + mobile panel) --------------------
  const nav = document.createElement("nav");
  nav.className = "site-header__nav";
  nav.id = "site-nav";
  nav.setAttribute("aria-label", strings.nav.label);
  const list = document.createElement("ul");
  list.className = "site-header__links";
  const navLinks = new Map<string, HTMLAnchorElement>();
  for (const item of navItems) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "site-header__link";
    a.href = opts.home ? `#${item.anchor}` : `/#${item.anchor}`;
    a.textContent = strings.nav[item.label];
    li.appendChild(a);
    list.appendChild(li);
    navLinks.set(item.anchor, a);
  }
  nav.appendChild(list);

  // --- Primary CTA → WhatsApp ---------------------------------------------
  const cta = buildCtaLink(strings.nav.cta);
  cta.classList.add("site-header__cta");

  // --- Mobile menu toggle --------------------------------------------------
  const toggle = document.createElement("button");
  toggle.className = "site-header__toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-controls", nav.id);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", strings.nav.menuOpen);
  // Two bars that morph into an X via CSS when open.
  for (let i = 0; i < 2; i++) {
    const bar = document.createElement("span");
    bar.className = "site-header__bar";
    bar.setAttribute("aria-hidden", "true");
    toggle.appendChild(bar);
  }

  const actions = document.createElement("div");
  actions.className = "site-header__actions";
  actions.append(cta, toggle);

  header.append(home, nav, actions);
  parent.appendChild(header);

  // ---------------------------------------------------------------- menu
  const mobile = window.matchMedia(MOBILE_QUERY);
  let open = false;

  /** Open/close the mobile panel and keep every a11y hook in sync. */
  function setOpen(next: boolean): void {
    open = next;
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? strings.nav.menuClose : strings.nav.menuOpen);
    // Closed panel on mobile = links unreachable by keyboard / AT.
    nav.inert = mobile.matches && !open;
    // Open panel = everything behind it (skip link, <main>) unreachable, so
    // Tab can't wander into content hidden under the full-screen panel.
    for (const sibling of Array.from(parent.children)) {
      if (sibling !== header) (sibling as HTMLElement).inert = open;
    }
    setScrollLocked(open);
    // Opening moves focus to the first link (the toggle sits after the nav
    // in DOM order, so Tab alone would otherwise skip the menu).
    if (open) navLinks.values().next().value?.focus();
  }
  toggle.addEventListener("click", () => setOpen(!open));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Crossing the breakpoint: close an open panel and re-evaluate `inert`.
  // Only touch the scroll lock if the panel was actually open — otherwise a
  // phone rotated during the preloader would unlock scrolling under it.
  mobile.addEventListener("change", () => {
    if (open) setOpen(false);
    nav.inert = mobile.matches;
  });
  nav.inert = mobile.matches;

  // ----------------------------------------------------------- link clicks
  // Home: smooth in-page jump + keep the hash in the URL (shareable).
  // The panel closes first so the scroll lock is released before jumping.
  if (opts.home) {
    const jump = (e: MouseEvent, hash: string) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new-tab clicks
      e.preventDefault();
      if (open) setOpen(false);
      if (!scrollToHash(hash)) return;
      // Keep any query string (e.g. campaign tracking) when updating the URL.
      history.replaceState(null, "", hash === "#main" ? location.pathname + location.search : location.search + hash);
      // Move keyboard focus to the section we jumped to, so the next Tab
      // continues from there (and closing the menu doesn't drop focus on
      // <body>). tabindex=-1 makes a section focusable without adding it to
      // the Tab order; preventScroll leaves the smooth scroll in charge.
      const target = document.getElementById(hash.slice(1));
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    for (const a of navLinks.values()) a.addEventListener("click", (e) => jump(e, a.hash));
    home.addEventListener("click", (e) => jump(e, "#main"));
  } else {
    for (const a of navLinks.values()) a.addEventListener("click", () => open && setOpen(false));
  }

  // ------------------------------------------------- solid-on-scroll state
  let ticking = false;
  const syncSolid = () => {
    ticking = false;
    header.classList.toggle("is-scrolled", window.scrollY > SOLID_AFTER);
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(syncSolid);
      }
    },
    { passive: true }
  );
  syncSolid();

  // ------------------------------------------- active section (home only)
  // A band at the viewport's vertical centre: whichever section crosses it
  // marks its link current. Sections are looked up lazily because the
  // header mounts before them.
  if (opts.home) {
    queueMicrotask(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            for (const [anchor, a] of navLinks) {
              if (anchor === entry.target.id) a.setAttribute("aria-current", "true");
              else a.removeAttribute("aria-current");
            }
          }
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      for (const anchor of navLinks.keys()) {
        const section = document.getElementById(anchor);
        if (section) observer.observe(section);
      }
      // Leaving the tracked sections upward (hero) clears the state.
      const hero = document.getElementById("hero");
      if (hero) {
        new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) for (const a of navLinks.values()) a.removeAttribute("aria-current");
          },
          { rootMargin: "-45% 0px -50% 0px" }
        ).observe(hero);
      }
    });
  }

  return header;
}

/**
 * The "Start your project" WhatsApp button, shared by the header and the
 * contact section so both CTAs stay identical (label, link, a11y text).
 * Opens in a new tab; the accessible name says so.
 */
export function buildCtaLink(label: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.className = "btn btn--cta";
  a.href = links.whatsapp;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", `${label} (${strings.a11y.opensWhatsApp})`);
  const text = document.createElement("span");
  text.textContent = label;
  const arrow = document.createElement("span");
  arrow.className = "btn__arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  a.append(text, arrow);
  return a;
}

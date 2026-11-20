/**
 * Every user-facing string on the site lives here (i18n rule: no hardcoded
 * copy in components). The site ships English-first with Arabic display
 * accents; this single dictionary is the seam where a full Arabic locale
 * would plug in later.
 *
 * Copy voice: confident studio, short declarative lines, camera-room
 * vocabulary in the mono labels. Arabic display strings (mood names,
 * documentary captions) are first-class copy — they render in the brand's
 * Arabic face and are NEVER letter-split by animations (connected script).
 */
export const strings = {
  meta: {
    title: "MASRA Studio — Visual Production & Photography, Riyadh",
    description:
      "MASRA is a Riyadh visual production studio — artistic, lifestyle and menu photography, from concept to final delivery, for 200+ brands since 2023.",
    /* Shorter line used on social share cards (Open Graph). */
    ogDescription:
      "Artistic, lifestyle and menu photography — from concept to final delivery, for 200+ brands since 2023.",
    ogImageAlt: "PETI chocolate packaging photographed in deep red studio light by MASRA",
  },

  /* Typographic glyphs used as decoration between words (arrows are
     hidden from screen readers wherever they appear). */
  glyphs: {
    arrowRight: "→",
    arrowLeft: "←",
    separator: "·",
  },

  a11y: {
    skipToContent: "Skip to content",
    preloaderLabel: "Loading MASRA Studio",
    scrollDown: "Scroll down",
    /* Opens in a new tab — appended to the WhatsApp CTA's accessible name. */
    opensWhatsApp: "opens WhatsApp in a new tab",
  },

  /* ------------------------------------------------------- site header nav */
  /* Order of the links themselves is configured in site.config navItems;
     these are only their labels. */
  nav: {
    label: "Main navigation",
    homeLabel: "MASRA Studio — home",
    about: "About",
    work: "Work",
    services: "Services",
    clients: "Clients",
    contact: "Contact",
    /* Primary call-to-action → WhatsApp (header + contact section). */
    cta: "Start your project",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },

  cursor: {
    view: "VIEW",
  },

  brand: {
    /* Arabic wordmark — rendered whole, never character-split (ligatures). */
    wordmarkAr: "مسرى",
    wordmarkEn: "MASRA",
    studio: "STUDIO",
  },

  hero: {
    eyebrow: "Visual production & photography — Riyadh, KSA",
    line1: "MASRA",
    line2: "STUDIO",
    tagline: "A photography studio for brands with appetite.",
    scrollCue: "Scroll",
  },

  /* ---------------------------------------------------------------- about */
  /* The statement is the client's own definition from their profile
     (feedback item 2), verbatim in English. Split into words at runtime for
     the scroll-highlight effect; *asterisks* mark italic emphasis words. */
  about: {
    eyebrow: "About MASRA",
    statement:
      "A visual production studio focused on the *professional* execution of photography — from concept to final *delivery*.",
    /* Rendered label-above-value so each reads as a phrase: "Brands 200+",
       "Since 2023", "Riyadh, KSA — RUH". "200+" is copy, not a computed
       count (feedback: 23+ → 200+; "7 Color worlds" removed; founded 2023). */
    stats: [
      { value: "200+", label: "Brands" },
      { value: "2023", label: "Since" },
      { value: "RUH", label: "Riyadh, KSA" },
    ],
  },

  /* ----------------------------------------------------------------- work */
  /* Feedback item 3: three categories replace "Seven Moods". Category
     membership is set per client in src/content/clients/<id>.yaml. */
  work: {
    eyebrow: "Our work",
    title: "WORK",
    tabsLabel: "Filter work by category",
    tabs: { all: "All", artistic: "Artistic", lifestyle: "Lifestyle", menu: "Menu" },
    /* Card meta line + client-page intro use these singular labels. */
    categoryLabel: {
      artistic: "Artistic photography",
      lifestyle: "Lifestyle photography",
      menu: "Menu photography",
    },
    viewProject: "View project",
  },

  /* ----------------------------------------------------------- client page */
  clientPage: {
    back: "All work",
    next: "Next project",
    /* Appended to the client name for document.title. */
    titleSuffix: " — MASRA Studio",
    /* Page-not-found (any unknown URL). */
    notFoundTitle: "Page not found",
    notFoundBody: "That page doesn't exist (or moved). Browse all of our work instead.",
    notFoundLink: "See all work",
  },

  /* ------------------------------------------------------------- services */
  /* Section labels only — the services themselves (names, descriptions,
     hover photos) live in src/content/services.yaml. */
  services: {
    eyebrow: "What we do",
    title: "SERVICES",
  },

  /* ----------------------------------------------------- featured clients */
  /* Section labels only — the logo wall itself lives in
     src/content/featured-clients.yaml. */
  clients: {
    eyebrow: "Trusted by",
    title: "Featured clients",
    /* Headline count is copy, decoupled from the grid's length (24 shown,
       200+ served). */
    count: "200+",
    countLabel: "brands and counting",
  },

  /* -------------------------------------------------------------- contact */
  /* Feedback item 6: headline + one clear WhatsApp CTA + email + Instagram. */
  contact: {
    eyebrow: "New project?",
    title: "Let's work on your project.",
    cta: "Start your project",
    links: {
      email: { label: "Email", value: "info@wemasra.com" },
      instagram: { label: "Instagram", value: "@wemasra" },
    },
    /* Click-to-copy affordance on the email link. */
    copyHint: "Click to copy",
    copied: "Copied",
    /* Subject line prefilled when someone clicks the email link. */
    emailSubject: "Project inquiry — MASRA Studio",
    /* Prefilled WhatsApp message (URL-encoded in site.config.ts). */
    whatsappPrefill: "Hi MASRA — I'd like to start a project.",
    footerNote: "Riyadh, Saudi Arabia",
    copyright: "© 2026 MASRA Studio. All rights reserved.",
  },
  /* The hero photo (top of the home page). Client photos carry their alt
     text in their own file under src/content/clients/. */
  heroImage: {
    slug: "peti-hero",
    alt: "PETI chocolate boxes stacked in deep red studio light",
  },
} as const;

export type Strings = typeof strings;

/**
 * Every user-facing string on the site lives here (i18n rule: no hardcoded
 * copy in components). The site ships English-only today, but this single
 * dictionary is the seam where an Arabic locale would plug in later.
 *
 * Copy voice: confident studio, short declarative lines, camera-room
 * vocabulary in the mono labels. The Arabic wordmark "مسرى" is brand
 * artwork, not translatable copy.
 */
export const strings = {
  meta: {
    title: "MASRA Studio — Food & Product Photography, Riyadh",
    description:
      "MASRA is a Riyadh photography studio making food and products look the way they taste. Photography, videography, food styling and art direction for 23+ brands.",
    ogImageAlt: "PETI chocolate packaging photographed in deep red studio light by MASRA",
  },

  a11y: {
    skipToContent: "Skip to content",
    preloaderLabel: "Loading MASRA Studio",
    scrollDown: "Scroll down",
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
    eyebrow: "Food & product photography — Riyadh, KSA",
    line1: "MASRA",
    line2: "STUDIO",
    tagline: "A photography studio for brands with appetite.",
    scrollCue: "Scroll",
  },

  manifesto: {
    eyebrow: "The studio",
    /* Split into words at runtime for the scroll-highlight effect. */
    statement:
      "We make food look the way it tastes. Light, shadow, and a stubborn obsession with the details people feel before they notice.",
    stats: [
      { value: "23+", label: "Brands shot" },
      { value: "6", label: "Disciplines" },
      { value: "RUH", label: "Riyadh, KSA" },
    ],
  },

  work: {
    eyebrow: "Selected work",
    title: "CASES",
    cases: {
      peti: {
        index: "Case 01",
        name: "PETI",
        tags: ["Art direction", "Photography", "Packaging"],
        description:
          "A chocolate house dressed in crimson. We built the set the color of the box and let the light do the tasting.",
      },
      idmi: {
        index: "Case 02",
        name: "IDMI Coffee Roasters",
        tags: ["Product photography", "Styling"],
        description:
          "Tumblers, hard light and a gazelle. Product frames with the energy of a first morning roast.",
        stripLabel: "Drag through the roast", // shown under the film-strip
      },
      levo: {
        index: "Case 03",
        name: "LEVO",
        tags: ["Still life", "Food styling", "Art direction"],
        description:
          "Cakes staged like Dutch paintings — candelabras, moss and all. Still life that refuses to sit still.",
        plateTitle: "Still life, moving.",
      },
    },
  },

  services: {
    eyebrow: "What we do",
    title: "SERVICES",
    /* Order matches site.config.serviceThumbs — six disciplines from the
       current masra.sa site, carried over verbatim. */
    items: [
      "Photography",
      "Videography",
      "Phone Photography",
      "Food Styling",
      "Art Direction",
      "Graphic Design",
    ],
  },

  clients: {
    eyebrow: "Trusted by",
    countUpSuffix: "+ brands",
    /* All 23 client names from the current site. Arabic names render RTL
       inside the marquee rows — never split or reversed. */
    names: [
      "1/2 M",
      "La Bonte",
      "Mamola",
      "بيت الشاورما",
      "عنوان القهوة",
      "IDMI",
      "Jan Burger",
      "Nua",
      "Ronalo's Pizza",
      "4 Twins",
      "Bloss",
      "Cayk",
      "Jayla",
      "Sedar",
      "Let's Pizza",
      "LEVO",
      "The Chefz",
      "Musa & Palm",
      "Bab",
      "Chok",
      "Qishtya",
      "Shawrma Albalad",
      "Ablaze",
    ],
  },

  contact: {
    eyebrow: "New project?",
    title: "LET'S",
    titleAccent: "SHOOT.",
    links: {
      whatsapp: { label: "WhatsApp", value: "+966 53 626 7188" },
      email: { label: "Email", value: "info@wemasra.com" },
      instagram: { label: "Instagram", value: "@wemasra" },
    },
    /* Prefilled WhatsApp message (URL-encoded in site.config.ts). */
    whatsappPrefill: "Hi MASRA — I'd like to talk about a shoot.",
    footerNote: "Riyadh, Saudi Arabia",
    copyright: "© 2026 MASRA Studio. All rights reserved.",
  },

  /* Alt text per image slug (manifest carries geometry, this carries meaning). */
  imageAlt: {
    "peti-hero": "PETI chocolate boxes stacked in deep red studio light",
    "peti-lead": "PETI packaging arranged on a crimson set with hard shadows",
    "peti-grid-1": "Tower of PETI chocolate biscuits on peach seamless",
    "peti-grid-2": "White-gloved hand placing a chocolate onto a red PETI box",
    "peti-grid-3": "Magenta PETI gift box in warm directional light",
    "peti-wide": "Wide still life of PETI biscuits and packaging in warm light",
    "idmi-strip-1": "IDMI Coffee Roasters tumblers leaning against a concrete wall",
    "idmi-strip-2": "Colorful IDMI travel tumbler under hard daylight",
    "idmi-strip-3": "Three IDMI tumblers with gazelle artwork in pastel colors",
    "idmi-strip-4": "IDMI tumbler product frame with sharp midday shadow",
    "idmi-strip-5": "Macro texture frame from the IDMI roastery shoot",
    "levo-centerpiece": "Candlelit dessert table staged like a baroque painting for LEVO",
    "levo-grid-1": "White LEVO cake with berries surrounded by lit taper candles",
    "levo-grid-2": "LEVO chocolate petals plated with a stamped chocolate coin",
    "levo-grid-3": "Hand lifting a tart from a mint LEVO box of desserts",
    "levo-accent": "Detail of a LEVO cake against a painterly backdrop",
  },
} as const;

export type Strings = typeof strings;

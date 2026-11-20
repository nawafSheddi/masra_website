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
    ogImageAlt: "PETI chocolate packaging photographed in deep red studio light by MASRA",
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
     membership is configured per campaign in campaigns.config.ts. */
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
    notFoundTitle: "Project not found",
    notFoundBody: "That project doesn't exist (or moved). Browse all of our work instead.",
    notFoundLink: "See all work",
  },

  /* ------------------------------------------------------------- chapters */
  /* One entry per campaign (client). `name` is the client brand shown on
     Work cards and its /work/<id> page; tags + description form that page's
     intro. Copy only — structure (category, layout, images, palette hooks)
     lives in campaigns.config.ts. */
  chapters: {
    peti: {
      name: "PETI",
      tags: ["Art direction", "Photography", "Packaging"],
      description:
        "A chocolate house dressed in crimson. White gloves, one spotlight, and gift boxes that arrive like theatre.",
    },
    idmi: {
      name: "IDMI",
      tags: ["Product photography", "Styling"],
      description:
        "Coffee at the black end of the light. Steam, crema, and the first pour of the day held mid-air.",
      stripLabel: "Drag through the roast",
    },
    labonte: {
      name: "La Bonté",
      tags: ["Still life", "Food styling", "Art direction"],
      description:
        "Cakes staged like Dutch paintings — candelabras, moss and all. Still life that refuses to sit still.",
      plateTitle: "Still life, moving.",
    },
    mamola: {
      name: "Mamola",
      nameAr: "مامولا",
      tags: ["Photography", "Art direction", "Styling"],
      description:
        "Chocolate on a picnic blanket. Mangoes, pool water, and the sun doing half the styling.",
    },
    shaya: {
      name: "Shaya",
      nameAr: "شايا",
      tags: ["Stop motion", "Photography", "Packaging"],
      description:
        "A tea house in stop motion. Tins, petals, and shadows that move one frame at a time.",
      /* Label ticking beside the scroll-scrubbed canvas, e.g. "F 012 / 068". */
      frameCounterPrefix: "F",
      scrubHint: "Scroll to steep",
    },
    riyadh: {
      name: "Riyadh",
      nameAr: "الرياض",
      tags: ["Photography", "Packaging"],
      description:
        "Kunafa rolled tight and boxed like jewellery. Golden threads photographed in golden hour.",
    },
    maqsoud: {
      name: "Maqsoud",
      nameAr: "مقصود",
      tags: ["Documentary", "Editorial"],
      description:
        "A broast house that has fed its street for decades. We left the strobes at the studio and photographed it the way it is: striped ceilings, pomegranate juice, lunch rush.",
      /* Photo-essay captions, Arabic-first (this chapter reads right-to-left
         emotionally too). Index order matches maqsoud-essay-1..7. */
      leadCaptionAr: "المحل عند الظهر — عصير الرمان جاهز",
      leadCaptionEn: "The counter at noon, pomegranate juice standing ready.",
      captions: [
        { ar: "الشاورما على النار", en: "Shawarma turning against the flame." },
        { ar: "الكراسي تنتظر الزبائن", en: "Chairs waiting for the lunch crowd." },
        { ar: "مكينة العصير القديمة", en: "The old juice machine, still working." },
        { ar: "بطاطس على ورق", en: "Fries on paper, straight from the fryer." },
        { ar: "الصبة الأولى", en: "First wraps of the shift." },
        { ar: "التسليم باليد", en: "Handed over, not plated." },
        { ar: "الغداء كما يجب", en: "Lunch, the way it should be." },
      ],
    },
  },

  /* ------------------------------------------------------------- services */
  /* Feedback item 4: a standalone services section where each service says
     what it includes. The six names come from the company profile.
     DRAFT — the descriptions are proposals pending the client's approval of
     the final services list (they asked to sign it off before it goes live). */
  services: {
    eyebrow: "What we do",
    title: "SERVICES",
    items: [
      {
        name: "Photography",
        description:
          "Product, food and campaign shoots — concept, lighting, styling on set and fully retouched finals.",
      },
      {
        name: "Videography",
        description:
          "Short-form video and stop motion for launches, reels and ads — from storyboard to final edit.",
      },
      {
        name: "Phone Photography",
        description:
          "Fast, native-feeling content shot on phone for social channels, delivered ready to post.",
      },
      {
        name: "Food Styling",
        description:
          "Dishes and products prepared and styled for the camera so every frame looks the way it tastes.",
      },
      {
        name: "Art Direction",
        description:
          "Moodboards, set design, props and color direction that keep a shoot on-brand from first frame to last.",
      },
      {
        name: "Graphic Design",
        description:
          "Menu layouts, social templates and campaign graphics built around your photography.",
      },
    ],
  },

  /* ----------------------------------------------------- featured clients */
  /* Feedback item 5. The roster itself (names, order, logo files) lives in
     clients.config.ts so it can be updated without touching copy. */
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
  /* Alt text per video asset (mirrors imageAlt for the loop posters too). */
  videoAlt: {
    "shaya-loop-1": "Stop-motion loop: tea pouring from a glass teapot beside a lit candle",
    "shaya-loop-2": "Stop-motion loop: loose tea leaves circling a red cup of tea",
    "shaya-seq": "Stop-motion sequence: Shaya lemon tea box and two glasses under moving shadows",
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
    "labonte-centerpiece": "Candlelit dessert table staged like a baroque painting for La Bonté",
    "labonte-grid-1": "White La Bonté cake with berries surrounded by lit taper candles",
    "labonte-grid-2": "La Bonté chocolate petals plated with a stamped chocolate coin",
    "labonte-grid-3": "Hand lifting a tart from a mint La Bonté box of desserts",
    "labonte-accent": "Detail of a La Bonté cake against a painterly backdrop",
    "mamola-lead": "Pink Mamola tub of chocolates on a pool edge above turquoise water",
    "mamola-frame-1": "Top-down basket of mangoes on a yellow picnic blanket",
    "mamola-frame-2": "Macro of Mamola chocolate balls, one cut open showing the filling",
    "mamola-frame-3": "Hands opening a blue illustrated Mamola tin at a garden picnic",
    "mamola-frame-4": "Slice of cream cake beside the pool with mango cubes",
    "mamola-frame-5": "Basket of mangoes held above the grass, photographed from above",
    "mamola-frame-6": "Hand reaching into a tub of Mamola chocolates on a striped towel",
    "shaya-lead": "Grid of Shaya green-tea tins on gold, one open with loose leaves",
    "shaya-frame-1": "Tea bag dripping over a glass cup of deep red Shaya tea",
    "shaya-frame-2": "Amber Shaya tea pouring into a glass cup",
    "shaya-frame-3": "Four colorful Shaya teas photographed top-down with long shadows",
    "shaya-frame-4": "Hand lifting a sachet from a Shaya tea discovery box",
    "shaya-frame-5": "Portrait hidden behind an open green Shaya tea menu",
    "shaya-frame-6": "Macro cup of steeping Shaya green tea leaves",
    "shaya-wide": "Shaya gift box interior with tins, scoop and flower jar in low light",
    "riyadh-lead": "Open black Riyadh box of kunafa rolls in a strip of sunlight",
    "riyadh-frame-1": "Hands holding kunafa rolls over a small wooden mortar",
    "riyadh-frame-2": "Kunafa roll broken open showing the cream filling",
    "riyadh-frame-3": "Kunafa rolls in a diagonal row on deep cocoa brown",
    "riyadh-frame-4": "Two kunafa rolls staged on an acrylic riser in hard light",
    "maqsoud-lead": "Maqsoud counter with juice machine, oranges and pomegranates at noon",
    "maqsoud-essay-1": "Chicken shawarma turning against the flame at Maqsoud",
    "maqsoud-essay-2": "Empty Maqsoud dining room with yellow chairs and striped ceiling",
    "maqsoud-essay-3": "Vintage pomegranate slush machine churning at Maqsoud",
    "maqsoud-essay-4": "Fries on paper handed over in front of the shawarma flame",
    "maqsoud-essay-5": "Cooks in orange caps building wraps on the griddle",
    "maqsoud-essay-6": "A wrapped shawarma handed across the Maqsoud counter",
    "maqsoud-essay-7": "Hands with a shawarma wrap and juice at a Maqsoud table",
  },
} as const;

export type Strings = typeof strings;

/** Every image slug the site can render — adding a CURATED entry without
 *  alt text is a type error before it is a runtime error. */
export type ImageSlug = keyof Strings["imageAlt"];

/** Loop ids (poster + <video> sources in video-manifest.json). */
export type VideoId = Exclude<keyof Strings["videoAlt"], "shaya-seq">;

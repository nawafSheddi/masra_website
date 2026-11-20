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
    title: "MASRA Studio — Food & Product Photography, Riyadh",
    description:
      "MASRA is a Riyadh photography studio making food and products look the way they taste. Seven campaigns, seven moods — photography, stop motion, food styling and art direction for 23+ brands.",
    ogImageAlt: "PETI chocolate packaging photographed in deep red studio light by MASRA",
  },

  a11y: {
    skipToContent: "Skip to content",
    preloaderLabel: "Loading MASRA Studio",
    scrollDown: "Scroll down",
    chapterListLabel: "Campaign chapters",
    indexToggleLabel: "Switch between overview and index view",
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
    /* v2 concept line — bilingual pair rendered side by side. */
    moods: "Seven moods",
    moodsAr: "سبعة أمزجة",
    scrollCue: "Scroll",
  },

  manifesto: {
    eyebrow: "The studio",
    /* Split into words at runtime for the scroll-highlight effect.
       Words wrapped in *asterisks* render in the italic emphasis style. */
    statement:
      "We make food look the way it *tastes*. Light, shadow, and a stubborn obsession with the details people *feel* before they notice.",
    stats: [
      { value: "23+", label: "Brands shot" },
      { value: "7", label: "Color worlds" },
      { value: "RUH", label: "Riyadh, KSA" },
    ],
  },

  /* ------------------------------------------------------------- chapters */
  /* One entry per campaign. `mood` / `moodAr` are the giant bilingual
     chapter titles; `name` is the client brand. Copy only — structure
     (layout, images, palette hooks) lives in campaigns.config.ts. */
  chapters: {
    peti: {
      name: "PETI",
      mood: "Crimson",
      moodAr: "قِرمِزي",
      tags: ["Art direction", "Photography", "Packaging"],
      description:
        "A chocolate house dressed in crimson. White gloves, one spotlight, and gift boxes that arrive like theatre.",
    },
    idmi: {
      name: "IDMI",
      mood: "Roast",
      moodAr: "مُحَمَّص",
      tags: ["Product photography", "Styling"],
      description:
        "Coffee at the black end of the light. Steam, crema, and the first pour of the day held mid-air.",
      stripLabel: "Drag through the roast",
    },
    labonte: {
      name: "La Bonté",
      mood: "Candlelight",
      moodAr: "ضَوء الشُّموع",
      tags: ["Still life", "Food styling", "Art direction"],
      description:
        "Cakes staged like Dutch paintings — candelabras, moss and all. Still life that refuses to sit still.",
      plateTitle: "Still life, moving.",
    },
    mamola: {
      name: "Mamola",
      nameAr: "مامولا",
      mood: "Picnic",
      moodAr: "نُزهَة",
      tags: ["Photography", "Art direction", "Styling"],
      description:
        "Chocolate on a picnic blanket. Mangoes, pool water, and the sun doing half the styling.",
    },
    shaya: {
      name: "Shaya",
      nameAr: "شايا",
      mood: "Steeped",
      moodAr: "مَنقوع",
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
      mood: "Golden",
      moodAr: "ذَهَبي",
      tags: ["Photography", "Packaging"],
      description:
        "Kunafa rolled tight and boxed like jewellery. Golden threads photographed in golden hour.",
    },
    maqsoud: {
      name: "Maqsoud",
      nameAr: "مقصود",
      mood: "The Old Quarter",
      moodAr: "الدِّيرَة",
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

  /* ------------------------------------------------- index / overview nav */
  indexNav: {
    eyebrow: "Selected work",
    title: "SEVEN",
    titleAccent: "MOODS",
    titleAr: "سبعة أمزجة",
    toggle: { overview: "Overview", index: "Index" },
    headers: { index: "No.", name: "Brand", mood: "Mood", year: "Year", frames: "Frames" },
    /* Screen-reader hint on each row. */
    rowHint: "Scroll to chapter",
  },

  /* -------------------------------------------------- production numbers */
  numbers: {
    eyebrow: "Production log",
    stats: [
      { value: 7, suffix: "", label: "Campaigns" },
      { value: 45, suffix: "", label: "Frames published" },
      { value: 23, suffix: "+", label: "Brands served" },
      { value: 68, suffix: "", label: "Stop-motion frames" },
    ],
    /* Single marquee row — camera-room vocabulary. */
    marquee: ["Photography", "Stop motion", "Styling", "Art direction", "Retouch", "Riyadh"],
  },

  services: {
    eyebrow: "What we do",
    title: "SERVICES",
    /* Order matches the hover-thumb assignment in services.ts — six
       disciplines from the current masra.sa site, carried over verbatim. */
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
    /* Click-to-copy affordance on the email link. */
    copyHint: "Click to copy",
    copied: "Copied",
    /* Prefilled WhatsApp message (URL-encoded in site.config.ts). */
    whatsappPrefill: "Hi MASRA — I'd like to talk about a shoot.",
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

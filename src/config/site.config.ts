import { strings } from "./strings";

/**
 * Site-level configuration: external links, section order, and the mapping
 * of image slugs to layout slots. Changing which photo appears where — or
 * reordering sections — happens here, never inside section code.
 */

/** Contact endpoints assembled from strings (single source for numbers). */
export const links = {
  whatsapp: `https://wa.me/966536267188?text=${encodeURIComponent(strings.contact.whatsappPrefill)}`,
  email: `mailto:info@wemasra.com?subject=${encodeURIComponent("Shoot inquiry — MASRA Studio")}`,
  instagram: "https://instagram.com/wemasra",
} as const;

/** Sections mount in this order inside <main>. The preloader overlays
 *  everything and is not part of the document flow. */
export const sectionOrder = [
  "hero",
  "manifesto",
  "work",
  "services",
  "clients",
  "contact",
] as const;

export type SectionName = (typeof sectionOrder)[number];

/** Image slug → layout slot assignments per section. */
export const imageRoles = {
  hero: { panel: "peti-hero" },
  peti: {
    lead: "peti-lead",
    grid: ["peti-grid-1", "peti-grid-2", "peti-grid-3"],
    wide: "peti-wide",
  },
  idmi: {
    strip: ["idmi-strip-1", "idmi-strip-2", "idmi-strip-3", "idmi-strip-4", "idmi-strip-5"],
  },
  levo: {
    centerpiece: "levo-centerpiece",
    grid: ["levo-grid-1", "levo-grid-2", "levo-grid-3"],
    accent: "levo-accent",
  },
} as const;

/** Service row → hover-thumbnail slug (desktop hover preview). Order matches
 *  strings.services.items. */
export const serviceThumbs = [
  "peti-lead", // Photography
  "levo-centerpiece", // Videography
  "idmi-strip-1", // Phone Photography
  "levo-grid-2", // Food Styling
  "peti-grid-2", // Art Direction
  "idmi-strip-3", // Graphic Design
] as const;

import { strings, type ImageSlug } from "./strings";

/**
 * Site-level configuration: external links, section order, and the few
 * image assignments that don't belong to a campaign (services hover
 * thumbs). Campaign structure lives in campaigns.config.ts.
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
  "indexNav",
  "chapters",
  "numbers",
  "services",
  "clients",
  "contact",
] as const;

export type SectionName = (typeof sectionOrder)[number];

/** Service row → hover-thumbnail slug (desktop hover preview). Order matches
 *  strings.services.items; one lead frame per campaign keeps every mood
 *  represented in the services list. */
export const serviceThumbs: readonly ImageSlug[] = [
  "peti-lead", // Photography
  "shaya-lead", // Videography (the stop-motion campaign)
  "maqsoud-lead", // Phone Photography (the documentary register)
  "labonte-centerpiece", // Food Styling
  "mamola-lead", // Art Direction
  "riyadh-lead", // Graphic Design
] as const;

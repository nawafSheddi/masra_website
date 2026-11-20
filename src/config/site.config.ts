import { strings, type ImageSlug } from "./strings";

/**
 * Site-level configuration: external links, section order, header nav,
 * and the few image assignments that don't belong to a campaign (services
 * hover thumbs). Campaign structure lives in campaigns.config.ts; the
 * featured-clients roster lives in clients.config.ts.
 */

/** Contact endpoints assembled from strings (single source for numbers). */
export const links = {
  /* "Start your project" CTA (header + contact) — WhatsApp deep link with a
     prefilled message. */
  whatsapp: `https://wa.me/966536267188?text=${encodeURIComponent(strings.contact.whatsappPrefill)}`,
  email: `mailto:info@wemasra.com?subject=${encodeURIComponent(strings.contact.emailSubject)}`,
  instagram: "https://instagram.com/wemasra",
} as const;

/** Home-page sections mount in this order inside <main>. The header sits
 *  outside <main>; the preloader overlays everything and is not part of
 *  the document flow. Feedback order: About → Work → Services → Clients →
 *  Contact. */
export const sectionOrder = ["hero", "about", "work", "services", "clients", "contact"] as const;

export type SectionName = (typeof sectionOrder)[number];

/** Section ids the header can link to (each is also the section's DOM id). */
export type NavAnchor = Exclude<SectionName, "hero">;

/** Header nav, left → right. `label` keys into strings.nav. Reordering or
 *  hiding a link is a change here only. */
export const navItems: ReadonlyArray<{ anchor: NavAnchor; label: keyof typeof strings.nav }> = [
  { anchor: "about", label: "about" },
  { anchor: "work", label: "work" },
  { anchor: "services", label: "services" },
  { anchor: "clients", label: "clients" },
  { anchor: "contact", label: "contact" },
];

/** Service row → hover-thumbnail slug (desktop hover preview). Order matches
 *  strings.services.items; one lead frame per campaign keeps the whole
 *  portfolio represented in the services list. */
export const serviceThumbs: readonly ImageSlug[] = [
  "peti-lead", // Photography
  "shaya-lead", // Videography (the stop-motion campaign)
  "maqsoud-lead", // Phone Photography (the documentary register)
  "labonte-centerpiece", // Food Styling
  "mamola-lead", // Art Direction
  "riyadh-lead", // Graphic Design
] as const;

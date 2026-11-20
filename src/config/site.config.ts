import { strings } from "./strings";

/**
 * Site-level configuration: contact links, home section order, header nav.
 *
 * Content (clients, services, logo wall) lives in src/content/; copy lives
 * in strings.ts. This file only wires things together.
 */

/** Contact details — change the number / address / handle here. */
export const contact = {
  /** WhatsApp number in international format, digits only. */
  whatsappNumber: "966536267188",
  email: "info@wemasra.com",
  instagramHandle: "wemasra",
} as const;

/** Outgoing links assembled from `contact` + strings (prefilled messages). */
export const links = {
  /* "Start your project" CTA (header + contact) — WhatsApp deep link with a
     prefilled message. */
  whatsapp: `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(strings.contact.whatsappPrefill)}`,
  email: `mailto:${contact.email}?subject=${encodeURIComponent(strings.contact.emailSubject)}`,
  instagram: `https://instagram.com/${contact.instagramHandle}`,
} as const;

/** Home-page sections in display order (each is also the section's id).
 *  The hero always comes first. Reordering = reordering this list. */
export const sectionOrder = ["hero", "about", "work", "services", "clients", "contact"] as const;

export type SectionName = (typeof sectionOrder)[number];

/** Section ids the header can link to. */
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

/** Number of cells in the featured-clients logo wall. 24 fills every row
 *  at 6, 4 and 3 columns; the build fails with a clear message otherwise. */
export const LOGO_WALL_SIZE = 24;

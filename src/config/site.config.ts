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

/** Every home section that exists (each name is also the section's id). */
export type SectionName = "hero" | "about" | "work" | "services" | "clients" | "contact";

/** Home-page sections in display order. Reorder this list to reorder the
 *  page; delete a name to hide that section (its header link hides too). */
export const sectionOrder: readonly SectionName[] = ["hero", "about", "work", "services", "clients", "contact"];

/** Section ids the header can link to. */
export type NavAnchor = Exclude<SectionName, "hero">;

/** Header nav, left → right. `label` keys into strings.nav. Links to a
 *  section that's not in sectionOrder are left out automatically. */
export const navItems: ReadonlyArray<{ anchor: NavAnchor; label: keyof typeof strings.nav }> = [
  { anchor: "about", label: "about" },
  { anchor: "work", label: "work" },
  { anchor: "services", label: "services" },
  { anchor: "clients", label: "clients" },
  { anchor: "contact", label: "contact" },
];

/** Browser-bar color on pages without a client palette. Must match
 *  --color-bg in src/styles/tokens.css (a <meta> tag can't read CSS
 *  variables). */
export const BASE_THEME_COLOR = "#0b0a09";

/** Number of cells in the featured-clients logo wall. 24 fills every row
 *  at 6, 4 and 3 columns; the build fails with a clear message otherwise. */
export const LOGO_WALL_SIZE = 24;

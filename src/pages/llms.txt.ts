/**
 * /llms.txt — a plain-text summary of the site for AI assistants, generated
 * at build time from the content (so a new client appears automatically).
 */
import type { APIRoute } from "astro";
import { getClients, getServices } from "../shared/content/clients";
import { contact, links } from "../config/site.config";
import { strings } from "../config/strings";

// Machine-readable summary for AI crawlers (not shown to visitors); its
// headings are part of the llms.txt format, not site copy.
export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://masra.sa")).origin;
  const clients = await getClients();
  const services = await getServices();
  const lines = [
    "# MASRA Studio",
    "",
    `> ${strings.meta.description}`,
    "",
    `Services: ${services.map((s) => s.data.name).join(", ")}.`,
    "",
    "## Site",
    "",
    `- [Home](${base}/): about, work (by category), services, featured clients and contact`,
    ...clients.map(
      (c) =>
        `- [${c.data.name}](${base}/work/${c.id}): ${strings.work.categoryLabel[c.data.category]}, ${c.data.year}. ${c.data.description}`
    ),
    `- [Start a project via WhatsApp](https://wa.me/${contact.whatsappNumber}): new project inquiries`,
    `- [Instagram](${links.instagram}): latest work`,
    "",
    "## Contact",
    "",
    `- Email: ${contact.email}`,
    `- Location: ${strings.contact.footerNote}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

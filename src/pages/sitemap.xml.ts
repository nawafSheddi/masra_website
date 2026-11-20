/**
 * /sitemap.xml — every public page, generated at build time from the
 * content (new client pages are included automatically).
 */
import type { APIRoute } from "astro";
import { getClients } from "../shared/content/clients";

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://masra.sa")).origin;
  const urls = ["/", ...(await getClients()).map((c) => `/work/${c.id}`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

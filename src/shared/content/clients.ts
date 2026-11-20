import { getCollection, type CollectionEntry } from "astro:content";
import { LOGO_WALL_SIZE } from "../../config/site.config";
import { nextIndex, paletteCss } from "./clients-pure";

/**
 * Build-time access to the content collections, in display order.
 * Pages and sections call these instead of getCollection() directly, so
 * ordering and validation rules live in one place.
 */

export type Client = CollectionEntry<"clients">;

/** All clients, sorted by `order` (Work grid + "Next project" order). */
export async function getClients(): Promise<Client[]> {
  const all = await getCollection("clients");
  const sorted = all.sort((a, b) => a.data.order - b.data.order);
  // Two clients with the same `order` would make "Next project" ambiguous.
  const seen = new Map<number, string>();
  for (const c of sorted) {
    const clash = seen.get(c.data.order);
    if (clash) {
      throw new Error(
        `Clients "${clash}" and "${c.id}" both have order: ${c.data.order}. ` +
          `Give each client a different order number (src/content/clients/).`
      );
    }
    seen.set(c.data.order, c.id);
  }
  return sorted;
}

/** The client after `id` in Work order (wraps from last to first). */
export function nextClient(clients: Client[], id: string): Client {
  return clients[nextIndex(clients.map((c) => c.id), id)];
}

/** CSS rule that maps a client's palette onto the live --chapter-* roles
 *  (consumed everywhere through tokens; see styles/chapters.css). */
export function clientPaletteCss(client: Client): string {
  return paletteCss(client.id, client.data.palette);
}

/** Services, in file order. */
export async function getServices() {
  return (await getCollection("services")).sort((a, b) => a.data.position - b.data.position);
}

/** The logo wall. Fails the build with a clear message if it isn't
 *  exactly LOGO_WALL_SIZE entries (rows would be left half-empty). */
export async function getFeaturedClients() {
  const wall = (await getCollection("featuredClients")).sort((a, b) => a.data.position - b.data.position);
  if (wall.length !== LOGO_WALL_SIZE) {
    throw new Error(
      `src/content/featured-clients.yaml has ${wall.length} entries; it must have exactly ` +
        `${LOGO_WALL_SIZE} (so every row of the logo wall is full). Add or remove lines.`
    );
  }
  return wall;
}

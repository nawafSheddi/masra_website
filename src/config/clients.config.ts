/**
 * Featured clients — the logo wall roster (v3, client feedback item 5).
 *
 * ┌──────────────────────────── HOW TO UPDATE ────────────────────────────┐
 * │ Replace / add a logo:                                                 │
 * │   1. Drop the file in public/images/clients/<slug>.svg                │
 * │      (SVG preferred; else a transparent PNG/WebP ≈ 400px wide,        │
 * │      trimmed tight to the artwork — no extra padding).                │
 * │   2. Set `logo: "/images/clients/<slug>.svg"` on that client's line.  │
 * │   No code changes. A missing/broken file falls back to the name.      │
 * │ Reorder: move lines. Remove/add a client: delete/add a line.          │
 * │ Keep exactly 24 entries (fills every row at 6 / 4 / 3 columns) —     │
 * │ `npx pnpm test` enforces it, plus "Work clients first".               │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * Logo sources (where each file came from, confidence, and the clients
 * still missing a logo) are recorded in assets/logos-staging/SOURCES.md
 * (local, git-ignored). Only transparent, high-confidence files are wired
 * in; ask the client for vector logos to fill the rest.
 *
 * Brand names are proper nouns (data), not translatable UI copy, so they
 * live here rather than in strings.ts. Arabic names render RTL
 * automatically. Import-free so the co-located test runs under node --test.
 */

export interface FeaturedClient {
  /** Lowercase slug — unique; also the logo filename stem. */
  slug: string;
  /** Display name — shown as the text wordmark until a logo exists, and
   *  used as the logo's alt text. */
  name: string;
  /** Public path to the logo file, or undefined → text wordmark. */
  logo?: string;
}

export const featuredClients: readonly FeaturedClient[] = [
  // --- The seven clients shown in Work (always first, Work order) --------
  { slug: "peti", name: "PETI" },
  { slug: "idmi", name: "IDMI", logo: "/images/clients/idmi.webp" },
  { slug: "labonte", name: "La Bonté" },
  { slug: "mamola", name: "Mamola" },
  { slug: "shaya", name: "Shaya" },
  { slug: "riyadh", name: "Riyadh" },
  { slug: "maqsoud", name: "Maqsoud" },
  // --- 17 more from the studio's client list ------------------------------
  { slug: "half-million", name: "1/2 M", logo: "/images/clients/half-million.svg" },
  { slug: "beit-alshawarma", name: "بيت الشاورما", logo: "/images/clients/beit-alshawarma.webp" },
  { slug: "unwan-alqahwa", name: "عنوان القهوة" },
  { slug: "jan-burger", name: "Jan Burger" },
  { slug: "nua", name: "Nua" },
  { slug: "ronalos-pizza", name: "Ronalo's Pizza" },
  { slug: "4-twins", name: "4 Twins" },
  { slug: "bloss", name: "Bloss" },
  { slug: "cayk", name: "Cayk" },
  { slug: "jayla", name: "Jayla" },
  { slug: "sedar", name: "Sedar" },
  { slug: "lets-pizza", name: "Let's Pizza" },
  { slug: "levo", name: "LEVO" },
  { slug: "the-chefz", name: "The Chefz" },
  { slug: "musa-palm", name: "Musa & Palm", logo: "/images/clients/musa-palm.svg" },
  { slug: "bab", name: "Bab" },
  { slug: "chok", name: "Chok" },
  // Not shown (24-cell limit): Qishtya, Shawrma Albalad, Ablaze — swap any
  // of them in for a line above when a logo arrives.
];

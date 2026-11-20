import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { parse as parseYaml } from "yaml";
import { hasImage } from "./shared/media/media";
import { MIN_TEXT_CONTRAST, contrastRatio } from "./shared/content/clients-pure";
import videoManifest from "./generated/video-manifest.json";

/**
 * Content schemas — the rules every content file must follow.
 *
 * If a content file breaks a rule, `npx pnpm check` / `npx pnpm build`
 * stops with a plain-English message naming the file and the field.
 * That's the safety net that lets anyone (or any AI agent) edit content
 * without touching code.
 *
 *   src/content/clients/<id>.yaml   one file per client (= one /work/<id> page)
 *   src/content/services.yaml       the services list on the home page
 *   src/content/featured-clients.yaml  the 24-cell logo wall
 */

// --------------------------------------------------------------- building blocks

/** An image slug that must exist in the optimized-image manifest. */
const imageSlug = z
  .string()
  .refine(hasImage, {
    error: (issue) =>
      `Image "${String(issue.input)}" doesn't exist yet. Import the photo first: ` +
      `npx pnpm media:add --client <id> --file <path-to-photo>`,
  });

/** A bilingual caption (documentary layout). Arabic is rendered first. */
const caption = z.object({
  ar: z.string().min(1),
  en: z.string().min(1),
});

/** One photo on a client page: which image + what it shows (alt text). */
const photo = z.object({
  image: imageSlug,
  alt: z.string().min(3, { error: "Every photo needs alt text describing what it shows." }),
  /** Only used by the "documentary" layout. */
  caption: caption.optional(),
});

/** A #rrggbb color. */
const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { error: 'Colors must be 6-digit hex values like "#1a0507".' });

/** A looping video id from src/generated/video-manifest.json. */
const loopId = z.enum(Object.keys(videoManifest.loops) as [string, ...string[]]);

/** How long a pinned gallery holds the screen, in screen-heights. Long
 *  runways made scrolling feel slow (client feedback) — keep ≤ 2.5. */
const sceneHeight = z.number().min(1).max(2.5);

/**
 * Gallery layouts. Each client page shows its photos in one of these
 * bespoke layouts (the look + motion). `type` picks the layout; some
 * layouts take extra settings. Photo-count rules are checked below.
 *
 *   theatrical   spotlight stage: lead + 3 photos drifting around it
 *   strip        horizontal film strip that scrolls sideways
 *   stilllife    lead zooms like a painting, then a row of details rises
 *   picnic       scattered photos drifting at different speeds (light look)
 *   scrub        stop-motion canvas scrubbed by scroll + 2 video loops
 *   gift         quiet, centered, lots of space (light look)
 *   documentary  flowing photo essay with Arabic + English captions
 */
const layout = z.discriminatedUnion("type", [
  z.object({ type: z.literal("theatrical"), sceneHeight: sceneHeight.default(2) }),
  z.object({
    type: z.literal("strip"),
    sceneHeight: sceneHeight.default(2),
    /** Small caption under the strip, e.g. "Drag through the roast". */
    label: z.string().min(1),
  }),
  z.object({ type: z.literal("stilllife"), sceneHeight: sceneHeight.default(2) }),
  z.object({ type: z.literal("picnic"), sceneHeight: sceneHeight.default(2) }),
  z.object({
    type: z.literal("scrub"),
    sceneHeight: sceneHeight.default(2.5),
    /** The scroll-scrubbed frame sequence (folder under public/images/<client>/seq). */
    sequence: z.object({
      id: z.literal("shaya"),
      alt: z.string().min(3),
    }),
    /** Two short looping videos shown beside the canvas. */
    loops: z
      .array(z.object({ video: loopId, alt: z.string().min(3) }))
      .length(2, { error: "The scrub layout shows exactly 2 video loops." }),
    /** Frame counter prefix, e.g. "F" → "F 012 / 068". */
    counterPrefix: z.string().default("F"),
    /** Hint under the canvas, e.g. "Scroll to steep". */
    hint: z.string().min(1),
  }),
  z.object({ type: z.literal("gift"), sceneHeight: sceneHeight.default(1.5) }),
  z.object({ type: z.literal("documentary") }),
]);

/** Minimum number of `frames` each layout needs to look right. */
export const MIN_FRAMES: Record<z.infer<typeof layout>["type"], number> = {
  theatrical: 3,
  strip: 3,
  stilllife: 2,
  picnic: 3,
  scrub: 3,
  gift: 2,
  documentary: 2,
};

// ------------------------------------------------------------------- clients

const clients = defineCollection({
  // The file name (without .yaml) is the client id and its URL: /work/<id>.
  loader: glob({ pattern: "*.yaml", base: "./src/content/clients" }),
  schema: z
    .object({
      /** Brand name as shown on the site. */
      name: z.string().min(1),
      /** Arabic brand name (optional, shown as an accent). */
      nameAr: z.string().optional(),
      /** Position on the Work grid and in "Next project" order (1 = first). */
      order: z.number().int().min(1),
      /** Work tab this client appears under. */
      category: z.enum(["artistic", "lifestyle", "menu"]),
      /** Year of the shoot, shown as "Artistic photography · 2025". */
      year: z.string().regex(/^\d{4}$/, { error: 'Year must look like "2025".' }),
      /** Short tags under the name, e.g. ["Photography", "Packaging"]. */
      tags: z.array(z.string().min(1)).min(1).max(5),
      /** One or two sentences introducing the project. */
      description: z.string().min(10),
      /** The page's color world (see README → palette system). */
      palette: z.object({
        bg: hex,
        bgElevated: hex,
        ink: hex,
        inkDim: hex,
        accent: hex,
      }),
      /** The main photo: Work card, top of the gallery, share card. */
      lead: photo,
      /** The rest of the gallery, in order. */
      frames: z.array(photo).min(1),
      layout,
    })
    .superRefine((client, ctx) => {
      // Text must stay readable on the page background.
      const darkBg = contrastRatio(client.palette.bg, "#ffffff") > contrastRatio(client.palette.bg, "#000000");
      for (const role of ["ink", "inkDim"] as const) {
        const ratio = contrastRatio(client.palette[role], client.palette.bg);
        if (ratio < MIN_TEXT_CONTRAST) {
          ctx.addIssue({
            code: "custom",
            path: ["palette", role],
            message:
              `palette.${role} is too close to palette.bg (contrast ${ratio.toFixed(1)}:1, needs ` +
              `${MIN_TEXT_CONTRAST}:1). Make it ${darkBg ? "lighter" : "darker"}.`,
          });
        }
      }
      const min = MIN_FRAMES[client.layout.type];
      if (client.frames.length < min) {
        ctx.addIssue({
          code: "custom",
          path: ["frames"],
          message: `The "${client.layout.type}" layout needs at least ${min} frames (has ${client.frames.length}).`,
        });
      }
      if (client.layout.type === "documentary") {
        const all = [client.lead, ...client.frames];
        all.forEach((p, i) => {
          if (!p.caption) {
            ctx.addIssue({
              code: "custom",
              path: i === 0 ? ["lead", "caption"] : ["frames", i - 1, "caption"],
              message: 'The "documentary" layout needs a caption (ar + en) on every photo.',
            });
          }
        });
      }
    }),
});

// ------------------------------------------------------------- list files

/**
 * Read a YAML list file and remember each entry's position, so the page
 * shows entries in the same order as the file (Astro otherwise sorts
 * entries by id). `position` is added automatically — never write it.
 */
function orderedList(path: string) {
  return file(path, {
    parser: (text) =>
      (parseYaml(text) as Record<string, unknown>[]).map((entry, position) => ({ ...entry, position })),
  });
}

// ------------------------------------------------------------------ services

const services = defineCollection({
  // A list in one file; each entry needs a unique `id`. Order on the page
  // = order in the file.
  loader: orderedList("src/content/services.yaml"),
  schema: z.object({
    /** Added by the loader (file order). */
    position: z.number(),
    name: z.string().min(1),
    /** One line: what the service includes. */
    description: z.string().min(10),
    /** Photo previewed when hovering this row (desktop). */
    thumb: imageSlug,
  }),
});

// ---------------------------------------------------------- featured clients

const featuredClients = defineCollection({
  // The logo wall. Must stay exactly 24 entries (fills every row at 6, 4
  // and 3 columns) — enforced where the wall renders.
  loader: orderedList("src/content/featured-clients.yaml"),
  schema: z.object({
    /** Added by the loader (file order). */
    position: z.number(),
    /** Brand name: shown as text until a logo exists; logo alt text. */
    name: z.string().min(1),
    /** Logo file under public/images/clients/ (SVG preferred), or omit. */
    logo: z
      .string()
      .regex(/^\/images\/clients\/[\w.-]+\.(svg|png|webp)$/, {
        error: 'Logo must be a file path like "/images/clients/idmi.svg".',
      })
      .optional(),
  }),
});

export const collections = { clients, services, featuredClients };

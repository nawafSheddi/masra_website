import videoManifest from "../../generated/video-manifest.json";

/**
 * Scroll-scrubbed stop-motion frame sequence.
 *
 * Instead of seeking a <video> (keyframe-dependent, janky in Firefox), the
 * stop-motion clip ships as a WebP frame sequence (scripts/optimize-videos)
 * painted onto a <canvas>. Frame-stepping IS the stop-motion aesthetic, so
 * a discrete scrub looks intentional rather than choppy.
 *
 * Loading strategy: nothing is fetched until prefetch() is called (the
 * layout triggers it ~one viewport before the chapter arrives). Frames
 * decode independently; setProgress() always paints the nearest LOADED
 * frame at-or-below the target so a partially-loaded sequence still scrubs
 * coherently instead of flashing gaps.
 */

type SequenceId = keyof typeof videoManifest.sequences;

interface SequenceEntry {
  dir: string;
  pattern: string;
  frameCount: number;
  width: number;
  height: number;
  aspect: number;
}

export interface FrameSequence {
  /** Aspect-boxed canvas element, ready to place in a layout. */
  el: HTMLCanvasElement;
  frameCount: number;
  /** Begin fetching + decoding all frames (idempotent). */
  prefetch(): void;
  /** Paint the frame for a 0→1 progress value. Returns the frame index painted. */
  setProgress(p: number): number;
}

/** Frame URL for a 1-based index, e.g. dir/f-014.webp. */
function frameUrl(entry: SequenceEntry, index1: number): string {
  return `${entry.dir}/${entry.pattern.replace("%03d", String(index1).padStart(3, "0"))}`;
}

export function createFrameSequence(id: SequenceId): FrameSequence {
  const entry = (videoManifest.sequences as Record<string, SequenceEntry>)[id];

  const canvas = document.createElement("canvas");
  canvas.className = "frame-seq";
  // Intrinsic buffer at asset size — CSS scales the element; devicePixelRatio
  // beyond the asset's own resolution buys nothing.
  canvas.width = entry.width;
  canvas.height = entry.height;
  canvas.style.aspectRatio = `${entry.width} / ${entry.height}`;
  const ctx2d = canvas.getContext("2d")!;

  const images: (HTMLImageElement | null)[] = new Array(entry.frameCount).fill(null);
  const loaded: boolean[] = new Array(entry.frameCount).fill(false);
  let started = false;
  let paintedIndex = -1;
  let lastProgress = 0; // remembered so late-decoding frames can catch up

  function paint(index0: number): void {
    const img = images[index0];
    if (!img || !loaded[index0] || paintedIndex === index0) return;
    ctx2d.drawImage(img, 0, 0, entry.width, entry.height);
    paintedIndex = index0;
  }

  function prefetch(): void {
    if (started) return;
    started = true;
    for (let i = 0; i < entry.frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(entry, i + 1);
      img
        .decode()
        .then(() => {
          loaded[i] = true;
          // Catch up to wherever the scroll already is — without this, a
          // user who parks mid-runway while frames stream in would stare
          // at frame 1 until their next scroll event.
          setProgress(lastProgress);
        })
        .catch(() => {
          /* a missing frame is skipped by the nearest-loaded search */
        });
      images[i] = img;
    }
  }

  function setProgress(p: number): number {
    lastProgress = p;
    const target = Math.round(Math.min(1, Math.max(0, p)) * (entry.frameCount - 1));
    // Nearest loaded frame at-or-below target, else the first loaded above.
    for (let i = target; i >= 0; i--) if (loaded[i]) { paint(i); return i; }
    for (let i = target + 1; i < entry.frameCount; i++) if (loaded[i]) { paint(i); return i; }
    return paintedIndex;
  }

  return { el: canvas, frameCount: entry.frameCount, prefetch, setProgress };
}

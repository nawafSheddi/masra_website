/**
 * One media command at a time.
 *
 * media-add / media-remove read the image manifest, write image files, and
 * write the manifest back. Two running at once (AI agents like to run
 * commands in parallel) would pick the same new image name and one photo
 * would silently overwrite the other. A lock file makes the second run stop
 * with a plain message instead. A lock older than 10 minutes is treated as
 * left over from a crashed run and replaced.
 */
import { closeSync, openSync, rmSync, statSync } from "node:fs";

const STALE_MS = 10 * 60 * 1000;

/** Take the lock or exit with a message. Released automatically on exit. */
export function acquireMediaLock(lockPath) {
  const take = () => closeSync(openSync(lockPath, "wx"));
  try {
    take();
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
    let stale = false;
    try {
      stale = Date.now() - statSync(lockPath).mtimeMs > STALE_MS;
    } catch {
      stale = true; // vanished between the two calls
    }
    if (!stale) {
      console.error(
        "\n✗ Another media command is running. Import photos one at a time: wait for it to finish, then run this again.\n"
      );
      process.exit(1);
    }
    rmSync(lockPath, { force: true });
    take();
  }
  process.on("exit", () => rmSync(lockPath, { force: true }));
}

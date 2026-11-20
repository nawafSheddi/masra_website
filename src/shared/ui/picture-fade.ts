/**
 * Blur-up fade for server-rendered <Picture> images.
 *
 * Each <img data-fade> starts transparent over its blur placeholder (CSS in
 * base.css, only while JS runs — see BaseLayout's head script) and fades in
 * once its pixels are decoded. Images that finished loading before this
 * script ran are shown immediately.
 */
export function initPictureFades(root: ParentNode = document): void {
  for (const img of root.querySelectorAll<HTMLImageElement>("img[data-fade]")) {
    const show = () => img.classList.add("is-loaded");
    if (img.complete) show();
    else {
      img.addEventListener("load", show, { once: true });
      // A broken image should not stay invisible forever.
      img.addEventListener("error", show, { once: true });
    }
  }
}

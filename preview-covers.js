// @ts-check
// Wider covers near the top of the library get card-sized WebP variants.
// The original PNGs remain the fallback and are still used in detail views.
export const responsiveCovers = new Set([
  "./assets/previews/block-antd-search.png",
  "./assets/previews/block-magicui-bento-grid.png",
  "./assets/previews/block-shadcn-dashboard-01.png",
  "./assets/previews/block-shadcn-sidebar-07.png",
  "./assets/previews/component-antd-table.png",
  "./assets/previews/component-fluent-data-grid.png",
  "./assets/previews/component-fluent-dialog.png",
  "./assets/previews/component-fluent-toast.png",
]);

export const coverWidths = [480, 960];

/** @param {string} png @param {number} width */
export const coverThumbnail = (png, width) =>
  png.replace(/\.png$/, `-${width}.webp`);

/** @param {string} png */
export const coverSrcset = (png) =>
  coverWidths
    .map((width) => `${coverThumbnail(png, width)} ${width}w`)
    .join(", ");

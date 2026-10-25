import { expect } from "@playwright/test";

// Check actual content geometry as well as the document: overflow:hidden alone
// must never hide the bottom controls or turn a cropped canvas into a passing fit.
export async function expectViewerContained(page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const viewer = document
          .querySelector(".experience-viewer")
          .getBoundingClientRect();
        const bottom = document
          .querySelector(".market-preview-bottom")
          .getBoundingClientRect();
        return Math.max(
          document.documentElement.scrollHeight - innerHeight,
          document.documentElement.scrollWidth - innerWidth,
          viewer.bottom - innerHeight,
          -viewer.top,
          bottom.bottom - innerHeight,
          -bottom.top,
        );
      }),
    )
    .toBeLessThanOrEqual(1);
  await expect
    .poll(() =>
      page.locator("#preview-viewport").evaluate((e) => e.clientHeight),
    )
    .toBeGreaterThan(80);
  expect(
    (await page.locator(".market-preview-bottom").boundingBox()).height,
  ).toBeGreaterThanOrEqual(36);
}

export async function expectCanvasContained(page) {
  await expect
    .poll(() =>
      page.locator("#case-preview").evaluate((frame) => {
        const box = frame.getBoundingClientRect();
        const stage = document
          .querySelector("#preview-viewport")
          .getBoundingClientRect();
        return Math.max(
          box.right - stage.right,
          stage.left - box.left,
          box.bottom - stage.bottom,
          stage.top - box.top,
        );
      }),
    )
    .toBeLessThanOrEqual(1);
}

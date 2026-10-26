import { chromium, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function createNativeZoomBrowser({
  baseURL,
  width = 1910,
  height = 873,
  executablePath,
} = {}) {
  const profile = await mkdtemp(path.join(tmpdir(), "atlas-native-zoom-test-"));
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, {
      ...(executablePath ? { executablePath } : { channel: "chromium" }),
      headless: true,
      viewport: null,
      baseURL,
      // Playwright hides scrollbars by default in headless mode. These tests
      // must retain real gutters to expose zoom/rounding feedback loops.
      ignoreDefaultArgs: ["--hide-scrollbars"],
      args: [
        `--window-size=${width},${height}`,
        "--disable-features=OverlayScrollbar",
      ],
    });
    const settings = await context.newPage();
    await settings.goto(
      executablePath
        ? "edge://settings/appearance"
        : "chrome://settings/appearance",
    );
    await settings.waitForFunction(
      () => typeof chrome.settingsPrivate?.setDefaultZoom === "function",
    );
    return {
      context,
      async setZoom(factor, page) {
        // The browser's own settings API changes native page zoom (and DPR),
        // rather than pinch emulation, CSS zoom or just viewport dimensions.
        await settings.evaluate(
          (zoom) =>
            new Promise((resolve) =>
              chrome.settingsPrivate.setDefaultZoom(zoom, resolve),
            ),
          factor,
        );
        if (page) {
          await page.bringToFront();
          await expect
            .poll(() => page.evaluate(() => devicePixelRatio))
            .toBeCloseTo(factor, 4);
        }
      },
      async close() {
        await context.close();
        await rm(profile, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await context?.close();
    await rm(profile, { recursive: true, force: true });
    throw error;
  }
}

export async function recordStableZoom(page, frames = 40) {
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator("#case-preview")
    .evaluate((f) => f.contentDocument.fonts.ready);
  return page.locator("#case-preview").evaluate(async (frame, count) => {
    for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
    const doc = frame.contentDocument,
      viewport = document.querySelector("#preview-viewport"),
      root = doc.querySelector("#root, #preview-root") || doc.body;
    const grid = doc.querySelector(".demo-surface > div > .grid");
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height];
    };
    let resizes = 0;
    const resized = () => resizes++;
    frame.contentWindow.addEventListener("resize", resized);
    const samples = [];
    try {
      for (let i = 0; i < count; i++) {
        await new Promise(requestAnimationFrame);
        samples.push({
          viewport: rect(viewport),
          frame: rect(frame),
          root: rect(root),
          cards: grid ? [...grid.children].map(rect) : [],
          viewportWidth: viewport.clientWidth,
          viewportHeight: viewport.clientHeight,
          scrollWidth: viewport.scrollWidth,
          scrollHeight: viewport.scrollHeight,
          scroll: [
            viewport.scrollLeft,
            viewport.scrollTop,
            frame.contentWindow.scrollX,
            frame.contentWindow.scrollY,
          ],
          innerWidth: frame.contentWindow.innerWidth,
          innerHeight: frame.contentWindow.innerHeight,
        });
      }
    } finally {
      frame.contentWindow.removeEventListener("resize", resized);
    }
    return {
      resizes,
      samples,
      dpr: devicePixelRatio,
      innerScrollbar:
        frame.contentWindow.innerWidth - doc.documentElement.clientWidth,
      sameDocument: frame.contentDocument === doc,
    };
  }, frames);
}

export function expectStableZoom(result, fitted = true) {
  expect(result.sameDocument).toBe(true);
  expect(result.resizes).toBe(0);
  expect(result.samples.length).toBeGreaterThan(20);
  for (const sample of result.samples) {
    expect(sample).toEqual(result.samples[0]);
    if (fitted) {
      expect(sample.scrollWidth).toBe(sample.viewportWidth);
      expect(sample.scrollHeight).toBe(sample.viewportHeight);
      const [x, y, width, height] = sample.frame,
        [vx, vy, vw, vh] = sample.viewport;
      expect(x).toBeGreaterThanOrEqual(vx - 0.1);
      expect(y).toBeGreaterThanOrEqual(vy - 0.1);
      expect(x + width).toBeLessThanOrEqual(vx + vw + 0.1);
      expect(y + height).toBeLessThanOrEqual(vy + vh + 0.1);
    }
  }
}

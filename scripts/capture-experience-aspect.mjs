import { chromium, expect } from "@playwright/test";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";

const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4173/ui-design-atlas/";
const out = new URL("../docs/ui/experience-aspect/", import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [],
  errors = [];
async function capture(page, name) {
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  // Let the archived chart's entrance animation finish before taking evidence.
  await page.waitForTimeout(700);
  const geometry = await page.locator("#case-preview").evaluate((frame) => {
    const stage = document.querySelector("#preview-viewport");
    return {
      native: { width: frame.clientWidth, height: frame.clientHeight },
      displayed: frame.getBoundingClientRect().toJSON(),
      stage: stage.getBoundingClientRect().toJSON(),
      overflow: [
        stage.scrollWidth - stage.clientWidth,
        stage.scrollHeight - stage.clientHeight,
      ],
    };
  });
  expect(geometry.displayed.width / geometry.displayed.height).toBeCloseTo(
    geometry.native.width / geometry.native.height,
    4,
  );
  expect(Math.max(...geometry.overflow)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: new URL(name + ".png", out).pathname });
  results.push({ name, url: page.url(), geometry });
}
try {
  for (const [width, height, colorScheme, lang] of [
    [2560, 1000, "dark", "zh-CN"],
    [1440, 900, "light", "en"],
    [1440, 600, "dark", "zh-CN"],
    [768, 1024, "light", "en"],
    [375, 812, "dark", "zh-CN"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme,
      hasTouch: width < 1024,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}#page/shadcn-admin-dashboard?lang=${lang}`);
    await capture(page, `after-${width}${height === 600 ? "-short" : ""}`);
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    recordVideo: { dir: out.pathname, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}#blocks?lang=en`);
  await page
    .locator('.asset-cover-link[data-open="block:magicui-bento-grid"]')
    .click();
  await capture(page, "block-original-ratio");
  await page.locator("[data-fullscreen]").click();
  await capture(page, "fullscreen");
  await page.evaluate(() => document.exitFullscreen());
  await page.locator('[data-device="375"]').click();
  await capture(page, "phone-device");
  await page.locator('[data-device="0"]').click();
  await page.locator(".experience-actions [data-toggle-details]").click();
  await capture(page, "details");
  await page.locator(".inspector-close").click();
  await page.goto(`${base}#component/fluent-dialog?lang=en`);
  const demo = page.frameLocator("#case-preview");
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await capture(page, "dialog");
  await demo.getByRole("button", { name: "Close", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeHidden();
  const video = page.video();
  await context.close();
  await rename(await video.path(), new URL("interaction.webm", out));
  expect(errors).toEqual([]);
  const hashes = {};
  for (const name of ["app.js", "market.css"])
    hashes[name] = createHash("sha256")
      .update(await readFile(new URL("../dist/" + name, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL("verification.json", out),
    JSON.stringify({ base, hashes, results, errors }, null, 2) + "\n",
  );
} finally {
  await browser.close();
}

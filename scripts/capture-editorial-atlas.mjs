import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createNativeZoomBrowser } from "../tests/native-zoom.mjs";

const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4174/ui-design-atlas/";
const output = new URL("../docs/ui/editorial-atlas/", import.meta.url);
await mkdir(output, { recursive: true });
const routes = [
  ["home", "", ".asset-card"],
  ["library", "explore", ".asset-card"],
  [
    "detail",
    "component/magicui-border-beam?panel=details",
    "#inspector .detail-section",
  ],
  ["guidance", "guidance", ".guidance-card"],
  ["composer", "compose", ".composer-group"],
  ["directory", "tools", ".guidance-card"],
  ["saved", "favorites", ".market-empty"],
];
const errors = [],
  samples = [],
  zoomSamples = [];
const browser = await chromium.launch();
async function visit(page, route, lang, ready) {
  await page.goto(
    base + "#" + route + (route.includes("?") ? "&" : "?") + "lang=" + lang,
  );
  await expect(page.locator(ready).first()).toBeVisible();
  if (route.startsWith("component/"))
    await expect(page.locator(".viewer-load-state")).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
}
try {
  for (const width of [1440, 1024, 768, 390]) {
    for (const lang of ["zh-CN", "en"]) {
      for (const colorScheme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme,
          reducedMotion: lang === "en" ? "reduce" : "no-preference",
        });
        const page = await context.newPage();
        page.on("pageerror", (e) => errors.push(e.message));
        for (const [name, route, ready] of routes) {
          await visit(page, route, lang, ready);
          const metrics = await page.evaluate(() => ({
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            titleSize: parseFloat(
              getComputedStyle(document.querySelector("#main h1")).fontSize,
            ),
          }));
          expect(
            metrics.scrollWidth,
            `${name}/${width}/${lang}/${colorScheme}`,
          ).toBeLessThanOrEqual(metrics.width);
          samples.push({ name, width, lang, colorScheme, ...metrics });
          if (
            ["home", "library", "detail", "guidance", "composer"].includes(
              name,
            ) &&
            ((lang === "zh-CN" && colorScheme === "light" && width === 1440) ||
              (lang === "en" && colorScheme === "dark" && width === 390))
          ) {
            await page.waitForTimeout(600);
            await page.screenshot({
              path: new URL(
                `after-${name}${width === 390 ? "-mobile-dark" : ""}.png`,
                output,
              ).pathname,
            });
          }
        }
        await context.close();
      }
    }
    console.log(
      `Verified ${width}px: both languages and themes across seven pages`,
    );
  }
} finally {
  await browser.close();
}
const native = await createNativeZoomBrowser({
  baseURL: base,
  width: 1440,
  height: 1000,
});
try {
  const page = await native.context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  for (const factor of [1.1, 1.25]) {
    await page.goto(base);
    await native.setZoom(factor, page);
    for (const [name, route, ready] of routes.slice(0, 5)) {
      await visit(page, route, "zh-CN", ready);
      const measurements = await page.evaluate(() => ({
        dpr: devicePixelRatio,
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(measurements.dpr).toBeCloseTo(factor, 4);
      expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.width);
      if (name === "detail") {
        const frame = page.locator("#case-preview");
        const before = await frame.boundingBox();
        await page.locator("[data-toggle-details]").first().click();
        expect(await frame.boundingBox()).toEqual(before);
      }
      zoomSamples.push({ name, factor, ...measurements });
    }
  }
} finally {
  await native.close();
}
expect(errors).toEqual([]);
const hash = createHash("sha256");
const dist = new URL("../dist/", import.meta.url);
const buildFiles = (await readdir(dist, { recursive: true }))
  .filter(
    (file) =>
      /^[^/]+\.(js|css|html)$/.test(file) ||
      /^atlas\/styles\/.*\.css$/.test(file),
  )
  .sort();
for (const file of buildFiles)
  hash.update(file).update(await readFile(new URL(file, dist)));
await writeFile(
  new URL("acceptance.json", output),
  JSON.stringify(
    {
      buildHash: hash.digest("hex"),
      buildFiles,
      viewportCases: samples.length,
      samples,
      zoomSamples,
      errors,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Saved ${samples.length} viewport checks, ${zoomSamples.length} native zoom checks and ten screenshots.`,
);

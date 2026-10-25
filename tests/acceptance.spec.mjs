import { test, expect } from "@playwright/test";
import { gzipSync } from "node:zlib";
import {
  expectViewerContained,
  expectCanvasContained,
} from "./viewer-assertions.mjs";

test("Responsive acceptance records bilingual light/dark canvases and screenshots", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const metrics = [];
  for (const [width, height] of [
    [375, 600],
    [768, 700],
    [1440, 655],
    [1910, 873],
  ])
    for (const lang of ["en", "zh-CN"])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(
          `./?audit=${width}-${lang}-${theme}#case/shadcn-admin?lang=${lang}&theme=${theme}`,
        );
        await expect(page.locator(".viewer-load-state")).toBeHidden();
        await expectViewerContained(page);
        await expectCanvasContained(page);
        const sample = await page.locator("#case-preview").evaluate((frame) => {
          const stage = document.querySelector("#preview-viewport"),
            box = frame.getBoundingClientRect();
          return {
            stageWidth: stage.clientWidth,
            stageHeight: stage.clientHeight,
            renderedWidth: box.width,
            renderedHeight: box.height,
            nativeWidth: frame.contentWindow.innerWidth,
            nativeHeight: frame.contentWindow.innerHeight,
            pageHeight: document.documentElement.scrollHeight,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        expect(sample.overflow).toBe(false);
        expect(sample.nativeWidth).toBe(sample.stageWidth);
        expect(sample.renderedWidth).toBe(sample.stageWidth);
        expect(sample.nativeHeight).toBe(sample.stageHeight);
        expect(sample.renderedHeight).toBe(sample.stageHeight);
        expect(sample.pageHeight).toBeLessThanOrEqual(height + 1);
        metrics.push({ width, height, lang, theme, ...sample });
        await page.waitForTimeout(1600);
        await info.attach(`preview-${width}-${lang}-${theme}.png`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
        await page.goto(`#explore?lang=${lang}&category=forms`);
        await expect(page.locator(".asset-card").first()).toBeVisible();
        await page.locator("[data-advanced-filters]").click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await info.attach(`facets-${width}-${lang}-${theme}.png`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });
      }
  await info.attach("responsive-metrics.json", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
});

test("Startup budget measures every main-document script and records iframe scripts separately", async ({
  page,
}, info) => {
  const records = [],
    pending = [];
  page.on("response", (response) => {
    if (response.request().resourceType() !== "script") return;
    pending.push(
      (async () => {
        const bytes = await response.body();
        records.push({
          url: new URL(response.url()).pathname,
          main: response.frame() === page.mainFrame(),
          bytes: bytes.length,
          gzip: gzipSync(bytes).length,
        });
      })(),
    );
  });
  await page.goto("#explore?lang=en");
  await expect(
    page.locator("[data-preview-state=ready]").first(),
  ).toBeVisible();
  await page.waitForTimeout(250);
  await Promise.all(pending);
  const main = records.filter((r) => r.main),
    iframe = records.filter((r) => !r.main);
  expect(main.some((r) => /source-code|components-/.test(r.url))).toBe(false);
  const startupGzip = main.reduce((sum, r) => sum + r.gzip, 0);
  expect(startupGzip).toBeLessThanOrEqual(190000);
  await info.attach("network-budget.json", {
    body: JSON.stringify(
      {
        startupGzip,
        main,
        iframe,
        iframeGzip: iframe.reduce((sum, r) => sum + r.gzip, 0),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

import { test, expect } from "@playwright/test";
import {
  expectViewerContained,
  expectCanvasContained,
} from "./viewer-assertions.mjs";

test("Screenshot case and short windows fit the whole viewer with a responsive page canvas", async ({
  page,
}, info) => {
  const samples = [];
  for (const [width, height] of [
    [1910, 873],
    [1440, 655],
    [1440, 600],
    [1273, 582],
    [1024, 500],
  ]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(
      `./?fit=${width}-${height}#case/shadcn-admin?lang=zh-CN&theme=dark&page=notifications`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expectViewerContained(page);
    await expectCanvasContained(page);
    const sample = await page.locator("#case-preview").evaluate((frame) => {
      const box = frame.getBoundingClientRect();
      const stage = document
        .querySelector("#preview-viewport")
        .getBoundingClientRect();
      return {
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        pageHeight: document.documentElement.scrollHeight,
        frameWidth: box.width,
        nativeWidth: frame.contentWindow.innerWidth,
        nativeHeight: frame.contentWindow.innerHeight,
        frameHeight: box.height,
        stageWidth: stage.width,
        stageHeight: stage.height,
        bottom: document
          .querySelector(".market-preview-bottom")
          .getBoundingClientRect().bottom,
      };
    });
    expect(sample.frameWidth).toBe(sample.stageWidth);
    expect(sample.frameHeight).toBe(sample.stageHeight);
    expect(sample.nativeWidth).toBe(sample.stageWidth);
    expect(sample.nativeHeight).toBe(sample.stageHeight);
    expect(
      Math.min(
        sample.stageWidth - sample.frameWidth,
        sample.stageHeight - sample.frameHeight,
      ),
    ).toBeLessThanOrEqual(1);
    await page.locator("#topbar").hover();
    await page.mouse.wheel(0, 1500);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    samples.push(sample);
    await info.attach(`fit-${width}-${height}.png`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  }
  await info.attach("viewport-fit-metrics.json", {
    body: JSON.stringify(samples, null, 2),
    contentType: "application/json",
  });
});

test("Phone content, notes and source scroll inside the fitted viewer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 600 });
  await page.goto("#case/shadcn-admin?lang=en&page=notifications");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await expectViewerContained(page);
  await expectCanvasContained(page);
  const demo = page.frameLocator("#case-preview");
  await demo
    .getByRole("button", { name: "Update notifications", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator("#case-preview")
        .evaluate(
          (frame) =>
            JSON.parse(
              frame.contentWindow.localStorage.getItem(
                "atlas:shadcn-admin:v1:notifications",
              ) || "null",
            )?.type,
        ),
    )
    .toBe("all");
  expect(
    await page
      .locator("#case-preview")
      .evaluate((frame) =>
        [...frame.contentDocument.querySelectorAll("*")].some(
          (el) => el.scrollTop > 0,
        ),
      ),
  ).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator(".experience-actions [data-toggle-details]").click();
  await expect(page.locator("#inspector")).toBeVisible();
  await page.locator("#inspector").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(
    await page.locator("#inspector").evaluate((el) => el.scrollTop),
  ).toBeGreaterThan(0);
  await page.locator(".inspector-close").click();
  await expectViewerContained(page);
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toBeVisible();
  await page.locator("#full-code").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(
    await page.locator("#full-code").evaluate((el) => el.scrollTop),
  ).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
  const code = await page.locator("#full-code").boundingBox();
  expect(code.y + code.height).toBeLessThanOrEqual(600);
  await page.locator("[data-tab=notes]").click();
  await expectViewerContained(page);
  await expectCanvasContained(page);
});

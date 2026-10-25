import { test, expect } from "@playwright/test";
import {
  expectViewerContained,
  expectCanvasContained,
  expectResponsiveCanvas,
} from "./viewer-assertions.mjs";

async function metrics(page) {
  return page.locator("#case-preview").evaluate((frame) => {
    const viewport = document.querySelector("#preview-viewport");
    const box = frame.getBoundingClientRect();
    const stage = viewport.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      nativeWidth: frame.contentWindow.innerWidth,
      nativeHeight: frame.contentWindow.innerHeight,
      stageWidth: stage.width,
      stageHeight: stage.height,
      horizontalInset: box.x - stage.x,
      verticalInset: box.y - stage.y,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
}

test("Component details use native pixels and retain their document when notes toggle", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (r) => {
    if (r.isNavigationRequest() && r.frame() !== page.mainFrame()) requests++;
  });
  for (const id of ["folio-button", "folio-card", "folio-form", "antd-form"]) {
    await page.goto(`#component/${id}?lang=en`);
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    const initial = await metrics(page);
    await expectResponsiveCanvas(page);
    expect(initial.nativeWidth).toBe(initial.stageWidth);
    expect(initial.nativeHeight).toBe(initial.stageHeight);
    await expectViewerContained(page);
    await expectCanvasContained(page);
    await expect(page.locator("#preview-scale")).toHaveText("100%");
    await page.locator("#case-preview").evaluate((frame) => {
      window.originalFrame = frame;
      window.originalDoc = frame.contentDocument;
    });
    if (id === "folio-form")
      await page
        .frameLocator("#case-preview")
        .locator("input[type=email]")
        .fill("detail@example.com");
    const before = requests;
    for (const open of [true, false]) {
      await page.locator(".experience-actions [data-toggle-details]").click();
      await expect(page.locator(".experience-viewer")).toHaveAttribute(
        "data-details-open",
        String(open),
      );
      await expectResponsiveCanvas(page);
      const current = await metrics(page);
      expect(current.height).toBe(current.stageHeight);
      expect(current.stageHeight).toBe(initial.stageHeight);
      await expectViewerContained(page);
      await expectCanvasContained(page);
      expect(Math.abs(current.horizontalInset)).toBeLessThanOrEqual(1);
      expect(
        await page
          .locator("#case-preview")
          .evaluate(
            (frame) =>
              frame === window.originalFrame &&
              frame.contentDocument === window.originalDoc,
          ),
      ).toBe(true);
      if (open) {
        expect(
          (await page.locator("#inspector").boundingBox()).width,
        ).toBeLessThanOrEqual(360);
        await page.locator("#inspector").evaluate((panel) => {
          panel.scrollTop = panel.scrollHeight;
        });
        expect(
          await page
            .locator("#inspector")
            .evaluate(
              (panel) =>
                panel.scrollHeight <= panel.clientHeight || panel.scrollTop > 0,
            ),
        ).toBe(true);
      }
    }
    if (id === "folio-form")
      await expect(
        page.frameLocator("#case-preview").locator("input[type=email]"),
      ).toHaveValue("detail@example.com");
    expect(requests - before).toBe(0);
  }
});

test("Native component sizing survives devices, fullscreen, theme and real interactions", async ({
  page,
}) => {
  await page.goto("#component/fluent-dialog?lang=en");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await page.locator("[data-fullscreen]").click();
  await expect(page.locator("#preview-panel:fullscreen")).toBeVisible();
  await expectResponsiveCanvas(page);
  await page
    .frameLocator("#case-preview")
    .getByRole("button", { name: "Open dialog", exact: true })
    .click();
  await expect(
    page.frameLocator("#case-preview").getByRole("dialog"),
  ).toBeVisible();
  await page
    .frameLocator("#case-preview")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.evaluate(() => document.exitFullscreen());
  await page.locator("[data-preview-theme]").click();
  await expect(page).toHaveURL(/theme=dark/);
  await page.locator('[data-device="375"]').click();
  await expectCanvasContained(page);
  const device = await metrics(page);
  expect(device.nativeWidth).toBe(375);
  expect(device.nativeHeight).toBe(812);
  expect(device.width).toBeLessThanOrEqual(375);
  await expect(page.locator("#preview-scale")).toHaveText(
    `${Math.round((device.width / 375) * 100)}%`,
  );
  await page.locator('[data-device="0"]').click();
  await expectResponsiveCanvas(page);
  await page.locator("[data-fit]").click();
  await expect(page.locator("[data-fit]")).not.toHaveClass(/selected/);
  await page.locator("[data-fit]").click();
  await expect(page.locator("[data-fit]")).toHaveClass(/selected/);
});

test("Component detail screenshots cover narrow, wide and short windows in both languages and themes", async ({
  page,
}, info) => {
  const samples = [];
  for (const [width, height] of [
    [375, 600],
    [768, 700],
    [1440, 655],
    [1910, 873],
  ])
    for (const [lang, theme] of [
      ["en", "light"],
      ["zh-CN", "dark"],
    ]) {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`#component/folio-card?lang=${lang}&theme=${theme}`);
      await expect(page.locator(".viewer-load-state")).toBeHidden();
      await expectViewerContained(page);
      await expectCanvasContained(page);
      const sample = await metrics(page);
      expect(sample.overflow).toBe(false);
      expect(sample.width).toBe(sample.stageWidth);
      expect(sample.height).toBe(sample.stageHeight);
      expect(sample.nativeWidth).toBe(sample.stageWidth);
      expect(sample.nativeHeight).toBe(sample.stageHeight);
      samples.push({
        viewportWidth: width,
        viewportHeight: height,
        lang,
        theme,
        ...sample,
      });
      await info.attach(`detail-${width}-${lang}-${theme}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
      await page.locator(".experience-actions [data-toggle-details]").click();
      await expect(page.locator("#inspector")).toBeVisible();
      expect((await metrics(page)).overflow).toBe(false);
      await page.locator(".inspector-close").click();
      await expect(
        page.locator(".experience-actions [data-toggle-details]"),
      ).toBeFocused();
    }
  await info.attach("component-detail-metrics.json", {
    body: JSON.stringify(samples, null, 2),
    contentType: "application/json",
  });
});

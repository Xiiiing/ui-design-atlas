import { test, expect } from "@playwright/test";
import {
  expectViewerContained,
  expectResponsiveCanvas,
} from "./viewer-assertions.mjs";

test("Detail layout gives real component controls readable native pixels and consolidates chrome", async ({
  page,
}, info) => {
  const samples = [];
  for (const [width, height] of [
    [1440, 655],
    [1273, 582],
    [1910, 873],
  ]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(
      `./?clarity=${width}-${height}#component/magicui-border-beam?lang=zh-CN&theme=dark&panel=details`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expectViewerContained(page);
    await expectResponsiveCanvas(page);
    await expect(
      page.locator(".preview-toolbar [data-preview-setting=duration]"),
    ).toBeVisible();
    const sample = await page.locator("#case-preview").evaluate((frame) => {
      const card = frame.contentDocument.querySelector(
        ".demo-surface > div > [data-slot=card]",
      );
      const input = card.querySelector("input");
      const scale =
        frame.getBoundingClientRect().width / frame.contentWindow.innerWidth;
      const box = card.getBoundingClientRect();
      const title = document
        .querySelector(".market-viewer-toolbar")
        .getBoundingClientRect();
      return {
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        stageHeight: document.querySelector("#preview-viewport").clientHeight,
        componentWidth: box.width * scale,
        componentHeight: box.height * scale,
        inputFontSize:
          parseFloat(frame.contentWindow.getComputedStyle(input).fontSize) *
          scale,
        scale,
        cardFits:
          box.top >= 0 &&
          box.bottom <= frame.contentWindow.innerHeight &&
          box.left >= 0 &&
          box.right <= frame.contentWindow.innerWidth,
        combinedHeader:
          document.querySelector(".experience-actions").getBoundingClientRect()
            .top < title.bottom,
        pageHeight: document.documentElement.scrollHeight,
      };
    });
    expect(sample.componentWidth).toBeGreaterThanOrEqual(340);
    expect(sample.inputFontSize).toBeGreaterThanOrEqual(14);
    expect(sample.scale).toBe(1);
    expect(sample.cardFits).toBe(true);
    expect(sample.combinedHeader).toBe(true);
    samples.push(sample);
    await info.attach(`clarity-${width}-${height}.png`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  }
  await info.attach("component-clarity-metrics.json", {
    body: JSON.stringify(samples, null, 2),
    contentType: "application/json",
  });
});

test("Detail controls and iframe inputs survive auto, authored and device viewport changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 655 });
  let requests = 0;
  page.on("request", (r) => {
    if (r.isNavigationRequest() && r.frame() !== page.mainFrame()) requests++;
  });
  await page.goto("#component/magicui-border-beam?lang=en&panel=details");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  const email = page.frameLocator("#case-preview").locator("#email");
  await email.fill("clear@example.com");
  await page.locator("#case-preview").evaluate((frame) => {
    window.clarityFrame = frame;
    window.clarityDoc = frame.contentDocument;
  });
  const before = requests;
  await page.locator("[data-fit]").click();
  await expect
    .poll(() =>
      page
        .locator("#case-preview")
        .evaluate((frame) => [
          frame.contentWindow.innerWidth,
          frame.contentWindow.innerHeight,
        ]),
    )
    .toEqual([640, 480]);
  await page.locator("[data-fit]").click();
  await expectResponsiveCanvas(page);
  await page.locator('[data-device="375"]').click();
  await expect
    .poll(() =>
      page
        .locator("#case-preview")
        .evaluate((frame) => frame.contentWindow.innerWidth),
    )
    .toBe(375);
  await page.locator('[data-device="0"]').click();
  await expectResponsiveCanvas(page);
  await page.locator(".inspector-close").click();
  await page.locator(".experience-actions [data-toggle-details]").click();
  await expectResponsiveCanvas(page);
  await expect(email).toHaveValue("clear@example.com");
  expect(
    await page
      .locator("#case-preview")
      .evaluate(
        (frame) =>
          frame === window.clarityFrame &&
          frame.contentDocument === window.clarityDoc,
      ),
  ).toBe(true);
  expect(requests - before).toBe(0);
  await page.locator("[data-preview-setting=duration]").fill("6");
  await page.locator("[data-preview-setting=duration]").press("Tab");
  await expect(page.locator("[data-preview-setting=duration]")).toHaveAttribute(
    "data-applied-value",
    "6",
  );
  await page.locator("[data-fullscreen]").click();
  await expect(page.locator("#preview-panel:fullscreen")).toBeVisible();
  await expectResponsiveCanvas(page);
  await page.evaluate(() => document.exitFullscreen());
  await expectViewerContained(page);
});

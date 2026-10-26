import { test, expect } from "@playwright/test";
import {
  recordBentoAnimation,
  expectSmoothBentoAnimation,
} from "./bento-animation.mjs";

for (const locale of ["zh-CN", "en"])
  for (const hover of [false, true])
    test(`Bento notifications enter without a scaled-layout jump (${locale}, hover=${hover})`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.clock.install();
      await page.goto(
        `#block/magicui-bento-grid?lang=${locale}&theme=${hover ? "dark" : "light"}`,
      );
      const result = await recordBentoAnimation(page, hover);
      expectSmoothBentoAnimation(result, hover);
      await info.attach("insertion-frames.json", {
        body: JSON.stringify(result, null, 2),
        contentType: "application/json",
      });
      await info.attach("bento.png", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    });

test.describe("Phone Bento", () => {
  test.use({
    viewport: { width: 375, height: 600 },
    hasTouch: true,
    isMobile: true,
  });
  test("Notifications stay smooth after touch without a stuck hover zoom", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto("#block/magicui-bento-grid?lang=zh-CN&theme=dark");
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await page
      .frameLocator("#case-preview")
      .locator(".demo-surface > div > .grid > .group")
      .nth(1)
      .tap();
    const result = await recordBentoAnimation(page);
    expect(result.canHover).toBe(false);
    expectSmoothBentoAnimation(result);
    await expect(page.locator("#preview-scale")).toHaveText("100%");
  });
});

import { test, expect } from "@playwright/test";
import {
  createNativeZoomBrowser,
  recordStableZoom,
  expectStableZoom,
} from "./native-zoom.mjs";

for (const [width, height, resource] of [
  [1910, 873, "block/magicui-bento-grid"],
  [1440, 655, "component/folio-form"],
  [900, 900, "block/magicui-bento-grid"],
]) {
  test(`Native zoom and real scrollbars keep ${resource} stable at ${width}×${height}`, async ({
    baseURL,
  }, info) => {
    test.setTimeout(150000);
    const native = await createNativeZoomBrowser({ baseURL, width, height });
    try {
      const page = await native.context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      let documents = 0;
      page.on("request", (r) => {
        if (r.isNavigationRequest() && r.frame() !== page.mainFrame())
          documents++;
      });
      await page.goto(`#${resource}?lang=zh-CN&theme=dark`);
      await expect(page.locator(".viewer-load-state")).toBeHidden();
      if (resource.includes("form"))
        await page
          .frameLocator("#case-preview")
          .locator("input[type=email]")
          .fill("zoom@example.com");
      await page.locator("#case-preview").evaluate((f) => {
        window.zoomDocument = f.contentDocument;
      });
      const initialRequests = documents,
        records = [];
      // The same live document crosses zoom levels and breakpoint boundaries.
      for (const factor of [1, 1.1, 1.25, 1.5, 1.75, 2, 1, 1.1]) {
        await native.setZoom(factor, page);
        await page.mouse.move(0, 0);
        for (const device of ["0", "375", "768"]) {
          await page.locator(`[data-device="${device}"]`).click();
          await page.mouse.move(0, 0);
          const result = await recordStableZoom(page);
          expectStableZoom(result);
          if (resource.includes("bento"))
            expect(result.innerScrollbar).toBeGreaterThan(0);
          records.push({ factor, device, ...result });
        }
        await page.locator('[data-device="0"]').click();
      }
      await page.locator("[data-fit]").click();
      expectStableZoom(await recordStableZoom(page), false);
      await page.locator("[data-fit]").click();
      const before = await recordStableZoom(page);
      await page.locator(".experience-actions [data-toggle-details]").click();
      const open = await recordStableZoom(page);
      expectStableZoom(open);
      expect(open.samples[0].frame).toEqual(before.samples[0].frame);
      await page.locator(".inspector-close").click();
      await page.locator("[data-fullscreen]").click();
      await expect(page.locator("#preview-panel:fullscreen")).toBeVisible();
      expectStableZoom(await recordStableZoom(page));
      await page.locator("[data-exit-fullscreen]").click();
      expectStableZoom(await recordStableZoom(page));
      expect(
        await page
          .locator("#case-preview")
          .evaluate((f) => f.contentDocument === window.zoomDocument),
      ).toBe(true);
      if (resource.includes("form"))
        await expect(
          page.frameLocator("#case-preview").locator("input[type=email]"),
        ).toHaveValue("zoom@example.com");
      expect(documents - initialRequests).toBe(0);
      await page.reload();
      await expect(page.locator(".viewer-load-state")).toBeHidden();
      // Also exercise a cold load at 110%, independently of live transitions.
      expectStableZoom(await recordStableZoom(page));
      // Reload is expected to add one document request, zoom and controls none.
      expect(documents - initialRequests).toBe(1);
      expect(errors).toEqual([]);
      await info.attach("native-zoom-frames.json", {
        body: JSON.stringify(records),
        contentType: "application/json",
      });
      await info.attach("native-zoom-110.png", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    } finally {
      await native.close();
    }
  });
}

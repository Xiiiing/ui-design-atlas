import { test, expect } from "@playwright/test";
import {
  beginDetailMeasurement,
  finishDetailMeasurement,
  expectStableDetailToggle,
} from "./detail-stability.mjs";

for (const [width, height, locale, theme] of [
  [1910, 873, "zh-CN", "dark"],
  [1440, 655, "en", "light"],
  [1024, 600, "zh-CN", "light"],
  [1023, 600, "en", "dark"],
  [768, 700, "zh-CN", "dark"],
  [375, 600, "en", "light"],
]) {
  test(`Details do not move the canvas at ${width}×${height} (${locale}, ${theme})`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme: theme });
    let documents = 0;
    page.on("request", (r) => {
      if (r.isNavigationRequest() && r.frame() !== page.mainFrame())
        documents++;
    });
    await page.goto(
      `#component/magicui-border-beam?lang=${locale}&theme=${theme}`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    const input = page.frameLocator("#case-preview").locator("#email");
    await input.fill("stable@example.com");
    const before = documents;
    const records = [];
    for (const device of ["0", "768", "375"]) {
      await page.locator(`[data-device="${device}"]`).click();
      records.push({ device, ...(await expectStableDetailToggle(page)) });
    }
    await page.locator('[data-device="0"]').click();
    await page.locator("[data-fit]").click();
    records.push({
      actualSize: true,
      ...(await expectStableDetailToggle(page)),
    });
    await expect(input).toHaveValue("stable@example.com");
    expect(documents - before).toBe(0);
    await page.locator(".experience-actions [data-toggle-details]").click();
    await info.attach("details.png", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
    await info.attach("per-frame-geometry.json", {
      body: JSON.stringify(records, null, 2),
      contentType: "application/json",
    });
  });
}

test("Late detail data cannot resize or move an open preview", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route(
    "**/details/component-magicui-border-beam.json",
    async (r) => {
      await gate;
      await r.continue();
    },
  );
  await page.goto("#component/magicui-border-beam?lang=en");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  try {
    await page.locator(".experience-actions [data-toggle-details]").click();
    await expect(page.locator(".prompt-text")).toContainText("Loading details");
    await beginDetailMeasurement(page);
    release();
    await expect(page.locator(".prompt-text")).not.toContainText(
      "Loading details",
    );
    await finishDetailMeasurement(page);
  } finally {
    release();
  }
});

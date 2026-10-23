import { test, expect } from "@playwright/test";

test("Wide experience fits the available viewport and long content scrolls inside the demo", async ({
  page,
}) => {
  for (const width of [2560, 1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#page/shadcn-admin-dashboard?lang=en");
    const frame = page.frameLocator("#case-preview");
    await expect(
      frame.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#inspector")).toBeHidden();
    const sizes = await page.evaluate(() => {
      const v = document.querySelector("#preview-viewport"),
        f = document.querySelector("#case-preview");
      return {
        viewport: v.clientHeight,
        scroll: v.scrollHeight,
        frame: f.getBoundingClientRect().height,
        document: document.documentElement.scrollHeight,
        window: innerHeight,
      };
    });
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport + 1);
    expect(Math.abs(sizes.frame - sizes.viewport)).toBeLessThan(1);
    expect(sizes.document).toBeLessThanOrEqual(sizes.window + 1);
    await page.locator("[data-fit]").click();
    await expect
      .poll(() =>
        page
          .locator("#preview-viewport")
          .evaluate((el) => el.scrollHeight - el.clientHeight),
      )
      .toBeLessThanOrEqual(1);
    await page.locator("[data-fit]").click();
    await page.locator('[data-device="375"]').click();
    await expect
      .poll(() =>
        page
          .locator("#case-preview")
          .evaluate((f) => f.contentWindow.innerWidth),
      )
      .toBe(375);
    const bottom = await page.locator("#case-preview").evaluate((f) => {
      const d = f.contentDocument;
      const owners = [d.scrollingElement, ...d.querySelectorAll("*")].filter(
        (e) =>
          e.scrollHeight > e.clientHeight + 20 &&
          ["auto", "scroll"].includes(getComputedStyle(e).overflowY),
      );
      for (const e of owners) e.scrollTop = e.scrollHeight;
      return owners.map((e) => ({
        top: e.scrollTop,
        remaining: e.scrollHeight - e.clientHeight - e.scrollTop,
      }));
    });
    expect(bottom.some((e) => e.top > 0 && e.remaining < 2)).toBe(true);
    await page.locator(".experience-actions [data-toggle-details]").click();
    await expect(page).toHaveURL(/panel=details/);
    await expect(page.locator("#inspector")).toBeVisible();
    await page.locator(".inspector-close").click();
    await expect(page.locator("#inspector")).toBeHidden();
    await expect(
      page.locator(".experience-actions [data-toggle-details]"),
    ).toBeFocused();
  }
});

test("Details entry, code deep link and back restore filters, load count and exact entry focus", async ({
  page,
}) => {
  await page.goto("#components?lang=en&style=minimal");
  const entry = page.locator(".asset-actions [data-details]").last();
  await entry.scrollIntoViewIfNeeded();
  const hash = await page.evaluate(() => location.hash),
    scroll = await page.evaluate(() => scrollY),
    count = await page.locator(".asset-card").count();
  await entry.click();
  await expect(page).toHaveURL(/panel=details/);
  await expect(page.locator("#inspector")).toBeVisible();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(page.locator("#code-text")).toBeVisible();
  await page.locator("[data-close-viewer]").first().click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(hash);
  await expect(page.locator(".asset-card")).toHaveCount(count);
  await expect(entry).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
  await page.goto(url);
  await expect(page.locator("#code-text")).toBeVisible();
});

test("Wide preview failures retry in the same stage and ignore unrelated iframe messages", async ({
  page,
}) => {
  await page.route("**/examples/ui-market/index.html?**", (r) =>
    r.fulfill({ status: 503, contentType: "text/html", body: "Unavailable" }),
  );
  await page.goto("#component/fluent-dialog?lang=en");
  await expect(page.locator("[data-retry-viewer]")).toBeVisible();
  const before = await page.locator("#preview-viewport").boundingBox();
  await page.unroute("**/examples/ui-market/index.html?**");
  await page.locator("[data-retry-viewer]").click();
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  expect(await page.locator("#preview-viewport").boundingBox()).toEqual(before);
  const demo = page.frameLocator("#case-preview");
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await demo.getByRole("button", { name: "Close", exact: true }).click();
  const original = page.url();
  await page.evaluate(() => {
    const f = document.querySelector("#case-preview");
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: location.origin,
        source: window,
        data: { type: "atlas:escape", resourceId: "fluent-dialog" },
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: location.origin,
        source: f.contentWindow,
        data: {
          type: "atlas:resource-state",
          resourceId: "another-resource",
          theme: "dark",
        },
      }),
    );
  });
  expect(page.url()).toBe(original);
  await expect(page.locator(".experience-viewer")).toBeVisible();
});

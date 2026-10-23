import { test, expect } from "@playwright/test";
import { findResource, resourcePrompt } from "../catalog.js";

test("Visible cards operate directly and expose prompt, details and filter tags", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#components?lang=en&category=buttons");
  const card = page.locator('[data-resource="component:folio-button"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const url = page.url();
  await card
    .frameLocator("iframe")
    .locator("[data-demo-action]")
    .first()
    .click();
  await expect(card.frameLocator("iframe").locator("#feedback")).toBeVisible();
  expect(page.url()).toBe(url);
  await card.locator("[data-card-prompt]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    resourcePrompt(findResource("folio-button"), "en"),
  );
  await card.locator("[data-resource-tag=style]").click();
  await expect(page).toHaveURL(/category=buttons.*style=folio/);
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.goBack();
  await expect(page.locator(".asset-card")).toHaveCount(6);
});

test("Inline forms accept input on touch devices without opening a viewer", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(
    "http://127.0.0.1:4173/ui-design-atlas/#components?lang=en&q=folio&category=forms",
  );
  const card = page.locator('[data-resource="component:folio-form"]');
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const form = card.frameLocator("iframe");
  await form.locator("input[type=email]").fill("demo@example.com");
  await form.locator("button[type=submit]").tap();
  await expect(form.locator(".s-feedback")).not.toBeEmpty();
  await expect(page).toHaveURL(/#components/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await context.close();
});

test("Failed card loads retry in place and the live iframe budget is bounded", async ({
  page,
}) => {
  await page.route("**/component-preview.html?**", (r) =>
    r.fulfill({ status: 503, contentType: "text/html", body: "Unavailable" }),
  );
  await page.goto("#components?lang=en&category=buttons");
  const card = page.locator('[data-resource="component:folio-button"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-preview-state", "error");
  const before = await card.boundingBox();
  await page.unroute("**/component-preview.html?**");
  await card.locator("[data-retry-preview]").click();
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  expect(await card.boundingBox()).toEqual(before);
  await page.goto("#components?lang=en");
  for (const y of [0, 500, 1200, 2200, 4000]) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await expect
      .poll(() => page.locator(".asset-live iframe").count())
      .toBeLessThanOrEqual(8);
  }
});

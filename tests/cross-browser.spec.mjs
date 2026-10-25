import { test, expect } from "@playwright/test";
// Runs in all three engines; no clipboard permissions or Chromium-only APIs.
test("Core filter, navigation, saved state, source and preview workflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#components?lang=en&category=forms&q=folio");
  const card = page.locator('[data-resource="component:folio-form"]');
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  await card
    .frameLocator("iframe")
    .locator("input[type=email]")
    .fill("engine@example.com");
  await card.locator("[data-save]").click();
  await expect(page.locator("[data-favorite-count]").first()).toHaveText("1");
  await card.locator(".asset-caption [data-open]").click();
  await expect(page.locator("#case-preview")).toBeVisible();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText("<!doctype html>");
  await page.goBack();
  await expect(page.locator("[name=q]")).toHaveValue("folio");
  await page.goto("#favorites?lang=en&type=component");
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.locator("[data-save]").click();
  await expect(page.locator(".market-empty h2")).toBeFocused();
  await page.goto("#pages?lang=en&category=forms");
  await page.locator("[data-advanced-filters]").click();
  await page.locator("[name=technology][value=react]").check();
  await expect(page.locator(".asset-card").first()).toBeVisible();
  await page.reload();
  await expect(page.locator("[name=technology][value=react]")).toBeChecked();
  await page.goto("#case/shadcn-admin?lang=en");
  await expect(
    page.frameLocator("#case-preview").locator("#root"),
  ).not.toBeEmpty();
  expect(errors).toEqual([]);
});

import { test, expect } from "@playwright/test";
const saved = [
  "component:magicui-border-beam",
  "component:orbit-table",
  "page:shadcn-admin-tasks",
  "case:folio",
];
const backup = (favorites) => ({
  name: "favorites.json",
  mimeType: "application/json",
  buffer: Buffer.from(
    JSON.stringify({ format: "ui-design-atlas", version: 1, favorites }),
  ),
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript((items) => {
    if (!localStorage.getItem("favorites-test-seeded")) {
      localStorage.setItem("design-atlas-favorites", JSON.stringify(items));
      localStorage.setItem("favorites-test-seeded", "1");
    }
  }, saved);
});

test("Saved type/motion filters retain scope through search, refresh and detail history", async ({
  page,
}) => {
  await page.goto("#favorites?lang=en");
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await page.locator('[data-market-mode="components"]').click();
  await expect(page).toHaveURL(/#favorites\?.*type=component/);
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await expect(page.locator('[data-market-mode="pages"] span')).toHaveText("1");
  await page.locator("[name=q]").fill("orbit");
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("[name=q]")).toHaveValue("orbit");
  await page.locator(".asset-caption [data-open]").click();
  await page.goBack();
  await expect(page).toHaveURL(/#favorites\?.*type=component/);
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.locator("[data-reset-filters]").click();
  await page.locator('[data-market-mode="motion"]').click();
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.locator('[data-market-mode="explore"]').click();
  await expect(page).not.toHaveURL(/type=/);
  await expect(page.locator(".asset-card")).toHaveCount(4);
});

test("Saving updates counts without replacing the button and removal restores keyboard focus", async ({
  page,
}) => {
  await page.goto("#components?lang=en&q=border%20beam");
  const button = page.locator(".asset-card [data-save]");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-favorite-count]")).toHaveText("3");
  await page.goto("#favorites?lang=en&type=component");
  await page.locator(".asset-card [data-save]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".market-empty h2")).toBeFocused();
  await expect(page.locator("[data-favorite-count]")).toHaveText("2");
  await page.goto("#favorites?lang=en");
  await page.locator(".asset-card [data-save]").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".asset-card [data-save]")).toBeFocused();
});

test("Import is keyboard accessible, repeatable, atomic and distinguishes storage errors", async ({
  page,
}) => {
  await page.goto("#favorites?lang=en");
  const trigger = page.locator("[data-import-favorites]");
  await trigger.focus();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Space");
  await (await chooser).setFiles(backup(["component:orbit-table:extra"]));
  await expect(page.locator("#toast")).toHaveText(
    "Choose a valid favorites backup.",
  );
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await expect(trigger).toBeFocused();
  const input = page.locator("#import-favorites");
  await input.setInputFiles(backup(["component:folio-card"]));
  await expect(page.locator(".asset-card")).toHaveCount(5);
  await input.setInputFiles(backup(["component:folio-card"]));
  await expect(page.locator(".asset-card")).toHaveCount(5);
  await expect(input).toHaveValue("");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await input.setInputFiles(backup(["component:forma-card"]));
  await expect(page.locator("#toast")).toContainText(
    "Could not save favorites",
  );
  await expect(page.locator(".asset-card")).toHaveCount(5);
});

test("Other tabs update saved counts and removal focus without navigating", async ({
  page,
  context,
}) => {
  await page.goto("#favorites?lang=en&type=component");
  await page.locator('[data-save="component:magicui-border-beam"]').focus();
  const other = await context.newPage();
  await other.goto("#discover?lang=en");
  await other.evaluate(() =>
    localStorage.setItem(
      "design-atlas-favorites",
      JSON.stringify(["component:orbit-table"]),
    ),
  );
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await expect(
    page.locator('[data-save="component:orbit-table"]'),
  ).toBeFocused();
  await expect(page.locator("[data-favorite-count]")).toHaveText("1");
  await expect(page).toHaveURL(/#favorites/);
});

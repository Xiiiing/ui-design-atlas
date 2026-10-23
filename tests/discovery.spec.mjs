import { test, expect } from "@playwright/test";
import { discovery, collectionResources, resources } from "../catalog.js";

test("Discovery offers curated resources, counted categories, themes and complete systems", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("#discovery-search")).toBeVisible();
  await expect(page.locator("#filters")).toHaveCount(0);
  await expect(page.locator(".featured-section .asset-card")).toHaveCount(8);
  await expect(page.locator(".systems-section .asset-card")).toHaveCount(3);
  for (const id of discovery.categories)
    await expect(
      page.locator(`.discovery-categories a[href*="category=${id}"]`),
    ).toContainText(String(resources.filter((r) => r.category === id).length));
  await page.locator('.collection-card[href*="micro-interactions"]').click();
  await expect(page.locator("#results .asset-card")).toHaveCount(
    collectionResources("micro-interactions").length,
  );
  await expect(page.locator("[data-remove-filter=collection]")).toBeVisible();
  await page.locator("[data-remove-filter=collection]").click();
  await expect(page.locator("#results .asset-card")).toHaveCount(24);
  await page.goto("#discover?lang=en");
  await page.locator("#discovery-search input").fill("Fluent");
  await page
    .locator("#discovery-search")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page.locator("#results .asset-card")).toHaveCount(4);
  await expect(page).toHaveURL(/#explore.*q=Fluent/);
});

test("Search compares like resources in distinct groups and discovery restores after quick preview", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  await expect(
    page.locator(".resource-group[data-type=component]"),
  ).toBeVisible();
  await page.goto("#discover?lang=en");
  await page
    .locator(".featured-section .asset-caption [data-open]")
    .first()
    .click();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator(".featured-section .asset-card")).toHaveCount(8);
});

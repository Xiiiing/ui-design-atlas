import { test, expect } from "@playwright/test";
import { searchResources, resources } from "../catalog.js";

test("List and keyboard search rank exact names first and preserve filters and history", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  for (const query of ["Border Beam", "流光边框", "antd 表格", "微软"]) {
    await page.locator("[name=q]").fill(query);
    const expected = searchResources(query)[0];
    await expect(page.locator("#results .asset-card").first()).toHaveAttribute(
      "data-resource",
      `${expected.type}:${expected.id}`,
    );
    await page.keyboard.press("Control+k");
    await page.locator("#quick-search").fill(query);
    await expect(page.locator("#search-results a").first()).toHaveAttribute(
      "data-open",
      `${expected.type}:${expected.id}`,
    );
    await page.locator("[data-close-search]").click();
    await expect(page.locator("#search-dialog")).not.toBeVisible();
  }
  await page.locator("[name=q]").fill("Border Beam");
  await page.locator("#results .asset-caption [data-open]").first().click();
  await page.goBack();
  await expect(page.locator("[name=q]")).toHaveValue("Border Beam");
  await page.reload();
  await expect(page.locator("#results .asset-card").first()).toHaveAttribute(
    "data-resource",
    "component:magicui-border-beam",
  );
  await page.goto("#motion?lang=en&category=buttons&q=magic");
  await expect(page.locator("#results .asset-card")).toHaveCount(2);
  await page.locator("[name=q]").fill("no-such-resource");
  await expect(page.locator(".market-empty")).toBeVisible();
  await page.locator(".market-empty [data-reset-filters]").click();
  await expect(page.locator("#results .asset-card")).toHaveCount(
    resources.filter((r) => r.motion).length,
  );
});

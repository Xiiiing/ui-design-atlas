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

test("Quick experience, full code and browser history restore the original comparison", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#explore?lang=en&category=buttons");
  await page.locator("[name=q]").fill("shimmer");
  await page.locator(".asset-caption [data-open]").click();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await expect(page.locator("#asset-dialog [role=tab]")).toHaveCount(0);
  await expect(page.locator("#asset-dialog .provenance")).toHaveCount(0);
  await page
    .getByRole("spinbutton", { name: "Duration (seconds)", exact: true })
    .fill("6");
  await page.locator("#inspector [data-copy-prompt]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "duration = 6",
  );
  await page.locator("[data-full-detail]").first().click();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator("#topbar")).toBeVisible();
  await expect(page.locator(".resource-page h1")).toHaveText("Shimmer Button");
  await expect(page.locator(".inline-prompt")).toContainText("duration = 6");
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(page).toHaveURL(/tab=code/);
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
  await page.locator("[data-copy-code]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "ShimmerButton",
  );
  await page.goBack();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await expect(
    page.getByRole("spinbutton", { name: "Duration (seconds)", exact: true }),
  ).toHaveValue("6");
  await page.goBack();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator("[name=q]")).toHaveValue("shimmer");
  await expect(page.locator("[data-remove-filter=category]")).toContainText(
    "Buttons",
  );
  await page.goForward();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await page.goForward();
  await expect(page.locator(".resource-page")).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Code", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.reload();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
});

test("Complete case directory, internal navigation and associated parts form a reusable path", async ({
  page,
}) => {
  await page.goto("#case/shadcn-admin?lang=en");
  await expect(page.locator(".case-page-grid button")).toHaveCount(6);
  await page.locator('[data-page-preview="shadcn-admin-tasks"]').click();
  await expect(page.locator(".inspector-head h2")).toHaveText("Tasks");
  await expect(page).toHaveURL(/page=tasks/);
  await page
    .frameLocator("#case-preview")
    .getByRole("link", { name: "Users", exact: true })
    .first()
    .click();
  await expect(page.locator(".inspector-head h2")).toHaveText("Users");
  await expect(
    page.locator('[data-page-preview="shadcn-admin-users"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator('#related a[href*="component/shadcn-admin-user-dialog"]')
    .click();
  await expect(page.locator(".resource-page")).toBeVisible();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await page.goBack();
  await expect(page.locator(".inspector-head h2")).toHaveText("Users");
});

test("Type filters preserve a thematic or search context and empty results remain recoverable", async ({
  page,
}) => {
  await page.goto("#explore?lang=en&collection=login-and-signup");
  await page.locator("[data-market-mode=blocks]").click();
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await expect(page).toHaveURL(/collection=login-and-signup/);
  await page.locator("[name=q]").fill("does-not-exist");
  await expect(page.locator(".market-empty")).toBeVisible();
  await page.locator("[data-reset-filters]").first().click();
  await expect(page.locator(".asset-card")).toHaveCount(
    resources.filter((r) => r.type === "block").length,
  );
});

test("Canonical links open a full document and same-URL Back restores quick preview", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
  await page
    .locator(".featured-section .asset-caption [data-open]")
    .first()
    .click();
  const canonical = page.url();
  await page.locator("[data-full-detail]").first().click();
  expect(page.url()).toBe(canonical);
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await page.goBack();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".featured-section")).toBeVisible();
  await page.goto(canonical);
  await expect(page.locator(".resource-page")).toBeVisible();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
});

test("Touch discovery cards show their actual UI and retain readable captions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto("#discover?lang=en");
  const card = page.locator(".featured-section .asset-card").first();
  await expect(card.locator(".asset-caption")).toBeVisible();
  await expect(card.locator(".asset-description")).toBeVisible();
  expect(
    await card
      .locator(".asset-cover-link")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgba(0, 0, 0, 0)");
  const bounds = await card.evaluate((el) => {
    const p = el.querySelector("img").getBoundingClientRect(),
      d = el.querySelector(".asset-description").getBoundingClientRect(),
      c = el.querySelector(".asset-caption").getBoundingClientRect();
    return {
      imageBottom: p.bottom,
      descriptionTop: d.top,
      descriptionBottom: d.bottom,
      captionTop: c.top,
    };
  });
  expect(bounds.descriptionTop).toBeGreaterThanOrEqual(bounds.imageBottom);
  expect(bounds.captionTop).toBeGreaterThanOrEqual(bounds.descriptionBottom);
});

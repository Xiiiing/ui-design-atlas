import { test, expect } from "@playwright/test";
import { collectionResources, resources } from "../catalog.js";

test("The root opens the library, with collections in more filters and cases in type navigation", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#filters")).toBeVisible();
  await expect(page.locator("#results .asset-card")).toHaveCount(24);
  await expect(page.locator("[data-market-mode=cases]")).toBeVisible();
  await page.locator("[data-advanced-filters]").click();
  await page.locator('.collection-shortcuts a[href*="micro-interactions"]').click();
  await expect(page.locator("#results .asset-card")).toHaveCount(collectionResources("micro-interactions").length);
  await expect(page.locator("[data-remove-filter=collection]")).toBeVisible();
  await page.locator("[data-remove-filter=collection]").click();
  await expect(page.locator("#results .asset-card")).toHaveCount(24);
  await page.goto("#discover?lang=en");
  await expect(page).toHaveURL(/#explore/);
  await page.locator('#filters [name=q]').fill("Fluent");
  await expect(page.locator("#results .asset-card")).toHaveCount(4);
  await expect(page).toHaveURL(/#explore.*q=Fluent/);
});

test("Search compares like resources in distinct groups and library restores after wide experience", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  await expect(
    page.locator(".resource-group[data-type=component]"),
  ).toBeVisible();
  await page.goto("#discover?lang=en");
  await page
    .locator("#results .asset-caption [data-open]")
    .first()
    .click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await expect(page.locator("#main")).not.toHaveClass(/library-page/);
  await page.goBack();
  await expect(page.locator(".experience-viewer")).not.toBeVisible();
  await expect(page.locator("#results .asset-card")).toHaveCount(24);
});

test("Experience details, code and browser history restore the original comparison", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#explore?lang=en&category=buttons");
  await page.locator("[name=q]").fill("shimmer");
  await expect(page.locator(".asset-caption [data-open]")).toHaveCount(1);
  await page.locator(".asset-caption [data-open]").click();
  await expect(page.locator("#inspector")).toBeVisible();
  await expect(page).toHaveURL(/panel=details/);
  await page
    .getByRole("spinbutton", { name: "Duration (seconds)", exact: true })
    .fill("6");
  await page.locator("[data-copy-resource-prompt]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "duration = 6",
  );
  await page.locator("[data-tab=code]").click();
  await expect(page).toHaveURL(/tab=code/);
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
  await page.locator("[data-copy-code]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "ShimmerButton",
  );
  await page.goBack();
  await expect(page.locator("[name=q]")).toHaveValue("shimmer");
  await expect(page.locator("[data-remove-filter=category]")).toContainText(
    "Buttons",
  );
  await page.goForward();
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
  await page.reload();
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
});

test("Complete case directory, internal navigation and associated parts form a reusable path", async ({
  page,
}) => {
  await page.goto("#case/shadcn-admin?lang=en&panel=details");
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
  await expect(page).toHaveURL(/component\/shadcn-admin-user-dialog/);
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

test("Canonical links preserve explicit details state and the default stays wide", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
  await page
    .locator("#results .asset-caption [data-open]")
    .first()
    .click();
  const canonical = page.url();
  await expect(page.locator("#inspector")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#results")).toBeVisible();
  await page.goto(canonical);
  await expect(page.locator("#inspector")).toBeVisible();
  await page.goto(canonical.replace("&panel=details", ""));
  await expect(page.locator("#inspector")).toBeHidden();
  await expect(page.locator(".resource-page")).toBeVisible();
});

test("Touch library cards show their actual UI and retain readable captions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto("#discover?lang=en");
  const card = page.locator('#results .asset-card[data-experience="canvas"]').first();
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
      captionBottom: c.bottom,
    };
  });
  expect(bounds.descriptionTop).toBeGreaterThanOrEqual(bounds.imageBottom);
  expect(bounds.captionTop).toBeGreaterThanOrEqual(bounds.imageBottom);
  expect(bounds.descriptionTop).toBeGreaterThanOrEqual(bounds.captionBottom);
});

test("The library mixes framed card widths and restores loaded results after detail", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  await expect(page.locator("#results .asset-card")).toHaveCount(24);
  const geometry = await page
    .locator(".comparison-grid")
    .first()
    .evaluate((grid) => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      gap: getComputedStyle(grid).columnGap,
      widths: [...grid.querySelectorAll(".asset-preview")].map((el) =>
        Math.round(el.getBoundingClientRect().width),
      ),
    }));
  expect(geometry.columns).toBe(4);
  expect(geometry.gap).toBe("16px");
  expect(new Set(geometry.widths).size).toBe(2);
  await page.locator("[data-more]").click();
  await expect(page.locator("#results .asset-card")).toHaveCount(48);
  await page.locator("#results .asset-caption [data-open]").last().click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#results .asset-card")).toHaveCount(48);
});

test("Live cards and wide experience follow the shell while fixed-height demos fit their frame", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("#motion?lang=en&category=backgrounds");
  const particles = page.locator(
    '[data-resource="component:magicui-particles"]',
  );
  await particles.hover();
  const iframe = particles.locator("iframe");
  await expect(iframe).toBeAttached();
  await expect
    .poll(() =>
      iframe.evaluate((f) =>
        f.contentDocument?.documentElement.classList.contains("dark"),
      ),
    )
    .toBe(false);
  await expect
    .poll(() =>
      iframe.evaluate((f) =>
        f.contentDocument
          ?.querySelector(".demo-surface")
          ?.getAttribute("data-inline"),
      ),
    )
    .toBe("true");
  await expect(
    particles
      .frameLocator("iframe")
      .locator(".demo-surface > div > div > span"),
  ).toBeVisible();
  const bounds = await iframe.evaluate((f) => {
    const el = f.contentDocument.querySelector(
      ".demo-surface > div > div > span",
    );
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: f.contentWindow.innerHeight,
    };
  });
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height);
  await particles.locator(".asset-caption [data-open]").click();
  await expect(
    page.frameLocator("#case-preview").locator("html"),
  ).not.toHaveClass(/dark/);
});

test("Responsive cards keep structured tags outside previews and loading does not duplicate recommendations", async ({
  page,
}) => {
  for (const width of [720, 600, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#discover?lang=en");
    const box = await page
      .locator("#results .asset-card")
      .first()
      .evaluate((el) => ({
        preview: el.querySelector(".asset-preview").getBoundingClientRect()
          .bottom,
        tags: el.querySelector(".resource-tags").getBoundingClientRect().top,
        count: el.querySelectorAll(".resource-tags a").length,
      }));
    expect(box.tags).toBeGreaterThanOrEqual(box.preview);
    expect(box.count).toBeLessThanOrEqual(2);
  }
  await expect(page.locator("[data-discovery-more]")).toHaveCount(0);
  const keys = await page
    .locator(".asset-card")
    .evaluateAll((els) => els.map((el) => el.dataset.resource));
  expect(new Set(keys).size).toBe(keys.length);
});

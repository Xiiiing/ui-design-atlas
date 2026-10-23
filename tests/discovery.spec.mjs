import { test, expect } from "@playwright/test";
import { discovery, collectionResources, resources } from "../catalog.js";

test("Discovery offers curated resources, counted categories, themes and complete systems", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("#filters")).toBeVisible();
  await expect(page.locator("#filters")).toHaveCount(1);
  await expect(page.locator(".featured-section .asset-card")).toHaveCount(8);
  await expect(page.locator(".systems-section .asset-card")).toHaveCount(3);
  for (const id of discovery.categories)
    await expect(page.locator(`[data-category="${id}"]`)).toContainText(
      String(resources.filter((r) => r.category === id).length),
    );
  await page.locator('.collection-card[href*="micro-interactions"]').click();
  await expect(page.locator("#results .asset-card")).toHaveCount(
    collectionResources("micro-interactions").length,
  );
  await expect(page.locator("[data-remove-filter=collection]")).toBeVisible();
  await page.locator("[data-remove-filter=collection]").click();
  await expect(page.locator("#results .asset-card")).toHaveCount(24);
  await page.goto("#discover?lang=en");
  await page.locator("#filters [name=q]").fill("Fluent");
  await page
    .locator("#filters")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page.locator("#results .asset-card")).toHaveCount(4);
  await expect(page).toHaveURL(/#explore.*q=Fluent/);
});

test("Search compares like resources in distinct groups and discovery restores after wide experience", async ({
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
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await expect(page.locator("#main")).not.toHaveClass(/library-page/);
  await page.goBack();
  await expect(page.locator(".experience-viewer")).not.toBeVisible();
  await expect(page.locator(".featured-section .asset-card")).toHaveCount(8);
});

test("Experience details, code and browser history restore the original comparison", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#explore?lang=en&category=buttons");
  await page.locator("[name=q]").fill("shimmer");
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
    .locator(".featured-section .asset-caption [data-open]")
    .first()
    .click();
  const canonical = page.url();
  await expect(page.locator("#inspector")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".featured-section")).toBeVisible();
  await page.goto(canonical);
  await expect(page.locator("#inspector")).toBeVisible();
  await page.goto(canonical.replace("&panel=details", ""));
  await expect(page.locator("#inspector")).toBeHidden();
  await expect(page.locator(".resource-page")).toBeVisible();
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
      captionBottom: c.bottom,
    };
  });
  expect(bounds.descriptionTop).toBeGreaterThanOrEqual(bounds.imageBottom);
  expect(bounds.captionTop).toBeGreaterThanOrEqual(bounds.imageBottom);
  expect(bounds.descriptionTop).toBeGreaterThanOrEqual(bounds.captionBottom);
});

test("The library puts a continuous, framed resource wall directly below its browsing controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#discover?lang=en");
  await expect(page.locator(".library-browser .asset-card")).toHaveCount(24);
  const geometry = await page.evaluate(() => {
    const hero = document.querySelector(".browse-intro h1"),
      search = document.querySelector(".market-search"),
      types = document.querySelector(".market-tabs"),
      grid = document.querySelector(".featured-section .market-grid"),
      first = grid.querySelector(".asset-preview"),
      secondRow = grid.querySelectorAll(".asset-preview")[4];
    return {
      fontSize: getComputedStyle(hero).fontSize,
      searchTop: search.getBoundingClientRect().top,
      typesTop: types.getBoundingClientRect().top,
      imageTop: first.getBoundingClientRect().top,
      imageBottom: secondRow.getBoundingClientRect().bottom,
      ratio: first.clientWidth / first.clientHeight,
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      gap: getComputedStyle(grid).columnGap,
    };
  });
  expect(geometry.fontSize).toBe("42px");
  expect(Math.abs(geometry.searchTop - geometry.typesTop)).toBeLessThan(5);
  expect(geometry.imageTop).toBeLessThan(460);
  expect(geometry.ratio).toBeGreaterThan(0.5);
  expect(geometry.columns).toBe(3);
  expect(geometry.gap).toBe("12px");
  await page.locator("[data-discovery-more]").click();
  await expect(page.locator(".library-browser .asset-card")).toHaveCount(48);
  await page
    .locator(".library-continuation .asset-caption [data-open]")
    .last()
    .click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".library-browser .asset-card")).toHaveCount(48);
});

test("Thumbnail and wide experience preserve the source theme and fixed-height demos fit their cover", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
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
    .toBe(true);
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
  await expect(page.frameLocator("#case-preview").locator("html")).toHaveClass(
    /dark/,
  );
});

test("Responsive cards keep structured tags outside previews and loading does not duplicate recommendations", async ({
  page,
}) => {
  for (const width of [720, 600, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#discover?lang=en");
    const box = await page
      .locator(".featured-section .asset-card")
      .first()
      .evaluate((el) => ({
        preview: el.querySelector(".asset-preview").getBoundingClientRect()
          .bottom,
        tags: el.querySelector(".resource-tags").getBoundingClientRect().top,
        count: el.querySelectorAll(".resource-tags a").length,
      }));
    expect(box.tags).toBeGreaterThanOrEqual(box.preview);
    expect(box.count).toBeLessThanOrEqual(3);
  }
  await page.locator("[data-discovery-more]").click();
  await page.locator("[data-discovery-more]").click();
  const keys = await page
    .locator(".asset-card")
    .evaluateAll((els) => els.map((el) => el.dataset.resource));
  expect(new Set(keys).size).toBe(keys.length);
});

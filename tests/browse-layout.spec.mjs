import { test, expect } from "@playwright/test";

async function positions(page) {
  await expect(page.locator("[data-selection-marker]").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const box = (selector) => {
      const b = document.querySelector(selector).getBoundingClientRect();
      return [b.x, b.y + scrollY, b.width, b.height];
    };
    return {
      types: box("[data-shell-key=market-types]"),
      search: box(".catalog-toolbar .market-search"),
      categories: box("[data-shell-key=resource-categories]"),
      facets: box(".catalog-facets"),
      cardTop: box(".asset-preview")[1],
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
}

for (const lang of ["zh-CN", "en"]) {
  test(`Browse navigation keeps controls and first cards in place (${lang})`, async ({
    page,
  }) => {
    for (const width of [2560, 1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`#discover?lang=${lang}`);
      const before = await positions(page);
      expect(before.overflow).toBe(false);
      if (width >= 768) {
        await page.locator('.market-navigation a[href*="#explore"]').click();
        await expect(page).toHaveURL(/#explore/);
        expect(await positions(page)).toEqual(before);
        await page.locator('.market-navigation a[href*="#discover"]').click();
        await expect(page).toHaveURL(/#discover/);
        expect(await positions(page)).toEqual(before);
      }
      for (const mode of [
        "motion",
        "components",
        "blocks",
        "pages",
        "cases",
        "explore",
      ]) {
        await page.locator(`[data-market-mode=${mode}]`).click();
        await expect(page).toHaveURL(new RegExp(`#${mode}`));
        expect(await positions(page), `${lang}/${width}/${mode}`).toEqual(
          before,
        );
      }
      await page.goBack();
      expect(await positions(page)).toEqual(before);
      await page.goForward();
      expect(await positions(page)).toEqual(before);
      await page.goto(`#discover?lang=${lang}`);
      await page.locator("[data-category=buttons]").click();
      await expect(page).toHaveURL(/#explore.*category=buttons/);
      expect(await positions(page)).toEqual(before);
      await page.locator("[data-remove-filter=category]").click();
      expect(await positions(page)).toEqual(before);
      await page.goBack();
      await expect(page.locator(".featured-section")).toBeVisible();
      expect(await positions(page)).toEqual(before);
    }
  });
}

test("Discovery submits search and library filters without moving the browse layout", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
  const before = await positions(page);
  await page.locator("[name=q]").fill("Fluent");
  await expect(page.locator(".featured-section")).toBeVisible();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/#explore.*q=Fluent/);
  await expect(page.locator("#results .asset-card")).toHaveCount(4);
  expect(await positions(page)).toEqual(before);
  await page.goBack();
  await page.locator("[data-advanced-filters]").click();
  await page.locator("input[name=library][value=fluent]").check();
  await page.locator("[data-advanced-filters]").click();
  await expect(page).toHaveURL(/#explore.*library=fluent/);
  await expect(page.locator("#results .asset-card")).toHaveCount(4);
  expect(await positions(page)).toEqual(before);
  await page.locator("[name=q]").fill("Fluent ".repeat(40).trim());
  expect(await positions(page)).toEqual(before);
});

test("Expanded filters stay open across type navigation and can still be collapsed", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
  await page.locator("[data-advanced-filters]").click();
  const expanded = await positions(page);
  await page.locator("[data-market-mode=motion]").click();
  await expect(page.locator("[data-advanced-filters]")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(await positions(page)).toEqual(expanded);
  await page.goBack();
  expect(await positions(page)).toEqual(expanded);
  await page.locator("[data-advanced-filters]").click();
  const collapsed = await positions(page);
  expect(collapsed.cardTop).toBeLessThan(expanded.cardTop);
  await page.locator("[data-market-mode=components]").click();
  await expect(page.locator("[data-advanced-filters]")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(await positions(page)).toEqual(collapsed);
});

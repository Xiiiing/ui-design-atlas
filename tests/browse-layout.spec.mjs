import { test, expect } from "@playwright/test";
import { openFilters } from "./navigation.mjs";

async function positions(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const box = (selector) => {
      const b = document.querySelector(selector).getBoundingClientRect();
      return [b.x, b.y + scrollY, b.width, b.height];
    };
    return {
      types: box("[data-shell-key=market-types]"),
      search: box(".catalog-toolbar .market-search"),
      facets: box(".catalog-facets"),
      cardTop: box(".asset-preview")[1],
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
}
for (const lang of ["zh-CN", "en"]) {
  test(`Library type navigation preserves controls and card positions (${lang})`, async ({
    page,
  }) => {
    for (const width of [2560, 1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`#explore?lang=${lang}`);
      const before = await positions(page);
      expect(before.overflow).toBe(false);
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
      await openFilters(page);
      await page.locator("[data-category=buttons]").click();
      await page.locator("[data-advanced-filters]").click();
      expect(await positions(page)).toEqual(before);
      await page.locator("[data-remove-filter=category]").click();
      expect(await positions(page)).toEqual(before);
    }
  });
}
test("Expanded filters persist through type navigation and collapse without losing conditions", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  await openFilters(page);
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

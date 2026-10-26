import { test, expect } from "@playwright/test";
import { resources } from "../catalog.js";

for (const lang of ["en", "zh-CN"]) {
  test(`Editorial discovery leads into the library and preserves legacy filters (${lang})`, async ({
    page,
  }) => {
    await page.goto(`#discover?lang=${lang}`);
    await expect(page.locator(".market-navigation a")).toHaveCount(4);
    await expect(page.locator("#filters")).toHaveCount(0);
    await expect(page.locator(".featured-section .asset-card")).toHaveCount(8);
    await expect(page.locator("[data-discovery-more]")).toHaveCount(0);
    await page.locator("#discovery-query").fill("Fluent");
    await page.locator("#discovery-query").press("Enter");
    await expect(page).toHaveURL(/#explore.*q=Fluent/);
    await expect(page.locator("#results .asset-card")).toHaveCount(4);
    await page.goBack();
    await expect(page.locator("#discovery-search")).toBeVisible();
    await page.goto(`#discover?lang=${lang}&category=buttons&library=magicui`);
    await expect(page).toHaveURL(/#explore.*category=buttons.*library=magicui/);
    await expect(page.locator("[data-remove-filter=category]")).toBeVisible();
    await expect(page.locator("[data-remove-filter=library]")).toBeVisible();
  });
}

test("Collapsed facets retain visible conditions; card menu works with keyboard and restores focus", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#explore?lang=en");
  await expect(page.locator(".category-strip")).toBeHidden();
  await page.locator("[data-advanced-filters]").click();
  await page.locator("[data-category=buttons]").click();
  await page.locator("[data-advanced-filters]").click();
  await expect(page.locator(".category-strip")).toBeHidden();
  await expect(page.locator("[data-remove-filter=category]")).toBeVisible();
  const card = page.locator(".asset-card").first();
  const trigger = card.locator(".card-menu-trigger");
  await expect(card.locator(".resource-tags a")).toHaveCount(2);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("menuitem", { name: "Copy prompt", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .not.toBe("");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.locator("[data-remove-filter=category]").click();
  await expect(page.locator(".asset-card")).toHaveCount(24);
});

for (const width of [1440, 1024, 768, 390]) {
  test(`Editorial pages keep readable cards and stable navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const lang of ["en", "zh-CN"]) {
      await page.emulateMedia({
        colorScheme: lang === "en" ? "dark" : "light",
        reducedMotion: "reduce",
      });
      for (const route of ["discover", "explore"]) {
        await page.goto(`#${route}?lang=${lang}`);
        await page.evaluate(() => document.fonts.ready);
        const header = page.locator(".market-header");
        const before = await header.boundingBox();
        await page.evaluate(() => scrollTo(0, 500));
        await expect.poll(() => header.boundingBox()).toEqual(before);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const cards = await page.locator(".asset-card").evaluateAll((els) =>
          els.map((el) => ({
            size: parseFloat(
              getComputedStyle(el.querySelector(".asset-caption > a")).fontSize,
            ),
            tags: el.querySelectorAll(".resource-tags a").length,
          })),
        );
        expect(cards.every((c) => c.size >= 16 && c.tags <= 2)).toBe(true);
        if (route === "explore") {
          const widths = await page
            .locator(".comparison-grid .asset-preview")
            .evaluateAll((els) =>
              els.map((el) => Math.round(el.getBoundingClientRect().width)),
            );
          expect(new Set(widths).size).toBe(1);
        }
      }
    }
  });
}

import { openFilters } from "./navigation.mjs";
import { test, expect } from "@playwright/test";

async function aligned(page, group, selected) {
  if (group === ".category-strip") {
    await expect(page.locator(`${group} ${selected}`).first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    return;
  }
  await expect(page.locator(`${group} [data-selection-marker]`)).toHaveCount(1);
  await expect
    .poll(() =>
      page.locator(group).evaluate((el, selector) => {
        const marker = el
          .querySelector("[data-selection-marker]")
          .getBoundingClientRect();
        const active = el.querySelector(selector).getBoundingClientRect();
        return Math.max(
          Math.abs(marker.x - active.x),
          Math.abs(marker.y - active.y),
          Math.abs(marker.width - active.width),
          Math.abs(marker.height - active.height),
        );
      }, selected),
    )
    .toBeLessThan(0.75);
}

test("Purpose multi-select preserves geometry, independent pressed states and keyboard focus", async ({
  page,
}) => {
  await page.goto("#motion?lang=en");
  await openFilters(page);
  const top = () =>
    page
      .locator(".market-results-line")
      .evaluate((el) => el.getBoundingClientRect().top);
  const before = await top();
  for (const id of ["cards", "text", "buttons"])
    await page.locator(`[data-category=${id}]`).click();
  await expect(page.locator(".category-strip [aria-pressed=true]")).toHaveCount(
    3,
  );
  for (const id of ["cards", "text", "buttons"])
    await expect(page.locator(`[data-category=${id}]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  expect(await top()).toBe(before);
  await page
    .locator("[data-remove-filter=category][data-filter-value=cards]")
    .click();
  await expect(page.locator("[data-category=cards]")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("[data-category=all]").click();
  await aligned(page, ".category-strip", "[data-category=all]");
  await page.locator("[data-category=buttons]").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-category=buttons]")).toBeFocused();
  await expect(page.locator(".asset-card")).toHaveCount(2);
});

test("Type selection retains its moving marker, link dimensions and focus through navigation and history", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  const group = "[data-shell-key=market-types] [data-selection-group]";
  await aligned(page, group, ".active");
  await page.locator(`${group} [data-selection-marker]`).evaluate((el) => {
    window.originalMarker = el;
  });
  const sizes = () =>
    page.locator(`${group} a`).evaluateAll((els) =>
      els.map((el) => {
        const b = el.getBoundingClientRect();
        return [b.width, b.height];
      }),
    );
  const before = await sizes();
  for (const mode of [
    "motion",
    "components",
    "blocks",
    "pages",
    "cases",
    "explore",
  ]) {
    const link = page.locator(`[data-market-mode=${mode}]`);
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(link).toBeFocused();
    expect(await sizes()).toEqual(before);
    expect(
      await page
        .locator(`${group} [data-selection-marker]`)
        .evaluate((el) => el === window.originalMarker),
    ).toBe(true);
  }
  await openFilters(page);
  await page.locator("[data-category=buttons]").click();
  await page.locator("[data-market-mode=motion]").click();
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await page.goBack();
  await expect(page.locator("[data-market-mode=explore]")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("[data-category=buttons]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await aligned(page, group, ".active");
  await aligned(page, ".category-strip", "[aria-pressed=true]");
  await page.goForward();
  await page.reload();
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await aligned(page, group, ".active");
  await aligned(page, ".category-strip", "[aria-pressed=true]");
  await page.goto("#explore?lang=en");
  await openFilters(page);
  await page.locator("[data-category=buttons]").click();
  await aligned(page, ".category-strip", "[data-category=buttons]");
});

test("Selection tracks scrolled controls, language, resizing and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const lang of ["zh-CN", "en"]) {
    for (const width of [1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`./?acceptance=${width}-${lang}#motion?lang=${lang}`);
      await openFilters(page);
      await page.evaluate(() => document.fonts.ready);
      await aligned(page, ".category-strip", "[aria-pressed=true]");
      await page.locator("[data-category=feedback]").click();
      await expect(page.locator("[data-category=feedback]")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await openFilters(page);
      await page.locator("[data-category=buttons]").click();
      await expect(
        page.locator(".category-strip [aria-pressed=true]"),
      ).toHaveCount(2);
      await page.locator("[data-category=buttons]").scrollIntoViewIfNeeded();
      await aligned(page, ".category-strip", "[aria-pressed=true]");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.setViewportSize({
        width: width === 375 ? 768 : 375,
        height: 1000,
      });
      await aligned(page, ".category-strip", "[aria-pressed=true]");
    }
  }
});

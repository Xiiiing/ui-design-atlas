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

for (const [route, kind, count] of [
  ["guidance", "skill", 5],
  ["tools", "design", 1],
]) {
  test(`${route} animates the existing type marker without moving button labels`, async ({
    page,
  }) => {
    await page.goto(`#${route}?lang=en`);
    await page.evaluate(() => document.fonts.ready);
    const group = ".content-types";
    await aligned(page, group, '[aria-pressed="true"]');
    const samples = await page.locator(group).evaluate(async (el, kind) => {
      const marker = el.querySelector("[data-selection-marker]");
      const buttons = [...el.querySelectorAll("button")];
      const target = el.querySelector(`[data-value="${kind}"]`);
      const before = buttons.map((b) => b.getBoundingClientRect().toJSON());
      const start = marker.getBoundingClientRect().x;
      const end = target.getBoundingClientRect().x;
      const frames = [];
      target.click();
      const deadline = performance.now() + 650;
      do {
        await new Promise(requestAnimationFrame);
        frames.push(marker.getBoundingClientRect().x);
      } while (performance.now() < deadline);
      return {
        start,
        end,
        frames,
        sameMarker: marker === el.querySelector("[data-selection-marker]"),
        before,
        after: buttons.map((b) => b.getBoundingClientRect().toJSON()),
      };
    }, kind);
    expect(samples.sameMarker).toBe(true);
    expect(samples.after).toEqual(samples.before);
    expect(
      samples.frames.some((x) => x > samples.start + 2 && x < samples.end - 2),
    ).toBe(true);
    await expect(page.locator(".guidance-card")).toHaveCount(count);
    await aligned(page, group, '[aria-pressed="true"]');
    await expect(page.locator(`${group} [aria-pressed="true"]`)).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    // Retarget the same spring before it settles, then activate using the keyboard.
    await page.locator(group).evaluate(async (el) => {
      el.querySelector('[data-value=""]').click();
      await new Promise(requestAnimationFrame);
      el.querySelectorAll("button")[1].click();
    });
    await aligned(page, group, '[aria-pressed="true"]');
    const all = page.locator(`${group} [data-value=""]`);
    await all.focus();
    await page.keyboard.press("Space");
    await expect(all).toBeFocused();
    await aligned(page, group, '[aria-pressed="true"]');
  });
}

test("Content type markers follow touch, horizontal scrolling and reduced motion", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    for (const lang of ["zh-CN", "en"]) {
      for (const [route, kind] of [
        ["guidance", "checklist"],
        ["tools", "learning"],
      ]) {
        await page.goto(`#${route}?lang=${lang}`);
        await aligned(page, ".content-types", '[aria-pressed="true"]');
        const target = page.locator(`.content-types [data-value="${kind}"]`);
        await target.tap();
        await expect(target).toHaveAttribute("aria-pressed", "true");
        await aligned(page, ".content-types", '[aria-pressed="true"]');
        await page.setViewportSize({ width: 768, height: 1000 });
        await aligned(page, ".content-types", '[aria-pressed="true"]');
        await page.setViewportSize({ width: 390, height: 844 });
        await expect(
          page.locator(".content-types [data-selection-marker]"),
        ).toHaveCount(1);
        await aligned(page, ".content-types", '[aria-pressed="true"]');
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
  } finally {
    await context.close();
  }
});

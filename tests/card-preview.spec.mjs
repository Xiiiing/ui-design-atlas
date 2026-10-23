import { test, expect } from "@playwright/test";

async function geometry(card) {
  return card.evaluate((el) => {
    const box = (s) => el.querySelector(s).getBoundingClientRect().toJSON();
    return {
      preview: box(".asset-preview"),
      image: box(".asset-preview > img"),
      caption: box(".asset-caption"),
      description: box(".asset-description"),
      badge: el.querySelector(".motion-badge") ? box(".motion-badge") : null,
      card: el.getBoundingClientRect().toJSON(),
    };
  });
}
function separate(g) {
  expect(g.caption.top).toBeGreaterThanOrEqual(g.preview.bottom);
  expect(g.description.top).toBeGreaterThanOrEqual(g.caption.bottom);
  expect(g.description.height).toBeLessThanOrEqual(36.5);
  if (g.badge) {
    expect(g.badge.top).toBeGreaterThanOrEqual(g.preview.top);
    expect(g.badge.bottom).toBeLessThan(g.preview.bottom);
    expect(g.badge.right).toBeLessThan(g.preview.right);
    expect(g.badge.bottom).toBeLessThan(g.description.top);
  }
}

test("Card metadata never covers or resizes the canvas on hover, focus or live loading", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 768, 375])
    for (const colorScheme of ["dark", "light"])
      for (const lang of ["zh-CN", "en"]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ colorScheme });
        await page.goto(`#motion?lang=${lang}&category=buttons`);
        await page.evaluate(() => document.fonts.ready);
        const card = page.locator(
          '[data-resource="component:magicui-shimmer-button"]',
        );
        await card.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        const before = await geometry(card);
        separate(before);
        if (width >= 768)
          await expect(card.locator(".asset-description")).toHaveCSS(
            "opacity",
            "0",
          );
        await card.hover();
        await expect(card).toHaveClass(/is-live/);
        await expect(card.locator(".asset-description")).toHaveCSS(
          "opacity",
          "1",
        );
        const after = await geometry(card);
        separate(after);
        expect(after).toEqual(before);
        await card.locator(".asset-cover-link").focus();
        expect(
          await card
            .locator(".asset-cover-link")
            .getAttribute("aria-describedby"),
        ).toBe("description-magicui-shimmer-button");
        expect(await geometry(card)).toEqual(before);
        await card.locator(".asset-cover-link").evaluate((el) => el.blur());
        await page.mouse.move(0, 0);
        if (width >= 768)
          await expect(card.locator(".asset-description")).toHaveCSS(
            "opacity",
            "0",
          );
        expect(await geometry(card)).toEqual(before);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
      }
  expect(errors).toEqual([]);
});

test("Revealing metadata keeps adjacent rows fixed and wide block covers intact", async ({
  page,
}) => {
  for (const route of ["#discover?lang=en", "#blocks?lang=en"]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator(
      route.includes("discover")
        ? ".featured-section .asset-card"
        : ".asset-card",
    );
    const positions = () =>
      cards.evaluateAll((es) =>
        es.map((el) => el.getBoundingClientRect().toJSON()),
      );
    const before = await positions();
    await cards.first().locator(".asset-cover-link").focus();
    await expect(cards.first()).toHaveClass(/is-live/);
    separate(await geometry(cards.first()));
    expect(await positions()).toEqual(before);
    await cards.nth(1).hover();
    separate(await geometry(cards.nth(1)));
    expect(await positions()).toEqual(before);
    expect(
      await page.locator(".asset-live iframe").count(),
    ).toBeLessThanOrEqual(2);
  }
});

test("Touch cards keep descriptions outside the preview and open the actual resource", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 1000 },
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(
      "http://127.0.0.1:4173/ui-design-atlas/#motion?lang=zh-CN&category=buttons",
    );
    const card = page.locator(
      '[data-resource="component:magicui-shimmer-button"]',
    );
    await expect(card.locator(".asset-description")).toHaveCSS("opacity", "1");
    separate(await geometry(card));
    await expect(card.locator(".asset-preview .asset-description")).toHaveCount(
      0,
    );
    await card.locator(".asset-cover-link").tap();
    await expect(page.locator("#asset-dialog")).toBeVisible();
    await expect(page.locator(".inspector-head h2")).toHaveText("微光按钮");
    await page.getByRole("button", { name: "关闭预览", exact: true }).click();
    await expect(card.locator(".asset-cover-link")).toBeFocused();
    await expect(card.locator("iframe")).toHaveCount(0);
    separate(await geometry(card));
  } finally {
    await ctx.close();
  }
});

import { test, expect } from "@playwright/test";

for (const lang of ["en", "zh-CN"]) {
  test(`Library home replaces discovery and preserves legacy filters (${lang})`, async ({
    page,
  }) => {
    await page.goto(`#discover?lang=${lang}`);
    await expect(page).toHaveURL(/#explore/);
    await expect(page.locator(".market-navigation a")).toHaveCount(3);
    await expect(page.locator('[data-primary-view="discover"]')).toHaveCount(0);
    await expect(page.locator("#filters")).toBeVisible();
    await expect(page.locator(".browse-intro p, .browse-intro .guidance-eyebrow")).toHaveCount(0);
    await page.locator('#filters [name=q]').fill("Fluent");
    await expect(page.locator("#results .asset-card")).toHaveCount(4);
    await expect(page).toHaveURL(/#explore.*q=Fluent/);
    await page.goto(`#explore?lang=${lang}`);
    await page.locator('[data-category=buttons]').focus();
    await page.keyboard.press("Space");
    await expect(page).toHaveURL(/#explore.*category=buttons/);
    await expect(page.locator("#advanced-filters")).toBeHidden();
    await expect(page.locator("[data-category=buttons]")).toHaveAttribute("aria-pressed", "true");
    await page.locator("[data-category=forms]").click();
    await page.reload();
    await expect(page.locator("[data-category=buttons]")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-category=forms]")).toHaveAttribute("aria-pressed", "true");
    await page.locator("[data-category=all]").click();
    await expect(page.locator("[data-remove-filter=category]")).toHaveCount(0);
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
  await expect(page.locator(".category-strip")).toBeVisible();
  await expect(page.locator("#advanced-filters")).toBeHidden();
  await page.locator("[data-advanced-filters]").click();
  await page.locator("[data-category=buttons]").click();
  await page.locator("[data-advanced-filters]").click();
  await expect(page.locator(".category-strip")).toBeVisible();
  await expect(page.locator("#advanced-filters")).toBeHidden();
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
  const links = await page
    .locator(".asset-card a")
    .evaluateAll((els) => els.map((a) => a.href));
  expect(
    links.every((url) =>
      url.startsWith("http://127.0.0.1:4173/ui-design-atlas/#"),
    ),
  ).toBe(true);
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
        await expect(page.locator("#filters")).toBeVisible();
        await expect(page.locator(".discovery-intro, .featured-section")).toHaveCount(0);
        const intro = await page.locator(".browse-intro").boundingBox();
        expect(intro.height).toBeLessThanOrEqual(60);
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

test("Detail reading disclosures keep the preview stable and prompt shortcut opens the text", async ({
  page,
}) => {
  await page.goto("#component/magicui-border-beam?lang=en&panel=details");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await expect(page.locator(".prompt-text")).not.toContainText(
    "Loading details",
  );
  const frame = page.locator("#case-preview");
  const geometry = await frame.boundingBox();
  await expect(page.locator(".prompt-disclosure")).not.toHaveAttribute("open");
  await page.locator(".prompt-disclosure summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".prompt-text")).toBeVisible();
  expect(await frame.boundingBox()).toEqual(geometry);
  await page.locator(".prompt-disclosure summary").click();
  await page.locator("[data-focus-prompt]").click();
  await expect(page.locator(".prompt-text")).toBeVisible();
  await page.locator(".provenance summary").click();
  await expect(page.locator(".provenance-content")).toBeVisible();
  expect(await frame.boundingBox()).toEqual(geometry);
});

for (const width of [1440, 1024, 768, 390]) {
  test(`Content tools share the editorial scale and fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const lang of ["en", "zh-CN"]) {
      await page.emulateMedia({
        colorScheme: lang === "en" ? "dark" : "light",
      });
      for (const route of [
        "guidance",
        "tools",
        "compose",
        "favorites",
        "resources",
        "guide",
      ]) {
        await page.goto(`#${route}?lang=${lang}`);
        await expect(page.locator("#main h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          await page
            .locator("#main h1")
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
        ).toBe(width < 768 ? 30 : 40);
        if (route === "compose") {
          await expect(page.locator(".composer-group")).toHaveCount(3);
          const input = await page.locator(".composer-inputs").boundingBox();
          const output = await page.locator(".composer-output").boundingBox();
          if (width > 900)
            expect(output.x).toBeGreaterThan(input.x + input.width);
          else expect(output.y).toBeGreaterThan(input.y + input.height);
        }
      }
    }
  });
}

test("Touch card menus and independent saved shortcut remain operable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(
    "http://127.0.0.1:4173/ui-design-atlas/#discover?lang=en",
  );
  await page.locator('[data-category=buttons]').tap();
  await expect(page).toHaveURL(/#explore.*category=buttons/);
  await expect(page.locator("#advanced-filters")).toBeHidden();
  const card = page.locator(".asset-card").first();
  await card.locator(".card-menu-trigger").tap();
  await page.getByRole("menuitem", { name: "Details", exact: true }).tap();
  await expect(page.locator("#inspector")).toBeVisible();
  await page.locator("[data-close-viewer]").first().tap();
  await expect(card.locator(".card-menu-trigger")).toBeFocused();
  await card.locator("[data-save]").tap();
  await page.locator(".saved-shortcut").tap();
  await expect(page).toHaveURL(/#favorites/);
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await context.close();
});

test("Systems share the library's navigation memory", async ({ page }) => {
  await page.goto("#cases?lang=en");
  await page.locator('[data-primary-view="guidance"]').click();
  await expect(page.locator(".guidance-card").first()).toBeVisible();
  await page.locator('[data-primary-view="explore"]').click();
  await expect(page).toHaveURL(/#cases/);
  await expect(page.locator('[data-market-mode="cases"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
});

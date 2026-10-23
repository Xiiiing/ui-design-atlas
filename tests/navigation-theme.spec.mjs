import { test, expect } from "@playwright/test";

const appearance = (page) => page.locator("#topbar .appearance-trigger");
const frameTheme = (frame) => frame.locator("html");

test("Navigation contracts without moving content, stays pinned and restores at the top", async ({
  page,
}) => {
  for (const width of [2560, 1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#explore?lang=en");
    const topbar = page.locator("#topbar");
    const header = page.locator(".market-header");
    const card = page.locator(".asset-card").first();
    const documentTop = () =>
      card.evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const before = await documentTop();
    await page.evaluate(() => scrollTo(0, 600));
    await expect(topbar).toHaveClass("is-compact");
    await expect
      .poll(() => header.evaluate((el) => el.getBoundingClientRect().width))
      .toBeLessThanOrEqual(497);
    expect(await documentTop()).toBeCloseTo(before, 0);
    await expect(page.locator(".market-navigation")).toBeVisible();
    for (const link of await page.locator(".market-navigation a").all()) {
      const box = await link.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThan(width);
    }
    await page.evaluate(() => scrollTo(0, 1200));
    await expect.poll(async () => (await header.boundingBox()).y).toBe(8);
    const beforeMenuScroll = await page.evaluate(() => scrollY);
    await page.locator("#site-locale").click();
    await expect.poll(async () => (await header.boundingBox()).y).toBe(8);
    expect(await page.evaluate(() => scrollY)).toBe(beforeMenuScroll);
    await expect(
      page.getByRole("option", { name: "English", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("#site-locale")).toBeFocused();
    await page.locator(".market-navigation a").first().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#discover/);
    await expect(topbar).not.toHaveClass("is-compact");
    await page.evaluate(() => scrollTo(0, 600));
    await expect(topbar).toHaveClass("is-compact");
    await page.evaluate(() => scrollTo(0, 0));
    await expect(topbar).not.toHaveClass("is-compact");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".market-header")
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration)),
  ).toBeLessThan(0.001);
});

test("Language icon supports keyboard selection, focus restoration and persistence", async ({
  page,
}) => {
  await page.goto("#explore?lang=en&category=buttons");
  const trigger = page.locator("#site-locale");
  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".language-content")).toBeVisible();
  await expect(
    page.getByRole("option", { name: "English", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("option", { name: "中文", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveURL(/category=buttons/);
  await expect(page.locator(".language-content")).toHaveCount(0);
  // Locale rendering replaces the old trigger. Focus must follow the new one.
  await expect(page.locator("#site-locale")).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.goto("#discover");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("Live card follows system and cycle changes without reloading or clearing input", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("#explore?lang=en&q=Border%20Beam");
  const card = page.locator('[data-resource="component:magicui-border-beam"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const frame = card.frameLocator("iframe");
  await expect(frameTheme(frame)).toHaveClass(/dark/);
  const email = frame.getByRole("textbox").first();
  await email.fill("theme-check@example.com");
  const src = await card.locator("iframe").getAttribute("src");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(frameTheme(frame)).not.toHaveClass(/dark/);
  await expect(email).toHaveValue("theme-check@example.com");
  await appearance(page).click();
  await expect(appearance(page)).toHaveAttribute("data-mode", "light");
  await appearance(page).click();
  await expect(appearance(page)).toHaveAttribute("data-mode", "dark");
  await expect(frameTheme(frame)).toHaveClass(/dark/);
  await expect(email).toHaveValue("theme-check@example.com");
  await expect(card.locator("iframe")).toHaveAttribute("src", src);
  await appearance(page).click();
  await expect(appearance(page)).toHaveAttribute("data-mode", "system");
  await expect(frameTheme(frame)).not.toHaveClass(/dark/);
});

test("Viewer theme defaults to shell, permits local changes and resynchronizes on the next shell change", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const resource of [
    "component/magicui-shimmer-button",
    "component/antd-table",
    "page/shadcn-admin-dashboard",
  ]) {
    await page.goto(`#${resource}?lang=en`);
    const frame = page.frameLocator("#case-preview");
    await expect(frameTheme(frame)).toHaveClass(/dark/);
    await page.locator("[data-preview-theme]").click();
    await expect(frameTheme(frame)).not.toHaveClass(/dark/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const source = await page.locator("#case-preview").getAttribute("src");
    await appearance(page).click(); // system -> light
    await appearance(page).click(); // light -> dark
    await expect(frameTheme(frame)).toHaveClass(/dark/);
    await expect(page.locator("#case-preview")).toHaveAttribute("src", source);
    await expect(page).not.toHaveURL(/[?&]theme=/);
    await expect(page.locator("#standalone")).toHaveAttribute(
      "href",
      /theme=dark/,
    );
    await appearance(page).click(); // dark -> system
  }
  await page.goto("#component/magicui-shimmer-button?lang=en&theme=light");
  await expect(frameTheme(page.frameLocator("#case-preview"))).not.toHaveClass(
    /dark/,
  );
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(frameTheme(page.frameLocator("#case-preview"))).toHaveClass(
    /dark/,
  );
});

test("A native demo theme choice remains usable after a same-color shell mode change", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("#page/shadcn-admin-dashboard?lang=en");
  const frame = page.frameLocator("#case-preview");
  await expect(frame.locator("html")).toHaveClass(/dark/);
  await appearance(page).click(); // system -> light
  await expect(frame.locator("html")).not.toHaveClass(/dark/);
  await appearance(page).click(); // light -> dark
  await expect(frame.locator("html")).toHaveClass(/dark/);
  await appearance(page).click(); // dark -> system, still dark
  await frame
    .getByRole("button", { name: "Toggle theme", exact: true })
    .click();
  await frame.getByRole("menuitem", { name: "Light", exact: true }).click();
  await expect(frame.locator("html")).not.toHaveClass(/dark/);
  await expect(page).toHaveURL(/theme=light/);
  await expect(page.locator("#standalone")).toHaveAttribute(
    "href",
    /theme=light/,
  );
  await page.locator("[data-preview-theme]").click();
  await expect(frame.locator("html")).toHaveClass(/dark/);
});

test("Touch users can operate compact navigation and dismiss the language picker", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 900 },
    hasTouch: true,
    isMobile: true,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/ui-design-atlas/#explore?lang=zh-CN");
  await page.evaluate(() => scrollTo(0, 600));
  await expect(page.locator("#topbar")).toHaveClass("is-compact");
  await page.locator("#site-locale").tap();
  await page.getByRole("option", { name: "English", exact: true }).tap();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#topbar")).toHaveClass("is-compact");
  await appearance(page).tap();
  await expect(appearance(page)).toHaveAttribute("data-mode", "light");
  await page.locator("#site-locale").tap();
  await page.touchscreen.tap(20, 500);
  await expect(page.locator(".language-content")).toHaveCount(0);
  await page.locator('.market-navigation a[aria-label="Saved"]').tap();
  await expect(page).toHaveURL(/#favorites/);
  await context.close();
});

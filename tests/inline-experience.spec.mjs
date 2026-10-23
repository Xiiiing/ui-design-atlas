import { test, expect } from "@playwright/test";
import { findResource, resourcePrompt } from "../catalog.js";

test("Visible cards operate directly and expose prompt, details and filter tags", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#components?lang=en&category=buttons");
  const card = page.locator('[data-resource="component:folio-button"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const url = page.url();
  await card
    .frameLocator("iframe")
    .locator("[data-demo-action]")
    .first()
    .click();
  await expect(card.frameLocator("iframe").locator("#feedback")).toBeVisible();
  expect(page.url()).toBe(url);
  await card.locator("[data-card-prompt]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    resourcePrompt(findResource("folio-button"), "en"),
  );
  await card.locator("[data-resource-tag=style]").click();
  await expect(page).toHaveURL(/category=buttons.*style=folio/);
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.goBack();
  await expect(page.locator(".asset-card")).toHaveCount(6);
});

test("Inline forms accept input on touch devices without opening a viewer", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(
    "http://127.0.0.1:4173/ui-design-atlas/#components?lang=en&q=folio&category=forms",
  );
  const card = page.locator('[data-resource="component:folio-form"]');
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const form = card.frameLocator("iframe");
  await form.locator("input[type=email]").fill("demo@example.com");
  await form.locator("button[type=submit]").tap();
  await expect(form.locator(".s-feedback")).not.toBeEmpty();
  await expect(page).toHaveURL(/#components/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await context.close();
});

test("Failed card loads retry in place and the live iframe budget is bounded", async ({
  page,
}) => {
  await page.route("**/component-preview.html?**", (r) =>
    r.fulfill({ status: 503, contentType: "text/html", body: "Unavailable" }),
  );
  await page.goto("#components?lang=en&category=buttons");
  const card = page.locator('[data-resource="component:folio-button"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-preview-state", "error");
  const before = await card.boundingBox();
  await page.unroute("**/component-preview.html?**");
  await card.locator("[data-retry-preview]").click();
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  expect(await card.boundingBox()).toEqual(before);
  await page.goto("#components?lang=en");
  for (const y of [0, 500, 1200, 2200, 4000]) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await expect
      .poll(() => page.locator(".asset-live iframe").count())
      .toBeLessThanOrEqual(8);
  }
});

test("Focused demos survive recycling, keyboard input works and forged card messages are ignored", async ({
  page,
}) => {
  await page.goto("#components?lang=en");
  const card = page.locator('[data-resource="component:magicui-border-beam"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-live/);
  const input = card.frameLocator("iframe").locator("input[type=email]");
  await input.fill("focus@example.com");
  await input.press("Tab");
  await expect(
    card.frameLocator("iframe").locator("input[type=password]"),
  ).toBeFocused();
  await card.locator("iframe").evaluate((f) => {
    f.dataset.instance = "focused";
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: location.origin,
        source: f.contentWindow,
        data: { type: "atlas:inline-error", resourceId: "another-resource" },
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: location.origin,
        source: window,
        data: { type: "atlas:inline-error", resourceId: "magicui-border-beam" },
      }),
    );
  });
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  await page.evaluate(() => scrollTo(0, 4000));
  await expect(card.locator("iframe")).toHaveAttribute(
    "data-instance",
    "focused",
  );
  expect(await page.locator(".asset-live iframe").count()).toBeLessThanOrEqual(
    8,
  );
  await page.locator(".asset-caption a").last().focus();
  await expect(card.locator("iframe")).toHaveCount(0);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-live/);
  await expect(input).toHaveValue("");
});

test("Card copy fallback preserves the exact selected resource and language without moving cards", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  for (const lang of ["en", "zh-CN"]) {
    await page.goto(`#components?lang=${lang}&category=buttons`);
    const card = page.locator('[data-resource="component:folio-button"]');
    await card.scrollIntoViewIfNeeded();
    const before = await card.boundingBox();
    await card.locator("[data-card-prompt]").click();
    await expect(page.locator("#copy-fallback")).toBeVisible();
    await expect(page.locator("#fallback-text")).toHaveValue(
      resourcePrompt(findResource("folio-button"), lang),
    );
    expect(await card.boundingBox()).toEqual(before);
    await page.locator("#fallback-close").click();
    await expect(card.locator("[data-card-prompt]")).toBeFocused();
    expect(await card.boundingBox()).toEqual(before);
  }
});

test("Tag URLs combine filters, survive reload and history, and remove one condition at a time", async ({
  page,
  context,
}) => {
  await page.goto("#components?lang=en&category=buttons&source=original");
  const tag = page.locator(
    '[data-resource="component:folio-button"] [data-resource-tag=interaction]',
  );
  const url = await tag.getAttribute("href");
  expect(url).toContain("source=original");
  expect(url).toContain("category=buttons");
  await tag.click();
  await expect(page).toHaveURL(/interaction=click/);
  await page.reload();
  const other = await context.newPage();
  await other.goto(page.url());
  expect(await other.locator(".asset-card").count()).toBe(
    await page.locator(".asset-card").count(),
  );
  await other.close();
  await page.locator("[data-remove-filter=interaction]").click();
  await expect(page).not.toHaveURL(/interaction=/);
  await expect(page).toHaveURL(/source=original/);
  await page.goBack();
  // Removing a chip updates the current search; Back returns the prior card-tag navigation.
  await expect(page).toHaveURL(/category=buttons/);
  await page.goForward();
  await page.locator("[data-reset-filters]").click();
  await expect(page.locator("[data-remove-filter]")).toHaveCount(0);
});

test("Adjusted compact previews fit phone cards without truncation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  for (const id of ["magicui-dock", "shadcn-admin-trend-chart"]) {
    await page.goto(
      `#components?lang=en&q=${encodeURIComponent(findResource(id).name.en)}`,
    );
    const card = page.locator(`[data-resource="component:${id}"]`);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-live/);
    const size = await card.locator("iframe").evaluate((f) => {
      const d = f.contentDocument,
        el = d.querySelector(".demo-surface") || d.scrollingElement;
      return {
        w: el.clientWidth,
        sw: el.scrollWidth,
        h: f.contentWindow.innerHeight,
        sh: el.scrollHeight,
      };
    });
    expect(size.sw).toBeLessThanOrEqual(size.w + 1);
    expect(size.sh).toBeLessThanOrEqual(size.h + 1);
  }
  await page.goto("#components?lang=en&q=metric");
  await expect(
    page.locator('[data-resource="component:shadcn-admin-metric-cards"]'),
  ).toHaveAttribute("data-experience", "canvas");
});

test("A touch swipe starting inside a compact iframe scrolls the resource list", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(
      "http://127.0.0.1:4173/ui-design-atlas/#components?lang=en&category=buttons",
    );
    const card = page.locator('[data-resource="component:folio-button"]');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-live/);
    const box = await card.locator("iframe").boundingBox(),
      before = await page.evaluate(() => scrollY);
    const session = await context.newCDPSession(page),
      x = Math.round(box.x + 20),
      y = Math.round(box.y + box.height - 35);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let delta = 20; delta <= 200; delta += 20) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - delta }],
      });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(before + 100);
    await expect(page).toHaveURL(/#components/);
  } finally {
    await context.close();
  }
});

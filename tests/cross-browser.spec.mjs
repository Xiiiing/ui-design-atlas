import { test, expect } from "@playwright/test";
// Runs in all three engines; no clipboard permissions or Chromium-only APIs.
test("Core filter, navigation, saved state, source and preview workflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#components?lang=en&category=forms&q=folio");
  const card = page.locator('[data-resource="component:folio-form"]');
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  await card
    .frameLocator("iframe")
    .locator("input[type=email]")
    .fill("engine@example.com");
  await card.locator("[data-save]").click();
  await expect(page.locator("[data-favorite-count]").first()).toHaveText("1");
  await card.locator(".asset-caption [data-open]").click();
  await expect(page.locator("#case-preview")).toBeVisible();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText("<!doctype html>");
  await page.goBack();
  await expect(page.locator("[name=q]")).toHaveValue("folio");
  await page.goto("#favorites?lang=en&type=component");
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.locator("[data-save]").click();
  await expect(page.locator(".market-empty h2")).toBeFocused();
  await page.goto("#pages?lang=en&category=forms");
  await page.locator("[data-advanced-filters]").click();
  await page.locator("[name=technology][value=react]").check();
  await expect(page.locator(".asset-card").first()).toBeVisible();
  await page.reload();
  await expect(page.locator("[name=technology][value=react]")).toBeChecked();
  await page.goto("#case/shadcn-admin?lang=en");
  await expect(
    page.frameLocator("#case-preview").locator("#root"),
  ).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test("Lazy source loading recovers from a failed module request", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let failed = false;
  await page.route(/\/atlas-source-code-[^/]+\.js$/, async (route) => {
    if (!failed) {
      failed = true;
      await route.abort();
    } else await route.continue();
  });
  await page.goto("#component/folio-form?lang=en&tab=code");
  await expect(page.locator("#full-code [role=alert]")).toBeVisible();
  await page.locator("#full-code [data-reload-source]").click();
  await expect(page.locator("#code-text")).toContainText("<!doctype html>");
  expect(errors).toEqual([]);
});

test("A delayed source module cannot overwrite a newer navigation", async ({
  page,
}) => {
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route(/\/atlas-source-code-[^/]+\.js$/, async (route) => {
    requested = true;
    await ready;
    await route.continue();
  });
  await page.goto("#component/folio-form?lang=en");
  try {
    await page.locator("[data-tab=code]").click();
    await expect.poll(() => requested).toBe(true);
    await page.evaluate(() => {
      location.hash = "#component/orbit-button?lang=en";
    });
    await expect(page.locator("[data-tab=notes]")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  } finally {
    release();
  }
  await expect(page.locator("#case-preview")).toBeVisible();
  await expect(page.locator("#full-code")).toBeEmpty();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText("Orbit");
  await expect(page.locator("#code-text")).not.toContainText("Folio");
});

test("Viewer fit contains the canvas and controls within short desktop and phone windows", async ({
  page,
}) => {
  const { expectViewerContained, expectCanvasContained } =
    await import("./viewer-assertions.mjs");
  for (const [width, height] of [
    [1910, 873],
    [1440, 600],
    [375, 600],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(
      `./?contain=${width}#case/shadcn-admin?lang=en&page=notifications`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expectViewerContained(page);
    await expectCanvasContained(page);
    await page.locator('[data-device="375"]').click();
    await expectCanvasContained(page);
    await expectViewerContained(page);
    await page.locator('[data-device="0"]').click();
    await expectCanvasContained(page);
  }
});

test("Short landscape motion previews keep canvas, parameter controls and a way back usable", async ({
  page,
}) => {
  const { expectViewerContained, expectCanvasContained } =
    await import("./viewer-assertions.mjs");
  for (const [width, height] of [
    [812, 320],
    [812, 375],
    [1440, 400],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(
      `./?landscape=${width}-${height}#component/magicui-border-beam?lang=en`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expectViewerContained(page);
    await expectCanvasContained(page);
    await expect(page.locator("#topbar")).toBeHidden();
    const email = page.frameLocator("#case-preview").locator("#email");
    await email.fill("landscape@example.com");
    await expect(email).toHaveValue("landscape@example.com");
    const duration = page.locator("[data-preview-setting=duration]");
    await duration.fill("5");
    await duration.press("Tab");
    await expect(duration).toHaveAttribute("data-applied-value", "5");
    await page.locator("[data-close-viewer]").first().click();
    await expect(page.locator("#topbar")).toBeVisible();
    await expect(page.locator(".experience-viewer")).toHaveCount(0);
  }
});

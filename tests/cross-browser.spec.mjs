import { test, expect } from "@playwright/test";
import { openClassification } from "./navigation.mjs";

test("Phone library keeps both type rows and the first cover in view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#explore?lang=zh-CN");
  await page.evaluate(() => document.fonts.ready);
  const types = page.locator("[data-market-mode]");
  const sizes = await types.evaluateAll((links) =>
    links.map((link) => {
      const { top, left, right, height } = link.getBoundingClientRect();
      return { top, left, right, height };
    }),
  );
  expect(sizes).toHaveLength(6);
  expect(new Set(sizes.slice(0, 3).map(({ top }) => top)).size).toBe(1);
  expect(new Set(sizes.slice(3).map(({ top }) => top)).size).toBe(1);
  expect(sizes[3].top).toBeGreaterThan(sizes[0].top);
  expect(
    sizes.every(
      ({ left, right, height }) => left >= 0 && right <= 390 && height >= 44,
    ),
  ).toBe(true);
  expect(
    (await page.locator(".asset-preview").first().boundingBox()).y,
  ).toBeLessThan(400);
  for (const [mode, type] of [
    ["pages", "page"],
    ["cases", "case"],
  ]) {
    await page.locator(`[data-market-mode=${mode}]`).click();
    await expect(page).toHaveURL(new RegExp(`#${mode}`));
    await expect(page.locator(`.resource-group[data-type=${type}]`)).toBeVisible();
    const keys = await page
      .locator(".asset-card")
      .evaluateAll((cards) => cards.map((card) => card.dataset.resource));
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.every((key) => key.startsWith(`${type}:`))).toBe(true);
  }
});

test("Card comparison opens four distinct styles, respects filters and restores from its URL", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  const toggle = page.getByRole("button", { name: "Compare card styles" });
  await expect(toggle).toBeHidden();
  await openClassification(page);
  await page.locator("[data-category=cards]").press("Space");
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/category=cards/);
  await expect(page).toHaveURL(/compare=cards/);
  const comparison = page.locator(".comparison-styles");
  await expect(comparison.locator(".asset-style")).toHaveText([
    "Editorial",
    "Swiss",
    "Technology",
    "Natural",
  ]);
  await page.reload();
  await expect(comparison.locator(".asset-card")).toHaveCount(4);
  await openClassification(page, "visual");
  await page.locator("[data-visual=editorial]").click();
  await expect(comparison.locator(".asset-card")).toHaveAttribute(
    "data-resource",
    "component:folio-card",
  );
  await comparison.locator(".asset-caption [data-details]").click();
  await expect(page).toHaveURL(/component\/folio-card/);
  await page.goBack();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(comparison.locator(".asset-card")).toHaveCount(1);
  await toggle.click();
  await expect(page).not.toHaveURL(/compare=/);
  await expect(page.locator("[data-remove-filter=visual]")).toBeVisible();
  await expect(page.locator("#results .asset-card")).not.toHaveCount(1);
  await toggle.click();
  await page.locator("[data-remove-filter=category]").click();
  await expect(toggle).toBeHidden();
  await expect(page).not.toHaveURL(/compare=/);
});
// Runs in all three engines; no clipboard permissions or Chromium-only APIs.
test("Core filter, navigation, saved state, source and preview workflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#components?lang=en&category=forms&q=folio");
  const card = page.locator('[data-resource="component:folio-form"]');
  await card.locator("[data-start-preview]").click();
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

test("Fullscreen and its API fallback fill the screen and restore keyboard focus", async ({
  page,
}) => {
  const { expectViewerContained } = await import("./viewer-assertions.mjs");
  for (const fallback of [false, true]) {
    if (fallback)
      await page.addInitScript(() => {
        Element.prototype.requestFullscreen = () =>
          Promise.reject(new Error("Not supported"));
      });
    await page.goto(
      `./?fullscreenFallback=${fallback}#component/magicui-border-beam?lang=en`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    const input = page.frameLocator("#case-preview").locator("#email");
    await input.fill("screen@example.com");
    await page.locator("[data-fullscreen]").click();
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "true",
    );
    if (fallback)
      await expect(page.locator("#preview-panel")).toHaveClass(/is-immersive/);
    await expectViewerContained(page);
    await page.locator("[data-fullscreen-controls]").click();
    await page.locator('[data-device="375"]').click();
    await expect
      .poll(() =>
        page
          .locator("#case-preview")
          .evaluate((f) => f.contentWindow.innerWidth),
      )
      .toBe(375);
    await page.locator("[data-exit-fullscreen]").click();
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "false",
    );
    await expect(page.locator("[data-fullscreen]")).toBeFocused();
    await expect(input).toHaveValue("screen@example.com");
    await page.locator("[data-fullscreen]").click();
    await input.press("Escape");
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "false",
    );
    await expect(page).toHaveURL(/component\/magicui-border-beam/);
  }
});

test("Details open and close without shifting or resizing the demo", async ({
  page,
}) => {
  const { expectStableDetailToggle } = await import("./detail-stability.mjs");
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 655 });
    await page.goto(`./?notes=${width}#component/magicui-border-beam?lang=en`);
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expectStableDetailToggle(page);
    await page.locator('[data-device="768"]').click();
    await expectStableDetailToggle(page);
  }
});

test("Bento's scaled notification animation has no insertion discontinuity", async ({
  page,
}) => {
  const { recordBentoAnimation, expectSmoothBentoAnimation } =
    await import("./bento-animation.mjs");
  await page.clock.install();
  await page.goto("#block/magicui-bento-grid?lang=zh-CN&theme=dark");
  expectSmoothBentoAnimation(await recordBentoAnimation(page));
  expectSmoothBentoAnimation(await recordBentoAnimation(page, true), true);
});

test("Guidance reading, mixed saved state and composer work across engines", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#guidance?lang=en&kind=skill");
  await expect(page.locator(".guidance-card")).toHaveCount(5);
  await page.locator("#content-filters [name=q]").fill("Baseline UI");
  await expect(page.locator(".guidance-card")).toHaveCount(1);
  await page.locator(".guidance-card h2 a").click();
  await expect(page.locator("h1")).toHaveText("Baseline UI");
  await page.locator('[data-save="guidance:baseline-ui"]').click();
  await expect(page.locator("[data-favorite-count]")).toHaveText("1");
  await page.goto("#favorites?lang=en&domain=guidance");
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.locator("[data-save]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".market-empty h2")).toBeFocused();
  await page.goto("#compose?lang=en&skill=animation-performance");
  await page
    .locator("[name=requirements]")
    .fill("Build a bilingual knowledge library.");
  await page.locator("[name=mode]").selectOption("agent");
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[name=output]")).toHaveValue(
    /animation-performance\/SKILL.md/,
  );
  await expect(page.locator("[data-agent-files] a[download]")).toBeVisible();
  await page.reload();
  await expect(page.locator("[name=requirements]")).toHaveValue(
    "Build a bilingual knowledge library.",
  );
  expect(errors).toEqual([]);
});

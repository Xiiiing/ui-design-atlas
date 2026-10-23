import { test, expect } from "@playwright/test";

const browseTop = (page) => page.evaluate(() => scrollY);
async function choose(page, id, name) {
  await page.locator(id).click();
  await page.getByRole("option", { name, exact: true }).click();
}
function watch(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}
test("Marketplace selects preserve FormData, reset, dialog portals and focus", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("#explore?lang=en");
  await choose(page, "#filter-library", "Fluent UI React v9");
  await expect(page.locator(".asset-card")).toHaveCount(4);
  expect(
    await page
      .locator("#filters")
      .evaluate((form) => new FormData(form).getAll("library")),
  ).toEqual(["fluent"]);
  await page.locator("[data-reset-filters]").click();
  await expect(page.locator("#filter-library")).toHaveText("All libraries");
  await expect(page.locator(".asset-card")).toHaveCount(24);
  await page.locator("[name=q]").fill("流光边框");
  await page.locator(".asset-caption [data-open]").click();
  await page.locator("#prompt-scope").click();
  const popover = page.locator(".atlas-select-content");
  await expect(popover).toBeVisible();
  expect(
    await popover.evaluate((el) => !!el.closest("#asset-dialog[open]")),
  ).toBe(true);
  await page
    .getByRole("option", { name: "Visual style only", exact: true })
    .click();
  await expect(page.locator("#prompt-scope")).toBeFocused();
  await expect(page.locator(".full-prompt")).toContainText(
    "Apply these visual and motion rules",
  );
  await page.locator("#locale").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await expect(page.locator("#locale")).toBeFocused();
  await choose(page, "#locale", "中文");
  await expect(page.locator(".inspector-head h2")).toHaveText("流光边框");
  await page.locator("[data-full-detail=code]").click();
  await expect(page.locator("#code-text")).toContainText("BorderBeam");
  await choose(page, "#code-file", "src/vendor/magicui/border-beam.tsx");
  await expect(page.locator("#code-text")).toContainText("motion/react");
  await page.goBack();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭预览", exact: true }).click();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator(".asset-cover-link")).toBeFocused();
  // A close/reopen caused by locale changes must not leave any stale scroll owner.
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe("");
  expect(errors).toEqual([]);
});

test("Resource type navigation keeps stable geometry and detail tabs support keyboards", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("#explore?lang=en");
  const geometry = () =>
    page.locator(".market-tabs a").evaluateAll((els) =>
      els.map((el) => ({
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      })),
    );
  const before = await geometry();
  for (const mode of [
    "motion",
    "components",
    "blocks",
    "pages",
    "cases",
    "explore",
  ]) {
    await page.locator(`[data-market-mode=${mode}]`).click();
    await expect(page.locator(`[data-market-mode=${mode}]`)).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
  expect(await geometry()).toEqual(before);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("[name=q]").fill("流光边框");
  await page.locator(".asset-caption [data-open]").click();
  await page.locator("[data-full-detail]").first().click();
  await page.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Code", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: "Code", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Code", exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});

test("Shell appearance persists across tabs and stays independent of archived previews", async ({
  page,
  context,
}) => {
  const errors = watch(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("#explore?lang=en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Atlas appearance", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const other = await context.newPage();
  await other.goto("#explore?lang=en");
  await page
    .getByRole("button", { name: "Atlas appearance", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "Dark", exact: true }).click();
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await other.close();
  await page
    .locator('[data-open="component:magicui-shimmer-button"]')
    .last()
    .click();
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("button", { name: "Shimmer Button", exact: true }),
  ).toBeVisible();
  await expect(
    page.frameLocator("#case-preview").locator("html"),
  ).not.toHaveClass(/dark/);
  await page.locator("[data-preview-theme]").click();
  await expect(page.frameLocator("#case-preview").locator("html")).toHaveClass(
    /dark/,
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Atlas appearance", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Follow system", exact: true })
    .click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("Document scrolling, touch controls and progressive filters work across sizes", async ({
  page,
}) => {
  const errors = watch(page);
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#explore?lang=en");
    if (width === 375) {
      await expect(page.locator("#filter-source")).not.toBeVisible();
      await page.locator("[data-advanced-filters]").click();
      await expect(page.locator("#filter-source")).toBeVisible();
      await choose(page, "#filter-source", "Open source");
      await page.reload();
      await expect(page.locator("[data-advanced-filters]")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await page.locator("[data-reset-filters]").click();
    }
    const sizes = await page
      .locator(
        ".discovery-toolbar button, .market-search input, .market-header button",
      )
      .evaluateAll((els) =>
        els
          .filter(
            (el) =>
              el.getClientRects().length &&
              getComputedStyle(el).visibility !== "hidden",
          )
          .map((el) => ({
            name: el.getAttribute("aria-label") || el.textContent,
            height: el.getBoundingClientRect().height,
          }))
          .filter((el) => el.height < (innerWidth < 768 ? 43.5 : 31.5)),
      );
    expect(sizes).toEqual([]);
    await page.locator("[data-more]").click();
    await page.locator(".asset-card").nth(30).scrollIntoViewIfNeeded();
    const scroll = await browseTop(page);
    expect(scroll).toBeGreaterThan(0);
    await page
      .locator(".asset-card")
      .nth(30)
      .locator(".asset-caption [data-open]")
      .click();
    await page
      .getByRole("button", { name: "Close preview", exact: true })
      .click();
    await expect.poll(() => browseTop(page)).toBeCloseTo(scroll, 0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

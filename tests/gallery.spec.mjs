import { test, expect } from "@playwright/test";
import { resources } from "../catalog.js";
import { resourcePresentation } from "../presentation.js";

const choose = async (page, id, name) => {
  await page.locator(id).click();
  await page.getByRole("option", { name, exact: true }).click();
};

test("Gallery uses native document scrolling, compact previews and wide spans", async ({
  page,
}) => {
  for (const [width, columns] of [
    [1440, 4],
    [768, 2],
    [375, 1],
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#explore?lang=en");
    await expect(page.locator(".asset-card")).toHaveCount(24);
    const metrics = await page.evaluate(() => ({
      columns: getComputedStyle(
        document.querySelector(".market-grid"),
      ).gridTemplateColumns.split(" ").length,
      wrapper: getComputedStyle(document.querySelector(".workspace"))
        .borderRadius,
      overflow: document.documentElement.scrollWidth > innerWidth,
      first: document.querySelector(".asset-card").getBoundingClientRect()
        .bottom,
    }));
    expect(metrics.columns).toBe(columns);
    expect(metrics.wrapper).toBe("0px");
    expect(metrics.overflow).toBe(false);
    if (width === 1440) expect(metrics.first).toBeLessThan(1000);
    await expect(
      page.locator('[data-resource="component:antd-table"]'),
    ).toHaveAttribute("data-layout", "wide");
    const thumb = page.locator(
      '[data-resource="component:magicui-ripple-button"] img',
    );
    await thumb.scrollIntoViewIfNeeded();
    await thumb.evaluate((img) => img.decode());
    expect(
      await thumb.evaluate((img) => [img.naturalWidth, img.naturalHeight]),
    ).toEqual([400, 400]);
  }
});

test("Filter chips remove individual conditions and collapsed filters retain their values", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  await page.locator("[data-category=feedback]").click();
  await choose(page, "#filter-library", "Fluent UI React v9");
  await page.locator("[data-advanced-filters]").click();
  await choose(page, "#filter-source", "Open source");
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await expect(page.locator("[data-remove-filter]")).toHaveCount(3);
  await page.locator("[data-advanced-filters]").click();
  await expect(page.locator("#filter-source")).not.toBeVisible();
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await page.locator("[data-remove-filter=category]").click();
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await expect(page).not.toHaveURL(/category=/);
  await page.reload();
  await expect(page.locator("[data-remove-filter]")).toHaveCount(2);
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await page.locator("[data-reset-filters]").click();
  await expect(page.locator(".asset-card")).toHaveCount(24);
  await expect(page.locator("[data-remove-filter]")).toHaveCount(0);
  await page.locator("[name=q]").fill("微软");
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await page.locator("[data-remove-filter=q]").click();
  await expect(page.locator("[name=q]")).toHaveValue("");
  await expect(page.locator(".asset-card")).toHaveCount(24);
});

test("Live cards use the same frame as their screenshot and unload outside the viewport", async ({
  page,
}) => {
  await page.goto("#components?lang=en");
  const r = resources.find((r) => r.id === "magicui-shimmer-button"),
    p = resourcePresentation(r);
  const card = page.locator(`[data-resource="component:${r.id}"]`);
  await card.hover();
  await expect(card.locator("iframe")).toBeAttached();
  await expect
    .poll(() =>
      card
        .locator("iframe")
        .evaluate((f) => [
          f.contentWindow.innerWidth,
          f.contentWindow.innerHeight,
        ]),
    )
    .toEqual([p.width, p.height]);
  await expect
    .poll(() =>
      card
        .locator("iframe")
        .evaluate((f) => f.contentDocument?.documentElement.dataset.thumbnail),
    )
    .toBe("true");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(card.locator("iframe")).toHaveCount(0);
  expect(await page.locator(".asset-live iframe").count()).toBeLessThanOrEqual(
    2,
  );
});

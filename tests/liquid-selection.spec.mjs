import { test, expect } from "@playwright/test";

async function aligned(page, group, selected) {
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

// Sample actual rendered frames rather than checking for animation class names.
test("Category clicks flow through one marker without displacing text or results", async ({
  page,
}) => {
  await page.goto("#motion?lang=zh-CN");
  await aligned(page, ".category-strip", "[aria-pressed=true]");
  const samples = await page.evaluate(async () => {
    const group = document.querySelector(".category-strip");
    const marker = group.querySelector("[data-selection-marker]");
    const boxes = () =>
      [...group.querySelectorAll("button")].map((el) => {
        const b = el.getBoundingClientRect();
        return [b.x, b.y, b.width, b.height];
      });
    const before = boxes(),
      top = document
        .querySelector(".market-results-line")
        .getBoundingClientRect().top;
    const frames = [],
      start = performance.now();
    let stage = 0;
    group.querySelector("[data-category=cards]").click();
    await new Promise((resolve) => {
      const sample = () => {
        const elapsed = performance.now() - start;
        const b = marker.getBoundingClientRect();
        const active = group
          .querySelector("[aria-pressed=true]")
          .getBoundingClientRect();
        frames.push({
          x: b.x,
          target: active.x,
          same: marker === group.querySelector("[data-selection-marker]"),
          scale: new DOMMatrix(getComputedStyle(marker).transform).a,
          top: document
            .querySelector(".market-results-line")
            .getBoundingClientRect().top,
        });
        if (elapsed > 90 && stage === 0) {
          group.querySelector("[data-category=text]").click();
          stage++;
        }
        if (elapsed > 160 && stage === 1) {
          group.querySelector("[data-category=buttons]").click();
          stage++;
        }
        if (elapsed < 750) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });
    return { before, after: boxes(), top, frames };
  });
  expect(samples.after).toEqual(samples.before);
  expect(
    samples.frames.every((f) => f.same && Math.abs(f.top - samples.top) < 1),
  ).toBe(true);
  expect(samples.frames.some((f) => Math.abs(f.x - f.target) > 3)).toBe(true);
  expect(samples.frames.some((f) => f.scale > 1.005)).toBe(true);
  await expect(page).toHaveURL(/category=buttons/);
  await expect(page.locator(".asset-card")).toHaveCount(2);
  await aligned(page, ".category-strip", "[aria-pressed=true]");
  await page.locator("[data-remove-filter=category]").click();
  expect(
    await page
      .locator(".market-results-line")
      .evaluate((el) => el.getBoundingClientRect().top),
  ).toBe(samples.top);
  await aligned(page, ".category-strip", "[data-category=all]");
  await page.locator("[data-category=buttons]").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-category=buttons]")).toBeFocused();
  await expect(page.locator("[data-category=buttons]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await aligned(page, ".category-strip", "[data-category=buttons]");
});

test("Type selection retains its moving marker, link dimensions and focus through navigation and history", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
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
  await page.goto("#discover?lang=en");
  await page
    .locator(".library-category-row [data-selection-marker]")
    .evaluate((el) => {
      window.categoryMarker = el;
    });
  await page
    .locator('.discovery-categories a[href*="category=buttons"]')
    .click();
  await aligned(page, ".category-strip", "[data-category=buttons]");
  expect(
    await page
      .locator(".category-strip [data-selection-marker]")
      .evaluate((el) => el === window.categoryMarker),
  ).toBe(true);
});

test("Selection tracks scrolled controls, language, resizing and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const lang of ["zh-CN", "en"]) {
    for (const width of [1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`#motion?lang=${lang}`);
      await page.evaluate(() => document.fonts.ready);
      await aligned(page, ".category-strip", "[aria-pressed=true]");
      await page.locator("[data-category=feedback]").click();
      await aligned(page, ".category-strip", "[aria-pressed=true]");
      const marker = page.locator(".category-strip [data-selection-marker]");
      await expect(marker).toHaveAttribute("aria-hidden", "true");
      expect(
        await marker.evaluate((el) => getComputedStyle(el).pointerEvents),
      ).toBe("none");
      const samples = await page
        .locator(".category-strip")
        .evaluate(async (el) => {
          const oldX = el
            .querySelector("[data-selection-marker]")
            .getBoundingClientRect().x;
          const targetX = el
            .querySelector("[data-category=buttons]")
            .getBoundingClientRect().x;
          el.querySelector("[data-category=buttons]").click();
          await new Promise((r) =>
            requestAnimationFrame(() =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
          );
          const values = [];
          for (let i = 0; i < 5; i++) {
            await new Promise((r) => requestAnimationFrame(r));
            const m = el.querySelector("[data-selection-marker]"),
              a = el.querySelector("[aria-pressed=true]");
            values.push([
              Math.abs(
                m.getBoundingClientRect().x - a.getBoundingClientRect().x,
              ),
              new DOMMatrix(getComputedStyle(m).transform).a,
            ]);
          }
          return { values, oldDistance: Math.abs(oldX - targetX) };
        });
      expect(
        samples.values.every(
          ([distance, scale]) =>
            (distance < 0.75 ||
              Math.abs(distance - samples.oldDistance) < 0.75) &&
            scale === 1,
        ),
        JSON.stringify({ lang, width, samples }),
      ).toBe(true);
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

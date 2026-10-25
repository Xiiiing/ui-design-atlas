import { test, expect } from "@playwright/test";
import {
  expectViewerContained,
  expectCanvasContained,
} from "./viewer-assertions.mjs";

async function expectFittedCanvas(page, width, height) {
  await expect
    .poll(async () => {
      return page.locator("#case-preview").evaluate(
        (frame, [width, height]) => {
          const viewport = document.querySelector("#preview-viewport");
          const box = frame.getBoundingClientRect();
          const stage = viewport.getBoundingClientRect();
          const device = Number(
            document.querySelector('[data-device][aria-pressed="true"]')
              ?.dataset.device || 0,
          );
          const automatic = !device;
          if (automatic) {
            width = viewport.clientWidth;
            height = viewport.clientHeight;
          }
          const scale = automatic ? 1 : Math.min(1, stage.width / width);
          if (!automatic) height = stage.height / scale;
          return Math.max(
            Math.abs(box.width - width * scale),
            Math.abs(box.height - height * scale),
            Math.abs(box.x - stage.x - (stage.width - box.width) / 2),
            Math.abs(box.y - stage.y - (stage.height - box.height) / 2),
            Math.abs(frame.contentWindow.innerWidth - width),
            Math.abs(frame.contentWindow.innerHeight - height),
            viewport.scrollWidth - viewport.clientWidth,
            viewport.scrollHeight - viewport.clientHeight,
          );
        },
        [width, height],
      );
    })
    .toBeLessThanOrEqual(1);
  await expectViewerContained(page);
  await expectCanvasContained(page);
}

test("Responsive experience fills automatic viewports and fits manual portrait devices", async ({
  page,
}) => {
  for (const [width, height, canvasWidth, canvasHeight] of [
    [2560, 1080, 1280, 800],
    [1440, 900, 1280, 800],
    [1440, 600, 1280, 800],
    [768, 1024, 768, 1024],
    [375, 812, 375, 812],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("#page/shadcn-admin-dashboard?lang=en");
    const frame = page.frameLocator("#case-preview");
    await expect(
      frame.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#inspector")).toBeHidden();
    await expectFittedCanvas(page, canvasWidth, canvasHeight);
    await page.locator(".experience-actions [data-toggle-details]").click();
    await expect(page).toHaveURL(/panel=details/);
    await expect(page.locator("#inspector")).toBeVisible();
    await expectFittedCanvas(page, canvasWidth, canvasHeight);
    await page.locator(".inspector-close").click();
    await expect(page.locator("#inspector")).toBeHidden();
    await expect(
      page.locator(".experience-actions [data-toggle-details]"),
    ).toBeFocused();
    await expectFittedCanvas(page, canvasWidth, canvasHeight);
    await page.locator('[data-device="768"]').click();
    await expectFittedCanvas(page, 768, 1024);
    await page.locator('[data-device="375"]').click();
    await expectFittedCanvas(page, 375, 812);
    const bottom = await page.locator("#case-preview").evaluate((f) => {
      const d = f.contentDocument;
      const owners = [d.scrollingElement, ...d.querySelectorAll("*")].filter(
        (e) =>
          e.scrollHeight > e.clientHeight + 20 &&
          ["auto", "scroll"].includes(getComputedStyle(e).overflowY),
      );
      for (const e of owners) e.scrollTop = e.scrollHeight;
      return owners.map((e) => ({
        top: e.scrollTop,
        remaining: e.scrollHeight - e.clientHeight - e.scrollTop,
      }));
    });
    expect(bottom.some((e) => e.top > 0 && e.remaining < 2)).toBe(true);
    await page.locator('[data-device="0"]').click();
    await expectFittedCanvas(page, canvasWidth, canvasHeight);
    // Actual size is explicit. Oversized canvases must start at a reachable
    // top/left, while returning to fit removes all stage scrolling again.
    await page.locator("[data-fit]").click();
    const native = await page.locator("#case-preview").evaluate((f) => {
      const box = f.getBoundingClientRect();
      const v = document
        .querySelector("#preview-viewport")
        .getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        x: box.x - v.x,
        y: box.y - v.y,
      };
    });
    expect(native.width).toBe(
      width < 1024
        ? await page
            .locator("#preview-viewport")
            .evaluate((el) => el.clientWidth)
        : canvasWidth,
    );
    expect(native.height).toBe(
      width < 1024
        ? await page
            .locator("#preview-viewport")
            .evaluate((el) => el.clientHeight)
        : canvasHeight,
    );
    expect(native.x).toBeGreaterThanOrEqual(0);
    expect(native.y).toBeGreaterThanOrEqual(0);
    await page.locator("[data-fit]").click();
    await expectFittedCanvas(page, canvasWidth, canvasHeight);
  }
});

test("Desktop detail stays centered and readable in wide and short windows", async ({
  page,
}) => {
  for (const [width, height] of [
    [1910, 873],
    [1440, 655],
    [2560, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("#case/shadcn-admin?lang=zh-CN&theme=dark");
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expectFittedCanvas(page, 1280, 800);
    const frame = await page.locator("#case-preview").boundingBox();
    const stage = await page.locator("#preview-viewport").boundingBox();
    const viewer = await page.locator(".experience-viewer").boundingBox();
    expect(viewer.width).toBeLessThanOrEqual(1760);
    expect(frame.width).toBeGreaterThan(300);
    expect(frame.height).toBeGreaterThan(180);
    expect(frame.width).toBeLessThanOrEqual(stage.width + 1);
    expect(frame.height).toBeLessThanOrEqual(stage.height + 1);
    expect(Math.abs(frame.width - stage.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(frame.height - stage.height)).toBeLessThanOrEqual(1);
    const workspace = await page.locator(".workspace").boundingBox();
    expect(
      Math.abs(viewer.x - workspace.x - (workspace.width - viewer.width) / 2),
    ).toBeLessThanOrEqual(1);
    await page.locator("[data-focus-prompt]").click();
    await expect(page.locator("#inspector")).toBeVisible();
    await expect(page.locator(".prompt-text")).toBeVisible();
    await page.locator(".inspector-close").click();
    await expectFittedCanvas(page, 1280, 800);
  }
});

test("Responsive resources survive resize, fullscreen and a real dialog interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#block/magicui-bento-grid?lang=en");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await expectFittedCanvas(page, 1280, 900);
  await page.locator("[data-fullscreen]").click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement?.id))
    .toBe("preview-panel");
  await expectFittedCanvas(page, 1280, 900);
  await page.evaluate(() => document.exitFullscreen());
  await expectFittedCanvas(page, 1280, 900);
  await page.setViewportSize({ width: 2560, height: 1000 });
  await expectFittedCanvas(page, 1280, 900);
  await page.goto("#component/fluent-dialog?lang=en");
  const demo = page.frameLocator("#case-preview");
  await expectFittedCanvas(page, 640, 480);
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await demo.getByRole("button", { name: "Close", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeHidden();
});

test("Details entry, code deep link and back restore filters, load count and exact entry focus", async ({
  page,
}) => {
  await page.goto("#components?lang=en&style=motion-neutral");
  const entry = page.locator(".asset-actions [data-details]").last();
  await entry.scrollIntoViewIfNeeded();
  const hash = await page.evaluate(() => location.hash),
    scroll = await page.evaluate(() => scrollY),
    count = await page.locator(".asset-card").count();
  await entry.click();
  await expect(page).toHaveURL(/panel=details/);
  await expect(page.locator("#inspector")).toBeVisible();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(page.locator("#code-text")).toBeVisible();
  await page.locator("[data-close-viewer]").first().click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(hash);
  await expect(page.locator(".asset-card")).toHaveCount(count);
  await expect(entry).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
  await page.goto(url);
  await expect(page.locator("#code-text")).toBeVisible();
});

test("Wide preview failures retry in the same stage and ignore unrelated iframe messages", async ({
  page,
}) => {
  await page.route("**/examples/ui-market/index.html?**", (r) =>
    r.fulfill({ status: 503, contentType: "text/html", body: "Unavailable" }),
  );
  await page.goto("#component/fluent-dialog?lang=en");
  await expect(page.locator("[data-retry-viewer]")).toBeVisible();
  const before = await page.locator("#preview-viewport").boundingBox();
  await page.unroute("**/examples/ui-market/index.html?**");
  await page.locator("[data-retry-viewer]").click();
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  expect(await page.locator("#preview-viewport").boundingBox()).toEqual(before);
  const demo = page.frameLocator("#case-preview");
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await demo.getByRole("button", { name: "Close", exact: true }).click();
  const original = page.url();
  await page.evaluate(() => {
    const f = document.querySelector("#case-preview");
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: location.origin,
        source: window,
        data: { type: "atlas:escape", resourceId: "fluent-dialog" },
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: location.origin,
        source: f.contentWindow,
        data: {
          type: "atlas:resource-state",
          resourceId: "another-resource",
          theme: "dark",
        },
      }),
    );
  });
  expect(page.url()).toBe(original);
  await expect(page.locator(".experience-viewer")).toBeVisible();
});

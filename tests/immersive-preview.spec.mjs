import { test, expect } from "@playwright/test";
import {
  expectViewerContained,
  expectCanvasContained,
} from "./viewer-assertions.mjs";

async function measurements(page) {
  return page.locator("#case-preview").evaluate((frame) => {
    const bounds = frame.getBoundingClientRect(),
      stage = document
        .querySelector("#preview-viewport")
        .getBoundingClientRect();
    const email = frame.contentDocument.querySelector("#email");
    return {
      stage: stage.toJSON(),
      frame: bounds.toJSON(),
      nativeWidth: frame.contentWindow.innerWidth,
      inputFont:
        (parseFloat(frame.contentWindow.getComputedStyle(email).fontSize) *
          bounds.width) /
        frame.contentWindow.innerWidth,
    };
  });
}

test("Compact chrome and width-based devices keep the real login card readable", async ({
  page,
}, info) => {
  const records = [];
  for (const [width, height] of [
    [1910, 873],
    [1440, 655],
    [1273, 582],
    [768, 700],
    [375, 600],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(
      `./?sizing=${width}-${height}#component/magicui-border-beam?lang=zh-CN&theme=dark`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    if (width >= 1024) {
      await page.locator(".experience-actions [data-toggle-details]").click();
      await expect(page.locator("#topbar")).toHaveCSS("height", "44px");
    }
    await page.locator('[data-device="375"]').click();
    const m = await measurements(page);
    expect(m.nativeWidth).toBe(375);
    expect(m.frame.width).toBe(Math.min(375, m.stage.width));
    expect(m.frame.height).toBeCloseTo(m.stage.height, 0);
    expect(m.inputFont).toBeGreaterThanOrEqual(width >= 768 ? 14 : 13);
    if (width >= 1024) expect(m.stage.height / height).toBeGreaterThan(0.7);
    await expectViewerContained(page);
    await expectCanvasContained(page);
    records.push({ width, height, ...m });
    await info.attach(`device-${width}-${height}.png`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }
  await info.attach("device-measurements", {
    body: JSON.stringify(records, null, 2),
    contentType: "application/json",
  });
});

for (const fallback of [false, true])
  test(`Fullscreen gives the demo the entire screen and preserves state (${fallback ? "fallback" : "native"})`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1440, height: 655 });
    if (fallback)
      await page.addInitScript(() => {
        Element.prototype.requestFullscreen = () =>
          Promise.reject(new Error("Fullscreen unavailable"));
      });
    let requests = 0;
    page.on("request", (r) => {
      if (r.isNavigationRequest() && r.frame() !== page.mainFrame()) requests++;
    });
    await page.goto("#component/magicui-border-beam?lang=en&panel=details");
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    const email = page.frameLocator("#case-preview").locator("#email");
    await email.fill("fullscreen@example.com");
    await page.locator("#case-preview").evaluate((f) => {
      window.savedFrame = f;
      window.savedDoc = f.contentDocument;
    });
    const before = requests;
    await page.locator('[data-device="375"]').click();
    await page.locator("[data-fullscreen]").click();
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "true",
    );
    if (fallback)
      await expect(page.locator("#preview-panel")).toHaveClass(/is-immersive/);
    else await expect(page.locator("#preview-panel:fullscreen")).toBeVisible();
    await expect(page.locator(".preview-toolbar")).toBeHidden();
    await expect(page.locator(".market-preview-bottom")).toBeHidden();
    await expectViewerContained(page);
    await expectCanvasContained(page);
    let m = await measurements(page);
    expect(m.frame.width).toBe(375);
    expect(m.inputFont).toBeGreaterThanOrEqual(14);
    await page.locator("[data-fullscreen-controls]").click();
    await expect(page.locator(".preview-toolbar")).toBeVisible();
    await page.locator("[data-preview-setting=duration]").fill("6");
    await page.locator("[data-preview-setting=duration]").press("Tab");
    await expect(
      page.locator("[data-preview-setting=duration]"),
    ).toHaveAttribute("data-applied-value", "6");
    await page.locator('[data-device="0"]').click();
    await page.locator("[data-fullscreen-controls]").click();
    await expect(page.locator(".preview-toolbar")).toBeHidden();
    m = await measurements(page);
    expect(m.frame.width).toBe(1440);
    expect(m.frame.height).toBe(655);
    await info.attach(`fullscreen-${fallback ? "fallback" : "native"}.png`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
    await page.locator("[data-exit-fullscreen]").click();
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "false",
    );
    await expect(page.locator("[data-fullscreen]")).toBeFocused();
    await expect(email).toHaveValue("fullscreen@example.com");
    expect(
      await page
        .locator("#case-preview")
        .evaluate(
          (f) =>
            f === window.savedFrame && f.contentDocument === window.savedDoc,
        ),
    ).toBe(true);
    expect(requests - before).toBe(0);
    await page.locator("[data-fullscreen]").click();
    await expect(page.locator("[data-exit-fullscreen]")).toBeFocused();
    if (fallback) {
      const loaded = page.waitForEvent(
        "framenavigated",
        (f) => f !== page.mainFrame(),
      );
      await page
        .locator("#case-preview")
        .evaluate((f) => f.contentWindow.location.reload());
      await loaded;
      await expect(email).toBeVisible();
    }
    await email.focus();
    await email.press("Escape");
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "false",
    );
    await expect(page).toHaveURL(/component\/magicui-border-beam/);
    await expectViewerContained(page);
  });

test("Escape cancels a pending fullscreen request without closing the resource", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      new Promise((resolve, reject) => {
        window.rejectFullscreen = () =>
          reject(new Error("Permission request cancelled"));
      });
  });
  for (const target of ["parent", "iframe"]) {
    await page.goto(
      `./?pending=${target}#component/magicui-border-beam?lang=en`,
    );
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await page.locator("[data-fullscreen]").click();
    if (target === "parent") await page.keyboard.press("Escape");
    else
      await page
        .frameLocator("#case-preview")
        .locator("#email")
        .press("Escape");
    await expect(page).toHaveURL(/component\/magicui-border-beam/);
    await page.evaluate(() => window.rejectFullscreen());
    await expect(page.locator("#preview-panel")).toHaveAttribute(
      "data-fullscreen-active",
      "false",
    );
    await expect(page.locator("#preview-panel")).not.toHaveClass(
      /is-immersive/,
    );
    await expect(page.locator("[data-fullscreen]")).toBeVisible();
  }
});

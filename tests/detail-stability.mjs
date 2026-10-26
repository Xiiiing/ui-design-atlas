import { expect } from "@playwright/test";

// Record every rendered frame, including the frames before a locator action
// completes: a final bounding-box assertion alone misses a transient jump.
export async function beginDetailMeasurement(page) {
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const frame = document.querySelector("#case-preview");
    const viewport = document.querySelector("#preview-viewport");
    const card = frame.contentDocument.querySelector("[data-slot=card]");
    const state = {
      frame,
      document: frame.contentDocument,
      samples: [],
      resizes: 0,
      running: true,
      raf: 0,
    };
    state.onResize = () => state.resizes++;
    frame.contentWindow.addEventListener("resize", state.onResize);
    function sample() {
      const box = frame.getBoundingClientRect();
      const content = card?.getBoundingClientRect();
      state.samples.push({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        nativeWidth: frame.contentWindow.innerWidth,
        nativeHeight: frame.contentWindow.innerHeight,
        cardX: content
          ? box.x + content.x * (box.width / frame.offsetWidth)
          : 0,
        cardY: content
          ? box.y + content.y * (box.height / frame.offsetHeight)
          : 0,
        scrollX: frame.contentWindow.scrollX,
        scrollY: frame.contentWindow.scrollY,
        stageScrollX: viewport.scrollLeft,
        stageScrollY: viewport.scrollTop,
      });
      if (state.running) state.raf = requestAnimationFrame(sample);
    }
    window.detailMeasurement = state;
    sample();
  });
}

export async function finishDetailMeasurement(page) {
  const result = await page.evaluate(async () => {
    for (let i = 0; i < 12; i++) await new Promise(requestAnimationFrame);
    const state = window.detailMeasurement;
    state.running = false;
    cancelAnimationFrame(state.raf);
    state.frame.contentWindow.removeEventListener("resize", state.onResize);
    return {
      samples: state.samples,
      resizes: state.resizes,
      sameDocument:
        state.frame === document.querySelector("#case-preview") &&
        state.document === state.frame.contentDocument,
    };
  });
  expect(result.sameDocument).toBe(true);
  expect(result.resizes).toBe(0);
  for (const sample of result.samples)
    expect(sample).toEqual(result.samples[0]);
  return result;
}

export async function expectStableDetailToggle(page) {
  await beginDetailMeasurement(page);
  const toggle = page.locator(".experience-actions [data-toggle-details]");
  await toggle.focus();
  await toggle.press("Enter");
  await expect(page.locator("#inspector")).toBeVisible();
  await expect(page).toHaveURL(/panel=details/);
  await expect(page.locator(".inspector-close")).toBeFocused();
  await expect(page.locator(".inspector-close")).toBeInViewport();
  const narrow = (await page.evaluate(() => innerWidth)) < 1024;
  expect(
    await page.locator(".full-preview-column").evaluate((e) => e.inert),
  ).toBe(narrow);
  if (!narrow) {
    const details = await page.locator("#inspector").boundingBox();
    const tools = await page.locator(".preview-toolbar").boundingBox();
    expect(Math.abs(details.y - tools.y - tools.height)).toBeLessThanOrEqual(1);
    await expect(page.locator("[data-fullscreen]")).toBeVisible();
    // The overlay must leave the full toolbar available for real clicks.
    await page.locator("[data-fullscreen]").click({ trial: true });
  }
  await page.locator("#inspector").evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  await expect
    .poll(() => page.locator("#inspector").evaluate((e) => e.scrollTop))
    .toBeGreaterThan(0);
  // Escape works even after the close button has scrolled out of view.
  await page.keyboard.press("Escape");
  await expect(page.locator("#inspector")).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page).not.toHaveURL(/panel=details/);
  const result = await finishDetailMeasurement(page);
  expect(
    await page.locator(".full-preview-column").evaluate((e) => e.inert),
  ).toBe(false);
  return result;
}

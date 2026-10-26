import { expect } from "@playwright/test";

// Install Playwright's clock before navigation. Deterministic 16ms animation
// frames expose insertion discontinuities without depending on CI frame rate.
export async function recordBentoAnimation(page, hover = false) {
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await page
    .locator("#case-preview")
    .evaluate((frame) => frame.contentDocument.fonts.ready);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 60000));
  await page.clock.runFor(500);
  if (hover) {
    const position = await page.locator("#case-preview").evaluate((frame) => {
      const card = frame.contentDocument.querySelector(
        ".demo-surface > div > .grid",
      ).children[1];
      const box = card.getBoundingClientRect(),
        outer = frame.getBoundingClientRect();
      return {
        x: outer.x + box.x + box.width / 2,
        y: outer.y + box.y + box.height / 2,
      };
    });
    await page.mouse.move(position.x, position.y);
  } else await page.mouse.move(0, 0);
  await page.clock.runFor(500);
  await page.locator("#case-preview").evaluate((frame) => {
    const doc = frame.contentDocument,
      grid = doc.querySelector(".demo-surface > div > .grid"),
      card = grid.children[1],
      background = card.querySelector(".absolute"),
      target = card.querySelector("figure"),
      list = target.parentElement.parentElement;
    const state = { samples: [], running: true, raf: 0, doc };
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height];
    };
    function sample() {
      state.samples.push({
        t: frame.contentWindow.performance.now(),
        y: target.getBoundingClientRect().y,
        count: list.children.length,
        scale:
          background.getBoundingClientRect().width / background.offsetWidth,
        canvas: box(frame),
        grid: box(grid),
        cards: [...grid.children].map(box),
        scroll: frame.contentWindow.scrollY,
      });
      if (state.running)
        state.raf = frame.contentWindow.requestAnimationFrame(sample);
    }
    window.bentoProbe = state;
    sample();
  });
  await page.clock.runFor(3500);
  return page.locator("#case-preview").evaluate((frame) => {
    const state = window.bentoProbe;
    state.running = false;
    frame.contentWindow.cancelAnimationFrame(state.raf);
    return {
      samples: state.samples,
      sameDocument: frame.contentDocument === state.doc,
      canHover: frame.contentWindow.matchMedia("(hover: hover)").matches,
    };
  });
}

export function expectSmoothBentoAnimation(result, hover = false) {
  expect(result.sameDocument).toBe(true);
  const samples = result.samples;
  const insertions = samples.slice(1).flatMap((r, i) =>
    r.count !== samples[i].count
      ? [
          {
            dy: r.y - samples[i].y,
            dt: r.t - samples[i].t,
            count: r.count,
          },
        ]
      : [],
  );
  expect(insertions.length).toBeGreaterThanOrEqual(3);
  for (const insertion of insertions) {
    expect(insertion.dt).toBeLessThanOrEqual(17);
    // Before the fix: a repeatable 18px jump at 75% scale.
    // A normal first spring frame advances by less than 2px at this interval.
    expect(Math.abs(insertion.dy)).toBeLessThan(4);
  }
  expect(samples.at(-1).y - samples[0].y).toBeGreaterThan(100);
  expect(samples[0].scale).toBeCloseTo(
    hover && result.canHover ? 0.9 : 0.75,
    2,
  );
  for (const sample of samples) {
    expect(sample.canvas).toEqual(samples[0].canvas);
    expect(sample.grid).toEqual(samples[0].grid);
    expect(sample.cards).toEqual(samples[0].cards);
    expect(sample.scroll).toBe(samples[0].scroll);
  }
  return insertions;
}

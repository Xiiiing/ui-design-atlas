import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
const out = new URL("../docs/ui/liquid-selection/", import.meta.url);
const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4173/ui-design-atlas/";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      page.locator(".category-strip").evaluate((el) => {
        const a = el
          .querySelector("[aria-pressed=true]")
          .getBoundingClientRect();
        const m = el
          .querySelector("[data-selection-marker]")
          ?.getBoundingClientRect();
        return m
          ? Math.max(Math.abs(a.x - m.x), Math.abs(a.width - m.width))
          : 1000;
      }),
    )
    .toBeLessThan(0.75);
}
try {
  for (const width of [1440, 768, 375])
    for (const colorScheme of ["light", "dark"])
      for (const lang of ["zh-CN", "en"]) {
        const ctx = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme,
          hasTouch: width === 375,
          isMobile: width === 375,
        });
        const page = await ctx.newPage(),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.route("**/*", (r) =>
          new URL(r.request().url()).origin === new URL(base).origin
            ? r.continue()
            : r.abort(),
        );
        await page.goto(`${base}#motion?lang=${lang}`);
        await ready(page);
        const top = () =>
          page
            .locator(".market-results-line")
            .evaluate((el) => el.getBoundingClientRect().top);
        const before = await top();
        await page.locator("[data-category=buttons]").click();
        await ready(page);
        await expect(page.locator(".asset-card")).toHaveCount(2);
        const after = await top();
        expect(after).toBe(before);
        await page
          .locator(".asset-preview img")
          .evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode())));
        await page.mouse.move(0, 0);
        const name = `buttons-${width}-${colorScheme}-${lang}.png`;
        await page.screenshot({ path: new URL(name, out).pathname });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        expect(overflow).toBe(false);
        expect(errors).toEqual([]);
        await page.locator("[data-remove-filter=category]").click();
        await ready(page);
        expect(await top()).toBe(before);
        results.push({
          width,
          colorScheme,
          lang,
          before,
          after,
          cleared: await top(),
          overflow,
          errors,
          screenshot: name,
        });
        await ctx.close();
      }
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "dark",
    recordVideo: { dir: out.pathname, size: { width: 1440, height: 1000 } },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}#discover?lang=zh-CN`);
  await expect(
    page.locator(".library-types [data-selection-marker]"),
  ).toBeVisible();
  await page.locator("[data-market-mode=motion]").click();
  await ready(page);
  await page.screenshot({
    path: new URL("motion-before-filter.png", out).pathname,
  });
  for (const category of [
    "cards",
    "text",
    "buttons",
    "navigation",
    "buttons",
  ]) {
    await page.locator(`[data-category=${category}]`).click();
    // Short interruption demonstrates continuity rather than independent restarts.
    await page.waitForTimeout(90);
  }
  await ready(page);
  await page.screenshot({ path: new URL("motion-buttons.png", out).pathname });
  await page.locator(".asset-caption [data-open]").last().click();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("button", { name: "微光按钮", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭预览", exact: true }).click();
  await page.locator("[data-market-mode=components]").click();
  await ready(page);
  await page.goBack();
  await ready(page);
  const video = page.video();
  await ctx.close();
  await rename(await video.path(), new URL("interaction.webm", out));
  const bundle = await readFile(
    new URL("../dist/atlas-shell.js", import.meta.url),
  );
  await writeFile(
    new URL("verification.json", out),
    JSON.stringify(
      {
        bundleSHA256: createHash("sha256").update(bundle).digest("hex"),
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}

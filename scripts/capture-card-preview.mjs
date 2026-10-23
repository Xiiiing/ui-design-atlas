import { chromium, expect } from "@playwright/test";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
const out = new URL("../docs/ui/card-preview/", import.meta.url);
const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4173/ui-design-atlas/";
await mkdir(out, { recursive: true });
const browser = await chromium.launch(),
  results = [];
try {
  for (const [width, colorScheme, lang, view] of [
    [1440, "dark", "zh-CN", "motion"],
    [768, "light", "en", "motion"],
    [375, "dark", "zh-CN", "motion"],
    [1440, "light", "en", "blocks"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      colorScheme,
      isMobile: width === 375,
      hasTouch: width === 375,
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (r) =>
      new URL(r.request().url()).origin === new URL(base).origin
        ? r.continue()
        : r.abort(),
    );
    await page.goto(
      `${base}#${view}?lang=${lang}${view === "motion" ? "&category=buttons" : ""}`,
    );
    await page.evaluate(() => document.fonts.ready);
    const card = page
      .locator(
        view === "motion"
          ? '[data-resource="component:magicui-shimmer-button"]'
          : ".asset-card",
      )
      .first();
    await card.scrollIntoViewIfNeeded();
    const geometry = () =>
      card.evaluate((el) =>
        Object.fromEntries(
          [
            ".asset-preview",
            ".asset-caption",
            ".asset-description",
            ".motion-badge",
          ].map((s) => [
            s,
            el.querySelector(s)?.getBoundingClientRect().toJSON(),
          ]),
        ),
      );
    const before = await geometry();
    if (width !== 375) {
      await card.hover();
      await expect(card).toHaveClass(/is-live/);
      // iframe load precedes React's lazy demo chunk. Capture the actual
      // archived UI after Suspense resolves rather than its loading fallback.
      await expect(
        card
          .frameLocator("iframe")
          .getByText(
            view === "blocks"
              ? "Save your files"
              : lang === "en"
                ? "Shimmer Button"
                : "微光按钮",
            { exact: true },
          ),
      ).toBeVisible();
    }
    await expect(card.locator(".asset-description")).toHaveCSS("opacity", "1");
    const after = await geometry();
    expect(after).toEqual(before);
    expect(after[".asset-description"].top).toBeGreaterThanOrEqual(
      after[".asset-caption"].bottom,
    );
    const screenshot = `${view}-${width}-${colorScheme}-${lang}.png`;
    await page.screenshot({ path: new URL(screenshot, out).pathname });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
    expect(errors).toEqual([]);
    results.push({
      width,
      colorScheme,
      lang,
      view,
      before,
      after,
      screenshot,
      overflow,
      errors,
    });
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "dark",
    recordVideo: { dir: out.pathname, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  await page.goto(`${base}#motion?lang=zh-CN&category=buttons`);
  const card = page.locator(
    '[data-resource="component:magicui-shimmer-button"]',
  );
  await card.hover();
  await expect(card).toHaveClass(/is-live/);
  await page.waitForTimeout(650);
  await page.mouse.move(0, 0);
  await card.locator(".asset-cover-link").focus();
  await page.waitForTimeout(500);
  await page.screenshot({ path: new URL("keyboard-focus.png", out).pathname });
  await page.keyboard.press("Enter");
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("button", { name: "微光按钮", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭预览", exact: true }).click();
  await expect(card.locator(".asset-cover-link")).toBeFocused();
  const video = page.video();
  await context.close();
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

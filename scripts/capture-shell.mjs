import { chromium, expect } from "@playwright/test";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const out = fileURLToPath(new URL("../docs/ui/yingxu-shell/", import.meta.url));
const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4173/ui-design-atlas/";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const result = [];
for (const width of [1982, 1440, 390])
  for (const mode of ["light", "dark"]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 1000 },
      isMobile: width < 500,
      hasTouch: width < 500,
      colorScheme: mode,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (r) =>
      new URL(r.request().url()).origin === new URL(base).origin
        ? r.continue()
        : r.abort(),
    );
    await page.goto(`${base}#explore?lang=zh-CN`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
    await expect(page.locator("#filter-library")).toBeVisible();
    await page
      .locator(".asset-preview > img")
      .first()
      .evaluate((img) => img.decode());
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await page.screenshot({
      path: path.join(out, `market-${width}-${mode}.png`),
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
    await page.locator(".asset-caption [data-open]").first().click();
    await expect(
      page
        .frameLocator("#case-preview")
        .getByRole("button", { name: "登录", exact: true }),
    ).toBeVisible();
    if (mode === "dark") {
      await page.locator("[data-preview-theme]").click();
      await expect(
        page.frameLocator("#case-preview").locator("html"),
      ).toHaveClass(/dark/);
    }
    await expect(page.locator(".detail-tabs .selection-marker")).toBeVisible();
    await page.screenshot({
      path: path.join(out, `detail-${width}-${mode}.png`),
    });
    result.push({
      width,
      height: 1000,
      mode,
      locale: "zh-CN",
      overflow,
      errors,
    });
    expect(errors).toEqual([]);
    await ctx.close();
  }
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: { dir: out, size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();
await page.goto(`${base}#explore?lang=zh-CN`);
await expect(page.locator(".market-tabs .selection-marker")).toBeVisible();
await page
  .locator(".asset-preview > img")
  .first()
  .evaluate((img) => img.decode());
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
await page.locator("[name=q]").fill("流光边框");
await page.locator(".asset-caption [data-open]").click();
await expect(
  page
    .frameLocator("#case-preview")
    .getByRole("button", { name: "登录", exact: true }),
).toBeVisible();
await page.getByRole("tab", { name: "提示词", exact: true }).click();
await page.locator("#prompt-scope").click();
await page.getByRole("option", { name: "只复用视觉风格", exact: true }).click();
await page.getByRole("tab", { name: "代码", exact: true }).click();
await expect(page.locator("#code-text")).toContainText("BorderBeam");
await page.getByRole("button", { name: "关闭预览", exact: true }).click();
const video = page.video();
await context.close();
await rename(await video.path(), path.join(out, "selection-interaction.webm"));
await writeFile(
  path.join(out, "verification.json"),
  JSON.stringify(
    {
      baseline: "b3cc662ce5cfe7947d6e5cec84ae54719f5d1062",
      screens: result,
      interactionRecording: "selection-interaction.webm",
      data: "Existing local archive demo data; browser captures, no generated mockups.",
    },
    null,
    2,
  ) + "\n",
);
await browser.close();
console.log(
  `Captured ${result.length} home/detail pairs and real interaction recording in docs/ui/yingxu-shell/.`,
);

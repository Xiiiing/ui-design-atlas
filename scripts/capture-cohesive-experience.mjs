import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, rename, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4173/ui-design-atlas/";
const beforeBase = process.env.ATLAS_BEFORE_URL;
const out = new URL("../docs/ui/cohesive-experience/", import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [],
  results = [];
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: new URL(name + ".png", out).pathname });
  results.push({
    name,
    url: page.url(),
    scroll: await page.evaluate(() => scrollY),
  });
}
try {
  if (beforeBase) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    await page.goto(beforeBase + "#page/folio-home?lang=zh-CN");
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await shot(page, "before-original-dark");
    await page.goto(beforeBase + "#explore?lang=zh-CN");
    await page.evaluate(() => scrollTo(0, 650));
    await expect(page.locator("#topbar")).toHaveClass("is-compact");
    await page.locator(".market-navigation a").first().click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await shot(page, "before-navigation");
    await context.close();
  }
  for (const [width, height, lang, colorScheme] of [
    [2560, 1100, "zh-CN", "dark"],
    [1440, 900, "en", "light"],
    [768, 1024, "en", "light"],
    [375, 812, "zh-CN", "dark"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "#explore?lang=" + lang);
    await shot(page, "browse-" + width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto(base + "#page/atlas-product-page?lang=" + lang);
    await expect(
      page.frameLocator("#case-preview").getByRole("heading").first(),
    ).toBeVisible();
    await shot(page, "product-" + width);
    const geometry = await page.locator("#case-preview").evaluate((f) => ({
      native: [f.clientWidth, f.clientHeight],
      displayed: [
        f.getBoundingClientRect().width,
        f.getBoundingClientRect().height,
      ],
    }));
    expect(geometry.displayed[0] / geometry.displayed[1]).toBeCloseTo(
      geometry.native[0] / geometry.native[1],
      4,
    );
    results.at(-1).geometry = geometry;
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    recordVideo: { dir: out.pathname, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "#page/folio-home?lang=zh-CN");
  await expect(
    page.frameLocator("#case-preview").locator("html"),
  ).toHaveAttribute("data-theme", "dark");
  await shot(page, "after-original-dark");
  await page.locator("[data-preview-theme]").click();
  await expect(
    page.frameLocator("#case-preview").locator("html"),
  ).toHaveAttribute("data-theme", "light");
  await shot(page, "local-light-override");
  await page.goto(base + "#explore?lang=zh-CN");
  await page.evaluate(() => scrollTo(0, 650));
  await expect(page.locator("#topbar")).toHaveClass("is-compact");
  await page.locator("[data-primary-view=discover]").click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await shot(page, "after-navigation");
  await page.locator("[data-primary-view=explore]").click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await page.goto(base + "#component/atlas-feedback?lang=zh-CN");
  let f = page.frameLocator("#case-preview");
  await f.getByRole("button", { name: "模拟失败", exact: true }).click();
  await shot(page, "feedback-error");
  await f.getByRole("button", { name: /重\s*试/ }).click();
  await expect(f.getByRole("status")).toContainText("已保存");
  await shot(page, "feedback-recovered");
  await page.goto(base + "#page/atlas-product-page?lang=zh-CN");
  f = page.frameLocator("#case-preview");
  await f.getByText("年付", { exact: true }).click();
  await f.getByRole("button", { name: "联系团队", exact: true }).click();
  await f.getByRole("textbox", { name: "邮箱" }).fill("demo@example.com");
  await f.getByRole("button", { name: "提交演示", exact: true }).click();
  await expect(f.getByRole("status")).toContainText("提交成功");
  await shot(page, "product-interaction");
  const video = page.video();
  await context.close();
  await rename(await video.path(), new URL("interaction.webm", out));
  expect(errors).toEqual([]);
  const hashes = {};
  for (const file of ["app.js", "market.css", "legacy-theme.js"])
    hashes[file] = createHash("sha256")
      .update(await readFile(new URL("../dist/" + file, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL("verification.json", out),
    JSON.stringify({ base, beforeBase, hashes, results, errors }, null, 2) +
      "\n",
  );
} finally {
  await browser.close();
}

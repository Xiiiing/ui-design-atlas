import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
// Run after npm run build, with npm run preview serving the built site.
const dir = process.argv[2] || "output/navigation-theme";
const base =
  process.env.ATLAS_CAPTURE_BASE || "http://127.0.0.1:4173/ui-design-atlas/";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "dark",
  recordVideo: { dir: dir + "/video", size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();
await page.goto(base + "#explore?lang=zh-CN");
await expect(
  page.locator('[data-resource="component:magicui-border-beam"]'),
).toHaveAttribute("data-preview-state", "ready");
await page.screenshot({ path: dir + "/header-expanded.png" });
await page.mouse.move(1280, 750);
await page.mouse.wheel(0, 600);
await expect(page.locator("#topbar")).toHaveClass("is-compact");
await expect
  .poll(() =>
    page
      .locator(".market-header")
      .evaluate((el) => el.getBoundingClientRect().width),
  )
  .toBe(496);
await page.screenshot({ path: dir + "/header-compact.png" });
await page.locator("#site-locale").click();
await page.screenshot({ path: dir + "/language-menu.png" });
await page.getByRole("option", { name: "English", exact: true }).click();
await page.locator("#topbar .appearance-trigger").click();
await page.screenshot({ path: dir + "/compact-light.png" });
await page.locator("#topbar .appearance-trigger").click();
await page.locator("#topbar .appearance-trigger").click();
await page.goto(base + "#component/magicui-border-beam?lang=en");
const frame = page.frameLocator("#case-preview");
await frame.locator("input[type=email]").fill("theme-check@example.com");
await page.locator("#topbar .appearance-trigger").click();
await expect(frame.locator("html")).not.toHaveClass(/dark/);
await page.screenshot({ path: dir + "/viewer-synced-light.png" });
await page.locator("#topbar .appearance-trigger").click();
await expect(frame.locator("html")).toHaveClass(/dark/);
await page.screenshot({ path: dir + "/viewer-synced-dark.png" });
const video = page.video();
await context.close();
await video.saveAs(dir + "/navigation-and-theme.webm");
for (const width of [2560, 768, 375]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    colorScheme: "dark",
  });
  const p = await context.newPage();
  await p.goto(base + "#explore?lang=zh-CN");
  await expect(
    p.locator('[data-resource="component:magicui-border-beam"]'),
  ).toHaveAttribute("data-preview-state", "ready");
  await p.evaluate(() => scrollTo(0, 600));
  await expect(p.locator("#topbar")).toHaveClass("is-compact");
  await expect
    .poll(() =>
      p
        .locator(".market-header")
        .evaluate((el) => el.getBoundingClientRect().y),
    )
    .toBe(8);
  await p.screenshot({ path: dir + `/compact-${width}.png` });
  await context.close();
}
await browser.close();

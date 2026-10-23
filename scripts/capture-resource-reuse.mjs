import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const directory = new URL("../docs/ui/resource-reuse/", import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 768, 375])
    for (const lang of ["zh-CN", "en"])
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          hasTouch: width === 375,
          isMobile: width === 375,
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.addInitScript(
          (theme) => localStorage.setItem("atlas-shell-theme", theme),
          theme,
        );
        await page.goto(
          `http://127.0.0.1:4173/ui-design-atlas/#component/magicui-border-beam?lang=${lang}&tab=code`,
        );
        await expect(page.locator("#code-text")).toContainText("BorderBeam");
        await page.locator(".code-integration summary").click();
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        expect(overflow).toBe(false);
        expect(errors).toEqual([]);
        const screenshot = `source-${width}-${theme}-${lang}.png`;
        await page.screenshot({
          path: new URL(screenshot, directory).pathname,
          fullPage: true,
        });
        results.push({ width, lang, theme, overflow, errors, screenshot });
        await context.close();
      }
  await writeFile(
    new URL("verification.json", directory),
    JSON.stringify({ screens: results }, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
console.log(
  `Captured ${results.length} source views without overflow or page errors.`,
);

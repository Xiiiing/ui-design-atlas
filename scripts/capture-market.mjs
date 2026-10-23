import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, rename, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const out = fileURLToPath(
  new URL("../docs/ui/resource-market/", import.meta.url),
);
const base =
  process.env.ATLAS_CAPTURE_URL || "http://127.0.0.1:4173/ui-design-atlas/";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 768, 375])
    for (const mode of ["light", "dark"])
      for (const lang of ["zh-CN", "en"]) {
        const ctx = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: mode,
          isMobile: width < 500,
          hasTouch: width < 500,
        });
        const page = await ctx.newPage(),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("response", (r) => {
          if (r.status() >= 400) errors.push(r.status() + " " + r.url());
        });
        await page.route("**/*", (route) =>
          new URL(route.request().url()).origin === new URL(base).origin
            ? route.continue()
            : route.abort(),
        );
        const suffix = `${width}-${mode}-${lang}`;
        const overflow = async () =>
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
          ).toBe(false);
        await page.goto(`${base}#explore?lang=${lang}`);
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        await expect(page.locator(".asset-card")).toHaveCount(24);
        await page
          .locator(".asset-preview img")
          .evaluateAll((imgs) =>
            Promise.all(
              imgs
                .filter((img) => img.getBoundingClientRect().top < innerHeight)
                .map((img) => img.decode()),
            ),
          );
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(0, 0);
        await overflow();
        await page.screenshot({ path: path.join(out, `home-${suffix}.png`) });
        await page.locator(".asset-caption [data-open]").first().click();
        await expect(
          page.frameLocator("#case-preview").getByRole("button", {
            name: lang === "en" ? "Login" : "登录",
            exact: true,
          }),
        ).toBeVisible();
        const frame = page.frameLocator("#case-preview");
        // At mobile sizes the complete source card must fit the compact preview viewport.
        if (width < 500) {
          const bottom = await frame
            .getByRole("button", {
              name: lang === "en" ? "Login" : "登录",
              exact: true,
            })
            .evaluate((el) => el.getBoundingClientRect().bottom);
          expect(bottom).toBeLessThanOrEqual(
            await page.locator("#case-preview").evaluate((f) => f.clientHeight),
          );
        }
        await page.mouse.move(0, 0);
        await overflow();
        await page.screenshot({
          path: path.join(out, `component-${suffix}.png`),
        });
        await page.goto(
          `${base}#page/shadcn-admin-dashboard?lang=${lang}&theme=${mode}`,
        );
        await expect(
          page.frameLocator("#case-preview").getByRole("heading", {
            name: lang === "en" ? "Dashboard" : "工作台",
            exact: true,
          }),
        ).toBeVisible();
        expect(
          await page
            .locator("#case-preview")
            .evaluate((f) => f.contentWindow.innerWidth),
        ).toBe(1280);
        // Wait for the source chart's entrance animation before recording it.
        await page.waitForTimeout(1800);
        await overflow();
        await page.screenshot({ path: path.join(out, `page-${suffix}.png`) });
        for (const route of ["favorites", "cases", "resources", "guide"]) {
          await page.goto(`${base}#${route}?lang=${lang}`);
          await expect(page.locator("#main h1")).toBeVisible();
          await overflow();
        }
        expect(errors).toEqual([]);
        results.push({
          width,
          height: 1000,
          mode,
          lang,
          externalRuntimeBlocked: true,
          errors,
        });
        await ctx.close();
      }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
    recordVideo: { dir: out, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  await page.goto(`${base}#explore?lang=zh-CN`);
  await page.locator("[data-category=buttons]").click();
  await page.waitForTimeout(350);
  await page.locator("[name=q]").fill("微光");
  await page.waitForTimeout(350);
  await page.locator(".asset-caption [data-open]").click();
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("button", { name: "微光按钮", exact: true }),
  ).toBeVisible();
  await page.locator("[data-preview-setting]").fill("6");
  await page.locator("[data-replay]").click();
  await page.waitForTimeout(700);
  await page.getByRole("tab", { name: "提示词", exact: true }).click();
  await page.locator("#inspector [data-copy-prompt]").click();
  await page.waitForTimeout(700);
  await page.getByRole("tab", { name: "代码", exact: true }).click();
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "关闭预览", exact: true }).click();
  await expect(page.locator("[name=q]")).toHaveValue("微光");
  const video = page.video();
  await context.close();
  await rename(await video.path(), path.join(out, "browse-and-reuse.webm"));
  const hashes = {};
  for (const file of [
    "app.js",
    "market.css",
    "presentation.js",
    "shell/controls.tsx",
    "shell/primitives.tsx",
    "shell/theme.css",
    "examples/ui-market/src/main.tsx",
  ])
    hashes[file] = createHash("sha256")
      .update(await readFile(new URL("../" + file, import.meta.url)))
      .digest("hex");
  await writeFile(
    path.join(out, "verification.json"),
    JSON.stringify(
      {
        referenceCommit: "b96d84dcf748d5e56f2f72f2bab9a4f7f33574cf",
        sourceHashes: hashes,
        results,
        recording: "browse-and-reuse.webm",
        data: "Existing local demo data; actual browser captures, no generated mockups.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Captured ${results.length} viewport/theme/language combinations, 36 screenshots, support routes and a reuse recording.`,
  );
} finally {
  await browser.close();
}

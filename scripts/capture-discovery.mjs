import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
const out = new URL("../docs/ui/discovery/", import.meta.url);
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
          isMobile: width === 375,
          hasTouch: width === 375,
        });
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("response", (r) => {
          if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
        });
        await page.route("**/*", (r) =>
          new URL(r.request().url()).origin === new URL(base).origin
            ? r.continue()
            : r.abort(),
        );
        const capture = async (name) => {
          console.log(`Capturing ${name} ${width} ${mode} ${lang}`);
          await page.evaluate(() => document.fonts.ready);
          await page.locator(".asset-preview img").evaluateAll((imgs) =>
            imgs
              .filter((img) => img.getBoundingClientRect().top < innerHeight)
              .forEach((img) => {
                img.loading = "eager";
              }),
          );
          await expect
            .poll(() =>
              page
                .locator(".asset-preview img")
                .evaluateAll((imgs) =>
                  imgs
                    .filter(
                      (img) => img.getBoundingClientRect().top < innerHeight,
                    )
                    .every((img) => img.complete && img.naturalWidth > 0),
                ),
            )
            .toBe(true);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
          ).toBe(false);
          await page.mouse.move(0, 0);
          await page.screenshot({
            path: new URL(`${name}-${width}-${mode}-${lang}.png`, out).pathname,
          });
        };
        await page.goto(`${base}#discover?lang=${lang}`);
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        await expect(page.locator(".featured-section .asset-card")).toHaveCount(
          8,
        );
        if (width === 1440)
          expect(
            await page
              .locator(".featured-section .asset-card")
              .first()
              .evaluate((el) => el.getBoundingClientRect().bottom),
          ).toBeLessThan(1000);
        await capture("home");
        await page.goto(`${base}#explore?lang=${lang}&category=buttons`);
        await expect(page.locator("[name=category]")).toHaveValue("buttons");
        await capture("category");
        await page
          .locator(
            '.asset-caption [data-open="component:magicui-shimmer-button"]',
          )
          .click();
        await expect(
          page.frameLocator("#case-preview").getByRole("button", {
            name: lang === "en" ? "Shimmer Button" : "微光按钮",
            exact: true,
          }),
        ).toBeVisible();
        await capture("quick");
        await page.locator("[data-full-detail]").first().click();
        await expect(page.locator(".resource-page")).toBeVisible();
        await expect(
          page.frameLocator("#case-preview").getByRole("button", {
            name: lang === "en" ? "Shimmer Button" : "微光按钮",
            exact: true,
          }),
        ).toBeVisible();
        await capture("detail");
        await page.goto(`${base}#case/shadcn-admin?lang=${lang}&theme=${mode}`);
        await expect(page.locator(".case-page-grid button")).toHaveCount(6);
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
        await capture("case");
        for (const route of ["favorites", "cases", "resources", "guide"]) {
          await page.goto(`${base}#${route}?lang=${lang}`);
          await expect(page.locator("#main h1")).toBeVisible();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
          ).toBe(false);
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
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
    recordVideo: { dir: out.pathname, size: { width: 1440, height: 1000 } },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}#discover?lang=zh-CN`);
  await page.waitForTimeout(700);
  await page.locator(".discovery-shortcuts a").first().click();
  await page.locator("[name=q]").fill("微光");
  await page.locator(".asset-caption [data-open]").click();
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("button", { name: "微光按钮", exact: true }),
  ).toBeVisible();
  await page.locator("[data-preview-setting]").fill("6");
  await page.locator("[data-replay]").click();
  await page.locator("#inspector [data-copy-prompt]").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "duration = 6",
  );
  await page.waitForTimeout(700);
  await page.locator("[data-full-detail=code]").click();
  await expect(page.locator("#code-text")).toContainText("ShimmerButton");
  await page.locator("[data-copy-code]").click();
  await page.waitForTimeout(700);
  await page.goBack();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  await page.goBack();
  await expect(page.locator("[name=q]")).toHaveValue("微光");
  await page.goto(`${base}#case/shadcn-admin?lang=zh-CN`);
  await page.locator('[data-page-preview="shadcn-admin-tasks"]').click();
  await expect(page.locator(".inspector-head h2")).toHaveText("任务管理");
  await page.waitForTimeout(1000);
  const video = page.video();
  await ctx.close();
  await rename(await video.path(), new URL("discover-and-reuse.webm", out));
  const sourceHashes = {};
  for (const file of [
    "app.js",
    "catalog.js",
    "content/discovery.json",
    "presentation.js",
    "market.css",
    "shell/controls.tsx",
    "examples/ui-market/src/main.tsx",
    "examples/ui-market/src/styles/index.css",
  ])
    sourceHashes[file] = createHash("sha256")
      .update(await readFile(new URL("../" + file, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL("verification.json", out),
    JSON.stringify(
      {
        referenceCommit: "b96d84dcf748d5e56f2f72f2bab9a4f7f33574cf",
        sourceHashes,
        results,
        recording: "discover-and-reuse.webm",
        screenshots: 60,
        data: "Actual same-origin browser captures using existing local demo data.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Captured 12 configurations, 60 screenshots and the discovery-to-reuse journey.",
  );
} finally {
  await browser.close();
}

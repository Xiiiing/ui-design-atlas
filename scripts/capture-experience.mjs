import { createHash } from "node:crypto";
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile, rename } from "node:fs/promises";
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
const out = "docs/ui/resource-experience";
await mkdir(out, { recursive: true });
const base = "http://127.0.0.1:4173/ui-design-atlas/";
const browser = await chromium.launch();
const metrics = [];
let beforeServer;
try {
  // Rebuild the exact PR #11 head separately before running this script.
  if (process.env.ATLAS_BASELINE_DIR) {
    beforeServer = spawn(
      process.execPath,
      ["scripts/serve.mjs", "--dist", "--base=/ui-design-atlas/"],
      {
        cwd: process.env.ATLAS_BASELINE_DIR,
        env: { ...process.env, PORT: "4190" },
        stdio: "ignore",
      },
    );
    for (let n = 0; n < 100; n++) {
      try {
        if ((await fetch("http://127.0.0.1:4190/ui-design-atlas/")).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: "dark",
        }),
        page = await context.newPage();
      for (const [name, route] of [
        ["discover", "#discover?lang=zh-CN"],
        ["viewer", "#page/shadcn-admin-dashboard?lang=zh-CN"],
      ]) {
        await page.goto("http://127.0.0.1:4190/ui-design-atlas/" + route);
        await page.evaluate(() => document.fonts.ready);
        if (name === "viewer")
          await expect(
            page
              .frameLocator("#case-preview")
              .getByRole("heading", { name: "工作台", exact: true }),
          ).toBeVisible();
        await page.screenshot({ path: `${out}/before-${name}-${width}.png` });
      }
      await context.close();
    }
  }
  for (const width of [2560, 1440, 768, 375])
    for (const theme of ["light", "dark"])
      for (const lang of ["en", "zh-CN"]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + `#discover?lang=${lang}`);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(".library-browser .asset-card")).toHaveCount(
          24,
        );
        await page
          .locator(".asset-preview > img")
          .first()
          .evaluate((img) => img.decode());
        await expect
          .poll(() =>
            page.evaluate(() =>
              [
                ...document.querySelectorAll(
                  '.asset-card[data-experience="inline"]',
                ),
              ]
                .filter((el) => {
                  const b = el.getBoundingClientRect();
                  return b.top < innerHeight && b.bottom > 0;
                })
                .every((el) => el.dataset.previewState === "ready"),
            ),
          )
          .toBe(true);
        await expect
          .poll(() =>
            page.evaluate(() =>
              [
                ...document.querySelectorAll(
                  '.asset-card[data-experience="inline"]',
                ),
              ]
                .filter((el) => {
                  const r = el.getBoundingClientRect();
                  return r.top < innerHeight && r.bottom > 0;
                })
                .every((el) => el.dataset.previewState === "ready"),
            ),
          )
          .toBe(true);
        await page.screenshot({
          path: `${out}/discover-${width}-${theme}-${lang}.png`,
        });
        const gallery = await page.evaluate(() => ({
          columns: getComputedStyle(
            document.querySelector(".market-grid"),
          ).gridTemplateColumns.split(" ").length,
          firstTop: document
            .querySelector(".asset-preview")
            .getBoundingClientRect().top,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          live: document.querySelectorAll(".asset-live iframe").length,
        }));
        expect(gallery.overflow).toBe(false);
        expect(gallery.live).toBeLessThanOrEqual(8);
        await page.goto(base + `#page/shadcn-admin-dashboard?lang=${lang}`);
        await expect(page.locator(".viewer-load-state")).toBeHidden();
        const demo = page.frameLocator("#case-preview");
        await expect(
          demo.getByRole("heading", {
            name: lang === "en" ? "Dashboard" : "工作台",
            exact: true,
          }),
        ).toBeVisible();
        await page.screenshot({
          path: `${out}/viewer-${width}-${theme}-${lang}.png`,
        });
        const viewer = await page.evaluate(() => {
          const e = document.querySelector("#preview-viewport");
          return {
            height: e.clientHeight,
            scrollHeight: e.scrollHeight,
            documentHeight: document.documentElement.scrollHeight,
            innerHeight,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        expect(viewer.scrollHeight).toBeLessThanOrEqual(viewer.height + 1);
        expect(viewer.documentHeight).toBeLessThanOrEqual(
          viewer.innerHeight + 1,
        );
        expect(viewer.overflow).toBe(false);
        expect(errors).toEqual([]);
        metrics.push({ width, theme, lang, gallery, viewer, errors });
        await context.close();
      }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "dark",
    permissions: ["clipboard-read", "clipboard-write"],
    recordVideo: { dir: out, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  const pause = () => page.waitForTimeout(550);
  await page.goto(base + "#components?lang=en&category=buttons");
  const card = page.locator('[data-resource="component:folio-button"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-live/);
  await pause();
  await card
    .frameLocator("iframe")
    .locator("[data-demo-action]")
    .first()
    .click();
  await pause();
  await card.locator("[data-card-prompt]").click();
  await pause();
  await card.locator("[data-resource-tag=style]").click();
  await pause();
  await page.goBack();
  await card.locator(".asset-actions [data-details]").click();
  await pause();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toBeVisible();
  await pause();
  await page.locator("[data-close-viewer]").first().click();
  await expect(card.locator(".asset-actions [data-details]")).toBeFocused();
  await pause();
  await page.goto(base + "#components?lang=en&q=fluent");
  await page
    .locator('[data-resource="component:fluent-dialog"] .asset-cover-link')
    .click();
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  const demo = page.frameLocator("#case-preview");
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await pause();
  await demo.getByRole("button", { name: "Close", exact: true }).click();
  await page.goto(base + "#page/shadcn-admin-dashboard?lang=en");
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await pause();
  await page.locator('[data-device="375"]').click();
  await pause();
  await page.locator('[data-device="0"]').click();
  await page.locator("[data-fullscreen]").click();
  await expect(page.locator("#preview-panel:fullscreen")).toBeVisible();
  await pause();
  await page.evaluate(() => document.exitFullscreen());
  await page.locator(".experience-actions [data-toggle-details]").click();
  await pause();
  const video = page.video();
  await context.close();
  await rename(await video.path(), `${out}/desktop-interaction.webm`);
  const touch = await browser.newContext({
    viewport: { width: 375, height: 1000 },
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    recordVideo: { dir: out, size: { width: 375, height: 1000 } },
  });
  const mobile = await touch.newPage();
  await mobile.goto(base + "#components?lang=en&category=forms&q=folio");
  const form = mobile.locator('[data-resource="component:folio-form"]');
  await expect(form).toHaveClass(/is-live/);
  await form
    .frameLocator("iframe")
    .locator("input[type=email]")
    .fill("demo@example.com");
  await form.frameLocator("iframe").locator("button[type=submit]").tap();
  await expect(
    form.frameLocator("iframe").locator(".s-feedback"),
  ).not.toBeEmpty();
  await mobile.waitForTimeout(650);
  await form.locator(".asset-actions [data-details]").tap();
  await expect(mobile.locator("#inspector")).toBeVisible();
  await mobile.waitForTimeout(650);
  await mobile.locator(".inspector-close").tap();
  await mobile.waitForTimeout(650);
  await mobile.locator("[data-close-viewer]").first().tap();
  await expect(form.locator(".asset-actions [data-details]")).toBeFocused();
  await mobile.waitForTimeout(650);
  const touchVideo = mobile.video();
  await touch.close();
  await rename(await touchVideo.path(), `${out}/touch-interaction.webm`);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        baseline: "eb7678eefa20b11a11cb6bb7aabf1d3ae10a05cc",
        capturedAt: new Date().toISOString(),
        source: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        workingTreeChanges: Boolean(
          execFileSync(
            "git",
            [
              "diff",
              "HEAD",
              "--",
              "app.js",
              "market.css",
              "presentation.js",
              "live-cards.js",
              "resource-tags.js",
              "examples",
            ],
            { encoding: "utf8" },
          ).trim(),
        ),
        bundleSha256: createHash("sha256")
          .update(await readFile("dist/atlas-shell.js"))
          .digest("hex"),
        matrix: metrics,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
  beforeServer?.kill();
}

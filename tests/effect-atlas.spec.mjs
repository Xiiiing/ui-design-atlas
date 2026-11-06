import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const preview = (slug) => `examples/ui-market/effect-atlas/${slug}/index.html`;
const detail = (slug) => `#component/effect-atlas-${slug}?lang=en`;
const slugs = [
  "pixel-wipe-button",
  "crosshair-image-reveal",
  "shared-element-transition",
  "scroll-minimap",
];

test("Effect Atlas is searchable and filterable; the button runs in its library card", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    "#motion?lang=en&library=effect-atlas&source=source-available&q=Effect%20Atlas",
  );
  await expect(page.locator("#results .asset-card")).toHaveCount(4);
  const card = page.locator(
    '[data-resource="component:effect-atlas-pixel-wipe-button"]',
  );
  await card.scrollIntoViewIfNeeded();
  await card.locator("[data-start-preview]").click();
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const demo = card.frameLocator("iframe");
  const cta = demo.getByRole("link", { name: "Book a demo" });
  await cta.hover();
  await expect(cta).toHaveAttribute("data-pw-state", "on");
  await demo.locator("#stage").hover({ position: { x: 5, y: 5 } });
  await expect(cta).not.toHaveAttribute("data-pw-state", "on");
});

test("The crosshair can be dragged and reaches both ends from the keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(preview("crosshair-image-reveal"));
  const target = page.getByRole("group", { name: /Image frame/ });
  const dot = target.locator(".cross-point");
  await target.press("Home");
  const closed = await dot.boundingBox();
  await target.press("End");
  const open = await dot.boundingBox();
  expect(open.x - closed.x).toBeGreaterThan(90);
  expect(open.y - closed.y).toBeGreaterThan(90);
  await page.mouse.move(open.x + open.width / 2, open.y + open.height / 2);
  await page.mouse.down();
  await page.mouse.move(open.x - 80, open.y - 80, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await dot.boundingBox()).x)
    .toBeLessThan(open.x - 35);
});

test("Shared artwork expands and returns, and the viewer controls the effect in place", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(detail("shared-element-transition") + "&theme=light");
  const demo = page.frameLocator("#case-preview");
  const stage = demo.locator(".shared-stage");
  const project = demo.getByRole("button", { name: "Project 02" });
  await expect(page.locator(".viewer-load-state")).toBeHidden();
  await expect(stage).toHaveAttribute("data-phase", "list");
  await project.press("Enter");
  await expect(stage).toHaveAttribute("data-phase", "detail");
  await page.getByRole("button", { name: "Toggle preview theme" }).click();
  await expect(demo.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(stage).toHaveAttribute("data-phase", "detail");
  await project.press("Space");
  await expect(stage).toHaveAttribute("data-phase", "list");
  await project.press("Enter");
  await expect(stage).toHaveAttribute("data-phase", "detail");
  await page.getByRole("button", { name: "Replay animation" }).click();
  await expect(stage).toHaveAttribute("data-phase", "list");
});

test("Minimap frame follows the document and section shortcuts on a phone", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto(preview("scroll-minimap") + "?lang=zh-CN&theme=dark");
  const content = page.getByRole("region", { name: "案例页面" });
  const outline = page.locator(".mm-frame");
  const first = await outline.boundingBox();
  await content.press("PageDown");
  await expect
    .poll(async () => (await outline.boundingBox()).y)
    .toBeGreaterThan(first.y + 8);
  await page.getByRole("button", { name: "跳到第 1 节" }).press("Enter");
  await expect
    .poll(async () => Math.abs((await outline.boundingBox()).y - first.y))
    .toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});

test("Each ZIP opens directly as a file and retains the pinned copyright and license", async ({
  page,
  request,
}) => {
  await page.goto(detail("scroll-minimap") + "&tab=code");
  await expect(page.locator("#code-text")).toContainText("mountScrollMinimap");
  await page.getByText("Integration", { exact: true }).click();
  await expect(page.locator(".code-integration")).toContainText(
    "No installation is needed",
  );
  await expect(
    page.getByRole("link", { name: "Download static project ZIP" }),
  ).toBeVisible();
  const temp = await mkdtemp(path.join(tmpdir(), "atlas-effect-"));
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    for (const slug of slugs) {
      const name = `component-effect-atlas-${slug}`;
      const zip = await request.get(`downloads/resources/${name}.zip`);
      expect(zip.ok()).toBe(true);
      const file = path.join(temp, `${name}.zip`);
      await writeFile(file, await zip.body());
      execFileSync("unzip", ["-q", file, "-d", temp]);
      const folder = path.join(temp, name);
      const entry = path.join(
        folder,
        "public/effect-atlas",
        slug,
        "index.html",
      );
      const license = await readFile(
        path.join(folder, "licenses/effect-atlas-LICENSE"),
        "utf8",
      );
      const js = await readFile(
        path.join(path.dirname(entry), "effect.js"),
        "utf8",
      );
      expect(license).toContain("Effect Atlas License 1.0");
      expect(js).toContain("Copyright (c) 2026 PROJECT Y/O");
      await page.goto(pathToFileURL(entry).href + "?lang=zh-CN&theme=dark");
      await expect(page.locator("#stage .fx-board")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    }
    expect(errors).toEqual([]);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

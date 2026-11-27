import { test, expect } from "@playwright/test";
import { resources } from "../catalog.js";
import { resourcePresentation } from "../presentation.js";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const additions = resources.filter((resource) =>
  resource.id.startsWith("ui-moments-"),
);
const preview = (slug, lang = "en", theme = "light") =>
  `examples/ui-market/ui-moments/${slug}/index.html?inline=1&lang=${lang}&theme=${theme}`;

test("Official static ZIP preserves font bytes and runs offline outside Atlas", async ({
  page,
  request,
}) => {
  const directory = await mkdtemp(path.join(tmpdir(), "atlas-ui-moments-"));
  try {
    const zip = await request.get(
      "downloads/resources/component-ui-moments-ink-switch.zip",
    );
    expect(zip.ok()).toBe(true);
    const archive = path.join(directory, "demo.zip");
    await writeFile(archive, await zip.body());
    execFileSync("unzip", ["-q", archive, "-d", directory]);
    const project = path.join(directory, "component-ui-moments-ink-switch");
    const font = await readFile(
      path.join(
        project,
        "public/ui-moments/upstream/assets/fonts/Geist-latin-wght.woff2",
      ),
    );
    const lock = JSON.parse(
      await readFile("examples/ui-market/sources.lock.json", "utf8"),
    );
    const expected = lock.sources["ui-moments"].files.find((file) =>
      file.upstream.endsWith(".woff2"),
    );
    expect(createHash("sha256").update(font).digest("hex")).toBe(
      expected.sha256,
    );
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(/^https?:/, (route) => route.abort());
    const url = pathToFileURL(
      path.join(project, "public/ui-moments/ink-switch/index.html"),
    );
    url.search = "?lang=zh-CN&theme=dark";
    await page.goto(url.href);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.locator(".ink").press("Space");
    await expect(page.locator(".ink")).toHaveAttribute("aria-checked", "true");
    expect(await page.evaluate(() => document.fonts.check("14px Geist"))).toBe(
      true,
    );
    expect(errors).toEqual([]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("Atlas pause freezes official progress and theme changes retain checkbox state and language", async ({
  page,
}) => {
  await page.goto(preview("download-ring"));
  await page.locator(".dl").click();
  await page.locator("#pause").click();
  const progress = await page.locator(".dl .bar").getAttribute("style");
  await page.waitForTimeout(250);
  expect(await page.locator(".dl .bar").getAttribute("style")).toBe(progress);
  await page.locator("#pause").click();
  await expect
    .poll(() => page.locator(".dl .bar").getAttribute("style"))
    .not.toBe(progress);
  await page.goto(preview("checklist"));
  await page.locator(".todo label").first().click();
  await page.evaluate(() =>
    window.postMessage(
      {
        type: "atlas:preview-config",
        resourceId: "ui-moments-checklist",
        theme: "dark",
        locale: "zh-CN",
      },
      location.origin,
    ),
  );
  await expect(page.locator(".todo")).toContainText("收集需求");
  await expect(page.locator(".todo :checked")).toHaveCount(2);
  await page.evaluate(() =>
    window.postMessage(
      {
        type: "atlas:preview-config",
        resourceId: "ui-moments-checklist",
        theme: "light",
        locale: "en",
      },
      location.origin,
    ),
  );
  await expect(page.locator(".todo")).toContainText("Gather requirements");
  await expect(page.locator(".todo :checked")).toHaveCount(2);
});

test("Only 23 official UI Moments resources, source and reusable packages are published", async ({
  page,
  request,
}) => {
  expect(additions).toHaveLength(23);
  await page.goto("#explore?lang=en&collection=ui-moments-04");
  await expect(page.locator(".asset-card")).toHaveCount(23);
  await expect(page.locator("[data-more]")).toHaveCount(0);
  for (const resource of additions) {
    const code = await (
      await request.get(`code/resources/component-${resource.id}.json`)
    ).json();
    expect(code.project).toBe("static");
    expect(code.files[resource.files[0]]).toContain('id="demo"');
    expect(resource.sourceId).toBe("ui-moments");
    expect(resource.provenance).toBe("open-source");
    expect(code.files["licenses/ui-moments-LICENSE"]).toContain(
      "Copyright (c) 2026 guanmo-ai",
    );
    expect(code.files["licenses/ui-moments-adapter-LICENSE"]).toContain(
      "UI Design Atlas contributors",
    );
    expect(
      code.binaryFiles[
        "public/ui-moments/upstream/assets/fonts/Geist-latin-wght.woff2"
      ],
    ).toBeTruthy();
    expect(code.files["public/ui-moments/shared/demo.js"]).toBeUndefined();
    expect(
      (
        await request.get(`downloads/resources/component-${resource.id}.zip`)
      ).ok(),
    ).toBe(true);
    for (const cover of [
      resource.cover,
      resource.cover.replace(".png", "-dark.png"),
    ])
      expect((await request.get(cover)).ok()).toBe(true);
  }
  for (const removed of [
    "examples/ui-market/ui-moments/rubber-search/index.html",
    "examples/ui-market/ui-moments/shared/demo.js",
    "code/resources/component-ui-moments-rubber-search.json",
    "downloads/resources/component-ui-moments-rubber-search.zip",
  ])
    expect((await request.get(removed)).status()).toBe(404);
  await page.goto("#explore?lang=zh-CN&q=纸飞机");
  await expect(page.locator(".asset-card")).toHaveAttribute(
    "data-resource",
    "component:ui-moments-paper-plane",
  );
  await page.locator(".asset-caption [data-open]").click();
  await expect(page.locator("#inspector")).toContainText("官方源码");
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText(
    "guanmo-ai/ui-moments",
  );
  await page.goBack();
  await expect(page.locator("[name=q]")).toHaveValue("纸飞机");
});

test("All video demos fit their interactive frames in both languages and themes", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const lang of ["zh-CN", "en"])
    for (const theme of ["light", "dark"])
      for (const resource of additions) {
        const framing = resourcePresentation(resource);
        const width = 320;
        const height = resource.category === "buttons" ? 240 : 320;
        await page.setViewportSize({ width, height });
        await page.goto(
          preview(resource.id.replace("ui-moments-", ""), lang, theme),
        );
        await expect(page.locator("#demo > :not(svg)").first()).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const metrics = await page.evaluate(() => ({
          overflow:
            document.documentElement.scrollWidth > innerWidth + 1 ||
            document.documentElement.scrollHeight > innerHeight + 1,
          clipped: [...document.querySelectorAll("button,input,[tabindex]")]
            .filter((node) => {
              const b = node.getBoundingClientRect();
              return (
                b.width &&
                b.height &&
                (b.left < -1 ||
                  b.right > innerWidth + 1 ||
                  b.top < -1 ||
                  b.bottom > innerHeight + 1)
              );
            })
            .map((node) => node.outerHTML),
        }));
        expect(metrics, resource.id + "/" + lang + "/" + theme).toEqual({
          overflow: false,
          clipped: [],
        });
        expect(framing.mode).toBe("inline");
      }
  expect(errors).toEqual([]);
});

test("Official send, download and checklist preserve completion, cancellation and keyboard behavior", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(preview("paper-plane"));
  const send = page.locator(".send");
  await send.press("Enter");
  await expect(send).toHaveAttribute("data-done", "");
  await expect(page.locator("#send-status")).toHaveText("Sent");
  await expect(send).not.toHaveAttribute("data-done", "");
  await page.goto(preview("download-ring"));
  let downloads = 0;
  page.on("download", () => downloads++);
  const button = page.locator(".dl");
  await button.press("Enter");
  await expect(button).toHaveAttribute("data-state", "loading");
  await button.press("Enter");
  await expect(button).toHaveAttribute("data-state", "idle");
  await expect(page.locator("#dl-status")).toHaveText("Download canceled");
  await button.press("Enter");
  await expect(button).toHaveAttribute("data-state", "done");
  expect(downloads).toBe(0);
  await page.goto(preview("checklist"));
  await expect(page.locator(".todo :checked")).toHaveCount(1);
  await page.locator(".todo label").nth(0).click();
  await page.locator(".todo input").nth(2).press("Space");
  await expect(page.locator(".todo :checked")).toHaveCount(3);
  await page.locator(".todo input").nth(1).press("Space");
  await expect(page.locator(".todo :checked")).toHaveCount(2);
});

test("Official swipe confirms only completed drags, cancels beyond the threshold and supports keyboard", async ({
  page,
}) => {
  await page.goto(preview("swipe-confirm"));
  const handle = page.locator(".swipe-knob");
  const track = page.locator(".swipe");
  const box = await handle.boundingBox();
  const rail = await track.boundingBox();
  await handle.click();
  await expect(track).not.toHaveAttribute("data-done", "");
  async function drag(distance, cancel = false) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await handle.evaluate((node) =>
      node.addEventListener(
        "pointerdown",
        (event) => {
          node.dataset.pointerId = String(event.pointerId);
        },
        { once: true },
      ),
    );
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + distance,
      box.y + box.height / 2,
      { steps: 8 },
    );
    if (cancel)
      await handle.evaluate((node) =>
        node.dispatchEvent(
          new PointerEvent("pointercancel", {
            pointerId: Number(node.dataset.pointerId),
            bubbles: true,
          }),
        ),
      );
    await page.mouse.up();
  }
  await drag(30);
  await expect(track).not.toHaveAttribute("data-done", "");
  await expect(handle).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await drag(rail.width, true);
  await expect(track).not.toHaveAttribute("data-done", "");
  await expect(handle).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await drag(rail.width);
  await expect(track).toHaveAttribute("data-done", "");
  await expect(track).not.toHaveAttribute("data-done", "");
  await handle.press("Enter");
  await expect(track).toHaveAttribute("data-done", "");
  await expect(track).not.toHaveAttribute("data-done", "");
  await handle.press("Space");
  await expect(track).toHaveAttribute("data-done", "");
});

test("New controls keep their selected values through theme and language configuration", async ({
  page,
}) => {
  await page.goto(preview("leaf-tabs"));
  await page.locator('[role="tab"]').nth(2).press("Enter");
  await page.evaluate(() =>
    window.postMessage(
      {
        type: "atlas:preview-config",
        resourceId: "ui-moments-leaf-tabs",
        locale: "zh-CN",
        theme: "dark",
      },
      location.origin,
    ),
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('[role="tab"]').nth(2)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.goto(preview("radial-menu"));
  await page.locator(".radial-main").press("Enter");
  await expect(page.locator(".radial-items")).toHaveAttribute("data-open", "");
  await expect(page.locator(".radial-items button")).toHaveCount(4);
  await page.locator(".radial-items button").nth(2).press("Enter");
  await expect(page.locator(".radial-items")).not.toHaveAttribute(
    "data-open",
    "",
  );
  await expect(page.locator(".radial-main")).toBeFocused();
});

test("A delayed viewer module cannot replace a newer library route", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route(/\/atlas-viewer-[^/]+\.js$/, async (route) => {
    requested = true;
    await gate;
    await route.continue();
  });
  await page.goto("#explore?lang=en&collection=ui-moments-04");
  expect(requested).toBe(false);
  await page.locator(".asset-caption [data-open]").first().click();
  try {
    await expect.poll(() => requested).toBe(true);
    await page.evaluate(() => {
      location.hash = "#explore?lang=en";
    });
    await expect(page.locator("#filters")).toBeVisible();
  } finally {
    release();
  }
  await expect(page.locator(".asset-card")).toHaveCount(24);
  await expect(page.locator(".experience-viewer")).toHaveCount(0);
  await page.locator(".asset-caption [data-open]").first().click();
  await expect(page.locator("#case-preview")).toBeVisible();
});

test("Viewer load failure offers a retry on the same resource", async ({
  page,
}) => {
  await page.route(/\/atlas-viewer-[^/]+\.js$/, (route) => route.abort());
  await page.goto("#component/ui-moments-checklist?lang=en");
  await expect(page.locator("#main [role=alert]")).toContainText(
    "viewer could not be loaded",
  );
  await page.unroute(/\/atlas-viewer-[^/]+\.js$/);
  await page.locator("[data-reload-viewer]").click();
  await expect(page.locator("#case-preview")).toBeVisible();
  await expect(
    page.frameLocator("#case-preview").locator(".todo input"),
  ).toHaveCount(3);
});

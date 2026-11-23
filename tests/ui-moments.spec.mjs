import { test, expect } from "@playwright/test";
import { resources } from "../catalog.js";
import { resourcePresentation } from "../presentation.js";
const additions = resources.filter(
  (resource) => resource.sourceId === "ui-moments-atlas",
);
const preview = (slug, lang = "en", theme = "light") =>
  `examples/ui-market/ui-moments/${slug}/index.html?inline=1&lang=${lang}&theme=${theme}`;

test("All 36 video references enter the catalog with independent source, covers and reusable packages", async ({
  page,
  request,
}) => {
  expect(additions).toHaveLength(36);
  await page.goto("#explore?lang=en&collection=ui-moments-04");
  await expect(page.locator(".asset-card")).toHaveCount(24);
  await page.locator("[data-more]").click();
  await expect(page.locator(".asset-card")).toHaveCount(36);
  for (const resource of additions) {
    const code = await (
      await request.get(`code/resources/component-${resource.id}.json`)
    ).json();
    expect(code.project).toBe("static");
    expect(code.files[resource.files[0]]).toContain('id="demo"');
    expect(code.files["public/ui-moments/ATTRIBUTION.md"]).toContain(
      "independently written",
    );
    expect(code.files["licenses/ui-moments-atlas-LICENSE"]).toContain(
      "UI Design Atlas contributors",
    );
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
  await page.goto("#explore?lang=zh-CN&q=纸飞机");
  await expect(page.locator(".asset-card")).toHaveAttribute(
    "data-resource",
    "component:ui-moments-paper-plane",
  );
  await page.locator(".asset-caption [data-open]").click();
  await expect(page.locator("#inspector")).toContainText(
    "参考观默 UI Moments 第四期视频",
  );
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText(
    'data-demo="paper-plane"',
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

test("Send, download and checklist keep meaningful completion states under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(preview("paper-plane"));
  const send = page.locator(".plane-send");
  await send.press("Enter");
  await expect(send).toHaveAttribute("data-state", "sent");
  await send.press("Space");
  await expect(send).toHaveAttribute("data-state", "idle");
  await page.goto(preview("download-ring"));
  const downloaded = page.waitForEvent("download");
  await page.locator(".download").press("Enter");
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe("atlas-demo.txt");
  await expect(page.locator('[role="progressbar"]')).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page.goto(preview("checklist"));
  await page.locator(".checklist input").nth(1).check();
  await page.locator(".checklist input").nth(2).press("Space");
  await expect(page.locator(".checklist :checked")).toHaveCount(2);
  await expect(page.locator("#status")).toHaveText("2 / 3 tasks complete");
  await page.locator(".checklist input").nth(1).uncheck();
  await expect(page.locator("#status")).toHaveText("1 / 3 tasks complete");
});

test("Swipe confirmation requires the drag threshold, handles cancellation and supports keyboard", async ({
  page,
}) => {
  await page.goto(preview("swipe-confirm"));
  const handle = page.locator(".swipe button");
  const box = await handle.boundingBox();
  await handle.click();
  await expect(page.locator("#status")).toContainText("Not confirmed");
  await page.mouse.move(box.x + 24, box.y + 24);
  await page.mouse.down();
  await page.mouse.move(box.x + 64, box.y + 24, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator("#status")).toContainText("Not confirmed");
  await expect(handle).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.mouse.move(box.x + 24, box.y + 24);
  await page.mouse.down();
  await page.mouse.move(box.x + 225, box.y + 24, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator("#status")).toContainText("Confirmed");
  await handle.press("Space");
  await expect(page.locator("#status")).toContainText("Not confirmed");
  await handle.dispatchEvent("pointerdown", {
    button: 0,
    clientX: box.x + 24,
    pointerId: 1,
  });
  await handle.dispatchEvent("pointercancel", { pointerId: 1 });
  await expect(page.locator("#status")).toContainText("Not confirmed");
  await handle.press("Enter");
  await expect(page.locator("#status")).toContainText("Confirmed");
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
  await page.goto(preview("rubber-search"));
  await page.locator(".rubber-search button").click();
  await page.locator("input").fill("Atlas");
  await page.locator("input").press("Enter");
  await expect(page.locator("#status")).toHaveText("Search term: Atlas");
  await page.locator("input").press("Escape");
  await expect(page.locator("input")).toBeHidden();
  await expect(page.locator(".rubber-search button")).toBeFocused();
  await page.goto(preview("radial-menu"));
  await page.locator("[data-toggle]").press("Enter");
  await expect(page.locator("[data-option]:visible")).toHaveCount(5);
  await page.locator("[data-option]").nth(2).press("Enter");
  await expect(page.locator("[data-option]:visible")).toHaveCount(0);
  await expect(page.locator("[data-toggle]")).toBeFocused();
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
    page.frameLocator("#case-preview").locator(".checklist input"),
  ).toHaveCount(3);
});

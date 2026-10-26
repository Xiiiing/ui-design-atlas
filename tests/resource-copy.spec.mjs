import { copyCardPrompt } from "./navigation.mjs";
import { test, expect } from "@playwright/test";
import resources from "../content/resources.json" with { type: "json" };

for (const lang of ["zh-CN", "en"]) {
  test(`All resource descriptions and copied prompts use canonical ${lang} content`, async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(240000);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Check the production split, including case prompts not selected by a page preview.
    for (const r of resources) {
      const response = await request.get(`details/${r.type}-${r.id}.json`);
      expect(response.ok(), r.id).toBe(true);
      const full = await response.json();
      for (const field of [
        "description",
        "prompt",
        "stylePrompt",
        "rules",
        "useCases",
        "principle",
      ])
        expect(full[field][lang], `${r.id}/${field}`).toEqual(r[field][lang]);
    }
    const styleSources = new Set();
    for (const r of resources.filter((r) => r.type !== "case")) {
      await page.goto(`#${r.type}/${r.id}?lang=${lang}&panel=details`);
      await expect(page.locator(".inspector-head h2"), r.id).toHaveText(
        r.name[lang],
      );
      await expect(page.locator(".inspector-head > p"), r.id).toHaveText(
        r.description[lang],
      );
      await expect(page.locator(".full-prompt"), r.id).toHaveText(
        r.prompt[lang],
      );
      await page.locator("#inspector [data-copy-prompt]").click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()), {
          message: r.id,
        })
        .toBe(r.prompt[lang]);
      // Exercise the real custom selector and copy path for each implementation family.
      if (!styleSources.has(r.sourceId)) {
        styleSources.add(r.sourceId);
        await page.locator("#prompt-scope").click();
        await page
          .getByRole("option", {
            name: lang === "en" ? "Visual style only" : "只复用视觉风格",
            exact: true,
          })
          .click();
        await expect(page.locator(".full-prompt")).toHaveText(
          r.stylePrompt[lang],
        );
        await page.locator("#inspector [data-copy-prompt]").click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toBe(r.stylePrompt[lang]);
      }
    }
    await page.goto(`#cases?lang=${lang}`);
    for (const r of resources.filter((r) => r.type === "case")) {
      await copyCardPrompt(
        page,
        page.locator(`[data-resource="case:${r.id}"]`),
      );
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(r.prompt[lang]);
    }
  });
}

test("Table and login claims correspond to actual columns and password fields", async ({
  page,
}) => {
  const table = resources.find((r) => r.id === "antd-table");
  await page.goto("#component/antd-table?lang=zh-CN&panel=details");
  const demo = page.frameLocator("#case-preview");
  await expect(demo.locator("th")).toHaveText(["姓名", "年龄", "地址"]);
  await expect(demo.locator("tbody tr")).toHaveCount(4);
  expect(table.description["zh-CN"]).not.toContain("状态");
  await expect(page.locator(".full-prompt")).toContainText("四条固定记录");
  // Sorting must still work, not just the wording.
  await demo.locator("th").filter({ hasText: "年龄" }).click();
  await expect(
    demo.locator("tbody tr").first().locator("td").nth(1),
  ).toHaveText("32");
  await page.goto("#block/shadcn-login-01?lang=en&panel=details");
  await expect(demo.locator('input[type="password"]')).toHaveCount(1);
  await expect(demo.locator('input[type="email"]')).toHaveCount(1);
  await expect(page.locator(".full-prompt")).toContainText(
    "no confirm-password field",
  );
  await demo.locator('input[type="email"]').fill("copy@example.com");
  await demo.locator('input[type="password"]').fill("local-demo");
  await demo.getByRole("button", { name: "Login", exact: true }).click();
  await expect(demo.locator(".demo-feedback")).toContainText(
    "No account was created",
  );
});

test("Morrow prompt dimensions match responsive CSS at actual browser widths", async ({
  page,
}) => {
  const r = resources.find((r) => r.id === "folio-home");
  const measurements = [];
  for (const width of [1440, 1280, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("preview.html?style=folio&page=home&lang=en&theme=light");
    const measured = await page.locator(".folio-hero h1").evaluate((n) => ({
      heading: getComputedStyle(n).fontSize,
      body: getComputedStyle(document.body).fontSize,
    }));
    for (const lang of ["zh-CN", "en"]) {
      expect(r.prompt[lang]).toContain(measured.heading);
      expect(r.prompt[lang]).toContain(measured.body);
    }
    measurements.push({ width, ...measured });
  }
  expect(measurements.map((m) => m.heading)).toEqual([
    "70px",
    "58px",
    "46px",
    "44px",
  ]);
  await test.info().attach("responsive-type-measurements", {
    body: JSON.stringify(measurements, null, 2),
    contentType: "application/json",
  });
});

test("Original button prompts stay within the component and use its delivered dimensions", async ({
  page,
}) => {
  for (const id of ["folio", "orbit", "forma", "bloom"]) {
    const r = resources.find((r) => r.id === `${id}-button`);
    await page.goto(`component-preview.html?id=${r.id}&lang=en&theme=light`);
    await expect(page.locator(".sample-buttons button")).toHaveCount(3);
    await expect(page.locator(".sample-buttons button:disabled")).toHaveCount(
      1,
    );
    const height = await page
      .locator(".sample-buttons button")
      .first()
      .evaluate((n) => getComputedStyle(n).minHeight);
    for (const lang of ["zh-CN", "en"])
      expect(r.prompt[lang]).toContain(height);
    expect(r.prompt.en).not.toMatch(/12.column|64–88|complete layout/i);
    await page.locator(".sample-buttons button").first().click();
    await expect(page.locator('[role="status"]')).toBeVisible();
  }
});

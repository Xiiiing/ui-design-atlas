import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

test("Guidance filters use URL/history, honor composition and cancel input before navigation", async ({
  page,
}) => {
  let bodies = 0;
  page.on("request", (r) => {
    if (/\/guidance\/[^/]+\.json/.test(r.url())) bodies++;
  });
  await page.goto("#guidance?lang=en");
  await expect(page.locator(".guidance-card")).toHaveCount(13);
  expect(bodies).toBe(0);
  const form = page.locator("#content-filters"),
    q = form.locator("[name=q]");
  await q.dispatchEvent("compositionstart");
  await q.fill("动效");
  await expect(page.locator(".guidance-card")).toHaveCount(13);
  await q.dispatchEvent("keydown", {
    key: "Enter",
    keyCode: 229,
    isComposing: true,
  });
  await q.dispatchEvent("compositionend");
  await expect(page.locator(".guidance-card")).not.toHaveCount(13);
  await q.fill("");
  await expect(page.locator(".guidance-card")).toHaveCount(13);
  await form.locator("[name=kind]").selectOption("skill");
  await expect(page.locator(".guidance-card")).toHaveCount(5);
  await form.locator("[name=purpose]").selectOption("motion");
  await expect(page.locator(".guidance-card")).toHaveCount(3);
  await expect(page).toHaveURL(/kind=skill.*purpose=motion/);
  await page.reload();
  await expect(page.locator(".guidance-card")).toHaveCount(3);
  await page.goBack();
  await expect(page.locator(".guidance-card")).toHaveCount(5);
  await form.locator("[name=q]").fill("a-query-that-does-not-match");
  await page.locator('.guidance-intro a[href*="compose"]').click();
  await expect(page.locator("#prompt-composer")).toBeVisible();
  await page.waitForTimeout(250);
  await expect(page.locator("#prompt-composer")).toBeVisible();
});

test("Skills retain support files, copied originals, exact ZIP contents and provenance", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(Error("denied")) },
    }),
  );
  await page.goto("#guidance/animate?lang=en");
  await expect(page.locator(".guidance-source")).toHaveCount(3);
  await expect(page.locator(".guidance-provenance")).toContainText(
    "Emil Kowalski",
  );
  await page
    .locator(".guidance-source summary")
    .filter({ hasText: "SKILL.md" })
    .click();
  await page.locator('[data-guidance-file="SKILL.md"]').click();
  const original = await readFile(
    "vendor/guidance/emilkowalski/skills/animate/SKILL.md",
    "utf8",
  );
  await expect(page.locator("#fallback-text")).toHaveValue(original);
  await page.locator("#fallback-close").click();
  const downloaded = page.waitForEvent("download");
  await page.locator('a[download][href$="animate.zip"]').click();
  const file = await (await downloaded).path();
  expect(
    execFileSync("unzip", ["-p", file, "animate/SKILL.md"], {
      encoding: "utf8",
    }),
  ).toBe(original);
  expect(execFileSync("unzip", ["-Z1", file], { encoding: "utf8" })).toContain(
    "animate/RECIPES.md",
  );
  await page.locator("[data-guidance-copy=task]").click();
  await expect(page.locator("#fallback-text")).not.toHaveValue(original);
  await expect(page.locator("#fallback-text")).not.toHaveValue(
    /Initial Response/,
  );
});

test("Detail requests retry and stale responses do not overwrite a newer page", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/guidance/animate.json", (route) =>
    fail ? ((fail = false), route.abort()) : route.continue(),
  );
  await page.goto("#guidance/animate?lang=en");
  await expect(page.locator("[data-guidance-retry]")).toBeVisible();
  await page.locator("[data-guidance-retry]").click();
  await expect(page.locator(".guidance-source")).toHaveCount(3);
  let release;
  const hold = new Promise((r) => (release = r));
  await page.route("**/guidance/linear-design.json", async (route) => {
    const response = await route.fetch();
    await hold;
    await route.fulfill({ response });
  });
  await page.goto("#guidance/linear-design?lang=en");
  await expect(
    page.getByText("Loading guidance…", { exact: true }),
  ).toBeVisible();
  await page.goto("#tools/element-plus?lang=en");
  await expect(page.locator("h1")).toHaveText("Element Plus");
  release();
  await page.waitForTimeout(150);
  await expect(page.locator("h1")).toHaveText("Element Plus");
});

test("Prompt variants, template filling and checklist progress work without executing content", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(Error("denied")) },
    }),
  );
  await page.goto("#guidance/visual-quality?lang=zh-CN");
  await page.locator(".guidance-original summary").click();
  await expect(page.locator(".guidance-original")).toContainText(
    "直到没有明显可提升之处",
  );
  await page.goto("#guidance/marketing-website?lang=en");
  await page
    .locator("[data-template-value=requirements]")
    .fill("Build a music school website");
  await page.locator("[data-guidance-filled]").click();
  await expect(page.locator("#fallback-text")).toHaveValue(
    /Build a music school website/,
  );
  expect(await page.locator("#fallback-text").inputValue()).not.toContain("{{");
  await page.locator("#fallback-close").click();
  await page.goto("#guidance/responsive-review?lang=en");
  await page.locator('[data-check-progress="0"]').check();
  await page.reload();
  await expect(page.locator('[data-check-progress="0"]')).toBeChecked();
  await page.locator("[data-guidance-copy=checks]").click();
  await expect(page.locator("#fallback-text")).toHaveValue(/110%/);
});

test("Mixed favorites preserve domain scope, focus, tab synchronization and v2 backup", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("mixed-seed")) {
      localStorage.setItem("mixed-seed", "1");
      localStorage.setItem(
        "design-atlas-favorites",
        JSON.stringify([
          "component:folio-form",
          "guidance:animate",
          "tool:element-plus",
        ]),
      );
    }
  });
  await page.goto("#favorites?lang=en");
  await expect(page.locator(".asset-card")).toHaveCount(3);
  await expect(page.locator("#filters .market-tabs")).toBeHidden();
  await page.locator("[data-saved-domain=ui]").click();
  await expect(page.locator("#filters .market-tabs")).toBeVisible();
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.locator("[data-saved-domain=all]").click();
  await expect(page.locator(".asset-card")).toHaveCount(3);
  const event = page.waitForEvent("download");
  await page.locator("[data-export-favorites]").click();
  const exported = JSON.parse(
    await readFile(await (await event).path(), "utf8"),
  );
  expect(exported.version).toBe(2);
  expect(exported.favorites).toContain("guidance:animate");
  await page.locator("[data-saved-domain=guidance]").click();
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await page.reload();
  await expect(
    page.locator('[data-resource="guidance:animate"]'),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("#discover?lang=en");
  await page.locator('[data-save="guidance:animate"]').focus();
  await other.evaluate(() =>
    localStorage.setItem(
      "design-atlas-favorites",
      JSON.stringify(["component:folio-form", "tool:element-plus"]),
    ),
  );
  await expect(page.locator(".asset-card")).toHaveCount(0);
  await expect(page.locator(".market-empty h2")).toBeFocused();
  await expect(page.locator("[data-favorite-count]")).toHaveText("2");
  await page.locator("[data-saved-domain=tool]").click();
  await page.locator('[data-save="tool:element-plus"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".market-empty h2")).toBeFocused();
  await expect(page.locator("[data-favorite-count]")).toHaveText("1");
});

test("Unified quick search reaches guidance and repositories, and no-result Enter retains the dialog", async ({
  page,
}) => {
  await page.goto("#discover?lang=en");
  await page.keyboard.press("Control+k");
  await page.locator("#quick-search").fill("Baseline UI");
  await expect(page.locator("#search-results a").first()).toHaveAttribute(
    "href",
    /#guidance\/baseline-ui/,
  );
  await page.keyboard.press("Enter");
  await expect(page.locator("h1")).toHaveText("Baseline UI");
  await page.locator("#topbar [data-primary-view=guidance]").click();
  await expect(page.locator(".guidance-card")).toHaveCount(13);
  await page.keyboard.press("Control+k");
  await page.locator("#quick-search").fill("Element Plus");
  await page.keyboard.press("Enter");
  await expect(page.locator("h1")).toHaveText("Element Plus");
  await page.keyboard.press("Control+k");
  await page.locator("#quick-search").fill("nonexistent-random-string");
  await page.keyboard.press("Enter");
  await expect(page.locator("#search-dialog")).toBeVisible();
  await expect(page.locator("#quick-search")).toHaveValue(
    "nonexistent-random-string",
  );
});

test("Guidance and interfaces link both ways and hand selected references to the composer", async ({
  page,
}) => {
  await page.goto("#block/magicui-bento-grid?lang=en&panel=details");
  await expect(page.locator(".related-guidance")).toBeVisible();
  await page
    .locator('.related-guidance a[href*="animation-performance"]')
    .click();
  await expect(page.locator("h1")).toHaveText("Animation Performance");
  await page
    .locator('.guidance-related [data-open="block:magicui-bento-grid"]')
    .click();
  await expect(page.locator("#case-preview")).toBeVisible();
  await page.locator(".experience-actions [data-toggle-details]").click();
  await page.locator('.related-guidance a[href*="compose"]').click();
  await expect(page.locator("#prompt-composer [name=reference]")).toHaveValue(
    "block:magicui-bento-grid",
  );
});

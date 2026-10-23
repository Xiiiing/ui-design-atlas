import { test, expect } from "@playwright/test";
import { resources, resourcePrompt } from "../catalog.js";

test("Original pages and components follow the shell, retain local overrides and keep themed links", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const path of [
    "page/folio-home",
    "page/orbit-home",
    "page/forma-home",
    "page/bloom-home",
    "component/folio-button",
  ]) {
    await page.goto("#" + path + "?lang=en");
    const html = page.frameLocator("#case-preview").locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.locator("[data-preview-theme]").click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.locator("#topbar .appearance-trigger").click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.locator("#topbar .appearance-trigger").click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    if (path.startsWith("page/")) {
      const links = await page
        .frameLocator("#case-preview")
        .locator('.p-header a[href*="preview.html"]')
        .evaluateAll((els) =>
          els.map((e) => new URL(e.href).searchParams.get("theme")),
        );
      expect(links.length).toBeGreaterThan(0);
      expect(links.every((v) => v === "dark")).toBe(true);
    }
    // Return the persisted shell to system, with a dark OS for the next resource.
    await page.locator("#topbar .appearance-trigger").click();
  }
  await page.goto("component-preview.html?id=orbit-button&lang=en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("Primary navigation keeps current scroll and restores each section and history", async ({
  page,
}) => {
  await page.goto("#explore?lang=en");
  await page.locator("[data-more]").click();
  await page.evaluate(() => scrollTo(0, 650));
  await expect(page.locator("#topbar")).toHaveClass("is-compact");
  const start = await page.evaluate(() => scrollY);
  const count = await page.locator(".asset-card").count();
  await page.locator("[data-primary-view=explore]").click();
  expect(await page.evaluate(() => scrollY)).toBe(start);
  await page.locator("[data-primary-view=discover]").click();
  await expect(page).toHaveURL(/#discover/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(start);
  await page.evaluate(() => scrollTo(0, 420));
  await page.locator("[data-primary-view=explore]").click();
  await expect(page.locator(".asset-card")).toHaveCount(count);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(start);
  await expect(page.locator("#topbar")).toHaveClass("is-compact");
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(420);
  await page.goForward();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(start);
  await page.locator(".asset-caption [data-open]").first().click();
  await page.goBack();
  await expect(
    page.locator(".asset-caption [data-open]").first(),
  ).toBeFocused();
  await page.locator("[data-primary-view=discover]").click();
  await page.locator("[data-primary-view=explore]").click();
  await expect(page.locator("[data-primary-view=explore]")).toBeFocused();
});

test("Cover variants change with appearance without changing card geometry", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("#pages?lang=en");
  const cover = page.locator("img[data-cover]").first();
  const before = await cover.boundingBox();
  await expect(cover).not.toHaveAttribute("src", /-dark\.png$/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(cover).toHaveAttribute("src", /-dark\.png$/);
  await expect
    .poll(() => cover.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  expect(await cover.boundingBox()).toEqual(before);
});

test("New practical resources operate locally with validation, search and recovery", async ({
  page,
}) => {
  await page.goto("#component/atlas-upload?lang=en");
  let f = page.frameLocator("#case-preview");
  await f.locator("input[type=file]").setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("local"),
  });
  await expect(f.getByRole("status")).toContainText("Selected: 1");
  await f.getByRole("button", { name: "Remove file" }).click();
  await expect(f.getByRole("status")).toContainText("Selected: 0");
  await page.goto("#component/atlas-steps?lang=en");
  f = page.frameLocator("#case-preview");
  await expect(
    f.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await f.getByRole("textbox").fill("Atlas");
  await f.getByRole("button", { name: "Next", exact: true }).click();
  await f.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(f.getByText("Setup complete", { exact: true })).toBeVisible();
  await page.goto("#component/atlas-search?lang=en");
  f = page.frameLocator("#case-preview");
  await f.getByRole("combobox").fill("Design");
  await f.getByRole("combobox").press("ArrowDown");
  await f.getByRole("combobox").press("Enter");
  await expect(f.getByRole("status")).toContainText(
    "Opened: Design guidelines",
  );
  await page.goto("#component/atlas-feedback?lang=en");
  f = page.frameLocator("#case-preview");
  await f.getByRole("button", { name: "Simulate failure" }).click();
  await f.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(f.getByRole("status")).toContainText("Saved in this local demo");
});

test("New complete pages provide real workflows", async ({ page }) => {
  await page.goto("#page/atlas-file-workspace?lang=en");
  let f = page.frameLocator("#case-preview");
  await f.getByPlaceholder("Search by filename").fill("Research");
  await expect(f.locator("article")).toHaveCount(1);
  await f.getByRole("button", { name: "Remove Research notes.md" }).click();
  await expect(f.getByText("No matching files", { exact: true })).toBeVisible();
  await page.goto("#page/atlas-onboarding-page?lang=en");
  f = page.frameLocator("#case-preview");
  await f.getByRole("textbox").fill("Team");
  await f.getByRole("button", { name: "Next", exact: true }).click();
  await f.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(f.getByText("Setup complete", { exact: true })).toBeVisible();
  await page.goto("#page/atlas-product-page?lang=en");
  f = page.frameLocator("#case-preview");
  await f.getByText("Yearly", { exact: true }).click();
  await expect(f.getByRole("heading", { name: /\$8/ })).toBeVisible();
  await f.getByText("Can I cancel anytime?", { exact: true }).click();
  await expect(
    f.getByText("This local product demo does not create a subscription.", {
      exact: true,
    }),
  ).toBeVisible();
  await f.getByRole("button", { name: "Contact team", exact: true }).click();
  await f.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await f.getByRole("button", { name: "Submit demo" }).click();
  await expect(f.getByRole("status")).toContainText("Demo submitted");
});

test("New motion resources pause or act, and reduced motion keeps rotation static", async ({
  page,
}) => {
  for (const id of ["word-rotate", "meteors"]) {
    await page.goto("#component/magicui-" + id + "?lang=en");
    const f = page.frameLocator("#case-preview");
    await f.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(
      f.getByRole("button", { name: "Play", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.goto("#component/magicui-shine-border?lang=en");
  let f = page.frameLocator("#case-preview");
  await f.getByRole("button", { name: "Save collection" }).click();
  await expect(
    f.getByRole("button", { name: "Saved", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#component/magicui-word-rotate?lang=en");
  f = page.frameLocator("#case-preview");
  await expect(
    f.getByRole("heading", { name: "Design", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(2800);
  await expect(
    f.getByRole("heading", { name: "Design", exact: true }),
  ).toBeVisible();
});

test("Mobile navigation restores combined filters and original compositions remain discoverable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("#components?lang=zh-CN&source=original&style=neutral");
  await page.evaluate(() => scrollTo(0, 550));
  await expect(page.locator("#topbar")).toHaveClass("is-compact");
  const before = await page.evaluate(() => scrollY);
  await page.locator("[data-primary-view=discover]").click();
  await page.locator("[data-primary-view=explore]").click();
  await expect(page).toHaveURL(
    /#components\?lang=zh-CN&source=original&style=neutral/,
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
  await page.locator("[data-primary-view=explore]").click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
  await page.goto("#explore?lang=en&source=original&q=Local%20file");
  await expect(
    page.locator('[data-resource="component:atlas-upload"]'),
  ).toBeVisible();
  await page.goto("#explore?lang=en&source=open-source&q=Local%20file");
  await expect(
    page.locator('[data-resource="component:atlas-upload"]'),
  ).toHaveCount(0);
});

test("New resources fit narrow screens in both languages and themes; file limits stay local", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const posts = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  const ids = [
    "atlas-upload",
    "atlas-steps",
    "atlas-search",
    "atlas-feedback",
    "atlas-file-workspace",
    "atlas-onboarding-page",
    "atlas-product-page",
    "magicui-word-rotate",
    "magicui-shine-border",
    "magicui-meteors",
  ];
  for (const lang of ["en", "zh-CN"]) {
    await page.emulateMedia({ colorScheme: lang === "en" ? "light" : "dark" });
    for (const id of ids) {
      await page.goto(`examples/ui-market/index.html?item=${id}&lang=${lang}`);
      await expect(page.locator("#root")).not.toBeEmpty();
      await expect(
        page
          .locator(".demo-surface")
          .locator("button, input:not([type=file])")
          .first(),
      ).toBeVisible();
      if (lang === "zh-CN")
        await expect(page.locator("html")).toHaveClass(/dark/);
      else await expect(page.locator("html")).not.toHaveClass(/dark/);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
    }
  }
  await page.goto("#component/atlas-upload?lang=en");
  const f = page.frameLocator("#case-preview");
  await f.locator("input[type=file]").setInputFiles({
    name: "large.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(f.getByRole("alert")).toContainText(
    "Choose files smaller than 5MB",
  );
  await expect(f.getByRole("status")).toContainText("Selected: 0");
  await f.locator("input[type=file]").setInputFiles(
    Array.from({ length: 6 }, (_, n) => ({
      name: `file-${n}.txt`,
      mimeType: "text/plain",
      buffer: Buffer.from("local"),
    })),
  );
  await expect(f.getByRole("status")).toContainText("Selected: 5");
  expect(posts).toEqual([]);
});

test("Every added resource copies its own prompt in the selected language", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const added = resources.filter(
    (r) =>
      r.id.startsWith("atlas-") ||
      [
        "magicui-word-rotate",
        "magicui-shine-border",
        "magicui-meteors",
      ].includes(r.id),
  );
  expect(added).toHaveLength(10);
  for (const lang of ["en", "zh-CN"])
    for (const r of added) {
      await page.goto(
        `#explore?lang=${lang}&q=${encodeURIComponent(r.name[lang])}`,
      );
      await page.locator(`[data-card-prompt="${r.type}:${r.id}"]`).click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(resourcePrompt(r, lang));
      await expect(page).toHaveURL(/#explore/);
    }
});

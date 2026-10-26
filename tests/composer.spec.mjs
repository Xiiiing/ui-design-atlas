import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("Composer assembles ordered content, separates modes, preserves edits and restores private drafts", async ({
  page,
}) => {
  await page.goto("#compose?lang=en");
  const form = page.locator("#prompt-composer"),
    output = form.locator("[name=output]");
  await form
    .locator("[name=requirements]")
    .fill("Build a website for independent filmmakers.");
  await form.locator("[name=audience]").fill("Directors and editors");
  await form.locator("[name=technology]").fill("Use the existing stack");
  await form.locator("[name=design]").selectOption("linear-design");
  await form
    .locator("[name=reference]")
    .selectOption("block:magicui-bento-grid");
  await form.locator("[name=checks][value=responsive-review]").check();
  await form.locator("[name=skills][value=animate]").check();
  await form.locator("[data-generate-prompt]").click();
  await expect(output).toHaveValue(/## Delivery checks/);
  const chat = await output.inputValue();
  const headings = [
    "## Requirements & constraints",
    "## Design specification",
    "## Interface reference",
    "## Task requirements",
    "## Delivery checks",
  ].map((s) => chat.indexOf(s));
  expect(
    headings.every((x, i) => x >= 0 && (i === 0 || x > headings[i - 1])),
  ).toBe(true);
  expect(chat).toContain("not installed or executed");
  expect(chat).not.toContain("Initial Response");
  expect(page.url()).not.toContain("filmmakers");
  await output.fill("My carefully edited prompt");
  await form.locator("[name=mode]").selectOption("agent");
  await form.locator("[name=audience]").fill("Creative teams");
  await expect(output).toHaveValue("My carefully edited prompt");
  await expect(page.locator("[data-agent-files]")).toBeVisible();
  await page.reload();
  await expect(form.locator("[name=requirements]")).toHaveValue(
    "Build a website for independent filmmakers.",
  );
  await expect(output).toHaveValue("My carefully edited prompt");
  await page.locator("#site-locale").click();
  await page.getByRole("option", { name: "中文", exact: true }).click();
  await expect(output).toHaveValue("My carefully edited prompt");
  await expect(form.locator("[name=audience]")).toHaveValue("Creative teams");
  await form.locator("[data-generate-prompt]").click();
  await expect(output).toHaveValue(/animate\/SKILL.md/);
  const downloaded = page.waitForEvent("download");
  await form.locator("[data-download-composed]").click();
  expect(await readFile(await (await downloaded).path(), "utf8")).toBe(
    await output.inputValue(),
  );
  await page.locator("#topbar [data-primary-view=guidance]").click();
  await page.locator('.guidance-intro a[href*="compose"]').click();
  await expect(output).toHaveValue(/animate\/SKILL.md/);
});

test("Denied storage and clipboard retain editing, copy fallback and export", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(Error("denied")) },
    });
  });
  await page.goto("#compose?lang=en");
  await expect(page.locator("[data-draft-status]")).toContainText("not saved");
  await page
    .locator("[name=requirements]")
    .fill("Build an accessible catalog.");
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[name=output]")).toHaveValue(/accessible catalog/);
  await page.locator("[data-copy-composed]").click();
  await expect(page.locator("#fallback-text")).toHaveValue(
    await page.locator("[name=output]").inputValue(),
  );
  await page.locator("#fallback-close").click();
  const event = page.waitForEvent("download");
  await page.locator("[data-download-composed]").click();
  expect((await event).suggestedFilename()).toBe("atlas-prompt.md");
});

test("Missing requirements, failed content and changed inputs preserve output and allow retry", async ({
  page,
}) => {
  await page.goto("#compose?lang=en");
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[name=requirements]")).toBeFocused();
  await page.locator("[name=requirements]").fill("Build a bookstore.");
  await page.locator("[name=output]").fill("Keep this text");
  let fail = true;
  await page.route("**/guidance/marketing-website.json", (r) =>
    fail ? ((fail = false), r.abort()) : r.continue(),
  );
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[data-compose-status]")).toContainText(
    "could not be loaded",
  );
  await expect(page.locator("[name=output]")).toHaveValue("Keep this text");
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[name=output]")).toHaveValue(/bookstore/);
  let release;
  const hold = new Promise((r) => (release = r));
  await page.route("**/guidance/vercel-design.json", async (r) => {
    const response = await r.fetch();
    await hold;
    await r.fulfill({ response });
  });
  await page.locator("[name=design]").selectOption("vercel-design");
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[data-compose-status]")).toContainText(
    "Combining",
  );
  await page.locator("[name=output]").fill("Edited while loading");
  release();
  await expect(page.locator("[data-compose-status]")).toContainText(
    "Inputs changed",
  );
  await expect(page.locator("[name=output]")).toHaveValue(
    "Edited while loading",
  );
});

test("Selections passed from guidance are consumed once and unsupported draft data is filtered", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "atlas-prompt-draft-v1",
      JSON.stringify({
        version: 1,
        requirements: "My existing requirements",
        output: "Existing edits",
        template: "unknown",
        skills: ["unknown"],
        checks: ["missing"],
      }),
    ),
  );
  await page.goto("#compose?lang=en&skill=break-ui&design=linear-design");
  await expect(page.locator("[name=skills][value=break-ui]")).toBeChecked();
  await expect(page.locator("[name=design]")).toHaveValue("linear-design");
  await expect(page.locator("[name=output]")).toHaveValue("Existing edits");
  expect(page.url()).not.toContain("skill=");
  await page.locator("[name=design]").selectOption("vercel-design");
  await expect(page.locator("[name=output]")).toHaveValue("Existing edits");
  // Remove only the init script in a new page; normal reload restoration is covered above.
  await page.locator("[data-generate-prompt]").click();
  await expect(page.locator("[name=output]")).toHaveValue(
    /worst-case|not installed|本站/,
  );
});

test("Guidance, directory and composer fit four widths in both languages and themes", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const records = [],
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [375, 768, 1440, 1910])
    for (const locale of ["zh-CN", "en"])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({
          width,
          height: width === 1910 ? 655 : 900,
        });
        await page.goto("#guidance?lang=" + locale);
        await page.evaluate((value) => {
          localStorage.setItem("atlas-shell-theme", value);
          document.documentElement.dataset.theme = value;
        }, theme);
        await expect(page.locator(".guidance-card")).toHaveCount(13);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const nav = page.locator(".market-navigation");
        if (width < 1101) {
          await expect(nav).toBeHidden();
          await expect(page.locator(".mobile-nav-trigger")).toBeVisible();
        }
        await page.screenshot({
          path: info.outputPath(`guidance-${width}-${locale}-${theme}.png`),
        });
        await page.goto("#compose?lang=" + locale);
        await expect(page.locator("#prompt-composer")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: info.outputPath(`composer-${width}-${locale}-${theme}.png`),
        });
        records.push({
          width,
          locale,
          theme,
          ...(await page.locator("#prompt-composer").boundingBox()),
        });
      }
  expect(errors).toEqual([]);
  await info.attach("guidance-dimensions.json", {
    body: JSON.stringify(records),
    contentType: "application/json",
  });
});

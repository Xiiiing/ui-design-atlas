import { test, expect } from "@playwright/test";
import { resources } from "../catalog.js";
const ids = [
  "boardui-agent-thinking",
  "bencho-slide-confirm",
  "bencho-context-meter",
  "libraries-thinking-orb",
  "watermelon-frequency-selector",
  "beui-expandable-tabs",
];
const preview = (id, locale = "en", theme = "light") =>
  `examples/ui-market/index.html?item=${id}&embed=1&lang=${locale}&theme=${theme}`;

test("New UI resources are actual library entries with complete source, prompts and download bundles", async ({
  page,
  request,
}) => {
  await page.goto("#explore?lang=en&collection=expressive-ui");
  await expect(page.locator("#results .asset-card")).toHaveCount(6);
  for (const id of ids) {
    const resource = resources.find((r) => r.id === id);
    await expect(
      page.locator(`[data-resource="component:${id}"]`),
    ).toBeVisible();
    const detail = await (
      await request.get(`details/component-${id}.json`)
    ).json();
    expect(detail.prompt.en.length).toBeGreaterThan(100);
    expect(detail.prompt["zh-CN"].length).toBeGreaterThan(100);
    expect(detail.sourceUrl).toContain("/blob/");
    const code = await (
      await request.get(`code/resources/component-${id}.json`)
    ).json();
    expect(code.files[resource.files[0]]).toBeTruthy();
    expect(
      Object.keys(code.files).some(
        (f) => f === `licenses/${resource.sourceId}-LICENSE`,
      ),
    ).toBe(true);
    expect(code.dependencies).not.toHaveProperty("framer-motion");
    expect(
      (await request.get(`downloads/resources/component-${id}.zip`)).ok(),
    ).toBe(true);
  }
  await page.goto("#tools/bencho?lang=en");
  await page.getByRole("link", { name: "Explore related interfaces" }).click();
  await expect(page.locator("#results .asset-card")).toHaveCount(2);
  await page.goto("#tools/beui-pro?lang=en");
  await expect(
    page.getByRole("link", { name: "Explore the beUI free selection" }),
  ).toHaveAttribute("href", /library=beui/);
  await page.goto("#component/bencho-slide-confirm?lang=en&tab=code");
  await expect(page.locator("#code-text")).toContainText("SlideConfirm");
});

test("Imported demos fit their card and phone viewports in both languages and themes", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const locale of ["zh-CN", "en"])
    for (const theme of ["light", "dark"])
      for (const id of ids) {
        const widths =
          id === "bencho-slide-confirm"
            ? [
                [320, 240],
                [320, 460],
              ]
            : [
                  "watermelon-frequency-selector",
                  "bencho-context-meter",
                ].includes(id)
              ? [
                  [400, 480],
                  [320, 540],
                ]
              : [
                  [480, 360],
                  [320, 460],
                ];
        for (const [width, height] of widths) {
          await page.setViewportSize({ width, height });
          await page.goto(preview(id, locale, theme));
          await expect(page.locator(".intake-demo")).toBeVisible();
          await expect(page.locator("html")).toHaveClass(new RegExp(theme));
          const geometry = await page.locator(".intake-demo").evaluate((el) => {
            const r = el.getBoundingClientRect();
            return {
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              width: innerWidth,
              height: innerHeight,
              scrollWidth: document.documentElement.scrollWidth,
            };
          });
          expect(
            geometry.left,
            `${id}/${locale}/${theme}/${width}`,
          ).toBeGreaterThanOrEqual(-1);
          expect(geometry.right).toBeLessThanOrEqual(width + 1);
          expect(geometry.scrollWidth).toBeLessThanOrEqual(width + 1);
          expect(geometry.top).toBeGreaterThanOrEqual(-1);
          expect(geometry.bottom).toBeLessThanOrEqual(height + 1);
          if (locale === "zh-CN" && width === widths[0][0])
            await testInfo.attach(`${id}-${theme}`, {
              body: await page.screenshot(),
              contentType: "image/png",
            });
        }
      }
  expect(errors).toEqual([]);
});

test("Interactive library cards retain full-size controls inside real square frames", async ({
  page,
}) => {
  for (const id of ids.filter(
    (id) =>
      !["bencho-context-meter", "watermelon-frequency-selector"].includes(id),
  )) {
    for (const locale of ["zh-CN", "en"]) {
      await page.setViewportSize({ width: 290, height: 290 });
      await page.goto(preview(id, locale) + "&inline=1");
      await expect(page.locator(".intake-demo")).toBeVisible();
      const rect = await page.locator(".intake-demo").boundingBox();
      expect(rect.y, id).toBeGreaterThanOrEqual(0);
      expect(rect.y + rect.height, id).toBeLessThanOrEqual(290);
      for (const control of await page
        .locator(".intake-demo button:visible, .intake-demo select:visible")
        .all()) {
        const box = await control.boundingBox();
        expect(box.x, id).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, id).toBeLessThanOrEqual(290);
        expect(box.y + box.height, id).toBeLessThanOrEqual(290);
      }
    }
  }
});

test("Thinking indicators and the actual Canvas orb support state changes, pause and reduced motion", async ({
  page,
}) => {
  await page.goto(preview("boardui-agent-thinking"));
  await page
    .getByRole("combobox", { name: "Indicator style" })
    .selectOption("stars");
  await expect(page.locator(".bui-agent-thinking-star")).toHaveCount(5);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect(
    await page
      .locator(".bui-agent-thinking-star")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("paused");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".bui-agent-thinking-star")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.goto(preview("libraries-thinking-orb"));
  await page
    .getByRole("combobox", { name: "Orb state" })
    .selectOption("searching");
  await expect(page.getByRole("status")).toHaveText("Searching…");
  const canvas = page.locator("canvas");
  await expect
    .poll(() =>
      canvas.evaluate((el) =>
        [
          ...el.getContext("2d").getImageData(0, 0, el.width, el.height).data,
        ].some((v) => v !== 0),
      ),
    )
    .toBe(true);
  const still = await canvas.evaluate((el) => el.toDataURL());
  await page.waitForTimeout(150);
  expect(await canvas.evaluate((el) => el.toDataURL())).toBe(still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await canvas.evaluate((el) => el.toDataURL());
  await page.waitForTimeout(150);
  expect(await canvas.evaluate((el) => el.toDataURL())).toBe(paused);
});

test("Slide confirmation handles incomplete and complete drags, keyboard and automatic reset", async ({
  page,
}) => {
  await page.goto(preview("bencho-slide-confirm"));
  const track = page.locator(".sld-track"),
    handle = page.getByRole("button", {
      name: "Slide to confirm",
      exact: true,
    });
  const box = await track.boundingBox();
  await page.mouse.move(box.x + 25, box.y + 28);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 28, { steps: 8 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-disabled", "false");
  await page.waitForTimeout(500);
  await page.mouse.move(box.x + 25, box.y + 28);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 1, box.y + 28, { steps: 20 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Confirmed", exact: true }),
  ).toBeVisible();
  await expect(handle).toBeVisible();
  await handle.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Confirmed", exact: true }),
  ).toBeVisible();
});

test("Context compaction is reversible and persists across field, bar and colour changes", async ({
  page,
}) => {
  await page.goto(preview("bencho-context-meter"));
  await expect(page.locator(".ctx-sr")).toHaveText("175.6K");
  await page.getByRole("button", { name: "Compact", exact: true }).click();
  await expect(page.locator(".ctx-sr")).toHaveText("97.4K");
  await page.getByRole("button", { name: "Bar", exact: true }).click();
  await expect(page.locator(".ctx-seg")).toHaveCount(6);
  await page.getByRole("button", { name: "Monochrome", exact: true }).click();
  await expect(page.locator(".ctx")).toHaveAttribute("data-mono", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".ctx-sr")).toHaveText("175.6K");
  await page.getByRole("button", { name: "Files", exact: true }).focus();
  await expect(page.locator(".ctx-sr")).toHaveText("46.1K");
});

test("Frequency edits are drafts until confirmed, Escape cancels and focus returns", async ({
  page,
}) => {
  await page.goto(preview("watermelon-frequency-selector"));
  const trigger = page.getByRole("button", { name: "Frequency", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await page.getByRole("button", { name: "15", exact: true }).click();
  await expect(page.locator("output")).toHaveText("Weekly · Tue");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(
    page.getByRole("button", { name: "Weekly", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await page.getByRole("button", { name: "15", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm frequency", exact: true })
    .click();
  await expect(page.locator("output")).toHaveText("Monthly · 15");
  await expect(trigger).toBeFocused();
});

test("Expandable tabs retain keyboard focus, local selection and Escape behavior", async ({
  page,
}) => {
  await page.goto(preview("beui-expandable-tabs"));
  const launch = page.getByRole("tab", { name: "Launch", exact: true }),
    inbox = page.getByRole("tab", { name: "Inbox", exact: true });
  await expect(launch).toHaveAttribute("aria-selected", "true");
  await launch.focus();
  await page.keyboard.press("ArrowRight");
  await expect(inbox).toBeFocused();
  await expect(inbox).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Client feedback", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator("output")).toHaveText("Selected: Client feedback");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tabpanel")).toHaveCount(0);
  await expect(inbox).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tabpanel")).toBeVisible();
});

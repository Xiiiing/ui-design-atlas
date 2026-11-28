import { test, expect } from "@playwright/test";
import { resources } from "../catalog.js";
import {
  componentPurpose,
  componentPurposes,
  designScope,
} from "../atlas/library-classification.js";

test("The public catalogue has one primary home per resource", async ({
  page,
}) => {
  for (const resource of resources) {
    if (designScope(resource)) expect(componentPurpose(resource)).toBe("");
    else expect(componentPurposes).toHaveProperty(componentPurpose(resource));
  }
  await page.goto("./");
  await expect(page.locator(".market-navigation a")).toHaveText([
    "组件",
    "界面设计",
    "提示词",
  ]);
  await page.locator("[name=q]").fill("流光边框");
  await page.locator("[data-gallery-choice=effects]").click();
  await expect(page.locator("#results .asset-card")).toHaveAttribute(
    "data-resource",
    "component:magicui-border-beam",
  );

  await page.locator("[data-primary-view=designs]").click();
  await page.locator("[data-gallery-choice=case]").click();
  await expect(page.locator("#results .asset-card")).toHaveCount(
    resources.filter((r) => r.type === "case").length,
  );
  await page.locator("[data-gallery-choice=page]").click();
  await page.locator("[name=q]").fill("dashboard 01");
  await expect(
    page.locator('[data-resource="block:shadcn-dashboard-01"]'),
  ).toBeVisible();

  await page.locator("[data-primary-view=prompts]").click();
  await expect(page.locator(".prompt-grid .guidance-card")).toHaveCount(4);
  await page.locator("[data-content-filter=task][data-value=improve]").click();
  await expect(page.locator(".prompt-grid .guidance-card")).toHaveCount(1);
  await page.locator(".prompt-grid h2 a").click();
  await expect(page.locator(".guidance-reading")).toBeVisible();
  await page.getByRole("link", { name: /返回提示词/ }).click();
  await expect(page.locator(".prompt-grid .guidance-card")).toHaveCount(1);
  await expect(
    page.locator("[data-content-filter=task][data-value=improve]"),
  ).toHaveAttribute("aria-pressed", "true");
});

test("A mobile gallery retains two rows and the original preview interaction", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("#library?lang=en");
    const choices = page.locator(".gallery-choice-strip").getByRole("button");
    await expect(choices).toHaveCount(6);
    const rows = await choices.evaluateAll((buttons) =>
      buttons.map((button) => ({
        y: button.getBoundingClientRect().y,
        height: button.getBoundingClientRect().height,
      })),
    );
    expect(new Set(rows.map((button) => button.y)).size).toBe(2);
    expect(rows.every((button) => button.height >= 44)).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator("[data-gallery-choice=input]").tap();
    await page.locator("[name=q]").fill("validated form");
    const cover = page.locator(
      '[data-resource="component:antd-form"] .asset-cover-link',
    );
    await cover.tap();
    await expect(page.locator("#inspector")).toBeHidden();
    const frame = page.frameLocator("#case-preview");
    const username = frame.getByLabel("Username");
    await username.fill("Atlas preview");
    const remember = frame.getByRole("checkbox").first();
    await remember.tap();
    await expect(remember).not.toBeChecked();
    await page.locator(".experience-actions [data-toggle-details]").tap();
    await expect(page.locator("#inspector")).toBeVisible();
    await page.locator(".inspector-close").tap();
    await expect(username).toHaveValue("Atlas preview");
    await expect(remember).not.toBeChecked();
    await page.locator(".viewer-leading [data-close-viewer]").tap();
    await expect(page.locator("[name=q]")).toHaveValue("validated form");
    await expect(page.locator("[data-gallery-choice=input]")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(cover).toBeFocused();
  } finally {
    await context.close();
  }
});

test("Navigation and two-row purpose choices move the same spring marker", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#library?lang=zh-CN");
  for (const [group, target, axis] of [
    [".gallery-choice-strip", "[data-gallery-choice=effects]", "y"],
    [".market-navigation", "[data-primary-view=designs]", "x"],
  ]) {
    const selection = page.locator(group);
    await expect(selection.locator("[data-selection-marker]")).toBeVisible();
    const samples = await selection.evaluate(
      async (el, { target, axis }) => {
        const marker = el.querySelector("[data-selection-marker]");
        const position = () => marker.getBoundingClientRect()[axis];
        const button = el.querySelector(target);
        const start = position();
        const end = button.getBoundingClientRect()[axis];
        const positions = [];
        button.click();
        const deadline = performance.now() + 600;
        do {
          await new Promise(requestAnimationFrame);
          positions.push(position());
        } while (performance.now() < deadline);
        return {
          same: marker === el.querySelector("[data-selection-marker]"),
          positions,
          start,
          end,
        };
      },
      { target, axis },
    );
    expect(samples.same).toBe(true);
    expect(
      samples.positions.some(
        (position) =>
          position > samples.start + 2 && position < samples.end - 2,
      ),
    ).toBe(true);
    expect(Math.abs(samples.positions.at(-1) - samples.end)).toBeLessThan(1);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("[data-primary-view=library]").click();
  const group = page.locator(".gallery-choice-strip");
  await group.locator("[data-gallery-choice=input]").click();
  await expect
    .poll(() =>
      group.evaluate((el) => {
        const active = el
          .querySelector('[aria-pressed="true"]')
          .getBoundingClientRect();
        const marker = el
          .querySelector("[data-selection-marker]")
          .getBoundingClientRect();
        return Math.max(
          Math.abs(active.x - marker.x),
          Math.abs(active.y - marker.y),
        );
      }),
    )
    .toBeLessThan(1);
});

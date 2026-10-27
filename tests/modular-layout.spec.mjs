import { test, expect } from "@playwright/test";
import { findResource, resources } from "../catalog.js";
import { experienceMode } from "../presentation.js";

test("Library mixes compact and double-width previews with consistent metadata", async ({
  page,
}) => {
  for (const lang of ["en", "zh-CN"])
    for (const width of [2560, 1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`#discover?lang=${lang}`);
      const sizes = await page
        .locator(".market-grid")
        .first()
        .evaluate((grid) => {
          const css = getComputedStyle(grid),
            columns = css.gridTemplateColumns.split(" ").length;
          const unit =
            (grid.clientWidth - (columns - 1) * parseFloat(css.columnGap)) /
            columns;
          return {
            columns,
            unit,
            gap: parseFloat(css.columnGap),
            cards: [...grid.children].map((card, index) => {
              const rect = card.getBoundingClientRect(),
                preview = card
                  .querySelector(".asset-preview")
                  .getBoundingClientRect();
              const footer = card
                .querySelector(".asset-footer")
                .getBoundingClientRect();
              return {
                wide: card.getAttribute("data-layout") === "wide",
                w: preview.width,
                h: preview.height,
                metadata: rect.height - preview.height,
                footer: footer.bottom - rect.bottom,
              };
            }),
          };
        });
      expect(sizes.cards.some((c) => c.wide)).toBe(true);
      expect(sizes.cards.some((c) => !c.wide)).toBe(true);
      for (const card of sizes.cards) {
        expect(Math.abs(card.h - sizes.unit)).toBeLessThan(1);
        expect(
          Math.abs(
            card.w -
              (card.wide && sizes.columns > 1
                ? 2 * sizes.unit + sizes.gap
                : sizes.unit),
          ),
        ).toBeLessThan(1);
        expect(card.metadata).toBeLessThanOrEqual(104);
        expect(card.footer).toBeLessThanOrEqual(1);
      }
      expect(new Set(sizes.cards.map((c) => c.metadata)).size).toBe(1);
      const first = page.locator(".asset-card").first();
      await first.locator(".card-menu-trigger").click();
      await expect(
        page.getByRole("menuitem", {
          name: lang === "en" ? "Copy prompt" : "复制提示词",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("menuitem", {
          name: lang === "en" ? "Details" : "查看详情",
          exact: true,
        }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(first.locator("[data-resource-tag]")).toHaveCount(2);
    }
});

test("Tall demos use a compact overview and remain fully usable in the responsive viewer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  for (const id of [
    "folio-card",
    "folio-pricing",
    "shadcn-admin-trend-chart",
    "fluent-dialog",
  ]) {
    await page.goto(
      `#components?lang=en&q=${encodeURIComponent(findResource(id).name.en)}`,
    );
    const card = page.locator(`[data-resource="component:${id}"]`);
    await expect(card).toHaveAttribute("data-layout", "compact");
    await expect(card).toHaveAttribute("data-experience", "canvas");
    await expect(card.locator("iframe")).toHaveCount(0);
    await card.locator(".asset-cover-link").click();
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    const demo = page.frameLocator("#case-preview");
    if (id === "fluent-dialog") {
      await demo
        .getByRole("button", { name: "Open dialog", exact: true })
        .click();
      await expect(demo.getByRole("dialog")).toBeVisible();
      await demo.getByRole("button", { name: "Close", exact: true }).click();
    } else if (id === "folio-pricing" || id === "folio-card") {
      await demo.locator("[data-demo-action]").click();
      await expect(demo.locator("#feedback")).toBeVisible();
    } else
      await expect(
        demo.locator(".recharts-responsive-container"),
      ).toBeVisible();
  }
});

test("Inline resources retain their content and controls within phone squares", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 375, height: 1000 });
  for (const lang of ["en", "zh-CN"])
    for (const r of resources.filter((r) => experienceMode(r) === "inline")) {
      await page.goto(
        `#components?lang=${lang}&q=${encodeURIComponent(r.name[lang])}`,
      );
      const card = page.locator(`[data-resource="${r.type}:${r.id}"]`);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toHaveAttribute("data-preview-state", "ready");
      const content = await card.locator("iframe").evaluate((f) => {
        const d = f.contentDocument,
          w = f.contentWindow,
          root = d.scrollingElement;
        return {
          overflowX: root.scrollWidth - w.innerWidth,
          overflowY: root.scrollHeight - w.innerHeight,
          clippedControls: [
            ...d.querySelectorAll("button,input,a,select,textarea"),
          ].filter((e) => {
            const b = e.getBoundingClientRect();
            return (
              b.width &&
              b.height &&
              (b.top < 0 ||
                b.bottom > w.innerHeight + 1 ||
                b.left < 0 ||
                b.right > w.innerWidth + 1)
            );
          }).length,
        };
      });
      expect(content.overflowX, `${r.id}/${lang}`).toBeLessThanOrEqual(2);
      expect(content.overflowY, `${r.id}/${lang}`).toBeLessThanOrEqual(2);
      expect(content.clippedControls, `${r.id}/${lang}`).toBe(0);
    }
});

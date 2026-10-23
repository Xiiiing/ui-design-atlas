import { chromium, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const stage = "after",
  browser = await chromium.launch(),
  metrics = [];
try {
  for (const width of [2560, 1440, 768, 375]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      colorScheme: "dark",
    });
    for (const [name, route] of [
      ["cards", "#discover?lang=zh-CN"],
      ["viewer", "#page/shadcn-admin-dashboard?lang=zh-CN"],
    ]) {
      await page.goto("http://127.0.0.1:4173/ui-design-atlas/" + route);
      await page.evaluate(() => document.fonts.ready);
      if (name === "viewer")
        await expect(
          page
            .frameLocator("#case-preview")
            .getByRole("heading", { name: "工作台", exact: true }),
        ).toBeVisible();
      else {
        await page
          .locator(".asset-preview > img")
          .first()
          .evaluate((img) => img.decode());
        await expect
          .poll(() =>
            page
              .locator(".asset-card[data-experience=inline]")
              .evaluateAll((es) =>
                es
                  .filter((e) => {
                    const b = e.getBoundingClientRect();
                    return b.top < innerHeight && b.bottom > 0;
                  })
                  .every((e) => e.dataset.previewState === "ready"),
              ),
          )
          .toBe(true);
      }
      await page.screenshot({
        path: `docs/ui/modular-layout/${stage}-${name}-${width}.png`,
      });
      metrics.push({
        width,
        name,
        ...(await page.evaluate(() => {
          const rect = (e) => {
            const b = e.getBoundingClientRect();
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          };
          return {
            cards: [
              ...document.querySelectorAll(".featured-section .asset-card"),
            ]
              .slice(0, 2)
              .map((e) => ({
                card: rect(e),
                preview: rect(e.querySelector(".asset-preview")),
              })),
            viewport:
              document.querySelector("#preview-viewport") &&
              rect(document.querySelector("#preview-viewport")),
            frame:
              document.querySelector("#case-preview") &&
              rect(document.querySelector("#case-preview")),
          };
        })),
      });
    }
    await page.close();
  }
  await writeFile(
    `docs/ui/modular-layout/${stage}.json`,
    JSON.stringify(metrics, null, 2) + "\n",
  );
} finally {
  await browser.close();
}

import { test, expect } from "@playwright/test";

test("Theme choices made before the case bridge is ready survive lazy route loading", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/examples/shadcn-admin/assets/_authenticated-*.js",
    async (route) => {
      await gate;
      await route.continue();
    },
  );
  try {
    await page.goto("#page/shadcn-admin-dashboard?lang=en", {
      waitUntil: "domcontentloaded",
    });
    const frame = page.frameLocator("#case-preview");
    await expect(frame.locator("html")).toHaveClass(/dark/);
    await expect(page.locator(".viewer-load-state")).toBeVisible();
    // The document has a theme, but its lazy route and message listener are not ready.
    await page.locator("[data-preview-theme]").click();
    await page.locator("#topbar .appearance-trigger").click(); // shell light; same pending target
    release();
    await expect(page.locator(".viewer-load-state")).toBeHidden();
    await expect(frame.locator("html")).not.toHaveClass(/dark/);
    await expect(page.locator("#standalone")).toHaveAttribute(
      "href",
      /theme=light/,
    );
    await frame
      .getByRole("button", { name: "Toggle theme", exact: true })
      .click();
    await frame.getByRole("menuitem", { name: "Dark", exact: true }).click();
    await expect(frame.locator("html")).toHaveClass(/dark/);
    await expect(page).toHaveURL(/theme=dark/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  } finally {
    release();
  }
});

// Exercise the visible destination, including the existing narrow-screen menu.
export async function activatePrimary(page, view) {
  const link = page.locator(`[data-primary-view="${view}"]`);
  if (await link.isVisible()) return link.click();
  const label = await link.getAttribute("aria-label");
  await page.locator(".mobile-nav-trigger").click();
  await page.getByRole("menuitem", { name: label, exact: true }).click();
}

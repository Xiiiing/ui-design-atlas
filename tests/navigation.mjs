// Use the visible navigation for both main destinations and supporting material.
export async function activatePrimary(page, view) {
  const link = page.locator(`.market-navigation [data-primary-view="${view}"]`);
  if (await link.count()) return link.click();
  const names = {
    guidance: /^(Design guidance|设计指导)$/,
    tools: /^(Resource directory|资源导航)$/,
  };
  if (!names[view]) throw new Error(`Unknown navigation destination: ${view}`);
  await page.locator(".more-nav-trigger").click();
  await page.getByRole("menuitem", { name: names[view] }).click();
}

export async function openFilters(page) {
  const trigger = page.locator("[data-advanced-filters]");
  if ((await trigger.getAttribute("aria-expanded")) !== "true")
    await trigger.click();
}

export async function openClassification(page, name = "category") {
  const trigger = page.locator(`[data-classification="${name}"]`);
  if ((await trigger.getAttribute("aria-expanded")) !== "true")
    await trigger.click();
}

export async function copyCardPrompt(page, card) {
  await card.locator(".card-menu-trigger").click();
  await page
    .getByRole("menuitem", { name: /^(Copy prompt|复制提示词)$/ })
    .click();
}

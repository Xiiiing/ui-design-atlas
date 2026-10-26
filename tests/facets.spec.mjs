import { test, expect } from "@playwright/test";
import { resources, searchResources } from "../catalog.js";
import { filterResources } from "../atlas/filter-model.js";

test("Facet combinations, scoped counts, zero options and URL history are coherent", async ({
  page,
}) => {
  await page.goto("#favorites?lang=en");
  await page.evaluate(() =>
    localStorage.setItem(
      "design-atlas-favorites",
      JSON.stringify(["component:folio-form"]),
    ),
  );
  await page.reload();
  await expect(page.locator("[data-category=all] span")).toHaveText("1");
  await expect(page.locator("[data-category=forms] span")).toHaveText("1");
  await expect(page.locator("[data-category=buttons]")).toBeDisabled();
  await page.locator("[data-advanced-filters]").click();
  await expect(page.locator("[name=library][value=antd]")).toBeDisabled();
  await page.locator("[name=library][value=native]").check();
  await expect(page.locator("[data-remove-filter=library]")).toContainText(
    "HTML",
  );
  await page.goto("#pages?lang=en&category=forms");
  const expected = filterResources(
    resources,
    { view: "pages", params: new URLSearchParams("category=forms") },
    new Set(),
  );
  await expect(page.locator(".asset-card")).toHaveCount(expected.length);
  await page.locator("[data-category=data]").click();
  await page.locator("[name=library][value=shadcn]").check();
  await page.locator("[name=library][value=native]").check();
  await expect(page).toHaveURL(/library=native%2Cshadcn/);
  const keys = await page
    .locator(".asset-card")
    .evaluateAll((els) => els.map((el) => el.dataset.resource));
  await page.reload();
  await expect(page.locator("[name=library]:checked")).toHaveCount(2);
  expect(
    await page
      .locator(".asset-card")
      .evaluateAll((els) => els.map((el) => el.dataset.resource)),
  ).toEqual(keys);
  await page.locator("[data-market-mode=components]").click();
  await page.goBack();
  await expect(page).toHaveURL(/#pages/);
  await expect(page.locator("[name=library]:checked")).toHaveCount(2);
  await page
    .locator("[data-remove-filter=library][data-filter-value=native]")
    .click();
  await expect(page.locator("[name=library][value=native]")).not.toBeChecked();
  await page.goto(
    "#components?lang=en&category=buttons&style=folio&source=original",
  );
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await expect(page.locator(".asset-card")).toHaveAttribute(
    "data-resource",
    "component:folio-button",
  );
});

test("Search retains global relevance across resource types and empty Enter keeps the dialog", async ({
  page,
}) => {
  for (const query of ["form", "表单"]) {
    await page.goto(`#explore?lang=en&q=${encodeURIComponent(query)}`);
    expect(
      await page
        .locator(".asset-card")
        .evaluateAll((els) => els.map((el) => el.dataset.resource)),
    ).toEqual(
      searchResources(query)
        .slice(0, 24)
        .map((r) => `${r.type}:${r.id}`),
    );
  }
  await page.keyboard.press("Control+k");
  await page.locator("#quick-search").fill("no-resource-matches");
  await page.locator("#quick-search").press("Enter");
  await expect(page.locator("#search-dialog")).toBeVisible();
  await expect(page.locator("#quick-search")).toHaveValue(
    "no-resource-matches",
  );
});

test("Library appends preserve visible frames, documents and input without document requests", async ({
  page,
}, info) => {
  let requests = 0;
  page.on("request", (req) => {
    if (req.isNavigationRequest() && req.frame() !== page.mainFrame())
      requests++;
  });
  await page.goto("#explore?lang=en");
  await expect(page.locator(".resource-group iframe").first()).toBeVisible();
  await expect
    .poll(() =>
      page.locator(".resource-group [data-preview-state=ready]").count(),
    )
    .toBeGreaterThan(0);
  const before = await page.evaluate(() => {
    window.retained = [
      ...document.querySelectorAll(".resource-group iframe"),
    ].filter((f) => f.closest("[data-preview-state=ready]"));
    window.docs = window.retained.map((f) => f.contentDocument);
    for (const doc of window.docs) {
      const input = doc.createElement("input");
      input.dataset.audit = "true";
      input.value = "preserved";
      doc.body.append(input);
    }
    return window.retained.length;
  });
  const baseline = requests;
  // Programmatic activation keeps the old cards visible, isolating append from intentional visibility recycling.
  await page.locator("[data-more]").evaluate((b) => b.click());
  await expect(page.locator("#results .asset-card")).toHaveCount(48);
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(() =>
      window.retained.every(
        (f, i) =>
          f.isConnected &&
          f.contentDocument === window.docs[i] &&
          f.contentDocument.querySelector("[data-audit]").value === "preserved",
      ),
    ),
  ).toBe(true);
  expect(requests - baseline).toBe(0);
  expect(await page.locator(".asset-card iframe").count()).toBeLessThanOrEqual(
    8,
  );
  await info.attach("discovery-retention.json", {
    body: JSON.stringify({
      mountedBefore: before,
      mountedAfter: await page.locator(".resource-group iframe").count(),
      addedDocumentRequests: requests - baseline,
    }),
    contentType: "application/json",
  });
});

test("Entering and clearing search preserves a retained card across result groups", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (r) => {
    if (r.isNavigationRequest() && r.frame() !== page.mainFrame()) requests++;
  });
  await page.goto("#favorites?lang=en");
  await page.evaluate(() =>
    localStorage.setItem(
      "design-atlas-favorites",
      JSON.stringify(["component:folio-form"]),
    ),
  );
  await page.reload();
  const card = page.locator('[data-resource="component:folio-form"]');
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  await card
    .frameLocator("iframe")
    .locator("input[type=email]")
    .fill("retained@example.com");
  await card.locator("iframe").evaluate((frame) => {
    window.savedFrame = frame;
    window.savedDocument = frame.contentDocument;
  });
  const before = requests;
  for (const query of ["form", ""]) {
    await page.locator("[name=q]").fill(query);
    await expect(page.locator(".resource-group")).toHaveAttribute(
      "data-type",
      query ? "search" : "component",
    );
    await expect(card).toHaveCount(1);
    expect(
      await card
        .locator("iframe")
        .evaluate(
          (frame) =>
            frame === window.savedFrame &&
            frame.contentDocument === window.savedDocument,
        ),
    ).toBe(true);
    await expect(
      card.frameLocator("iframe").locator("input[type=email]"),
    ).toHaveValue("retained@example.com");
  }
  expect(requests - before).toBe(0);
});

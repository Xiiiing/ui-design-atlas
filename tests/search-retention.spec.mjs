import { test, expect } from "@playwright/test";

test("IME composition does not update results or activate quick search", async ({
  page,
}) => {
  await page.goto("#components?lang=zh-CN");
  const before = await page.locator(".asset-card").count();
  const query = page.locator("[name=q]");
  await query.dispatchEvent("compositionstart");
  await query.fill("不存在");
  await page.waitForTimeout(220);
  await expect(page.locator(".asset-card")).toHaveCount(before);
  await query.dispatchEvent("compositionend");
  await expect(page.locator(".asset-card")).toHaveCount(0);
  await page.keyboard.press("Control+k");
  const quick = page.locator("#quick-search");
  await quick.fill("table");
  await quick.dispatchEvent("compositionstart");
  await quick.evaluate((el) => {
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        isComposing: true,
        bubbles: true,
      }),
    );
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        keyCode: 229,
        bubbles: true,
      }),
    );
  });
  await expect(page.locator("#search-dialog")).toBeVisible();
  await expect(quick).toBeFocused();
  await quick.dispatchEvent("compositionend");
  await quick.press("Enter");
  await expect(page).toHaveURL(/#component\/antd-table/);
});

test("Rapid input commits once, navigation flushes current filters and cancels late work", async ({
  page,
}) => {
  await page.goto("#components?lang=en");
  await page.locator("[name=q]").evaluate((el) => {
    window.atlasUpdates = 0;
    const original = history.replaceState.bind(history);
    history.replaceState = (...args) => {
      window.atlasUpdates++;
      original(...args);
    };
    for (const value of ["b", "bo", "border", "border beam"]) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await expect(page.locator(".asset-card")).toHaveCount(1);
  expect(await page.evaluate(() => window.atlasUpdates)).toBe(1);
  await page.locator("[name=q]").fill("table");
  await page.locator('[data-primary-view="favorites"]').click();
  await page.waitForTimeout(220);
  await expect(page).toHaveURL(/#favorites/);
  await page.locator('[data-primary-view="explore"]').click();
  await expect(page.locator("[name=q]")).toHaveValue("table");
  await expect(page).toHaveURL(/q=table/);
});

test("Unchanged previews retain their document, input and frame across search and save", async ({
  page,
}, testInfo) => {
  const docs = [];
  page.on("request", (req) => {
    if (
      req.isNavigationRequest() &&
      req.url().includes("component-preview.html")
    )
      docs.push(req.url());
  });
  await page.goto("#components?lang=en&category=forms&q=folio");
  const card = page.locator('[data-resource="component:folio-form"]');
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  const frame = card.frameLocator("iframe");
  await frame.locator("input[type=email]").fill("retain@example.com");
  await card.locator("iframe").evaluate((el) => {
    window.retainedFrame = el;
    window.retainedDocument = el.contentDocument;
  });
  const before = docs.length;
  for (const q of ["folio form", "FOLIO FORM", "folio"]) {
    await page.locator("[name=q]").fill(q);
    await expect(page).toHaveURL(
      new RegExp("q=" + q.replaceAll(" ", "\\+"), "i"),
    );
  }
  await card.locator("[data-save]").click();
  await expect(frame.locator("input[type=email]")).toHaveValue(
    "retain@example.com",
  );
  expect(
    await card
      .locator("iframe")
      .evaluate(
        (el) =>
          el === window.retainedFrame &&
          el.contentDocument === window.retainedDocument,
      ),
  ).toBe(true);
  expect(docs.length - before).toBe(0);
  await testInfo.attach("preview-retention.json", {
    body: JSON.stringify({
      filterUpdates: 3,
      previousImplementationExpectedReloads: 3,
      documentReloads: docs.length - before,
      retainedDocument: true,
    }),
    contentType: "application/json",
  });
  await page.locator("[name=q]").fill("no such form");
  await expect(card).toHaveCount(0);
  expect(await page.evaluate(() => window.retainedFrame.isConnected)).toBe(
    false,
  );
  await page.locator("[name=q]").fill("folio");
  await expect(card).toHaveAttribute("data-preview-state", "ready");
  await expect(frame.locator("input[type=email]")).toHaveValue("");
});

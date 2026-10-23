import { test, expect } from "@playwright/test";
import { cases, pages, components, resources } from "../catalog.js";
const example = (path = "/", lang = "en", extra = "") =>
  `examples/shadcn-admin/index.html?lang=${lang}${extra}#${path}`;
function watch(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
test("Market experience preserves filters, navigation context, prompt and source", async ({
  page,
  context,
}) => {
  const errors = watch(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#explore?lang=en");
  await expect(page.locator("#results .card")).toHaveCount(24);
  await page.locator("[name=q]").fill("用户编辑");
  await page.locator("[data-open]").last().click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await expect(page.locator(".inspector-head h2")).toHaveText(
    "User editor dialog",
  );
  await expect(page.locator(".inline-prompt")).toContainText(
    "User editor dialog",
  );
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText("UsersActionDialog");
  await page.locator("[data-tab=notes]").click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await page
    .getByRole("button", { name: "Back to market", exact: true })
    .click();
  await expect(page.locator("[name=q]")).toHaveValue("用户编辑");
  await page.goto("#case/shadcn-admin?lang=en&panel=details");
  const demo = page.frameLocator("#case-preview");
  await expect(
    demo.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  await demo.getByRole("link", { name: "Tasks", exact: true }).first().click();
  await expect(page.locator(".inspector-head h2")).toHaveText("Tasks");
  await expect(page).toHaveURL(/page=tasks/);
  await page
    .locator("#inspector")
    .getByRole("button", { name: "Copy prompt", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Task table with search",
  );
  await page
    .locator('#related a[href*="component/shadcn-admin-task-table"]')
    .first()
    .click();
  await expect(page.locator(".inspector-head h2")).toHaveText("Task table");
  await expect(
    page.frameLocator("#case-preview").getByRole("table"),
  ).toBeVisible();
  await page
    .locator('#related a[href*="page/shadcn-admin-tasks"]')
    .first()
    .click();
  await page.locator("#site-locale").click();
  await page.getByRole("option", { name: "中文", exact: true }).click();
  await expect(page.locator(".inspector-head h2")).toHaveText("任务管理");
  await page.reload();
  await expect(page.locator(".inspector-head h2")).toHaveText("任务管理");
  await page.goto("#component/folio-button?lang=en");
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("button", { name: /Start creating/ }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(page.locator("#code-text")).toContainText("<!doctype html>");
  expect(errors).toEqual([]);
});
test("Bilingual market searches, library and source filters retain existing content", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("#pages?lang=en");
  await expect(page.locator("#results .card")).toHaveCount(pages.length);
  await page.locator("[name=q]").fill("任务");
  await expect(page.locator("#results .card")).toHaveCount(1);
  await page.locator("[data-reset-filters]").click();
  await page.locator("[data-advanced-filters]").click();
  await page.locator("#filter-source").click();
  await page.getByRole("option", { name: "Open source", exact: true }).click();
  await expect(page.locator("#results .card")).toHaveCount(6);
  await page.reload();
  await expect(page.locator("#results .card")).toHaveCount(6);
  await page.goto("#cases?lang=zh-CN");
  await expect(page.locator("#results .card")).toHaveCount(cases.length);
  await expect(page.locator("[data-advanced-filters]")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.locator("#filter-audience").click();
  await page
    .getByRole("option", { name: "B 端 / 工作工具", exact: true })
    .click();
  await expect(page.locator("#results .card")).toHaveCount(2);
  expect(errors).toEqual([]);
});
test("Task create, search, edit, delete and reload update the actual table", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto(example("/tasks"));
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Atlas persistent task");
  await page
    .getByRole("combobox")
    .filter({ hasText: "Select dropdown" })
    .click();
  await page.getByRole("option", { name: "In Progress", exact: true }).click();
  await page.getByRole("radio", { name: "Feature", exact: true }).check();
  await page.getByRole("radio", { name: "High", exact: true }).check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByPlaceholder("Filter by title or ID...")
    .fill("Atlas persistent task");
  await expect(
    page.getByRole("row").filter({ hasText: "Atlas persistent task" }),
  ).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Atlas persistent task" }),
  ).toHaveCount(1);
  await page
    .getByRole("row")
    .filter({ hasText: "Atlas persistent task" })
    .getByRole("button", { name: "Open menu" })
    .click();
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Atlas updated task");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByPlaceholder("Filter by title or ID...")
    .fill("Atlas updated task");
  await expect(
    page.getByRole("row").filter({ hasText: "Atlas updated task" }),
  ).toHaveCount(1);
  await page
    .getByRole("row")
    .filter({ hasText: "Atlas updated task" })
    .getByRole("button", { name: "Open menu" })
    .click();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Atlas updated task" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Atlas updated task" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("Users create and edit, filter and delete; passwords never persist", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto(example("/users"));
  await page.getByRole("button", { name: "Add User", exact: true }).click();
  await page
    .getByRole("textbox", { name: "First Name", exact: true })
    .fill("Atlas");
  await page
    .getByRole("textbox", { name: "Last Name", exact: true })
    .fill("Tester");
  await page
    .getByRole("textbox", { name: "Username", exact: true })
    .fill("atlas_tester");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("atlas@example.com");
  await page
    .getByRole("textbox", { name: "Phone Number", exact: true })
    .fill("+15555550123");
  await page.getByRole("combobox").filter({ hasText: "Select a role" }).click();
  await page.getByRole("option", { name: "Manager", exact: true }).click();
  await page.getByLabel("Password", { exact: true }).fill("Example123");
  await page.getByLabel("Confirm Password", { exact: true }).fill("Example123");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByPlaceholder("Filter users...").fill("atlas_tester");
  const row = page.getByRole("row").filter({ hasText: "atlas_tester" });
  await expect(row).toHaveCount(1);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("atlas:shadcn-admin:v1:users"),
    ),
  ).not.toContain("Example123");
  await row.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page
    .getByRole("textbox", { name: "First Name", exact: true })
    .fill("Updated");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(row).toContainText("Updated");
  await page.reload();
  await expect(row).toContainText("Updated");
  await row.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByPlaceholder("Enter username to confirm deletion.")
    .fill("atlas_tester");
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(row).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("All settings save and reset independently from legacy demos", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto(example("/settings"));
  await page
    .getByRole("textbox", { name: "Username", exact: true })
    .fill("atlas_profile");
  await page
    .getByRole("button", { name: "Update profile", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Username", exact: true }),
  ).toHaveValue("atlas_profile");
  await page.goto(example("/settings/notifications"));
  await page
    .getByRole("radio", { name: "Direct messages and mentions", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Update notifications", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("radio", {
      name: "Direct messages and mentions",
      exact: true,
    }),
  ).toBeChecked();
  await page.goto(example("/settings/appearance"));
  await page.getByText("Dark", { exact: true }).click();
  await page
    .getByRole("button", { name: "Update preferences", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.evaluate(() =>
    localStorage.setItem(
      "atlas-orbit-settings",
      JSON.stringify({ name: "Legacy untouched" }),
    ),
  );
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("atlas:shadcn-admin:v1:profile"),
    ),
  ).toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem("atlas-orbit-settings")),
  ).toContain("Legacy untouched");
  expect(errors).toEqual([]);
});
for (const lang of ["en", "zh-CN"])
  test(`Six pages at desktop/tablet/mobile in both themes, ${lang}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    const errors = watch(page);
    const external = [];
    await page.route("**/*", (r) => {
      if (new URL(r.request().url()).origin !== "http://127.0.0.1:4173") {
        external.push(r.request().url());
        return r.abort();
      }
      return r.continue();
    });
    for (const width of [1440, 768, 375])
      for (const theme of ["light", "dark"])
        for (const path of [
          "/",
          "/tasks",
          "/users",
          "/settings",
          "/settings/appearance",
          "/settings/notifications",
        ]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(example(path, lang, "&theme=" + theme));
          await expect(
            page.getByRole("heading", {
              name: (lang === "en"
                ? {
                    "/": "Dashboard",
                    "/tasks": "Tasks",
                    "/users": "User List",
                    "/settings": "Profile",
                    "/settings/appearance": "Appearance",
                    "/settings/notifications": "Notifications",
                  }
                : {
                    "/": "工作台",
                    "/tasks": "任务",
                    "/users": "用户列表",
                    "/settings": "个人资料",
                    "/settings/appearance": "外观",
                    "/settings/notifications": "通知",
                  })[path],
              exact: true,
            }),
          ).toBeVisible();
          await noOverflow(page);
          await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        }
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
test("All eight isolated components load using the same actual page modules", async ({
  page,
}) => {
  const errors = watch(page);
  for (const component of components.filter(
    (c) => c.caseId === "shadcn-admin",
  )) {
    const c = cases[0],
      p = c.pages.find((p) => p.id === component.pageIds[0]);
    await page.goto(example(p.path, "en", "&component=" + component.key));
    if (component.key === "task-drawer") {
      await page.getByRole("button", { name: "Create Task" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
    } else if (component.key === "user-dialog") {
      await page.getByRole("button", { name: "Add User", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
    } else if (component.key === "sidebar")
      await expect(
        page.getByRole("link", { name: "Dashboard", exact: true }),
      ).toBeVisible();
    else if (component.key === "metric-cards")
      await expect(
        page.getByText("Total Revenue", { exact: true }),
      ).toBeVisible();
    else if (component.key === "trend-chart")
      await expect(page.locator(".recharts-surface")).toBeVisible();
    else if (component.key === "settings-form")
      await expect(
        page.getByRole("textbox", { name: "Username", exact: true }),
      ).toBeVisible();
    else
      await expect(
        page.getByPlaceholder("Filter by title or ID..."),
      ).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("Original examples still operate after translation and source download contains runnable files", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("preview.html?style=orbit&page=work&lang=en");
  await page.getByRole("button", { name: /Create project/ }).click();
  await page
    .getByRole("textbox", { name: "Project name", exact: true })
    .fill("Legacy project");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Legacy project" }),
  ).toHaveCount(1);
  await page.goto("preview.html?style=bloom&lang=en");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("link", { name: "Curved ceramic vase" }).click();
  await page.getByRole("button", { name: /Add to bag/ }).click();
  await page.getByRole("link", { name: "Shopping bag", exact: true }).click();
  await expect(page.locator(".cart-item")).toHaveCount(1);
  const response = await page.request.get("downloads/shadcn-admin.zip");
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 2).toString()).toBe("PK");
  const source = await page.request.get("code/shadcn-admin.json");
  const manifest = await source.json();
  expect(
    manifest.files["src/features/tasks/components/tasks-table.tsx"],
  ).toContain("useReactTable");
  expect(manifest.files["package-lock.json"]).toContain("atlas-shadcn-admin");
  expect(errors).toEqual([]);
});

test("Table filters, sorting, pagination and form validation survive hash refreshes", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto(example("/tasks"));
  const search = page.getByPlaceholder("Filter by title or ID...");
  await search.pressSequentially("Update the");
  await expect(search).toHaveValue("Update the");
  await page.reload();
  await expect(search).toHaveValue("Update the");
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Update the user onboarding flow" })
      .first(),
  ).toBeVisible();
  await search.fill("");
  await page
    .getByRole("button", { name: "Status", exact: true })
    .first()
    .click();
  await page.getByRole("option", { name: /^Done/ }).click();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.getByRole("row").nth(1)).toContainText("Done");
  expect(await page.getByRole("row").count()).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  const first = await page.getByRole("row").nth(1).innerText();
  await page
    .getByRole("button", { name: "Go to next page", exact: true })
    .click();
  await expect(page.getByRole("row").nth(1)).not.toHaveText(first);
  await page.getByRole("button", { name: "Title", exact: true }).click();
  await page.getByRole("menuitem", { name: "Asc", exact: true }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByText("Title is required.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto(example("/tasks", "zh-CN"));
  await page.getByRole("button", { name: "新建", exact: true }).click();
  await page.getByRole("button", { name: "保存更改", exact: true }).click();
  await expect(page.getByText("请填写标题。", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Market and experience layouts remain usable at all viewport sizes", async ({
  page,
}) => {
  const errors = watch(page);
  for (const lang of ["en", "zh-CN"])
    for (const width of [1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`#explore?lang=${lang}`);
      await noOverflow(page);
      await page.locator("[name=q]").fill("用户编辑");
      await page.locator("[data-open]").last().click();
      await expect(page.locator(".experience-viewer")).toBeVisible();
      await expect(page.locator("#inspector h2")).toBeVisible();
      await noOverflow(page);
      await page.locator("[data-tab=code]").click();
      await expect(page.locator("#code-text")).toBeVisible();
      await page.locator("[data-tab=notes]").click();
      await expect(page.locator(".experience-viewer")).toBeVisible();
      await page.locator("[data-close-viewer]").first().click();
      await expect(page.locator(".experience-viewer")).not.toBeVisible();
      await expect(page.locator("[name=q]")).toHaveValue("用户编辑");
    }
  expect(errors).toEqual([]);
});
test("Favorites export/import retains legacy and page IDs", async ({
  page,
}) => {
  await page.goto("#page/shadcn-admin-tasks?lang=en&panel=details");
  await page.locator("#inspector [data-save]").click();
  await page.goto("#favorites?lang=en");
  await expect(page.locator("#results .card")).toHaveCount(1);
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export saved" }).click();
  const file = await event;
  const stream = await file.createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk;
  expect(JSON.parse(text).favorites).toEqual(["page:shadcn-admin-tasks"]);
  await page.locator("#import-favorites").setInputFiles({
    name: "favorites.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "ui-design-atlas",
        version: 1,
        favorites: ["case:folio", "component:orbit-table"],
      }),
    ),
  });
  await expect(page.locator("#results .card")).toHaveCount(3);
});

test("Native page canvases, browser history, keyboard search and preview limits", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("#case/shadcn-admin?lang=en&theme=dark");
  await expect(
    page
      .frameLocator("#case-preview")
      .getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator("#case-preview")
      .evaluate((f) => f.contentWindow.innerWidth),
  ).toBe(1280);
  await page.locator('[data-device="375"]').click();
  await expect
    .poll(() =>
      page.locator("#case-preview").evaluate((f) => f.contentWindow.innerWidth),
    )
    .toBe(375);
  await page.goto("#explore?lang=en");
  await page.locator("[data-more]").click();
  await expect(page.locator("#results .card")).toHaveCount(48);
  await page.locator(".asset-card").nth(30).scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await page
    .locator(".asset-card")
    .nth(30)
    .locator("[data-open]")
    .last()
    .click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".experience-viewer")).not.toBeVisible();
  await expect(page.locator("#results .card")).toHaveCount(48);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);
  await page.keyboard.press("Control+k");
  await page.locator("#quick-search").fill("用户编辑");
  await page.locator("#quick-search").press("Enter");
  await expect(page.locator(".inspector-head h2")).toHaveText(
    "User editor dialog",
  );
  await expect(page.locator("#search-dialog")).not.toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".experience-viewer")).not.toBeVisible();
  for (let i = 0; i < 4; i++) await page.locator(".asset-card").nth(i).hover();
  expect(await page.locator(".asset-live iframe").count()).toBeLessThanOrEqual(
    8,
  );
  expect(errors).toEqual([]);
});

test("Independent upstream resources load locally with source, prompts and reduced motion", async ({
  page,
  context,
}) => {
  const errors = watch(page);
  const independent = resources.filter((r) => !r.caseId && r.type !== "case");
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === "http://127.0.0.1:4173"
      ? route.continue()
      : route.abort(),
  );
  for (const r of independent) {
    await page.goto(`examples/ui-market/index.html?item=${r.id}&lang=en`);
    await expect(page.locator(".demo-surface")).not.toContainText(
      "Loading preview…",
    );
    await expect(page.locator(".demo-surface [role=alert]")).toHaveCount(0);
    await expect(page.locator(".demo-surface")).not.toContainText(
      "Resource not found.",
    );
  }
  await page.goto("#component/magicui-border-beam?lang=en");
  await expect(page.locator(".inspector-head h2")).toHaveText("Border Beam");
  await expect(page.locator(".inline-prompt")).toContainText("8-second");
  await expect(page.locator(".provenance")).toContainText("Magic UI");
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(page.locator("#code-text")).toContainText("BorderBeam");
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  const demo = page.frameLocator("#case-preview");
  await page
    .getByRole("spinbutton", { name: "Duration (seconds)", exact: true })
    .fill("4");
  await expect(
    page.getByRole("spinbutton", { name: "Duration (seconds)", exact: true }),
  ).toHaveValue("4");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    "examples/ui-market/index.html?item=magicui-particles&lang=zh-CN",
  );
  await expect(page.locator(".demo-surface")).toContainText("粒子背景");
  expect(errors).toEqual([]);
});

test("Library examples use real Ant Design and Fluent UI with working validation and nested dialogs", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("examples/ui-market/index.html?item=antd-form&lang=en");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(
    page.getByText("Please input your username!", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Username", { exact: true }).fill("Atlas");
  await page.getByLabel("Password", { exact: true }).fill("OnlyForThisDemo");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Form submitted locally.");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "OnlyForThisDemo",
  );
  await page.goto(
    "examples/ui-market/index.html?item=fluent-data-grid&lang=en",
  );
  await expect(page.getByRole("grid")).toBeVisible();
  const first = await page.getByRole("row").nth(1).innerText();
  await page.getByRole("columnheader", { name: "File", exact: true }).click();
  await expect(page.getByRole("row").nth(1)).not.toHaveText(first);
  await page.goto("#explore?lang=en");
  await page.locator("[name=q]").fill("微软");
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await page.locator('[data-open="component:fluent-dialog"]').last().click();
  const demo = page.frameLocator("#case-preview");
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await demo.getByRole("button", { name: "Close", exact: true }).click();
  await expect(demo.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await demo.getByRole("button", { name: "Open dialog", exact: true }).click();
  await demo
    .getByRole("button", { name: "Close", exact: true })
    .press("Escape");
  await expect(demo.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await page
    .getByRole("button", { name: "Back to market", exact: true })
    .click();
  await expect(page.locator("[name=q]")).toHaveValue("微软");
  expect(errors).toEqual([]);
});

for (const lang of ["en", "zh-CN"])
  test(`New source previews: responsive, themed and self-contained (${lang})`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    const errors = watch(page);
    await page.route("**/*", (route) =>
      new URL(route.request().url()).origin === "http://127.0.0.1:4173"
        ? route.continue()
        : route.abort(),
    );
    const independent = resources.filter((r) => r.preview.url);
    async function check(r, width, theme) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `examples/ui-market/index.html?item=${r.id}&lang=${lang}&theme=${theme}`,
      );
      await expect(page.locator(".demo-surface")).not.toContainText(
        /Loading preview|正在加载演示/,
      );
      await expect(page.locator(".demo-surface [role=alert]")).toHaveCount(0);
      await noOverflow(page);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect
        .poll(() =>
          page.locator("html").evaluate((el) => el.classList.contains("dark")),
        )
        .toBe(theme === "dark");
    }
    for (const r of independent) await check(r, 1440, "light");
    for (const id of [
      "magicui-border-beam",
      "magicui-dock",
      "magicui-bento-grid",
      "antd-search",
      "antd-table",
      "fluent-data-grid",
      "fluent-dialog",
      "shadcn-login-01",
      "shadcn-sidebar-07",
      "shadcn-dashboard-01",
    ])
      for (const width of [768, 375])
        for (const theme of ["light", "dark"])
          await check(
            resources.find((r) => r.id === id),
            width,
            theme,
          );
    expect(errors).toEqual([]);
  });

test("Original shadcn blocks validate local forms and preserve native dashboard interactions", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto(
    "examples/ui-market/index.html?item=shadcn-signup-01&lang=en",
  );
  await page.getByLabel("Full Name", { exact: true }).fill("Atlas");
  await page.getByLabel("Email", { exact: true }).fill("atlas@example.test");
  await page.getByLabel("Password", { exact: true }).fill("ExamplePass123");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("Mismatch123");
  await page
    .getByRole("button", { name: "Create Account", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .getByLabel("Confirm Password", { exact: true })
        .evaluate((el) => el.validationMessage),
    )
    .toBe("Passwords do not match.");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("ExamplePass123");
  await page
    .getByRole("button", { name: "Create Account", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Local demo complete. No account was created.",
  );
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "ExamplePass123",
  );
  await page.goto(
    "examples/ui-market/index.html?item=shadcn-dashboard-01&lang=en",
  );
  await expect(page.getByRole("table")).toBeVisible();
  const first = await page.getByRole("row").nth(1).innerText();
  await page
    .getByRole("button", { name: "Go to next page", exact: true })
    .click();
  await expect(page.getByRole("row").nth(1)).not.toHaveText(first);
  await page
    .getByRole("checkbox", { name: "Select row", exact: true })
    .first()
    .check();
  await expect(
    page.getByRole("checkbox", { name: "Select row", exact: true }).first(),
  ).toBeChecked();
  await page.goto("#blocks?lang=en");
  await page.locator("[name=q]").fill("registration");
  await page.locator("[name=q]").fill("signup");
  await page.locator('[data-open="block:shadcn-signup-01"]').last().click();
  await expect(page.locator(".experience-viewer")).toBeVisible();
  await page.locator("[data-tab=code]").click();
  await expect(page.locator("#code-text")).toContainText("SignupForm");
  expect(errors).toEqual([]);
});

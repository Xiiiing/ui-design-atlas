import { expect, test } from "@playwright/test";
import { collectionResources } from "../catalog.js";

const additions = collectionResources("clayo-ui-references").filter(
  (resource) =>
    resource.files?.some((file) => file.startsWith("src/demos/ui-references/")),
);

const preview = (id, lang = "en", theme = "light") =>
  `examples/ui-market/index.html?item=${id}&embed=1&lang=${lang}&theme=${theme}`;

test("The directory and collection connect to real previews and reusable source", async ({
  page,
  request,
}) => {
  await page.goto("#tools?lang=zh-CN&q=0xclayo");
  await expect(page.locator(".guidance-card")).toHaveCount(15);
  await page.getByRole("button", { name: /开发工具/ }).click();
  await expect(page.locator(".guidance-card")).toHaveCount(2);
  await page.goto("#tools?lang=en&q=0xclayo");
  await page.getByRole("link", { name: "cmdk", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Open repository/ }),
  ).toHaveAttribute("href", "https://github.com/dip/cmdk");
  await page.getByRole("link", { name: /Explore related interfaces/ }).click();
  await expect(page.locator(".asset-card")).toHaveCount(1);

  await page.goto("#explore?lang=en&collection=clayo-ui-references");
  await expect(page.locator(".asset-card")).toHaveCount(13);
  const card = page.locator(
    '[data-resource="component:cmdk-workspace-command"]',
  );
  await card.locator(".asset-caption [data-open]").click();
  const frame = page.frameLocator("#case-preview");
  await expect(
    frame.getByRole("combobox", { name: "Workspace commands" }),
  ).toBeVisible();

  const packages = [
    "@radix-ui/react-dropdown-menu",
    "cmdk",
    "sonner",
    "vaul",
    "@tabler/icons-react",
    "tailwind-variants",
    "@mantine/core",
    "daisyui",
  ];
  expect(additions).toHaveLength(packages.length);
  for (const [index, resource] of additions.entries()) {
    const slug = `component-${resource.id}`;
    const code = await (
      await request.get(`code/resources/${slug}.json`)
    ).json();
    expect(code.dependencies[packages[index]]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(code.files[`licenses/${resource.sourceId}-LICENSE`]).toContain(
      "License",
    );
    expect(code.files[resource.files[0]]).toContain("export default");
    expect((await request.get(`downloads/resources/${slug}.zip`)).ok()).toBe(
      true,
    );
    expect((await request.get(resource.cover)).ok()).toBe(true);
    expect(
      (await request.get(resource.cover.replace(".png", "-dark.png"))).ok(),
    ).toBe(true);
  }
});

test("Radix and cmdk support keyboard selection and localized search", async ({
  page,
}) => {
  await page.goto(preview("radix-file-menu"));
  const trigger = page.getByRole("button", { name: "File options" });
  await trigger.focus();
  await trigger.press("Enter");
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Pin file" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("List · Pinned");
  await trigger.press("Enter");
  await page.getByRole("menuitemradio", { name: "Cards" }).click();
  await expect(page.getByRole("status")).toHaveText("Cards · Pinned");

  await page.goto(preview("cmdk-workspace-command", "zh-CN"));
  const search = page.getByRole("combobox");
  await expect(search).toBeVisible();
  await page.keyboard.press("ControlOrMeta+k");
  await expect(search).toBeFocused();
  await search.fill("settings");
  await expect(page.getByRole("option")).toHaveCount(1);
  await search.press("Enter");
  await expect(page.getByRole("status")).toHaveText("已选择「打开偏好设置」");
  await expect(search).toHaveValue("");
  await search.fill("文件夹zz");
  await expect(page.getByText("没有匹配的命令。")).toBeVisible();
});

test("Sonner expands stacked toasts and Vaul applies or discards edits", async ({
  page,
}) => {
  await page.goto(preview("sonner-toast-stack"));
  await page.getByRole("button", { name: "Send three notifications" }).click();
  const topToast = page
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Upload failed" });
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(3);
  await topToast.hover();
  await expect(topToast).toHaveAttribute("data-expanded", "true");
  await topToast.getByRole("button", { name: "Close notification" }).click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(2);
  await page.getByRole("button", { name: "Clear notifications" }).click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto(preview("vaul-sort-sheet"));
  const open = page.getByRole("button", { name: "Change order" });
  await open.click();
  await page.getByRole("radio", { name: "Name" }).check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Recently updated");
  await expect(open).toBeFocused();
  await open.click();
  await expect(
    page.getByRole("radio", { name: "Recently updated" }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "Name" }).check();
  await page.getByRole("button", { name: "Apply order" }).click();
  await expect(page.getByRole("status")).toHaveText("Name");
  await open.click();
  const handle = page.locator(".refs-sheet-handle");
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 220, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Icon weight, progress, density and theme update locally", async ({
  page,
}) => {
  await page.goto(preview("tabler-icon-browser", "zh-CN"));
  await page.getByRole("searchbox").fill("书签");
  await expect(page.locator(".refs-icon-grid li")).toHaveCount(1);
  await page.getByRole("slider").press("ArrowRight");
  await expect(page.locator(".refs-icon-grid svg")).toHaveAttribute(
    "stroke-width",
    "2.5",
  );

  await page.goto(preview("tremor-delivery-kpi"));
  await page.getByRole("button", { name: "This month" }).click();
  const metric = page.getByRole("progressbar", {
    name: "Deliveries completed",
  });
  await expect(metric).toHaveAttribute("aria-valuenow", "318");
  await expect(metric).toHaveAttribute("aria-valuemax", "400");
  await expect(metric).toContainText("80%");

  await page.goto(preview("mantine-list-density"));
  const list = page.locator(".refs-density");
  const standardHeight = (await list.boundingBox()).height;
  await page.getByRole("radio", { name: "Standard" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "Compact" })).toBeChecked();
  await expect
    .poll(async () => (await list.boundingBox()).height)
    .toBeLessThan(standardHeight);

  await page.goto(preview("daisyui-theme-switcher", "en", "dark"));
  const theme = page.locator(".refs-daisy");
  const chooser = page.getByRole("combobox", { name: "Preview theme" });
  await expect(theme).toHaveAttribute("data-theme", "dark");
  const before = await theme.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await chooser.selectOption("nord");
  await expect(theme).toHaveAttribute("data-theme", "nord");
  await expect
    .poll(() =>
      theme.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(before);
  await expect(page.getByRole("button", { name: "Saved" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("All new examples fit a phone viewport in light English and dark Chinese", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 480 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [lang, theme] of [
    ["en", "light"],
    ["zh-CN", "dark"],
  ]) {
    for (const resource of additions) {
      await page.goto(preview(resource.id, lang, theme));
      await expect(page.locator(".refs-panel h1")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("html")).toHaveClass(theme);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
    }
  }
  expect(errors).toEqual([]);
});

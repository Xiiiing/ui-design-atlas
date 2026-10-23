import { test, expect } from "@playwright/test";
import { resources, sourceProjects } from "../catalog.js";
import { imports, localFile } from "../scripts/resource-code.mjs";

const beam = "component-magicui-border-beam";
const endpoint = `code/resources/${beam}.json`;

test("All archived resources publish complete local dependency closures and downloadable file sets", async ({
  request,
}) => {
  for (const resource of resources.filter((r) => r.sourceId !== "original")) {
    const slug = `${resource.type}-${resource.id}`;
    const response = await request.get(`code/resources/${slug}.json`);
    expect(response.ok(), slug).toBe(true);
    const manifest = await response.json();
    expect(manifest.resourceId).toBe(resource.id);
    if (resource.sourceId !== "shadcn-admin") {
      const license = sourceProjects[resource.sourceId].licenseFile.replace(
        "./examples/ui-market/",
        "",
      );
      expect(manifest.files[license], `${slug}: source license`).toBeTruthy();
    }
    for (const file of [
      ...manifest.entryFiles,
      ...(resource.supportFiles || []),
    ])
      expect(manifest.files[file], `${slug}: ${file}`).toBeTruthy();
    for (const [file, content] of Object.entries(manifest.files)) {
      for (const imported of imports(file, content))
        expect(
          () => localFile(file, imported, manifest.files),
          `${slug}: ${file} -> ${imported}`,
        ).not.toThrow();
    }
    const zip = await request.get(`downloads/resources/${slug}.zip`);
    expect(zip.ok(), slug).toBe(true);
    expect((await zip.body()).subarray(0, 2).toString()).toBe("PK");
  }
});

test("Resource source loads independently, supports integration, copy/download and opt-in full project", async ({
  page,
  context,
}) => {
  const requests = [],
    errors = [];
  page.on("request", (req) => requests.push(new URL(req.url()).pathname));
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#component/magicui-border-beam?lang=en&tab=code");
  await expect(page.locator("#code-text")).toContainText("BorderBeam");
  expect(requests.some((url) => url.endsWith(endpoint))).toBe(true);
  expect(
    requests.some((url) => /code\/(ui-market|shadcn-admin)\.json$/.test(url)),
  ).toBe(false);
  await page.getByText("Integration & installation", { exact: true }).click();
  await expect(page.locator(".code-integration")).toContainText(
    "@/ maps to src/",
  );
  await page
    .getByRole("button", { name: "Copy install commands", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "npm install",
  );
  await page.locator("#code-file").click();
  await expect(
    page.getByRole("option", { name: "src/demos/antd/table.tsx", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("option", {
      name: "src/vendor/magicui/border-beam.tsx",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Copy file", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "motion/react",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download file", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("border-beam.tsx");
  const archive = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download resource files ZIP", exact: true })
    .click();
  expect((await archive).suggestedFilename()).toBe(`${beam}.zip`);
  await page
    .getByRole("button", { name: "View full project source", exact: true })
    .click();
  await expect(page.locator("#full-code h2")).toHaveText("Full project source");
  expect(requests.some((url) => url.endsWith("/code/ui-market.json"))).toBe(
    true,
  );
  await page.locator("#code-file").click();
  await page
    .getByRole("option", { name: "src/demos/antd/table.tsx", exact: true })
    .click();
  await expect(page.locator("#code-text")).toContainText("Table");
  await page
    .getByRole("button", { name: "Back to resource source", exact: true })
    .click();
  await expect(page.locator("#code-text")).toContainText("BorderBeam");
  await page.locator("#site-locale").click();
  await page.getByRole("option", { name: "中文", exact: true }).click();
  await expect(page.locator("#full-code h2")).toHaveText("当前资源源码");
  expect(errors).toEqual([]);
});

test("Failed source requests retry and late responses cannot overwrite a newly selected resource", async ({
  page,
}) => {
  let attempts = 0;
  await page.route(`**/${endpoint}`, async (route) => {
    if (++attempts === 1)
      await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.continue();
  });
  await page.goto("#component/magicui-border-beam?lang=en&tab=code");
  await expect(page.getByRole("alert")).toContainText(
    "Source could not be loaded",
  );
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator("#code-text")).toContainText("BorderBeam");
  expect(attempts).toBe(2);
  let release;
  const delayed = new Promise((resolve) => {
    release = resolve;
  });
  let intercepted;
  const started = new Promise((resolve) => {
    intercepted = resolve;
  });
  await page.route(
    "**/code/resources/component-antd-table.json",
    async (route) => {
      const response = await route.fetch();
      intercepted();
      await delayed;
      await route.fulfill({ response });
    },
  );
  await page.goto("#component/antd-table?lang=en&tab=code");
  await started;
  await page.goto("#component/fluent-toast?lang=en&tab=code");
  await expect(page.locator("#code-text")).toContainText("Toast");
  const late = page.waitForResponse(
    "**/code/resources/component-antd-table.json",
  );
  release();
  await late;
  await expect(page.locator("#code-file")).toContainText(
    "src/demos/fluent/toast.tsx",
  );
  await expect(page.locator("#code-text")).toContainText("Toast");
});

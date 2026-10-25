import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  cp,
  readdir,
  symlink,
  readFile,
  writeFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { chromium, expect } from "@playwright/test";

const root = fileURLToPath(new URL("../", import.meta.url));
async function freePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function fixture() {
  const target = await mkdtemp(path.join(tmpdir(), "atlas-dev-test-"));
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:html|js|json|css|svg)$/.test(entry.name))
      await cp(path.join(root, entry.name), path.join(target, entry.name));
  }
  for (const dir of [
    "atlas",
    "shell",
    "scripts",
    "assets",
    "content",
    "vendor",
    "examples",
  ]) {
    await cp(path.join(root, dir), path.join(target, dir), {
      recursive: true,
      filter: (source) =>
        !["node_modules", "dist", ".git"].includes(path.basename(source)) &&
        !source.endsWith(".tsbuildinfo"),
    });
  }
  await symlink(
    path.join(root, "node_modules"),
    path.join(target, "node_modules"),
    "dir",
  );
  for (const dir of ["examples/ui-market", "examples/shadcn-admin"]) {
    const installed = path.join(root, dir, "node_modules");
    const isolated = path.join(target, dir, "node_modules");
    await mkdir(isolated);
    for (const entry of await readdir(installed)) {
      // Keep Vite's cache private and font assets inside the served fixture root.
      if (entry.startsWith(".")) continue;
      if (entry === "@fontsource")
        await cp(path.join(installed, entry), path.join(isolated, entry), {
          recursive: true,
        });
      else
        await symlink(
          path.join(installed, entry),
          path.join(isolated, entry),
          "dir",
        );
    }
  }
  return target;
}

// Mutation happens only in this disposable copy, never in the checkout.
test(
  "Development updates shell and both React examples, keeps raw delivery current and releases servers",
  { timeout: 180000 },
  async (t) => {
    const directory = await fixture();
    const port = await freePort();
    const base = `http://127.0.0.1:${port}/ui-design-atlas/`;
    let log = "";
    const child = spawn(process.execPath, ["scripts/dev.mjs"], {
      cwd: directory,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (data) => {
      log += data;
    });
    child.stderr.on("data", (data) => {
      log += data;
    });
    const exited = once(child, "exit");
    let browser;
    t.after(async () => {
      if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
      await exited;
      await browser?.close();
      await rm(directory, { recursive: true, force: true });
    });
    try {
      await expect
        .poll(() => log, { timeout: 20000 })
        .toContain("Atlas development:");
      const duplicate = spawn(process.execPath, ["scripts/dev.mjs"], {
        cwd: directory,
        env: { ...process.env, PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
      });
      t.after(() => {
        if (duplicate.exitCode === null) duplicate.kill("SIGTERM");
      });
      let duplicateLog = "";
      duplicate.stdout.on("data", (chunk) => {
        duplicateLog += chunk;
      });
      duplicate.stderr.on("data", (chunk) => {
        duplicateLog += chunk;
      });
      const [duplicateCode] = await once(duplicate, "exit");
      assert.equal(duplicateCode, 1);
      assert.match(duplicateLog, /already in use|EADDRINUSE/);
      browser = await chromium.launch();
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "#components?lang=en&q=border%20beam");
      const card = page.locator(
        '[data-resource="component:magicui-border-beam"]',
      );
      await expect(card).toHaveAttribute("data-preview-state", "ready", {
        timeout: 30000,
      });
      await page.evaluate(() => {
        window.devIdentity = "same-document";
      });
      const css = path.join(directory, "market.css");
      await writeFile(
        css,
        (await readFile(css, "utf8")) +
          "\n.brand-name { outline: 7px solid rgb(123,45,67); }\n",
      );
      await expect(page.locator(".brand-name")).toHaveCSS(
        "outline-width",
        "7px",
      );
      assert.equal(
        await page.evaluate(() => window.devIdentity),
        "same-document",
      );
      const app = path.join(directory, "app.js");
      await writeFile(
        app,
        (await readFile(app, "utf8")).replace(
          '"UI marketplace"',
          '"Atlas development marker"',
        ),
      );
      await expect(page).toHaveTitle(/Atlas development marker/);
      assert.equal(await page.evaluate(() => window.devIdentity), undefined);
      await expect(card).toHaveAttribute("data-preview-state", "ready");
      const frame = card.frameLocator("iframe");
      assert.equal(
        await frame.locator("#root").evaluate(async () => {
          await document.fonts.ready;
          return [...document.fonts].some((font) => font.status === "loaded");
        }),
        true,
      );
      await frame.locator("#email").fill("hot@example.com");
      await card.locator("iframe").evaluate((el) => {
        el.contentWindow.devIdentity = "react-refresh";
      });
      const source = "examples/ui-market/src/demos/magicui/border-beam.tsx";
      const original = await readFile(path.join(directory, source), "utf8");
      const updated = original.replace(
        "<CardTitle>Login</CardTitle>",
        "<CardTitle>Hot login marker</CardTitle>",
      );
      const endpoint =
        base + "code/resources/component-magicui-border-beam.json";
      assert.equal(
        (await (await page.request.get(endpoint)).json()).files[
          "src/demos/magicui/border-beam.tsx"
        ],
        original,
      );
      const sourcePage = await browser.newPage();
      await sourcePage.goto(
        base + "#component/magicui-border-beam?lang=en&tab=code",
      );
      await expect(sourcePage.locator("#code-text")).toContainText(
        "<CardTitle>Login</CardTitle>",
      );
      await writeFile(path.join(directory, source), updated);
      await expect(
        frame.getByText("Hot login marker", { exact: true }),
      ).toBeVisible({ timeout: 20000 });
      assert.equal(
        await card
          .locator("iframe")
          .evaluate((el) => el.contentWindow.devIdentity),
        "react-refresh",
      );
      await expect(frame.locator("#email")).toHaveValue("hot@example.com");
      await expect(sourcePage.locator("#code-text")).toContainText(
        "Hot login marker",
      );
      await expect
        .poll(
          async () =>
            (await (await page.request.get(endpoint)).json()).files[
              "src/demos/magicui/border-beam.tsx"
            ],
          { timeout: 20000 },
        )
        .toBe(updated);
      const zip = await page.request.get(
        base + "downloads/resources/component-magicui-border-beam.zip",
      );
      assert.equal(zip.status(), 200);
      const zipBytes = await zip.body();
      // Read the generated ZIP's central directory and inflate the requested entry.
      const { inflateRawSync } = await import("node:zlib");
      let found = false;
      for (let i = 0; i < zipBytes.length - 46; i++)
        if (zipBytes.readUInt32LE(i) === 0x02014b50) {
          const nameLength = zipBytes.readUInt16LE(i + 28),
            name = zipBytes.subarray(i + 46, i + 46 + nameLength).toString();
          if (!name.endsWith("/src/demos/magicui/border-beam.tsx")) continue;
          const offset = zipBytes.readUInt32LE(i + 42),
            size = zipBytes.readUInt32LE(i + 20);
          const start =
            offset +
            30 +
            zipBytes.readUInt16LE(offset + 26) +
            zipBytes.readUInt16LE(offset + 28);
          assert.equal(
            inflateRawSync(zipBytes.subarray(start, start + size)).toString(),
            updated,
          );
          found = true;
          break;
        }
      assert.equal(found, true);
      const raw = await (
        await page.request.get(base + "components.js?atlas-source")
      ).text();
      assert.equal(
        raw,
        await readFile(path.join(directory, "components.js"), "utf8"),
      );

      // Catalog edits flow through the shell, example names, detail and ZIP manifests.
      const catalogPath = path.join(directory, "content/resources.json");
      const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
      const record = catalog.find((r) => r.id === "magicui-border-beam");
      record.name.en = "Catalog hot name";
      await writeFile(catalogPath, JSON.stringify(catalog));
      await page.goto(base + "#components?lang=en&q=Catalog%20hot%20name");
      await expect(page.locator(".asset-caption [data-open]")).toHaveText(
        "Catalog hot name",
      );
      await expect
        .poll(
          async () =>
            (
              await (
                await page.request.get(
                  base + "details/component-magicui-border-beam.json",
                )
              ).json()
            ).name.en,
        )
        .toBe("Catalog hot name");
      const index = async () =>
        JSON.parse(
          (await (await page.request.get(base + "code/ui-market.json")).json())
            .files["atlas-catalog.json"],
        );
      await expect
        .poll(
          async () => (await index()).find((r) => r.id === record.id)?.name.en,
        )
        .toBe("Catalog hot name");
      const clone = {
        ...record,
        id: "audit-catalog-added",
        name: { en: "Catalog addition", "zh-CN": "目录新增" },
      };
      catalog.push(clone);
      await writeFile(catalogPath, JSON.stringify(catalog));
      await page.goto(base + "#components?lang=en&q=Catalog%20addition");
      await expect(page.locator(".asset-card")).toHaveCount(1);
      await expect
        .poll(async () => (await index()).some((r) => r.id === clone.id))
        .toBe(true);
      assert.equal(
        (
          await page.request.get(
            base + "downloads/resources/component-audit-catalog-added.zip",
          )
        ).status(),
        200,
      );
      catalog.pop();
      await writeFile(catalogPath, JSON.stringify(catalog));
      await expect(page.locator(".market-empty")).toBeVisible();
      await expect
        .poll(async () => (await index()).some((r) => r.id === clone.id))
        .toBe(false);
      assert.equal(
        (
          await page.request.get(
            base + "details/component-audit-catalog-added.json",
          )
        ).status(),
        404,
      );
      assert.deepEqual(errors, []);
      const valid = JSON.stringify(catalog);
      record.categories.push("illegal-category");
      await writeFile(catalogPath, JSON.stringify(catalog));
      await expect
        .poll(
          async () =>
            (await page.request.get(base + "code/ui-market.json")).status(),
          { timeout: 20000 },
        )
        .toBe(500);
      await writeFile(catalogPath, valid);
      await expect
        .poll(
          async () =>
            (await page.request.get(base + "code/ui-market.json")).status(),
          { timeout: 20000 },
        )
        .toBe(200);
      // Harmless sentinels exercise the exact production/development delivery generator.
      for (const name of ["ui-market", "shadcn-admin"]) {
        const project = path.join(directory, "examples", name);
        for (const file of [
          ".env.local",
          "src/local.ts.bak",
          "debug.log",
          "private-note.md",
          "src/unrelated-local.ts",
        ])
          await writeFile(
            path.join(project, file),
            "ATLAS_PUBLIC_AUDIT_SENTINEL",
          );
        const zipResponse = await page.request.get(
          base + `downloads/${name}.zip`,
        );
        assert.equal(zipResponse.status(), 200);
        const bytes = await zipResponse.body();
        for (const name of [
          ".env.local",
          "local.ts.bak",
          "debug.log",
          "private-note.md",
          "src/unrelated-local.ts",
        ])
          assert.equal(bytes.includes(Buffer.from(name)), false);
      }
      await writeFile(
        path.join(directory, "outside.ts"),
        "ATLAS_PUBLIC_OUTSIDE_SENTINEL",
      );
      const link = path.join(directory, "examples/ui-market/src/outside.ts");
      await symlink(path.join(directory, "outside.ts"), link);
      await expect
        .poll(
          async () =>
            (await page.request.get(base + "downloads/ui-market.zip")).status(),
          { timeout: 20000 },
        )
        .toBe(500);
      await rm(link);
      await expect
        .poll(
          async () =>
            (await page.request.get(base + "downloads/ui-market.zip")).status(),
          { timeout: 20000 },
        )
        .toBe(200);
      errors.length = 0;
      // Restore the live demo used below after catalog invalidation/recovery.
      await page.goto(base + "#components?lang=en&q=Catalog%20hot%20name");
      await expect(card).toHaveAttribute("data-preview-state", "ready");

      const admin = await browser.newPage();
      await admin.goto(
        base + "examples/shadcn-admin/index.html?lang=en#/tasks",
      );
      await expect(
        admin.getByRole("heading", { name: "Tasks", exact: true }),
      ).toBeVisible({ timeout: 30000 });
      assert.equal(
        await admin.evaluate(async () => {
          await document.fonts.ready;
          return [...document.fonts].some((font) => font.status === "loaded");
        }),
        true,
      );
      assert.doesNotMatch(log, /outside of Vite serving allow list/);
      await admin.evaluate(() => {
        window.devIdentity = "admin-refresh";
      });
      const adminPath = path.join(
        directory,
        "examples/shadcn-admin/src/features/tasks/index.tsx",
      );
      await writeFile(
        adminPath,
        (await readFile(adminPath, "utf8")).replace(
          '{t("Tasks")}',
          '{t("Hot tasks marker")}',
        ),
      );
      await expect(
        admin.getByRole("heading", { name: "Hot tasks marker", exact: true }),
      ).toBeVisible({ timeout: 20000 });
      assert.equal(
        await admin.evaluate(() => window.devIdentity),
        "admin-refresh",
      );
      assert.deepEqual(errors, []);

      // Broken React source reports an overlay, then recovers after the edit is fixed.
      await writeFile(
        path.join(directory, source),
        updated + "\nconst broken = ;\n",
      );
      await expect(frame.locator("vite-error-overlay")).toHaveCount(1, {
        timeout: 15000,
      });
      await writeFile(
        path.join(directory, source),
        updated.replace("Hot login marker", "Recovered login marker"),
      );
      await expect(
        frame.getByText("Recovered login marker", { exact: true }),
      ).toBeVisible({ timeout: 15000 });
      await expect(frame.locator("vite-error-overlay")).toHaveCount(0);
      child.kill("SIGTERM");
      await exited;
      const check = net.createServer();
      await new Promise((resolve, reject) => {
        check.once("error", reject);
        check.listen(port, "127.0.0.1", resolve);
      });
      await new Promise((resolve) => check.close(resolve));
    } catch (error) {
      console.error(log.slice(-14000));
      throw error;
    }
  },
);

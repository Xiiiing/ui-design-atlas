import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
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
  for (const dir of ["", "examples/ui-market", "examples/shadcn-admin"])
    await symlink(
      path.join(root, dir, "node_modules"),
      path.join(target, dir, "node_modules"),
      "dir",
    );
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

      const admin = await browser.newPage();
      await admin.goto(
        base + "examples/shadcn-admin/index.html?lang=en#/tasks",
      );
      await expect(
        admin.getByRole("heading", { name: "Tasks", exact: true }),
      ).toBeVisible({ timeout: 30000 });
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

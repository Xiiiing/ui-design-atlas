import { test, expect } from "@playwright/test";
import { mkdtemp, writeFile, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import http from "node:http";
import { once } from "node:events";
for (const id of ["folio", "forma", "orbit", "bloom"])
  test(`Original ${id} ZIP runs outside the repository with navigation, language and theme`, async ({
    page,
    request,
  }) => {
    const temp = await mkdtemp(path.join(tmpdir(), "atlas-original-"));
    let server;
    try {
      const zip = await request.get(`downloads/resources/case-${id}.zip`);
      expect(zip.ok()).toBe(true);
      await writeFile(path.join(temp, "project.zip"), await zip.body());
      execFileSync("unzip", ["-q", path.join(temp, "project.zip"), "-d", temp]);
      const root = path.join(temp, `case-${id}`),
        failures = [];
      server = http.createServer(async (req, res) => {
        try {
          const pathname = new URL(req.url, "http://localhost").pathname;
          const file = path.join(
            root,
            pathname === "/" ? "index.html" : pathname,
          );
          await stat(file);
          res.setHeader(
            "Content-Type",
            file.endsWith(".js")
              ? "application/javascript"
              : file.endsWith(".css")
                ? "text/css"
                : file.endsWith(".svg")
                  ? "image/svg+xml"
                  : "text/html",
          );
          res.end(await readFile(file));
        } catch {
          res.writeHead(404).end();
        }
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      page.on("pageerror", (e) => failures.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400) failures.push(r.url());
      });
      const base = `http://127.0.0.1:${server.address().port}`;
      for (const [lang, theme] of [
        ["en", "light"],
        ["zh-CN", "dark"],
      ]) {
        await page.goto(`${base}/index.html?lang=${lang}&theme=${theme}`);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("#preview-root")).not.toBeEmpty();
        await page.locator(".p-header nav a").nth(1).click();
        await expect(page).toHaveURL(/page=work/);
        await page.locator(".p-header nav a").nth(2).click();
        await expect(page).toHaveURL(/page=about/);
        if (id === "folio" || id === "forma") {
          await page.locator("[name=name]").fill("Atlas Audit");
          await page.locator("[name=email]").fill("audit@example.com");
          await page
            .locator("[name=message]")
            .fill("Static archive interaction");
          await page.locator(".p-form button[type=submit]").click();
          await expect(page.locator(".form-result")).not.toBeEmpty();
        }
      }
      expect(failures).toEqual([]);
    } finally {
      if (server) await new Promise((resolve) => server.close(resolve));
      await rm(temp, { recursive: true, force: true });
    }
  });

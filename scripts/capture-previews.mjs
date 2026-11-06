import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import {
  responsiveCovers,
  coverThumbnail,
  coverWidths,
} from "../preview-covers.js";
import { resources, resourcePreview } from "../catalog.js";
import { resourcePresentation } from "../presentation.js";
const port = 4188;
const server = spawn(process.execPath, ["scripts/serve.mjs", "--dist"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});
const browser = await chromium.launch();
const failures = [];
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      ready = (await fetch(`http://127.0.0.1:${port}/`)).ok;
    } catch {}
    if (ready) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!ready) throw Error("Preview server did not start");
  await mkdir("assets/previews", { recursive: true });
  const jobs = resources.filter(
    (r) =>
      !process.argv[2] ||
      (process.argv[2] === "--canvas"
        ? resourcePresentation(r).mode === "canvas"
        : process.argv[2] === "--controls"
          ? r.type === "component" &&
            r.category === "buttons" &&
            r.preview.width < 900
          : process.argv[2] === "--new"
            ? Boolean(r.preview.url)
            : r.id.includes(process.argv[2])),
  );
  let index = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      const page = await browser.newPage();
      while (index < jobs.length) {
        const r = jobs[index++];
        try {
          const framing = resourcePresentation(r);
          await page.setViewportSize({
            width: framing.width,
            height: framing.height,
          });
          for (const theme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: theme });
            const url = new URL(
              resourcePreview(r, "zh-CN", theme),
              `http://127.0.0.1:${port}/`,
            );
            url.searchParams.set("thumb", "1");
            await page.goto(url.href, {
              waitUntil: "networkidle",
              timeout: 20000,
            });
            await page.evaluate(() => document.fonts.ready);
            await page.waitForTimeout(r.motion ? 1100 : 200);
            // Screenshot-only chrome removal: live demos keep all native scrolling.
            await page.addStyleTag({
              content:
                "* { scrollbar-width: none !important; } *::-webkit-scrollbar { display: none !important; }",
            });
            const png = r.cover
              .replace("./", "")
              .replace(/\.png$/, theme === "dark" ? "-dark.png" : ".png");
            const image = await page.screenshot({
              path: png,
              animations: "allow",
            });
            if (responsiveCovers.has(r.cover)) {
              for (const width of coverWidths) {
                const webp = await page.evaluate(
                  async ({ data, width }) => {
                    const image = new Image();
                    image.src = "data:image/png;base64," + data;
                    await image.decode();
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = Math.round(
                      (image.height * width) / image.width,
                    );
                    canvas
                      .getContext("2d")
                      .drawImage(image, 0, 0, canvas.width, canvas.height);
                    return canvas.toDataURL("image/webp", 0.87).split(",")[1];
                  },
                  { data: image.toString("base64"), width },
                );
                await writeFile(
                  coverThumbnail(png, width),
                  Buffer.from(webp, "base64"),
                );
              }
            }
            console.log(`Captured ${r.type}:${r.id}/${theme}`);
          }
        } catch (e) {
          failures.push(`${r.id}: ${e.message}`);
        }
      }
      await page.close();
    }),
  );
} finally {
  await browser.close();
  server.kill();
}
if (failures.length) throw Error(failures.join("\n"));

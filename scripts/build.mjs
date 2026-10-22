import "./check.mjs";
import { mkdir, cp, rm, readdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import archiver from "archiver";
import { upstream } from "../catalog.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const example = path.join(root, "examples/shadcn-admin");
for (const command of ["build"]) {
  const result = spawnSync("npm", ["run", command], {
    cwd: example,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
const out = path.join(root, "dist");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const assets = [
  "index.html",
  "preview.html",
  "component-preview.html",
  "styles.css",
  "components.css",
  "preview.css",
  "app.js",
  "icons.js",
  "data.js",
  "catalog.js",
  "market-catalog.js",
  "components.js",
  "preview.js",
  "component-preview.js",
  "legacy-i18n.js",
  "legacy-translations.js",
  "favicon.svg",
  ".nojekyll",
];
for (const file of assets)
  await cp(path.join(root, file), path.join(out, file));
await cp(path.join(root, "assets"), path.join(out, "assets"), {
  recursive: true,
});
await cp(path.join(root, "vendor"), path.join(out, "vendor"), {
  recursive: true,
});
await mkdir(path.join(out, "examples/shadcn-admin"), { recursive: true });
await cp(path.join(example, "dist"), path.join(out, "examples/shadcn-admin"), {
  recursive: true,
});
for (const file of ["LICENSE", "ATTRIBUTION.md"])
  await cp(
    path.join(example, file),
    path.join(out, "examples/shadcn-admin", file),
  );
async function walk(dir, exclude = new Set()) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (exclude.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) result.push(...(await walk(full, exclude)));
    else result.push(full);
  }
  return result;
}
const files = {};
for (const file of await walk(path.join(example, "src"))) {
  if (/\.(tsx?|css|json)$/.test(file))
    files[path.relative(example, file).split(path.sep).join("/")] =
      await readFile(file, "utf8");
}
for (const file of [
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "index.html",
  "README.md",
  "LICENSE",
  "ATTRIBUTION.md",
])
  files[file] = await readFile(path.join(example, file), "utf8");
await mkdir(path.join(out, "code"));
await writeFile(
  path.join(out, "code/shadcn-admin.json"),
  JSON.stringify({ source: upstream, files }),
);
// Include dependency notices from the actual lockfile installation, including font licenses.
const notices = [
  "# Third-party dependency notices\n\nCollected from the installed, locked dependencies of the Atlas Shadcn Admin example.\n",
];
async function packages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name.startsWith("@"))
      for (const child of await readdir(full))
        dirs.push(path.join(full, child));
    else if (e.isDirectory()) dirs.push(full);
  }
  const nested = [];
  for (const pkg of dirs) {
    try {
      nested.push(...(await packages(path.join(pkg, "node_modules"))));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return [...dirs, ...nested];
}
for (const dir of (await packages(path.join(example, "node_modules"))).sort()) {
  try {
    const pkg = JSON.parse(
      await readFile(path.join(dir, "package.json"), "utf8"),
    );
    notices.push(
      `\n## ${pkg.name} ${pkg.version}\n\nLicense: ${typeof pkg.license === "string" ? pkg.license : JSON.stringify(pkg.license) || "See package notice"}\n`,
    );
    for (const f of await readdir(dir))
      if (/^(license|licence|copying|ofl|notice)(\.|$|-)/i.test(f)) {
        try {
          notices.push(
            "\n" + (await readFile(path.join(dir, f), "utf8")) + "\n",
          );
        } catch {}
      }
  } catch {}
}
const noticeText = notices.join("");
await mkdir(path.join(out, "downloads"));
await writeFile(
  path.join(out, "examples/shadcn-admin/THIRD_PARTY_NOTICES.md"),
  noticeText,
);
const archive = archiver("zip", { zlib: { level: 6 } });
const stream = createWriteStream(path.join(out, "downloads/shadcn-admin.zip"));
const done = new Promise((resolve, reject) => {
  stream.on("close", resolve);
  stream.on("error", reject);
  archive.on("error", reject);
});
archive.pipe(stream);
for (const file of await walk(
  example,
  new Set(["node_modules", "dist", ".git"]),
)) {
  const relative = path.relative(example, file).split(path.sep).join("/");
  if (
    !/^(node_modules|dist|\.git)\//.test(relative) &&
    !relative.endsWith(".tsbuildinfo")
  )
    archive.file(file, { name: "shadcn-admin/" + relative });
}
archive.append(noticeText, { name: "shadcn-admin/THIRD_PARTY_NOTICES.md" });
await archive.finalize();
await done;
console.log(
  "Built Atlas, local React demo, source manifest, license notices and standalone project ZIP in dist/.",
);

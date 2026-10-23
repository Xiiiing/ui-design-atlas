import "./check.mjs";
import { build } from "esbuild";
import { mkdir, cp, rm, readdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import archiver from "archiver";
import { upstream, resources } from "../catalog.js";
import { resourceCode } from "./resource-code.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const example = path.join(root, "examples/shadcn-admin");
const shellCheck = spawnSync("npm", ["run", "check:shell"], {
  cwd: root,
  stdio: "inherit",
});
if (shellCheck.status !== 0) process.exit(shellCheck.status || 1);
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
  "market.css",
  "components.css",
  "preview.css",
  "app.js",
  "icons.js",
  "data.js",
  "catalog.js",
  "search.js",
  "presentation.js",
  "resource-tags.js",
  "live-cards.js",
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
await cp(path.join(root, "content"), path.join(out, "content"), {
  recursive: true,
});
await cp(path.join(root, "assets"), path.join(out, "assets"), {
  recursive: true,
});
await build({
  entryPoints: [path.join(root, "app.js")],
  bundle: true,
  format: "esm",
  target: "es2022",
  jsx: "automatic",
  minify: true,
  outfile: path.join(out, "atlas-shell.js"),
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
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

// Independent UI sources are built separately and keep their own providers and lockfile.
const market = path.join(root, "examples/ui-market");
const marketBuild = spawnSync("npm", ["run", "build"], {
  cwd: market,
  stdio: "inherit",
});
if (marketBuild.status !== 0) process.exit(marketBuild.status || 1);
const marketOut = path.join(out, "examples/ui-market");
await mkdir(marketOut, { recursive: true });
await cp(path.join(market, "dist"), marketOut, { recursive: true });
for (const file of [
  "licenses",
  "LICENSE",
  "ATTRIBUTION.md",
  "sources.lock.json",
])
  await cp(path.join(market, file), path.join(marketOut, file), {
    recursive: true,
  });
const marketFiles = {};
for (const file of await walk(
  market,
  new Set(["node_modules", "dist", ".git"]),
)) {
  const rel = path.relative(market, file).split(path.sep).join("/");
  if (
    /\.(tsx?|css|json|md|html|svg)$/.test(rel) ||
    rel === "LICENSE" ||
    rel.startsWith("licenses/")
  )
    marketFiles[rel] = await readFile(file, "utf8");
}
await writeFile(
  path.join(out, "code/ui-market.json"),
  JSON.stringify({ files: marketFiles }),
);
const marketNotices = [
  "# Third-party notices\n\nLocked dependencies for Atlas UI Market.\n",
];
for (const dir of (await packages(path.join(market, "node_modules"))).sort()) {
  try {
    const pkg = JSON.parse(
      await readFile(path.join(dir, "package.json"), "utf8"),
    );
    marketNotices.push(
      `\n## ${pkg.name} ${pkg.version}\n\nLicense: ${typeof pkg.license === "string" ? pkg.license : JSON.stringify(pkg.license) || "See package license"}\n`,
    );
    for (const f of await readdir(dir))
      if (/^(license|licence|copying|ofl|notice)(\.|$|-)/i.test(f)) {
        try {
          marketNotices.push(
            "\n" + (await readFile(path.join(dir, f), "utf8")) + "\n",
          );
        } catch {}
      }
  } catch {}
}
const marketZip = archiver("zip", { zlib: { level: 6 } });
const marketStream = createWriteStream(
  path.join(out, "downloads/ui-market.zip"),
);
const marketDone = new Promise((resolve, reject) => {
  marketStream.on("close", resolve);
  marketStream.on("error", reject);
  marketZip.on("error", reject);
});
marketZip.pipe(marketStream);
for (const file of await walk(
  market,
  new Set(["node_modules", "dist", ".git"]),
)) {
  const rel = path.relative(market, file).split(path.sep).join("/");
  if (!rel.endsWith(".tsbuildinfo"))
    marketZip.file(file, { name: "ui-market/" + rel });
}
marketZip.append(marketNotices.join(""), {
  name: "ui-market/THIRD_PARTY_NOTICES.md",
});
await marketZip.finalize();
await marketDone;
await writeFile(
  path.join(marketOut, "THIRD_PARTY_NOTICES.md"),
  marketNotices.join(""),
);
console.log(
  "Built independent UI Market previews, actual source manifest and runnable ZIP.",
);

// Per-resource source files are loaded independently; full manifests remain opt-in.
await mkdir(path.join(out, "code/resources"), { recursive: true });
await mkdir(path.join(out, "downloads/resources"), { recursive: true });
for (const resource of resources.filter((r) => r.sourceId !== "original")) {
  const project =
    resource.sourceId === "shadcn-admin" ? "shadcn-admin" : "ui-market";
  const manifest = resourceCode(
    resource,
    project === "shadcn-admin" ? files : marketFiles,
    project,
  );
  const slug = `${resource.type}-${resource.id}`;
  await writeFile(
    path.join(out, `code/resources/${slug}.json`),
    JSON.stringify(manifest),
  );
  const zip = archiver("zip", { zlib: { level: 6 } });
  const destination = createWriteStream(
    path.join(out, `downloads/resources/${slug}.zip`),
  );
  const finished = new Promise((resolve, reject) => {
    destination.on("close", resolve);
    destination.on("error", reject);
    zip.on("error", reject);
  });
  zip.pipe(destination);
  for (const [name, content] of Object.entries(manifest.files))
    zip.append(content, { name: `${slug}/${name}` });
  zip.append(project === "shadcn-admin" ? noticeText : marketNotices.join(""), {
    name: `${slug}/THIRD_PARTY_NOTICES.md`,
  });
  await zip.finalize();
  await finished;
}
console.log(
  "Built resource source manifests and file-set ZIPs with dependency closure and reuse notes.",
);

import "./check.mjs";
import { build } from "esbuild";
import { mkdir, cp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { generateDelivery } from "./delivery.mjs";
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
  "components.js",
  "preview.js",
  "component-preview.js",
  "legacy-i18n.js",
  "legacy-theme.js",
  "legacy-translations.js",
  "favicon.svg",
  "logo.svg",
  "logo-reverse.svg",
  ".nojekyll",
];
for (const file of assets)
  await cp(path.join(root, file), path.join(out, file));
await cp(path.join(root, "atlas"), path.join(out, "atlas"), {
  recursive: true,
});
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
await generateDelivery(root, out);

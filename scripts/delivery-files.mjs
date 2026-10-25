import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
const rootFiles = new Set([
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
  "sources.lock.json",
  "components.json",
  "eslint.config.js",
]);
const sourceExtensions =
  /\.(?:[cm]?[jt]sx?|css|json|html|svg|png|jpe?g|webp|avif|woff2?|ico|md)$/i;
const excluded = (name) =>
  name.startsWith(".") ||
  /(?:~|\.bak|\.backup|\.old|\.tmp|\.sw[op]|\.log|\.tsbuildinfo)$/i.test(name);
export async function deliveryFiles(root) {
  const boundary = await realpath(root),
    result = [];
  async function visit(relative, ancestors = new Set()) {
    const filename = path.join(root, relative),
      resolved = await realpath(filename);
    const inside = path.relative(boundary, resolved);
    if (
      inside === ".." ||
      inside.startsWith(".." + path.sep) ||
      path.isAbsolute(inside)
    )
      throw Error(`Delivery path escapes project: ${relative}`);
    const info = await stat(filename);
    if (info.isDirectory()) {
      if (ancestors.has(resolved))
        throw Error(`Delivery directory cycle: ${relative}`);
      const next = new Set([...ancestors, resolved]);
      for (const entry of await readdir(filename, { withFileTypes: true })) {
        if (
          excluded(entry.name) ||
          ["node_modules", "dist", "coverage", "test-results"].includes(
            entry.name,
          )
        )
          continue;
        await visit(path.join(relative, entry.name), next);
      }
    } else if (
      info.isFile() &&
      (rootFiles.has(relative) ||
        sourceExtensions.test(relative) ||
        relative.startsWith("licenses" + path.sep))
    )
      result.push(filename);
  }
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (
      rootFiles.has(entry.name) ||
      ["src", "public", "licenses"].includes(entry.name)
    )
      await visit(entry.name);
  }
  return result.sort();
}
export async function originalFiles(root) {
  const names = [
    "preview.html",
    "preview.js",
    "preview.css",
    "component-preview.html",
    "component-preview.js",
    "components.js",
    "components.css",
    "data.js",
    "legacy-i18n.js",
    "legacy-translations.js",
    "legacy-theme.js",
    "favicon.svg",
  ];
  const boundary = await realpath(root);
  const files = {};
  for (const name of names) {
    const file = await realpath(path.join(root, name));
    if (path.dirname(file) !== boundary)
      throw Error(`Original delivery path escapes project: ${name}`);
    files[name] = await readFile(file, "utf8");
  }
  return files;
}

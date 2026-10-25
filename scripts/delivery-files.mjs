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
export async function deliveryFiles(root, allowList) {
  if (
    allowList?.some(
      (file) =>
        typeof file !== "string" ||
        path.isAbsolute(file) ||
        file.includes("\\") ||
        file.split("/").some((part) => part === ".." || excluded(part)),
    )
  )
    throw Error("Invalid delivery allowlist path");
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
  if (allowList) {
    const found = new Set(
      result.map((file) => path.relative(root, file).split(path.sep).join("/")),
    );
    for (const file of allowList)
      if (!found.has(file))
        throw Error(`Missing or excluded delivery file: ${file}`);
    return result
      .filter((file) =>
        allowList.includes(path.relative(root, file).split(path.sep).join("/")),
      )
      .sort();
  }
  return result.sort();
}
export async function originalFiles(root) {
  const names = JSON.parse(
    await readFile(path.join(root, "content/delivery-files.json"), "utf8"),
  ).original;
  if (
    !Array.isArray(names) ||
    names.some(
      (name) =>
        typeof name !== "string" ||
        name.includes("/") ||
        name.includes("\\") ||
        excluded(name),
    )
  )
    throw Error("Invalid original delivery allowlist");
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

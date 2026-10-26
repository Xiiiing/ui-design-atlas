import { readFile, realpath, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";
const localized = (value) =>
  value &&
  ["zh-CN", "en"].every(
    (lang) => typeof value[lang] === "string" && value[lang].trim(),
  );
const validPath = (value) =>
  typeof value === "string" &&
  /^[\w./-]+$/.test(value) &&
  !path.isAbsolute(value) &&
  value
    .split("/")
    .every(
      (part) => part && part !== "." && part !== ".." && !part.startsWith("."),
    );
export function validateGuidance(guidance, tools, resources, sources) {
  const keys = new Set(),
    toolIds = new Set(),
    resourceKeys = new Set(resources.map((r) => `${r.type}:${r.id}`));
  for (const tool of tools) {
    if (
      !/^[-a-z0-9]+$/.test(tool.id) ||
      toolIds.has(tool.id) ||
      !["library", "skills", "design", "learning"].includes(tool.kind) ||
      !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(tool.repo) ||
      !localized(tool.name) ||
      !localized(tool.description) ||
      !Array.isArray(tool.technologies) ||
      !tool.technologies.length ||
      !Array.isArray(tool.aliases)
    )
      throw Error("Invalid tool: " + tool.id);
    toolIds.add(tool.id);
  }
  for (const item of guidance) {
    if (
      !/^[-a-z0-9]+$/.test(item.id) ||
      keys.has(item.id) ||
      !["prompt", "skill", "design", "checklist"].includes(item.kind) ||
      !localized(item.name) ||
      !localized(item.description) ||
      !Array.isArray(item.aliases) ||
      !Array.isArray(item.purposes) ||
      !item.purposes.length ||
      item.purposes.some(
        (p) =>
          !["website", "application", "layout", "motion", "review"].includes(p),
      ) ||
      new Set(item.purposes).size !== item.purposes.length ||
      !Array.isArray(item.related) ||
      item.related.some((k) => !resourceKeys.has(k)) ||
      (item.toolId && !toolIds.has(item.toolId)) ||
      typeof item.checked !== "boolean" ||
      item.effect !== "unverified"
    )
      throw Error("Invalid guidance: " + item.id);
    keys.add(item.id);
    if (["skill", "design"].includes(item.kind)) {
      const u = item.upstream,
        source = sources[u?.source];
      if (
        !source ||
        !validPath(u.entry) ||
        !Array.isArray(u.files) ||
        !u.files.includes(u.entry) ||
        u.files.some((f) => !validPath(f) || !Object.hasOwn(source.files, f))
      )
        throw Error("Invalid guidance files: " + item.id);
    }
    if (
      item.kind === "design" &&
      (!item.palette?.length ||
        item.palette.some((c) => !/^#[\da-f]{6}$/i.test(c)) ||
        !localized(item.typography))
    )
      throw Error("Invalid design: " + item.id);
  }
  for (const [id, source] of Object.entries(sources)) {
    if (
      !/^[\da-f]{40}$/.test(source.commit) ||
      !/^[-\w.]+\/[-\w.]+$/.test(source.repo) ||
      !/^[-\w]+$/.test(source.folder) ||
      !source.author ||
      source.license !== "MIT" ||
      !source.files.LICENSE ||
      Object.entries(source.files).some(
        ([f, h]) => !validPath(f) || !/^[\da-f]{64}$/.test(h),
      )
    )
      throw Error("Invalid guidance source: " + id);
  }
}
export async function readGuidance(root) {
  const read = (file) =>
    readFile(path.join(root, "content", file + ".json"), "utf8").then(
      JSON.parse,
    );
  const [guidance, tools, resources, sources] = await Promise.all(
    ["guidance", "tools", "resources", "guidance-sources"].map(read),
  );
  validateGuidance(guidance, tools, resources, sources);
  const boundary = await realpath(path.join(root, "vendor/guidance"));
  const snapshots = {};
  for (const [id, source] of Object.entries(sources)) {
    snapshots[id] = {};
    const sourceRoot = await realpath(path.join(boundary, source.folder));
    if (path.dirname(sourceRoot) !== boundary)
      throw Error("Guidance source escapes root");
    for (const [file, hash] of Object.entries(source.files)) {
      const resolved = await realpath(path.join(sourceRoot, file)),
        relative = path.relative(sourceRoot, resolved);
      if (relative.startsWith("..") || path.isAbsolute(relative))
        throw Error("Guidance path escapes root: " + file);
      const bytes = await readFile(resolved);
      if (createHash("sha256").update(bytes).digest("hex") !== hash)
        throw Error("Guidance snapshot changed: " + file);
      snapshots[id][file] = bytes.toString("utf8");
    }
  }
  const details = {};
  for (const item of guidance) {
    const detail = await read("guidance/" + item.id);
    if (
      !["body", "task", "usage"].every((f) => localized(detail[f])) ||
      (detail.original && !localized(detail.original)) ||
      (item.kind === "checklist" &&
        !["zh-CN", "en"].every(
          (lang) =>
            Array.isArray(detail.checks?.[lang]) &&
            detail.checks[lang].length &&
            detail.checks[lang].every((c) => typeof c === "string" && c.trim()),
        ))
    )
      throw Error("Invalid guidance detail: " + item.id);
    const files = {};
    if (item.upstream) {
      const { source: sourceId, entry, files: requested } = item.upstream,
        source = sources[sourceId],
        base = path.posix.dirname(entry);
      for (const file of requested) {
        const rel = path.posix.relative(base, file);
        if (rel.startsWith(".."))
          throw Error("Guidance bundle escapes entry: " + file);
        files[rel] = snapshots[sourceId][file];
      }
      files.LICENSE = snapshots[sourceId].LICENSE;
      // All relative Markdown document references must be included, not silently broken.
      for (const [name, text] of Object.entries(files)) {
        for (const match of text.matchAll(/\]\(([^\s)#]+\.md)(?:#[^)]*)?\)/g)) {
          const target = match[1];
          if (/^[a-z]+:/i.test(target)) continue;
          if (
            !Object.hasOwn(
              files,
              path.posix.normalize(
                path.posix.join(path.posix.dirname(name), target),
              ),
            )
          )
            throw Error(
              "Missing guidance reference: " + item.id + "/" + target,
            );
        }
      }
      detail.entry = path.posix.basename(entry);
      detail.source = {
        repo: source.repo,
        commit: source.commit,
        author: source.author,
        license: source.license,
      };
    } else {
      files["GUIDANCE.md"] = ["zh-CN", "en"]
        .map(
          (lang) =>
            detail.body[lang] +
            (detail.original
              ? "\n\n## " +
                (lang === "en" ? "Original wording" : "用户原句") +
                "\n\n" +
                detail.original[lang]
              : "") +
            (detail.checks
              ? "\n\n" +
                detail.checks[lang].map((text) => "- " + text).join("\n")
              : "") +
            "\n\n" +
            detail.usage[lang],
        )
        .join("\n\n---\n\n");
    }
    detail.files = files;
    details[item.id] = detail;
  }
  return { guidance, tools, details };
}
export async function generateGuidance(root, out) {
  const { guidance, details } = await readGuidance(root);
  await mkdir(path.join(out, "guidance"), { recursive: true });
  await mkdir(path.join(out, "downloads/guidance"), { recursive: true });
  for (const item of guidance) {
    const detail = details[item.id];
    await writeFile(
      path.join(out, "guidance", item.id + ".json"),
      JSON.stringify(detail),
    );
    const zip = archiver("zip", { zlib: { level: 6 } }),
      stream = createWriteStream(
        path.join(out, "downloads/guidance", item.id + ".zip"),
      );
    const done = new Promise((resolve, reject) => {
      stream.on("close", resolve);
      stream.on("error", reject);
      zip.on("error", reject);
    });
    zip.pipe(stream);
    for (const [name, text] of Object.entries(detail.files))
      zip.append(text, { name: item.id + "/" + name });
    const source = detail.source;
    zip.append(
      `# ${item.name["zh-CN"]} / ${item.name.en}\n\n${detail.usage["zh-CN"]}\n\n${detail.usage.en}\n\n${source ? `Source: https://github.com/${source.repo}/tree/${source.commit}\nAuthor: ${source.author}\nLicense: ${source.license}\nOriginal entry: ${detail.entry}\n\nKeep all supporting files beside the entry. Ask your coding assistant to read the entry explicitly; copying it into an ordinary chat does not install a skill.\n` : "Atlas editorial content. Existing project terms apply. No new license is granted by this package.\n"}\n${item.checked ? "Content checked" : "Content not checked"}; AI generation outcome unverified.\n`,
      { name: item.id + "/ATLAS-REUSE.md" },
    );
    await zip.finalize();
    await done;
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await generateGuidance(
    fileURLToPath(new URL("../", import.meta.url)),
    path.resolve(process.argv[2]),
  );

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveCasePages } from "../catalog-pages.js";
import { readGuidance } from "./guidance-data.mjs";
import taxonomy from "../content/taxonomy.json" with { type: "json" };
const detailFields = new Set([
  "prompt",
  "stylePrompt",
  "principle",
  "rules",
  "tokens",
  "useCases",
  "subtitle",
  "scene",
  "files",
  "supportFiles",
  "sourceUrl",
  "originalUrl",
  "libraryVersions",
]);
export const summaryOf = (resource) => ({
  ...Object.fromEntries(
    Object.entries(resource).filter(
      ([key]) => !detailFields.has(key) && key !== "pages",
    ),
  ),
  ...(resource.pages
    ? { pages: resource.pages.map(({ id }) => ({ id })) }
    : {}),
});
export function validateCatalog(
  resources,
  sources,
  libraries,
  discovery,
  vocabulary = taxonomy,
) {
  if (!Array.isArray(resources) || !resources.length)
    throw Error("Catalog must contain resources");
  const ids = new Set(),
    keys = new Set();
  const fail = (r, field) => {
    throw Error(`Invalid catalog ${r?.id || "?"}: ${field}`);
  };
  for (const r of resources) {
    if (
      !r ||
      !["component", "block", "page", "case"].includes(r.type) ||
      !/^[-a-z0-9]+$/.test(r.id)
    )
      fail(r, "identity");
    const key = `${r.type}:${r.id}`;
    if (keys.has(key) || ids.has(r.id)) fail(r, "duplicate identity");
    keys.add(key);
    ids.add(r.id);
    if (!["b2b", "b2c"].includes(r.audience)) fail(r, "audience");
    if (typeof r.motion !== "boolean") fail(r, "motion");
    if (r.preview?.mode && !["inline", "canvas"].includes(r.preview.mode))
      fail(r, "preview mode");
    for (const file of [...(r.files || []), ...(r.supportFiles || [])])
      if (
        typeof file !== "string" ||
        file.startsWith("/") ||
        file.includes("\\") ||
        file.split("/").some((part) => part === ".." || part.startsWith("."))
      )
        fail(r, "file path");
    if (r.type === "page" && r.caseId && !r.key) fail(r, "page key");
    if (!sources[r.sourceId]) fail(r, "source");
    for (const [field, allowed] of [
      ["categories", vocabulary.categories],
      ["interactions", vocabulary.interactions],
      ["styleIds", vocabulary.styles],
      ["technologyIds", vocabulary.technologies],
      ["libraryIds", libraries],
    ]) {
      const values = r[field];
      if (
        !Array.isArray(values) ||
        (field !== "interactions" && !values.length) ||
        new Set(values).size !== values.length ||
        values.some((v) => !Object.hasOwn(allowed, v))
      )
        fail(r, field);
    }
    if (
      !vocabulary.categories[r.category] ||
      !vocabulary.provenance[r.provenance]
    )
      fail(r, "legacy category/provenance");
    for (const field of ["name", "description", "prompt", "stylePrompt"])
      for (const lang of ["zh-CN", "en"])
        if (typeof r[field]?.[lang] !== "string" || !r[field][lang].trim())
          fail(r, `${field}/${lang}`);
    if (
      !Number.isFinite(r.preview?.width) ||
      r.preview.width <= 0 ||
      !Number.isFinite(r.preview.height) ||
      r.preview.height <= 0
    )
      fail(r, "preview");
    if (r.type === "case" && (!r.pages?.length || r.pages.some((p) => !p.id)))
      fail(r, "pages");
  }
  for (const r of resources) {
    if (r.caseId && !keys.has(`case:${r.caseId}`)) fail(r, "case reference");
    for (const id of r.pageIds || [])
      if (!keys.has(`page:${id}`)) fail(r, "page reference");
    for (const p of r.pages || [])
      if (!keys.has(`page:${p.id}`)) fail(r, "case page reference");
  }
  for (const section of ["featured", "gallery", "cases"])
    for (const id of discovery[section])
      if (!ids.has(id)) throw Error(`Unknown discovery resource: ${id}`);
  for (const collection of discovery.collections) {
    for (const id of collection.resources || [])
      if (!ids.has(id)) throw Error(`Unknown collection resource: ${id}`);
    for (const category of collection.categories || [])
      if (!vocabulary.categories[category])
        throw Error(`Unknown collection category: ${category}`);
  }
  return resources;
}
export async function readCatalog(root) {
  const read = (name) =>
    readFile(path.join(root, "content", name + ".json"), "utf8").then(
      JSON.parse,
    );
  const [resources, sources, libraries, discovery, vocabulary] =
    await Promise.all(
      ["resources", "sources", "libraries", "discovery", "taxonomy"].map(read),
    );
  return resolveCasePages(
    validateCatalog(resources, sources, libraries, discovery, vocabulary),
  );
}
export async function writeDetails(root, out) {
  const resources = await readCatalog(root);
  await mkdir(path.join(out, "details"), { recursive: true });
  for (const r of resources)
    await writeFile(
      path.join(out, "details", `${r.type}-${r.id}.json`),
      JSON.stringify(r),
    );
}
export function catalogBrowserPlugin(root) {
  return {
    name: "atlas-catalog-summary",
    enforce: "pre",
    handleHotUpdate(context) {
      if (path.dirname(context.file) !== path.join(root, "content")) return;
      for (const module of context.server.moduleGraph.getModulesByFile(
        path.join(root, "content/resources.json"),
      ) || [])
        context.server.moduleGraph.invalidateModule(module);
    },
    async load(id) {
      if (new URLSearchParams(id.split("?")[1] || "").has("registry")) {
        const data = await readGuidance(root);
        if (id.split("?")[0] === path.join(root, "content/guidance.json"))
          return (
            "export default " +
            JSON.stringify(
              data.guidance.map(({ id, name, related }) => ({
                id,
                name,
                related,
              })),
            )
          );
        if (id.split("?")[0] === path.join(root, "content/tools.json"))
          return (
            "export default " +
            JSON.stringify(data.tools.map(({ id }) => ({ id })))
          );
      }
      if (id.split("?")[0] !== path.join(root, "content/resources.json"))
        return;
      return JSON.stringify((await readCatalog(root)).map(summaryOf));
    },
  };
}
export function catalogEsbuildPlugin(root) {
  return {
    name: "atlas-catalog-summary",
    setup(build) {
      build.onResolve(
        { filter: /content\/(?:guidance|tools)\.json\?registry$/ },
        (args) => ({
          path: path.resolve(args.resolveDir, args.path.split("?")[0]),
          namespace: "guidance-registry",
        }),
      );
      build.onLoad(
        { filter: /.*/, namespace: "guidance-registry" },
        async (args) => {
          const data = await readGuidance(root);
          return {
            contents: JSON.stringify(
              args.path.endsWith("guidance.json")
                ? data.guidance.map(({ id, name, related }) => ({
                    id,
                    name,
                    related,
                  }))
                : data.tools.map(({ id }) => ({ id })),
            ),
            loader: "json",
          };
        },
      );
      build.onLoad(
        { filter: /[/\\]content[/\\]resources\.json$/ },
        async () => ({
          contents: JSON.stringify((await readCatalog(root)).map(summaryOf)),
          loader: "json",
        }),
      );
    },
  };
}

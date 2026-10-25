// @ts-check
import { resolveCasePages } from "./catalog-pages.js";
import records from "./content/resources.json" with { type: "json" };
import sourceRecords from "./content/sources.json" with { type: "json" };
import libraryRecords from "./content/libraries.json" with { type: "json" };
import discoveryContent from "./content/discovery.json" with { type: "json" };
import { createSearchIndex, rankSearch } from "./search.js";

// The same validated catalog feeds Node delivery and browser summaries. Build
// adapters strip detail fields from this JSON only for the browser bundle.
/** @type {import("./atlas/types").Resource[]} */
export const resources = resolveCasePages(
  /** @type {import("./atlas/types").Resource[]} */ (
    /** @type {unknown} */ (records)
  ),
);
/** @type {Record<string,import("./atlas/types").Source>} */
export const sourceProjects = sourceRecords;
/** @type {Record<string,import("./atlas/types").Library>} */
export const libraries = libraryRecords;
/** @param {string} zh @param {string} en */
export const localized = (zh, en) => ({ "zh-CN": zh, en });
const byKey = new Map(resources.map((r) => [`${r.type}:${r.id}`, r]));
const byId = new Map(resources.map((r) => [r.id, r]));
/** @param {string} id @param {string} [type] */
export const findResource = (id, type) =>
  type ? byKey.get(`${type}:${id}`) : byId.get(id);
export const cases = resources.filter((r) => r.type === "case");
export const pages = resources.filter((r) => r.type === "page" && r.caseId);
export const components = resources.filter(
  (r) => r.type === "component" && r.caseId,
);
/** @param {string|undefined} id */
export const getCase = (id) =>
  /** @type {(import("./atlas/types").Resource & {pages:import("./atlas/types").CasePage[]})|undefined} */ (
    cases.find((r) => r.id === id)
  );
/** @param {string} id */
export const getPage = (id) => pages.find((r) => r.id === id);
/** @param {string} id */
export const getComponent = (id) => components.find((r) => r.id === id);
export const archivedCase = getCase("shadcn-admin");
export const upstream = sourceProjects["shadcn-admin"];
/** @param {import("./atlas/types").Resource} r */
export const resourceSource = (r) => sourceProjects[r.sourceId];
/** @param {import("./atlas/types").Resource} r @param {import("./atlas/types").Locale} [lang] @param {string} [scope] */
export function resourcePrompt(r, lang = "zh-CN", scope = r.type) {
  const text = scope === "style" ? r.stylePrompt : r.prompt;
  if (!text) throw new Error(`Resource details not loaded: ${r.type}:${r.id}`);
  return text[lang];
}
/** @param {import("./atlas/types").Resource} c @param {{id:string}} item @param {string} scope @param {import("./atlas/types").Locale} locale */
export function promptFor(c, item, scope, locale) {
  return resourcePrompt(
    scope === "system" || scope === "style" ? c : findResource(item.id) || c,
    locale,
    scope,
  );
}
/** @param {import("./atlas/types").Resource} c @param {import("./atlas/types").Resource|import("./atlas/types").CasePage} item @param {string} locale @param {string} theme */
export function previewURL(c, item, locale = "zh-CN", theme = "light") {
  if (c.source === "open-source") {
    const page =
      "pageIds" in item && item.pageIds ? getPage(item.pageIds[0]) : item;
    return `./examples/shadcn-admin/index.html?lang=${locale}&theme=${theme}${"pageIds" in item && item.pageIds ? "&component=" + item.key : ""}#${page?.path || "/"}`;
  }
  return `./preview.html?style=${c.id}&page=${item?.key && !("pageIds" in item && item.pageIds) ? item.key : "home"}&lang=${locale}&theme=${theme}`;
}
/** @param {import("./atlas/types").Resource|null} r @param {string} [lang] @param {string} [theme] */
export function resourcePreview(r, lang = "zh-CN", theme = "light") {
  if (!r) throw new Error("Missing resource");
  if (r.preview.url)
    return `${r.preview.url}${r.preview.url.includes("?") ? "&" : "?"}lang=${lang}&theme=${theme}`;
  const c = getCase(r.type === "case" ? r.id : r.caseId);
  if (!c) throw new Error(`Missing case for ${r.id}`);
  if (r.type === "component" && c.source === "original")
    return `./component-preview.html?id=${r.id}&lang=${lang}&theme=${theme}`;
  return previewURL(c, r.type === "case" ? c.pages?.[0] || r : r, lang, theme);
}
export const resourceCounts = {
  total: resources.length,
  motion: 0,
  byType: new Map(),
  byCategory: new Map(),
};
for (const r of resources) {
  resourceCounts.byType.set(
    r.type,
    (resourceCounts.byType.get(r.type) || 0) + 1,
  );
  for (const category of r.categories)
    resourceCounts.byCategory.set(
      category,
      (resourceCounts.byCategory.get(category) || 0) + 1,
    );
  if (r.motion) resourceCounts.motion++;
}
const searchIndex = createSearchIndex(resources, (r) => ({
  names: r.name,
  aliases: [
    r.aliases,
    r.tags,
    r.libraryIds.flatMap((id) => [libraries[id]?.name, libraries[id]?.aliases]),
  ],
  description: r.description,
  context: [r.categories, r.interactions, r.style, resourceSource(r)?.name],
}));
/** @param {import("./atlas/types").Resource} r */
export const resourceSearch = (r) => searchIndex.get(r)?.text || "";
/** @param {string} query @param {import("./atlas/types").Resource[]} [items] */
export const searchResources = (query, items = resources) =>
  rankSearch(items, query, searchIndex);

// Editorial discovery modules reference existing resources; no duplicate records.
export const discovery = discoveryContent;
/** @param {string} id @returns {import("./atlas/types").Resource[]} */
export function collectionResources(id) {
  const collection = discovery.collections.find((item) => item.id === id);
  if (!collection) return [];
  if (collection.resources)
    return collection.resources.map((id) => requireResource(id));
  return resources.filter(
    (r) =>
      (!collection.motion || r.motion) &&
      collection.categories.includes(r.category),
  );
}
/** @param {"featured"|"gallery"|"cases"} section @returns {import("./atlas/types").Resource[]} */
export const discoveryResources = (section) =>
  discovery[section].map((id) => requireResource(id));

/** @returns {import("./atlas/types").Resource[]} */
export function discoveryGallery() {
  const ordered = [
    ...discovery.featured,
    ...discovery.gallery,
    ...resources.map((r) => r.id),
  ];
  return [...new Set(ordered)].map((id) => requireResource(id));
}

/** @param {string} id @returns {import("./atlas/types").Resource} */
function requireResource(id) {
  const resource = findResource(id);
  if (!resource) throw new Error(`Unknown editorial resource: ${id}`);
  return resource;
}

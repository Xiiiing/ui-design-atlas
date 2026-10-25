// @ts-check
import { searchResources, collectionResources } from "../catalog.js";
/** @typedef {import('./types').Resource} Resource */
/** @typedef {{view:string;params:URLSearchParams}} Route */
/** @param {string|undefined|null} value */
export const selections = (value) =>
  (value || "").split(",").filter((v) => v && v !== "all");
/** @type {Record<string,(resource:Resource)=>readonly string[]>} */
export const facetValues = {
  category: (r) => r.categories,
  library: (r) => r.libraryIds,
  interaction: (r) => r.interactions,
  visual: (r) => r.styleIds,
  technology: (r) => r.technologyIds,
  source: (r) => [r.provenance],
  project: (r) => [r.sourceId],
  style: (r) => [r.styleId],
  audience: (r) => [r.audience],
  motion: (r) => (r.motion ? ["yes"] : ["no"]),
};
/** @type {Record<string,string>} */
export const modeTypes = {
  components: "component",
  blocks: "block",
  pages: "page",
  cases: "case",
  motion: "motion",
};
/** @param {Route} route */
export const selectedType = (route) =>
  route.view === "favorites"
    ? route.params.get("type") || ""
    : modeTypes[route.view] || "";
/** Explicit inputs: computing counts or detail neighbors never mutates navigation. @param {Resource[]} resources @param {Route} route @param {ReadonlySet<string>} favorites @param {Record<string,string>} [values] @param {string} [omit] */
export function filterResources(
  resources,
  route,
  favorites,
  values = Object.fromEntries(route.params),
  omit = "",
) {
  const type = selectedType(route),
    collection = values.collection
      ? new Set(collectionResources(values.collection).map((r) => r.id))
      : null;
  return searchResources(
    values.q || "",
    resources.filter((r) => {
      if (collection && !collection.has(r.id)) return false;
      if (route.view === "favorites" && !favorites.has(`${r.type}:${r.id}`))
        return false;
      if (
        omit !== "type" &&
        type &&
        (type === "motion" ? !r.motion : r.type !== type)
      )
        return false;
      return Object.entries(facetValues).every(
        ([name, get]) =>
          name === omit ||
          !selections(values[name]).length ||
          selections(values[name]).some((v) => get(r).includes(v)),
      );
    }),
  );
}
/** @param {Resource[]} resources @param {Route} route @param {ReadonlySet<string>} favorites @param {Record<string,string>} values @param {string} facet */
export function facetCounts(resources, route, favorites, values, facet) {
  const pool = filterResources(resources, route, favorites, values, facet),
    counts = new Map([["all", pool.length]]);
  for (const r of pool)
    for (const value of facet === "type"
      ? [r.type, ...(r.motion ? ["motion"] : [])]
      : facetValues[facet](r))
      counts.set(value, (counts.get(value) || 0) + 1);
  return counts;
}

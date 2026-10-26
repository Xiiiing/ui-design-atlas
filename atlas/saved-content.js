// @ts-check
import { contentEntries, searchContent } from "./content-search.js";
import { contentCard } from "./content-cards.js";
/** @param {import('./types').BaseDependencies} deps @param {Record<string,string>} values @param {string} domain */
export function savedContent(deps, values, domain) {
  const { appState, t } = deps;
  const pool = searchContent(
    values.q || "",
    contentEntries.filter((r) => appState.favorites.has(r.key)),
  );
  const extra = pool.filter(
    (r) => r.domain !== "ui" && (domain === "all" || domain === r.domain),
  );
  /** @type {Record<string,number>} */ const counts = {
    all: pool.length,
    ui: 0,
    guidance: 0,
    tool: 0,
  };
  for (const hit of pool) counts[hit.domain]++;
  return {
    count: extra.length,
    counts,
    html: extra.length
      ? `<section class="resource-group" data-type="saved-content"><h2>${t("指导与资源", "Guidance & resources")}</h2><div class="guidance-grid comparison-grid">${extra.map((hit) => ("preview" in hit.item ? "" : contentCard(hit.item, deps))).join("")}</div></section>`
      : "",
  };
}

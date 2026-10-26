// @ts-check
// Only identity and reverse links are needed before opening guidance/search.
import records from "./content/guidance.json?registry" with { type: "json" };
import toolRecords from "./content/tools.json?registry" with { type: "json" };
/** @type {Array<Pick<import('./atlas/guidance-types').Guidance,'id'|'name'|'related'>>} */
const guidance = records;
const ids = new Set(guidance.map((g) => g.id)),
  toolIds = new Set(toolRecords.map((g) => g.id));
/** @param {string} id */
export const hasGuidance = (id) => ids.has(id);
/** @param {string} id */
export const hasTool = (id) => toolIds.has(id);
/** @param {string} key */
export const guidanceForResource = (key) =>
  guidance.filter((g) => g.related.includes(key));

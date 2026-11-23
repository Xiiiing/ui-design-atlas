// @ts-check
// Only identity is needed to validate saved items before opening content.
import records from "./content/guidance.json?registry" with { type: "json" };
import toolRecords from "./content/tools.json?registry" with { type: "json" };
/** @type {Array<Pick<import('./atlas/guidance-types').Guidance,'id'>>} */
const guidance = records;
const ids = new Set(guidance.map((g) => g.id)),
  toolIds = new Set(toolRecords.map((g) => g.id));
/** @param {string} id */
export const hasGuidance = (id) => ids.has(id);
/** @param {string} id */
export const hasTool = (id) => toolIds.has(id);

// @ts-check
import { resources, resourceSearchFields } from "../catalog.js";
import { guidance, tools } from "../guidance-catalog.js";
import { createSearchIndex, rankSearch } from "../search.js";
/** @type {import('./guidance-types').ContentHit[]} */
export const contentEntries = [
  ...resources.map((r) => ({
    id: r.id,
    domain: /** @type {const} */ ("ui"),
    key: `${r.type}:${r.id}`,
    view: r.type,
    name: r.name,
    description: r.description,
    item: r,
  })),
  ...guidance.map((g) => ({
    id: g.id,
    domain: /** @type {const} */ ("guidance"),
    key: `guidance:${g.id}`,
    view: "guidance",
    name: g.name,
    description: g.description,
    aliases: g.aliases,
    context: [g.purposes, g.kind, g.toolId],
    item: g,
  })),
  ...tools.map((g) => ({
    id: g.id,
    domain: /** @type {const} */ ("tool"),
    key: `tool:${g.id}`,
    view: "tools",
    name: g.name,
    description: g.description,
    aliases: g.aliases,
    context: [g.kind, g.technologies],
    item: g,
  })),
];
const index = createSearchIndex(contentEntries, (r) =>
  r.domain === "ui" && "sourceId" in r.item
    ? resourceSearchFields(r.item)
    : {
        names: r.name,
        aliases: r.aliases,
        description: r.description,
        context: r.context,
      },
);
/** @param {string} q @param {typeof contentEntries} [items] */
export const searchContent = (q, items = contentEntries) =>
  rankSearch(items, q, index);

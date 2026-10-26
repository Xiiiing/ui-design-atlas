// @ts-check
import records from "./content/guidance.json" with { type: "json" };
import toolRecords from "./content/tools.json" with { type: "json" };
/** @type {import('./atlas/guidance-types').Guidance[]} */
export const guidance =
  /** @type {import('./atlas/guidance-types').Guidance[]} */ (
    /** @type {unknown} */ (records)
  );
/** @type {import('./atlas/guidance-types').Tool[]} */
export const tools = /** @type {import('./atlas/guidance-types').Tool[]} */ (
  /** @type {unknown} */ (toolRecords)
);
export const guidanceKinds = {
  prompt: ["提示词", "Prompts"],
  skill: ["Skills", "Skills"],
  design: ["设计规范", "Design specifications"],
  checklist: ["检查清单", "Checklists"],
};
export const toolKinds = {
  library: ["组件库", "Libraries"],
  skills: ["Skills 集合", "Skill collections"],
  design: ["规范集合", "Design collections"],
  learning: ["学习资料", "Learning"],
};
export const purposes = {
  website: ["网站", "Websites"],
  application: ["后台应用", "Applications"],
  layout: ["布局与排版", "Layout & typography"],
  motion: ["动效", "Motion"],
  review: ["审核与验收", "Review & acceptance"],
};
const byId = new Map(guidance.map((g) => [g.id, g]));
const toolById = new Map(tools.map((g) => [g.id, g]));
/** @param {string} id */
export const findGuidance = (id) => byId.get(id);
/** @param {string} id */
export const findTool = (id) => toolById.get(id);
/** @param {string} key */
export const guidanceForResource = (key) =>
  guidance.filter((g) => g.related.includes(key));

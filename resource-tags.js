// @ts-check
import taxonomy from "./content/taxonomy.json" with { type: "json" };
/** @param {Record<string,string[]>} values @returns {Record<string,[string,string]>} */
function labels(values) {
  return Object.fromEntries(
    Object.entries(values).map(([id, pair]) => {
      if (pair.length !== 2 || pair.some((label) => typeof label !== "string"))
        throw Error(`Invalid taxonomy label: ${id}`);
      return [id, /** @type {[string,string]} */ ([pair[0], pair[1]])];
    }),
  );
}
export const categories = labels(taxonomy.categories);
export const interactions = labels(taxonomy.interactions);
/** @param {import("./atlas/types").Resource} resource @returns {{name:string;value:string;label:string}[]} */
export function resourceTags(resource, lang = "zh-CN") {
  const index = lang === "en" ? 1 : 0;
  // Prefer the distinguishing action over generic click/autoplay metadata.
  const interaction = ["input", "hover", "scroll", "click", "auto"].find((x) =>
    resource.interactions.some((value) => value === x),
  );
  const candidates = [
    {
      name: "category",
      value: resource.category,
      label: categories[resource.category]?.[index],
    },
    ...(interaction
      ? [
          {
            name: "interaction",
            value: interaction,
            label: interactions[interaction][index],
          },
        ]
      : []),
    {
      name: "style",
      value: resource.styleId,
      label: resource.style?.[lang === "en" ? "en" : "zh-CN"],
    },
  ];
  return candidates.filter(
    (tag) => typeof tag === "object" && Boolean(tag?.label),
  );
}

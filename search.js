// @ts-check
// Build once from bilingual catalog fields; queries never stringify resources.
/** @param {unknown} value */
const normalize = (value) =>
  String(value).normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
/** @param {unknown} value @returns {string[]} */
const strings = (value) =>
  value == null
    ? []
    : typeof value === "object"
      ? Object.values(value).flatMap(strings)
      : [normalize(value)];

/** @template T @param {T[]} items @param {(item:T)=>{names:unknown;aliases?:unknown;description?:unknown;context?:unknown}} fields */
export function createSearchIndex(items, fields) {
  return new Map(
    items.map((item) => {
      const { names, aliases, description, context } = fields(item);
      const groups = [names, aliases, description, context].map(strings);
      return [item, { groups, text: groups.flat().join(" ") }];
    }),
  );
}

/** @template T @param {T[]} items @param {string} query @param {Map<T,{groups:string[][];text:string}>} index @returns {T[]} */
export function rankSearch(items, query, index) {
  const phrase = normalize(query || "");
  if (!phrase) return [...items];
  const words = phrase.split(" ");
  return items
    .map((item, order) => {
      const entry = index.get(item);
      if (!entry) return null;
      const { groups, text } = entry;
      if (!words.every((word) => text.includes(word))) return null;
      const [names, aliases, descriptions] = groups;
      /** @param {string[]} values */
      const contains = (values) =>
        values.some((value) => value.includes(phrase));
      // English whole tokens outrank prefixes; incidental substrings are last.
      // Chinese keeps contiguous phrases (no whitespace token boundary needed).
      /** @param {string} word @param {string[]} values */
      const strength = (word, values) =>
        Math.max(
          0,
          ...values.map((value) => {
            if (!value.includes(word)) return 0;
            if (!/^[a-z0-9-]+$/.test(word)) return 3;
            const tokens = value.split(/[^a-z0-9-]+/);
            return tokens.includes(word)
              ? 3
              : tokens.some((token) => token.startsWith(word))
                ? 2
                : 1;
          }),
        );
      const quality = Math.min(
        ...words.map((word) => strength(word, [...names, ...aliases])),
      );
      const tier = names.includes(phrase)
        ? 9
        : quality === 3
          ? 8
          : words.every((word) => strength(word, descriptions) === 3)
            ? 7
            : quality === 2
              ? 6
              : contains(names)
                ? 4
                : contains(aliases)
                  ? 3
                  : contains(descriptions)
                    ? 2
                    : 1;
      const wordScore = words.reduce(
        (sum, word) =>
          sum +
          strength(word, names) * 4 +
          strength(word, aliases) * 3 +
          strength(word, descriptions) * 2,
        0,
      );
      return { item, tier, wordScore, order };
    })
    .filter((entry) => entry !== null)
    .sort(
      (a, b) =>
        b.tier - a.tier || b.wordScore - a.wordScore || a.order - b.order,
    )
    .map(({ item }) => item);
}

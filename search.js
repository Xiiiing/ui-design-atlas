// Build once from bilingual catalog fields; queries never stringify resources.
const normalize = (value) =>
  String(value).normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
const strings = (value) =>
  value == null
    ? []
    : typeof value === "object"
      ? Object.values(value).flatMap(strings)
      : [normalize(value)];

export function createSearchIndex(items, fields) {
  return new Map(
    items.map((item) => {
      const { names, aliases, description, context } = fields(item);
      const groups = [names, aliases, description, context].map(strings);
      return [item, { groups, text: groups.flat().join(" ") }];
    }),
  );
}

export function rankSearch(items, query, index) {
  const phrase = normalize(query || "");
  if (!phrase) return [...items];
  const words = phrase.split(" ");
  return items
    .map((item, order) => {
      const { groups, text } = index.get(item);
      if (!words.every((word) => text.includes(word))) return null;
      const [names, aliases, descriptions] = groups;
      const contains = (values) =>
        values.some((value) => value.includes(phrase));
      const tier = names.includes(phrase)
        ? 6
        : contains(names)
          ? 5
          : words.every((word) => names.some((name) => name.includes(word)))
            ? 4
            : contains(aliases)
              ? 3
              : contains(descriptions)
                ? 2
                : 1;
      const wordScore = words.reduce(
        (sum, word) =>
          sum +
          (names.some((value) => value.includes(word))
            ? 4
            : aliases.some((value) => value.includes(word))
              ? 3
              : descriptions.some((value) => value.includes(word))
                ? 2
                : 1),
        0,
      );
      return { item, tier, wordScore, order };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.tier - a.tier || b.wordScore - a.wordScore || a.order - b.order,
    )
    .map(({ item }) => item);
}

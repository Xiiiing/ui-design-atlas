// @ts-check
/** Resolve case page metadata from the page records, never a manually synced copy.
 * @param {import('./atlas/types').Resource[]} resources */
export function resolveCasePages(resources) {
  const pages = new Map(
    resources.filter((r) => r.type === "page").map((r) => [r.id, r]),
  );
  return resources.map((r) =>
    r.type !== "case"
      ? r
      : {
          ...r,
          pages: (r.pages || []).map((reference) => {
            const page = pages.get(reference.id);
            if (!page?.key) throw Error(`Missing case page: ${reference.id}`);
            return { ...page, key: page.key, caseId: r.id };
          }),
        },
  );
}

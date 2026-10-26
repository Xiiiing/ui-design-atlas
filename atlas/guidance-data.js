// @ts-check
import { createRequestCache } from "./resource-data.js";
const cache =
  /** @type {ReturnType<typeof createRequestCache<import('./guidance-types').GuidanceDetail>>} */ (
    createRequestCache()
  );
if (import.meta.hot)
  import.meta.hot.on("atlas:source-changed", () => cache.clear());
/** @param {string} id */
export function loadGuidanceDetail(id) {
  return cache.get(`./guidance/${encodeURIComponent(id)}.json`, (value) => {
    const data = /** @type {import('./guidance-types').GuidanceDetail} */ (
      value
    );
    if (
      !data?.body?.en ||
      !data.body["zh-CN"] ||
      !data.task?.en ||
      !data.task["zh-CN"] ||
      !data.files ||
      Object.values(data.files).some((v) => typeof v !== "string")
    )
      throw Error("Invalid guidance body");
    return data;
  });
}

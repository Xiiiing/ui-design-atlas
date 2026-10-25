// @ts-check
/** @template T */
export function createRequestCache() {
  /** @type {Map<string,Promise<T>>} */
  const cache = new Map();
  return {
    clear() {
      cache.clear();
    },
    /** @param {string} url @param {(value:unknown)=>T} decode */
    get(url, decode) {
      if (!cache.has(url)) {
        const pending = fetch(url).then(async (response) => {
          if (!response.ok) throw Error(`HTTP ${response.status}`);
          return decode(await response.json());
        });
        cache.set(url, pending);
        void pending.catch(() => {
          if (cache.get(url) === pending) cache.delete(url);
        });
      }
      return /** @type {Promise<T>} */ (cache.get(url));
    },
  };
}
const details =
  /** @type {ReturnType<typeof createRequestCache<import("./types").Resource>>} */ (
    createRequestCache()
  );
if (import.meta.hot)
  import.meta.hot.on("atlas:source-changed", () => details.clear());
/** @param {import("./types").Resource} resource */
export async function loadResourceDetails(resource) {
  if (resource.prompt) return resource;
  return details.get(
    `./details/${resource.type}-${resource.id}.json`,
    (value) => {
      const r = /** @type {import("./types").Resource} */ (value);
      if (
        !r ||
        r.id !== resource.id ||
        r.type !== resource.type ||
        !r.prompt?.en ||
        !r.prompt?.["zh-CN"] ||
        !r.stylePrompt
      )
        throw Error("Invalid resource details");
      return r;
    },
  );
}

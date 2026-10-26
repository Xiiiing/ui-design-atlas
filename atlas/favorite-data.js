// @ts-check
import { findResource } from "../catalog.js";
import { hasGuidance, hasTool } from "../guidance-registry.js";

export const favoriteStorageKey = "design-atlas-favorites";

/** @param {unknown} value @returns {value is string} */
export function validFavorite(value) {
  if (typeof value !== "string") return false;
  const parts = value.split(":");
  return (
    parts.length === 2 &&
    (parts[0] === "guidance"
      ? hasGuidance(parts[1])
      : parts[0] === "tool"
        ? hasTool(parts[1])
        : ["component", "block", "page", "case"].includes(parts[0]) &&
          !!findResource(parts[1], parts[0]))
  );
}

/** @param {string|null} text @returns {Set<string>} */
export function readFavorites(text) {
  try {
    const values = JSON.parse(text || "[]");
    return new Set(Array.isArray(values) ? values.filter(validFavorite) : []);
  } catch {
    return new Set();
  }
}

/** @param {string} text @param {Set<string>} current @returns {Set<string>} */
export function importFavorites(text, current) {
  const data = JSON.parse(text);
  if (
    !data ||
    data.format !== "ui-design-atlas" ||
    ![1, 2].includes(data.version) ||
    !Array.isArray(data.favorites) ||
    !data.favorites.every(
      (/** @type {unknown} */ value) =>
        validFavorite(value) &&
        (data.version === 2 || !/^(guidance|tool):/.test(value)),
    )
  ) {
    throw new Error("Invalid favorites backup");
  }
  return new Set([...current, ...data.favorites]);
}

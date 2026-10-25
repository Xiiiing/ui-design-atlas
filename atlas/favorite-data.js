import { findResource } from "../catalog.js";

export const favoriteStorageKey = "design-atlas-favorites";

export function validFavorite(value) {
  if (typeof value !== "string") return false;
  const parts = value.split(":");
  return (
    parts.length === 2 &&
    ["component", "block", "page", "case"].includes(parts[0]) &&
    !!findResource(parts[1], parts[0])
  );
}

export function readFavorites(text) {
  try {
    const values = JSON.parse(text || "[]");
    return new Set(Array.isArray(values) ? values.filter(validFavorite) : []);
  } catch {
    return new Set();
  }
}

export function importFavorites(text, current) {
  const data = JSON.parse(text);
  if (
    !data ||
    data.format !== "ui-design-atlas" ||
    data.version !== 1 ||
    !Array.isArray(data.favorites) ||
    !data.favorites.every(validFavorite)
  ) {
    throw new Error("Invalid favorites backup");
  }
  return new Set([...current, ...data.favorites]);
}

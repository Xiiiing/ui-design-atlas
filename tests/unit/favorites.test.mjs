import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validFavorite,
  readFavorites,
  importFavorites,
} from "../../atlas/favorite-data.js";

test("Favorite keys are complete known resource identities; persisted malformed data is filtered", () => {
  assert.equal(validFavorite("component:orbit-table"), true);
  for (const key of [
    "component:orbit-table:extra",
    "component:orbit-table:",
    "bogus:orbit-table",
    "component:missing",
    null,
    {},
  ])
    assert.equal(validFavorite(key), false);
  assert.deepEqual(
    [
      ...readFavorites(
        '["component:orbit-table", "component:orbit-table:extra"]',
      ),
    ],
    ["component:orbit-table"],
  );
  for (const text of ["null", "{}", "broken"])
    assert.equal(readFavorites(text).size, 0);
});
test("Imports merge valid v1 backups and reject invalid files without changing existing favorites", () => {
  const existing = new Set(["case:folio"]);
  const backup = (favorites) =>
    JSON.stringify({ format: "ui-design-atlas", version: 1, favorites });
  assert.deepEqual(
    [
      ...importFavorites(
        backup(["component:orbit-table", "case:folio"]),
        existing,
      ),
    ],
    ["case:folio", "component:orbit-table"],
  );
  for (const text of [
    "null",
    "{}",
    backup(["component:orbit-table", "component:orbit-table:extra"]),
  ])
    assert.throws(() => importFavorites(text, existing));
  assert.deepEqual([...existing], ["case:folio"]);
});

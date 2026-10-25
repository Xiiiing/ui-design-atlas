import { test } from "node:test";
import assert from "node:assert/strict";
import { resources, searchResources } from "../../catalog.js";
import { filterResources, facetCounts } from "../../atlas/filter-model.js";
const route = (view = "explore", query = "") => ({
  view,
  params: new URLSearchParams(query),
});
test("Facets combine OR within, AND across and count without their own selection", () => {
  const values = {
    category: "forms,data",
    library: "shadcn",
    interaction: "input",
  };
  const list = filterResources(resources, route(), new Set(), values);
  assert.ok(list.length);
  assert.ok(
    list.every(
      (r) =>
        r.categories.some((c) => ["forms", "data"].includes(c)) &&
        r.libraryIds.includes("shadcn") &&
        r.interactions.includes("input"),
    ),
  );
  const forms = facetCounts(resources, route(), new Set(), values, "category");
  assert.equal(
    forms.get("forms"),
    resources.filter(
      (r) =>
        r.categories.includes("forms") &&
        r.libraryIds.includes("shadcn") &&
        r.interactions.includes("input"),
    ).length,
  );
  const favorite = resources.find((r) => r.id === "folio-form");
  const saved = new Set([`${favorite.type}:${favorite.id}`]);
  assert.equal(
    facetCounts(resources, route("favorites"), saved, {}, "category").get(
      "all",
    ),
    1,
  );
  assert.equal(
    filterResources(
      resources,
      route("pages", "category=forms"),
      new Set(),
    ).some((r) => r.id === "folio-about"),
    true,
  );
  assert.equal(
    filterResources(resources, route("favorites", "type=page"), saved).length,
    0,
  );
});
test("Whole words outrank Forma noise and legacy filters keep matching identities", () => {
  const ranked = searchResources("form");
  assert.ok(
    ranked.findIndex((r) => r.id === "antd-form") <
      ranked.findIndex((r) => r.id === "forma-button"),
  );
  assert.ok(searchResources("表单").length);
  assert.deepEqual(
    filterResources(
      resources,
      route("components", "category=buttons&style=folio&source=original"),
      new Set(),
    ).map((r) => r.id),
    ["folio-button"],
  );
  const original = route("pages", "category=forms");
  const before = original.params.toString();
  facetCounts(
    resources,
    original,
    new Set(),
    Object.fromEntries(original.params),
    "type",
  );
  assert.equal(original.params.toString(), before);
});

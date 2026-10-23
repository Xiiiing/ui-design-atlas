import { test } from "node:test";
import assert from "node:assert/strict";
import { createSearchIndex, rankSearch } from "../../search.js";
import { resources, searchResources } from "../../catalog.js";

test("Exact bilingual names outrank partial names, aliases and descriptions; ties remain stable", () => {
  const rows = [
    { names: "Other", description: "A border beam demo" },
    { names: "Alias", aliases: ["border beam", "流光边框"] },
    { names: "Border Beam Card" },
    { names: { en: "Border Beam", zh: "流光边框" } },
    { names: "Border Beam" },
  ];
  const index = createSearchIndex(rows, (r) => r);
  assert.deepEqual(rankSearch(rows, "  ＢＯＲＤＥＲ   BEAM ", index), [
    rows[3],
    rows[4],
    rows[2],
    rows[1],
    rows[0],
  ]);
  assert.deepEqual(rankSearch(rows, "流光边框", index), [rows[3], rows[1]]);
  assert.deepEqual(rankSearch(rows, "", index), rows);
  assert.deepEqual(rankSearch(rows, "absent", index), []);
});

test("Catalog searches preserve aliases, all-word matching, candidate filters and no-query order", () => {
  for (const query of ["流光边框", "Border Beam"])
    assert.equal(searchResources(query)[0].id, "magicui-border-beam");
  assert.ok(searchResources("微软").length > 0);
  assert.ok(
    searchResources("微软").every((r) => r.libraryIds.includes("fluent")),
  );
  assert.ok(searchResources("antd 表格").some((r) => r.id === "antd-table"));
  assert.equal(searchResources("antd no-such-word").length, 0);
  const candidates = resources.filter((r) => r.category === "forms");
  assert.ok(
    searchResources("antd", candidates).every((r) => candidates.includes(r)),
  );
  assert.deepEqual(searchResources("  "), resources);
  assert.deepEqual(searchResources("button"), searchResources("button"));
});

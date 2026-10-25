import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  validateCatalog,
  readCatalog,
  summaryOf,
} from "../../scripts/catalog-data.mjs";
import sources from "../../content/sources.json" with { type: "json" };
import libraries from "../../content/libraries.json" with { type: "json" };
import discovery from "../../content/discovery.json" with { type: "json" };
import { deliveryFiles } from "../../scripts/delivery-files.mjs";
const rows = await readCatalog(new URL("../../", import.meta.url).pathname);
test("Canonical catalog rejects invalid metadata and references; summaries omit details", () => {
  for (const change of [
    (r) => r[0].categories.push("invalid"),
    (r) => r[0].interactions.push("invalid"),
    (r) => r[0].libraryIds.push("missing"),
    (r) => (r[0].caseId = "missing"),
    (r) => r.push(r[0]),
    (r) => (r[0].preview.width = 0),
    (r) => delete r[0].prompt.en,
  ]) {
    const data = structuredClone(rows);
    change(data);
    assert.throws(() => validateCatalog(data, sources, libraries, discovery));
  }
  for (const row of rows) {
    const summary = summaryOf(row);
    assert.equal(summary.id, row.id);
    assert.equal(summary.prompt, undefined);
    assert.equal(summary.rules, undefined);
    assert.ok(summary.name.en);
  }
});
test("Delivery allows source and assets but excludes local files and rejects escaping symlinks", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "atlas-delivery-unit-")),
    root = path.join(temp, "project");
  try {
    await mkdir(path.join(root, "src"), { recursive: true });
    for (const file of [
      "package.json",
      "README.md",
      "src/main.ts",
      ".env.local",
      "private-note.md",
      "src/unrelated-local.ts",
      "src/main.ts.bak",
      "src/.env",
      "debug.log",
    ])
      await writeFile(path.join(root, file), "AUDIT PUBLIC SENTINEL");
    assert.deepEqual(
      (await deliveryFiles(root,["README.md","package.json","src/main.ts"])).map((f) => path.relative(root, f)),
      ["README.md", "package.json", "src/main.ts"],
    );
    await writeFile(path.join(temp, "outside.ts"), "AUDIT OUTSIDE");
    await symlink(
      path.join(temp, "outside.ts"),
      path.join(root, "src/escape.ts"),
    );
    await assert.rejects(deliveryFiles(root), /escapes project/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  cp,
  readFile,
  writeFile,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  readGuidance,
  validateGuidance,
  generateGuidance,
} from "../../scripts/guidance-data.mjs";
const root = fileURLToPath(new URL("../../", import.meta.url));
const read = async (name) =>
  JSON.parse(
    await readFile(path.join(root, "content", name + ".json"), "utf8"),
  );
test("Guidance catalog validates independent kinds, real references and complete pinned bundles", async () => {
  const d = await readGuidance(root);
  assert.equal(d.guidance.length, 13);
  assert.equal(d.tools.length, 8);
  assert.equal(d.guidance.filter((g) => g.kind === "skill").length, 5);
  assert.equal(d.details.animate.files["RECIPES.md"].includes("#"), true);
  assert.equal(
    d.details["review-animations"].files["STANDARDS.md"].includes("#"),
    true,
  );
  assert.equal(d.details["break-ui"].files["CATALOG.md"].includes("#"), true);
  assert.equal(
    d.details["visual-quality"].original["zh-CN"].includes(
      "直到没有明显可提升之处",
    ),
    true,
  );
  for (const detail of Object.values(d.details))
    if (detail.source) assert.match(detail.files.LICENSE, /MIT License/);
});
test("Invalid kinds, duplicate IDs, references and file traversal fail checks", async () => {
  const args = await Promise.all(
    ["guidance", "tools", "resources", "guidance-sources"].map(read),
  );
  for (const change of [
    (a) => a[0].push(a[0][0]),
    (a) => (a[0][0].kind = "video"),
    (a) => (a[0][0].related = ["component:missing"]),
    (a) => (a[0][0].toolId = "missing"),
    (a) => (a[0][0].purposes = ["unknown"]),
    (a) =>
      a[0].find((g) => g.kind === "skill").upstream.files.push("../secret.md"),
    (a) => (a[3].emil.commit = "main"),
    (a) => (a[1][0].repo = "javascript:alert(1)"),
  ]) {
    const copy = structuredClone(args);
    change(copy);
    assert.throws(() => validateGuidance(...copy));
  }
});
test("Downloaded archives retain exact source, supporting files, license and reuse notes", async () => {
  const out = await mkdtemp(path.join(tmpdir(), "atlas-guidance-zip-"));
  try {
    await generateGuidance(root, out);
    const d = await readGuidance(root);
    for (const item of d.guidance) {
      const archive = path.join(out, "downloads/guidance", item.id + ".zip");
      for (const [name, text] of Object.entries(d.details[item.id].files))
        assert.equal(
          execFileSync("unzip", ["-p", archive, item.id + "/" + name], {
            encoding: "utf8",
          }),
          text,
        );
      const listing = execFileSync("unzip", ["-Z1", archive], {
        encoding: "utf8",
      })
        .trim()
        .split("\n");
      assert.equal(
        listing.length,
        Object.keys(d.details[item.id].files).length + 1,
      );
      assert(
        listing.every((p) => p.startsWith(item.id + "/") && !p.includes("..")),
      );
    }
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});
test("Source tampering and symlinks outside the delivery boundary are rejected", async () => {
  const copy = await mkdtemp(path.join(tmpdir(), "atlas-guidance-unsafe-"));
  try {
    await cp(path.join(root, "content"), path.join(copy, "content"), {
      recursive: true,
    });
    await cp(
      path.join(root, "vendor/guidance"),
      path.join(copy, "vendor/guidance"),
      { recursive: true },
    );
    const file = path.join(
      copy,
      "vendor/guidance/ibelick/skills/baseline-ui/SKILL.md",
    );
    await writeFile(file, "changed");
    await assert.rejects(readGuidance(copy), /snapshot changed/);
    await rm(file);
    await symlink(path.join(root, "README.md"), file);
    await assert.rejects(readGuidance(copy), /escapes root/);
  } finally {
    await rm(copy, { recursive: true, force: true });
  }
});

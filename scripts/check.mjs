import { readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  cases,
  pages,
  components,
  getCase,
  getPage,
  upstream,
  promptFor,
  resources, sourceProjects, libraries, resourcePreview, resourcePrompt,
} from "../catalog.js";
import { components as originals } from "../data.js";
import { componentMarkup } from "../components.js";
const base = new URL("../", import.meta.url);
for (const [label, items] of Object.entries({ cases, pages, components })) {
  assert.equal(
    new Set(items.map((x) => x.id)).size,
    items.length,
    `${label} IDs must be unique`,
  );
  for (const item of items) {
    for (const lang of ["zh-CN", "en"])
      for (const field of ["name", "description"])
        assert.ok(
          item[field]?.[lang]?.length,
          `${item.id}: missing ${field}/${lang}`,
        );
  }
}
assert.equal(cases[0].source, "open-source");
assert.equal(upstream.commit, "e16c87f213a5ba5e45964e9b67c792105ec74d26");
for (const c of cases) {
  assert.ok(c.pages.length > 0);
  for (const lang of ["zh-CN", "en"]) {
    assert.ok(c.principle[lang]);
    assert.ok(c.rules[lang].length);
    for (const scope of ["style", "system"])
      assert.ok(
        promptFor(c, c.pages[0], scope, lang).includes(c.tokens.background),
      );
  }
}
for (const p of pages) {
  assert.ok(getCase(p.caseId));
  for (const lang of ["zh-CN", "en"])
    assert.ok(
      promptFor(getCase(p.caseId), p, "page", lang).includes(p.name[lang]),
    );
}
for (const c of components) {
  assert.ok(getCase(c.caseId));
  assert.ok(c.pageIds.every((id) => getPage(id)?.caseId === c.caseId));
  for (const lang of ["zh-CN", "en"])
    assert.ok(
      promptFor(getCase(c.caseId), c, "component", lang).includes(c.name[lang]),
    );
  if (c.caseId === "shadcn-admin")
    for (const file of c.files)
      await access(new URL("examples/shadcn-admin/" + file, base));
}
for (const item of originals)
  assert.ok(componentMarkup(item, true).length > 100);
const files = [
  "index.html",
  "preview.html",
  "component-preview.html",
  "styles.css",
  "components.css",
  "preview.css",
  "app.js",
  "icons.js",
  "data.js",
  "catalog.js",
  "components.js",
  "preview.js",
  "component-preview.js",
  "legacy-i18n.js",
  "legacy-translations.js",
  "favicon.svg",
];
for (const file of files) await access(new URL(file, base));
for (const file of [
  ...files.filter((f) => f.endsWith(".js")),
  "scripts/build.mjs",
  "scripts/serve.mjs",
]) {
  const result = spawnSync(
    process.execPath,
    ["--check", fileURLToPath(new URL(file, base))],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
}
const license = await readFile(
  new URL("examples/shadcn-admin/LICENSE", base),
  "utf8",
);
assert.ok(license.includes("Copyright (c) 2024 Sat Naing"));
for (const weight of [400, 500, 600, 700])
  await access(new URL(`assets/fonts/inter-${weight}.woff2`, base));
for (const file of ["vendor/shadcn-ui/LICENSE.md", "vendor/lucide/LICENSE", "vendor/inter/LICENSE"])
  await access(new URL(file, base));
const pkg = JSON.parse(
  await readFile(new URL("examples/shadcn-admin/package.json", base)),
);
assert.ok(!pkg.dependencies["@clerk/react"]);
console.log(
  `Verified ${cases.length} systems, ${pages.length} pages, ${components.length} components; bilingual content, prompt coverage, source references and licenses.`,
);

assert.equal(new Set(resources.map(r => `${r.type}:${r.id}`)).size, resources.length);
for (const r of resources) {
  assert.ok(sourceProjects[r.sourceId], `${r.id}: source`);
  assert.ok(r.libraryIds.length && r.libraryIds.every(id => libraries[id]), `${r.id}: libraries`);
  if (r.caseId) assert.ok(getCase(r.caseId));
  for (const id of r.pageIds || []) assert.ok(getPage(id));
  for (const lang of ["zh-CN", "en"]) {
    assert.ok(r.name[lang] && r.description[lang]);
    assert.ok(resourcePrompt(r, lang).length > 80);
    assert.ok(resourcePreview(r, lang).startsWith("./"));
  }
}
console.log(`Verified ${resources.length} unified resources and library provenance.`);

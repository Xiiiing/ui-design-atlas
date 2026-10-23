import { createHash } from "node:crypto";
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
  resources,
  sourceProjects,
  libraries,
  resourcePreview,
  resourcePrompt,
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
  "legacy-theme.js",
  "legacy-translations.js",
  "favicon.svg",
  "logo.svg",
  "logo-reverse.svg",
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
for (const file of [
  "vendor/shadcn-ui/LICENSE.md",
  "vendor/lucide/LICENSE",
  "vendor/inter/LICENSE",
])
  await access(new URL(file, base));
const pkg = JSON.parse(
  await readFile(new URL("examples/shadcn-admin/package.json", base)),
);
assert.ok(!pkg.dependencies["@clerk/react"]);
console.log(
  `Verified ${cases.length} systems, ${pages.length} pages, ${components.length} components; bilingual content, prompt coverage, source references and licenses.`,
);

assert.equal(
  new Set(resources.map((r) => `${r.type}:${r.id}`)).size,
  resources.length,
);
for (const r of resources) {
  assert.ok(sourceProjects[r.sourceId], `${r.id}: source`);
  assert.ok(
    r.libraryIds.length && r.libraryIds.every((id) => libraries[id]),
    `${r.id}: libraries`,
  );
  if (r.caseId) assert.ok(getCase(r.caseId));
  for (const id of r.pageIds || []) assert.ok(getPage(id));
  for (const lang of ["zh-CN", "en"]) {
    assert.ok(r.name[lang] && r.description[lang]);
    assert.ok(resourcePrompt(r, lang).length > 80);
    assert.ok(resourcePreview(r, lang).startsWith("./"));
  }
}
console.log(
  `Verified ${resources.length} unified resources and library provenance.`,
);
for (const r of resources.filter((r) => !r.caseId && r.type !== "case")) {
  assert.ok(
    r.preview.url && r.files?.length,
    `${r.id}: independent preview and code`,
  );
  assert.ok(
    r.originalUrl?.startsWith("https://") && r.sourceUrl?.includes("/blob/"),
    `${r.id}: original sources`,
  );
  for (const lang of ["zh-CN", "en"])
    for (const field of ["principle", "useCases", "prompt", "stylePrompt"])
      assert.ok(r[field]?.[lang]?.length, `${r.id}: ${field}/${lang}`);
  for (const file of [...r.files, ...r.supportFiles])
    await access(new URL("examples/ui-market/" + file, base));
}
if (!process.argv.includes("--capture-previews"))
  for (const r of resources) {
    await access(new URL(r.cover, base));
    await access(new URL(r.cover.replace(/\.png$/, "-dark.png"), base));
  }
for (const s of Object.values(sourceProjects).filter((s) => !s.original))
  assert.ok(s.commit?.length === 40 && s.repo && s.licenseFile);

const sourceLock = JSON.parse(
  await readFile(new URL("examples/ui-market/sources.lock.json", base), "utf8"),
);
for (const [id, source] of Object.entries(sourceLock.sources)) {
  assert.equal(
    sourceProjects[id].commit,
    source.commit,
    `${id}: pin must match registry`,
  );
  for (const file of source.files) {
    const data = await readFile(
      new URL("examples/ui-market/" + file.original, base),
    );
    assert.equal(
      createHash("sha256").update(data).digest("hex"),
      file.sha256,
      `${id}: original source changed: ${file.original}`,
    );
  }
}
console.log("Verified pinned upstream snapshots and SHA-256 checksums.");

const shellSources = JSON.parse(
  await readFile(new URL("vendor/yingxu-ui/sources.lock.json", base), "utf8"),
);
assert.equal(
  shellSources.sourceCommit,
  "b3cc662ce5cfe7947d6e5cec84ae54719f5d1062",
);
for (const [file, hash] of Object.entries(shellSources.files)) {
  const content = await readFile(new URL("vendor/yingxu-ui/" + file, base));
  assert.equal(
    createHash("sha256").update(content).digest("hex"),
    hash,
    "Yingxu source changed: " + file,
  );
}
console.log("Verified pinned Yingxu UI components and design tokens.");

const marketDesign = JSON.parse(
  await readFile(new URL("vendor/21st-market/sources.lock.json", base), "utf8"),
);
assert.equal(marketDesign.commit, "b96d84dcf748d5e56f2f72f2bab9a4f7f33574cf");
for (const [file, hash] of Object.entries(marketDesign.files)) {
  const content = await readFile(new URL("vendor/21st-market/" + file, base));
  assert.equal(
    createHash("sha256").update(content).digest("hex"),
    hash,
    "21st reference changed: " + file,
  );
}
const { resourcePresentation, thumbnailURL } =
  await import("../presentation.js");
for (const r of resources) {
  const p = resourcePresentation(r);
  assert.ok(p.width > 0 && p.height > 0);
  if (r.type !== "component" || r.preview.width >= 900)
    assert.equal(p.width, r.preview.width);
  else if (p.mode === "canvas") assert.ok(p.width >= 400 && p.height >= 400);
  else assert.equal(p.width, r.category === "buttons" ? 320 : 480);
  assert.ok(["inline", "canvas"].includes(p.mode));
}
assert.equal(
  thumbnailURL("./demo.html?a=b#/tasks"),
  "./demo.html?a=b&thumb=1#/tasks",
);
console.log(
  "Verified pinned 21st design reference and shared preview framing.",
);

const { discovery, discoveryResources, collectionResources } =
  await import("../catalog.js");
for (const field of ["title", "description"])
  for (const lang of ["zh-CN", "en"]) assert.ok(discovery[field][lang]);
for (const section of ["featured", "gallery", "cases"]) {
  assert.equal(new Set(discovery[section]).size, discovery[section].length);
  assert.ok(discoveryResources(section).length);
  assert.ok(
    discoveryResources(section).every(Boolean),
    `Invalid discovery ${section}`,
  );
}
assert.equal(
  new Set(discovery.collections.map((c) => c.id)).size,
  discovery.collections.length,
);
for (const collection of discovery.collections) {
  for (const lang of ["zh-CN", "en"])
    for (const field of ["name", "description"])
      assert.ok(collection[field][lang]);
  const items = collectionResources(collection.id);
  assert.ok(items.length && items.every(Boolean), collection.id);
  assert.equal(new Set(items.map((r) => r.id)).size, items.length);
}
assert.equal(new Set(discovery.categories).size, discovery.categories.length);
assert.ok(discoveryResources("cases").every((r) => r.type === "case"));
for (const category of discovery.categories)
  assert.ok(resources.some((r) => r.category === category));

for (const [id, theme] of Object.entries(discovery.previewThemes)) {
  assert.ok(resources.some((r) => r.id === id));
  assert.ok(["light", "dark"].includes(theme));
}
const { discoveryGallery } = await import("../catalog.js");
assert.equal(discoveryGallery().length, resources.length);

assert.equal(
  new Set([...discovery.featured, ...discovery.gallery]).size,
  discovery.featured.length + discovery.gallery.length,
  "The first gallery must not repeat resources",
);

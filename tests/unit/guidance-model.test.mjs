import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyDraft,
  readDraft,
  composePrompt,
  fillTemplate,
} from "../../atlas/composer-model.js";
import { renderGuidanceMarkdown } from "../../atlas/guidance-markdown.js";
import { searchContent } from "../../atlas/content-search.js";
import { readGuidance } from "../../scripts/guidance-data.mjs";
import {
  readFavorites,
  importFavorites,
  validFavorite,
} from "../../atlas/favorite-data.js";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
test("Unified search uses one relevance order across interfaces, guidance and repositories", () => {
  assert.equal(searchContent("Baseline UI")[0].key, "guidance:baseline-ui");
  assert.equal(searchContent("Element Plus")[0].key, "tool:element-plus");
  assert.equal(
    searchContent("视觉品质追加语")[0].key,
    "guidance:visual-quality",
  );
  assert(
    searchContent("Bento").some((r) => r.key === "block:magicui-bento-grid"),
  );
  assert.equal(searchContent("nothing-matches-this-query").length, 0);
});
test("Favorites retain UI keys, v1 atomic import and v2 mixed identity validation", () => {
  const v2 = {
    format: "ui-design-atlas",
    version: 2,
    favorites: [
      "guidance:animate",
      "tool:element-plus",
      "component:folio-form",
    ],
  };
  assert.deepEqual(
    [...importFavorites(JSON.stringify(v2), new Set())],
    v2.favorites,
  );
  assert.equal(validFavorite("guidance:animate"), true);
  for (const k of [
    "tool:animate",
    "guidance:missing",
    "guidance:animate:extra",
    "guidance:Animate",
    "tool:element-plus:",
  ])
    assert.equal(validFavorite(k), false);
  assert.deepEqual(
    [...readFavorites(JSON.stringify([...v2.favorites, "guidance:missing"]))],
    v2.favorites,
  );
  for (const value of [
    { ...v2, version: 1 },
    { ...v2, version: 3 },
    { ...v2, favorites: [...v2.favorites, "guidance:missing"] },
  ])
    assert.throws(() =>
      importFavorites(JSON.stringify(value), new Set(["case:folio"])),
    );
});
test("Draft parsing rejects stale selections without losing valid text and never creates unresolved placeholders", () => {
  assert.equal(readDraft("broken").requirements, "");
  const d = readDraft(
    JSON.stringify({
      ...emptyDraft(),
      requirements: "My site",
      output: "manual text",
      design: "missing",
      skills: ["animate", "missing", "animate"],
      checks: ["responsive-review"],
      reference: "case:folio:extra",
    }),
  );
  assert.equal(d.requirements, "My site");
  assert.equal(d.output, "manual text");
  assert.equal(d.design, "");
  assert.deepEqual(d.skills, ["animate"]);
  assert.equal(d.reference, "");
  assert.equal(
    fillTemplate(
      "Need {{requirements}} for {{audience}}; {{technology}} / {{direction}}",
      { requirements: "a site", audience: "readers" },
    ),
    "Need a site for readers;  / ",
  );
});
test("Composition preserves constraints/order and separates chat notes from full agent files", async () => {
  const { details } = await readGuidance(root);
  const d = {
    ...emptyDraft(),
    requirements: "Build a docs site",
    design: "linear-design",
    checks: ["responsive-review"],
    skills: ["animate"],
  };
  const chat = composePrompt(d, "en", details, undefined);
  const order = [
    "## Requirements & constraints",
    "## Design specification",
    "## Task requirements",
    "## Delivery checks",
  ].map((x) => chat.indexOf(x));
  assert(order.every((n, i) => n >= 0 && (i === 0 || n > order[i - 1])));
  assert.match(chat, /Explicit user constraints take precedence/);
  assert.match(chat, /Third-party design analysis/);
  assert.match(chat, /skill is not installed/);
  assert.doesNotMatch(chat, /I'm ready to build animations/);
  const agent = composePrompt(
    { ...d, mode: "agent" },
    "en",
    details,
    undefined,
  );
  assert.match(agent, /animate\/SKILL.md/);
  assert.match(agent, /supporting files/);
  assert.throws(() =>
    composePrompt({ ...d, requirements: " " }, "en", details, undefined),
  );
  assert.throws(() =>
    composePrompt(
      { ...d, reference: "component:folio-form" },
      "en",
      details,
      undefined,
    ),
  );
});
test("Markdown keeps raw HTML, scripts and unsafe links inert while supporting safe reading", () => {
  const html = renderGuidanceMarkdown(
    "# Title\n<script>alert(1)</script>\n[x](javascript:alert(1))\n[safe](https://example.com/path)\n```html\n<img onerror=alert(1)>\n```",
  );
  assert.match(html, /<h2>Title<\/h2>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script|<img|href="javascript:/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /<pre><code>&lt;img/);
});

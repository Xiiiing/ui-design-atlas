import { test } from "node:test";
import assert from "node:assert/strict";
import {
  imports,
  localFile,
  resourceCode,
} from "../../scripts/resource-code.mjs";

const resource = {
  id: "example",
  name: { "zh-CN": "示例", en: "Example" },
  sourceId: "magicui",
  files: ["src/demo.tsx"],
  supportFiles: ["src/provider.tsx"],
};
function fixture() {
  const dependencies = Object.fromEntries(
    ["react", "react-dom", "@fontsource/geist", "motion", "tailwindcss"].map(
      (name) => [name, "^1.0.0"],
    ),
  );
  return {
    "package.json": JSON.stringify({ dependencies }),
    "package-lock.json": JSON.stringify({
      packages: Object.fromEntries(
        Object.keys(dependencies).map((name) => [
          `node_modules/${name}`,
          { version: "1.2.3" },
        ]),
      ),
    }),
    "src/demo.tsx":
      'import {x} from "@/parts"; import("./lazy"); export default () => "./avatars/a.svg";',
    "src/parts/index.ts": 'export {x} from "./value";',
    "src/parts/value.ts": 'import "../demo"; export const x = 1;',
    "src/lazy.ts": 'import {animate} from "motion/react";',
    "src/provider.tsx": "export const Provider = () => null;",
    "src/styles/index.css": '@import "tailwindcss"; @import "./theme.css";',
    "src/styles/theme.css": ":root { --background: white; }",
    "public/avatars/a.svg": "<svg></svg>",
    "src/unrelated.ts": "export const other = true;",
    LICENSE: "MIT",
    "licenses/antd-LICENSE": "MIT Ant",
    "licenses/fluentui-LICENSE": "MIT Microsoft",
  };
}
test("Resource delivery includes aliases, directory exports, dynamic imports, cycles, styles and assets", () => {
  const result = resourceCode(resource, fixture(), "ui-market");
  for (const name of [
    "src/parts/value.ts",
    "src/lazy.ts",
    "src/provider.tsx",
    "src/styles/theme.css",
    "public/avatars/a.svg",
    "LICENSE",
    "licenses/antd-LICENSE",
    "licenses/fluentui-LICENSE",
    "ATLAS-REUSE.md",
  ])
    assert.ok(name in result.files, name);
  assert.ok(!("src/unrelated.ts" in result.files));
  assert.ok(!("package-lock.json" in result.files));
  assert.equal(result.dependencies.motion, "1.2.3");
  assert.match(result.install, /motion@1.2.3/);
  assert.match(result.files["ATLAS-REUSE.md"], /src\/demo.tsx/);
});
test("Missing entries, transitive local imports, public assets and undeclared packages fail the build", () => {
  for (const missing of [
    "src/demo.tsx",
    "src/parts/value.ts",
    "src/styles/theme.css",
    "public/avatars/a.svg",
  ]) {
    const files = fixture();
    delete files[missing];
    assert.throws(() => resourceCode(resource, files, "ui-market"), /Missing/);
  }
  const files = fixture();
  files["src/lazy.ts"] = 'import x from "undeclared";';
  assert.throws(
    () => resourceCode(resource, files, "ui-market"),
    /Undeclared dependency/,
  );
});
test("Import extraction ignores comments and resolves local files without interpreting package paths as local", () => {
  assert.deepEqual(
    imports("demo.ts", '// import "./missing"\nexport { x } from "./real";'),
    ["./real"],
  );
  assert.equal(localFile("src/demo.tsx", "react", fixture()), null);
  assert.throws(
    () => localFile("src/demo.tsx", "../../missing", fixture()),
    /Missing local dependency/,
  );
});

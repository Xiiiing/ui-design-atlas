// Development helper: run once against an unlocalized pinned snapshot.
import ts from "../examples/shadcn-admin/node_modules/typescript/lib/typescript.js";
import { readdir, readFile, writeFile } from "node:fs/promises";
const root = new URL("../examples/shadcn-admin/src/", import.meta.url);
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory()
          ? files(new URL(e.name + "/", dir))
          : new URL(e.name, dir),
      ),
    )
  ).flat();
}
const messages = new Set();
for (const file of (await files(root)).filter(
  (f) =>
    /\.(tsx|ts)$/.test(f.pathname) &&
    !f.pathname.includes("/archive/") &&
    !f.pathname.endsWith("routeTree.gen.ts"),
)) {
  const text = await readFile(file, "utf8");
  if (text.includes("from '@/archive/i18n'")) continue;
  const source = ts.createSourceFile(
    file.pathname,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.pathname.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const edits = [];
  const add = (node, value, jsx = false) => {
    if (!/[A-Za-z]/.test(value) || /^https?:|@|example\.com/.test(value))
      return;
    messages.add(value);
    edits.push([
      node.getStart(source),
      node.end,
      jsx ? `{t(${JSON.stringify(value)})}` : `t(${JSON.stringify(value)})`,
    ]);
  };
  function visit(n) {
    if (ts.isJsxText(n)) {
      const value = n.text
        .replace(/\s+/g, " ")
        .trim()
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
      if (value) {
        add(n, value, true);
        return;
      }
    }
    if (ts.isStringLiteral(n)) {
      const p = n.parent;
      if (
        ts.isJsxAttribute(p) &&
        [
          "placeholder",
          "title",
          "aria-label",
          "confirmText",
          "desc",
          "searchPlaceholder",
          "heading",
          "entityName",
        ].includes(p.name.getText(source))
      ) {
        add(n, n.text, true);
        return;
      }
      if (
        ts.isPropertyAssignment(p) &&
        [
          "title",
          "label",
          "description",
          "searchPlaceholder",
          "header",
          "message",
          "loading",
          "error",
        ].includes(p.name.getText(source))
      ) {
        add(n, n.text);
        return;
      }
      if (
        ts.isCallExpression(p) &&
        p.arguments.includes(n) &&
        ["min", "max", "string", "url", "email"].some((k) =>
          p.expression.getText(source).endsWith("." + k),
        ) &&
        n.text.includes(" ")
      ) {
        add(n, n.text);
        return;
      }
      if (
        ts.isConditionalExpression(p) &&
        (p.whenTrue === n || p.whenFalse === n) &&
        /^[A-Z]/.test(n.text) &&
        !n.text.includes("[") &&
        !n.text.includes("bg-")
      ) {
        add(n, n.text);
        return;
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(source);
  if (process.argv.includes("--write") && edits.length) {
    let output = text;
    for (const [a, b, v] of edits.sort((a, b) => b[0] - a[0]))
      output = output.slice(0, a) + v + output.slice(b);
    await writeFile(file, "import { t } from '@/archive/i18n'\n" + output);
  }
}
await writeFile(
  new URL("../output/upstream-messages.json", import.meta.url),
  JSON.stringify([...messages].sort(), null, 2),
);
console.log(`${messages.size} messages`);

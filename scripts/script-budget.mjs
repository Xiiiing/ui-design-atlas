import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
// Traverse only static imports. Dynamic source/HTML export chunks are measured separately.
export async function scriptBudget(meta, root, out) {
  const outputs = meta.outputs,
    entry = Object.keys(outputs).find(
      (key) =>
        outputs[key].entryPoint === path.join(root, "app.js") ||
        outputs[key].entryPoint === "app.js",
    );
  const seen = new Set();
  function visit(key) {
    if (seen.has(key)) return;
    seen.add(key);
    for (const dependency of outputs[key]?.imports || [])
      if (dependency.kind === "import-statement" && !dependency.external)
        visit(dependency.path);
  }
  visit(entry);
  const startup = [];
  for (const file of seen) {
    const bytes = await readFile(path.resolve(root, file));
    startup.push({
      file: path.basename(file),
      bytes: bytes.length,
      gzip: gzipSync(bytes).length,
    });
  }
  const report = {
    tool: "esbuild static-import graph + node:zlib gzip (default)",
    startup,
    startupGzip: startup.reduce((sum, file) => sum + file.gzip, 0),
    budget: 190000,
  };
  await writeFile(
    path.join(out, "script-budget.json"),
    JSON.stringify(report, null, 2),
  );
  if (report.startupGzip > report.budget)
    throw Error(
      `Main document startup gzip ${report.startupGzip} exceeds ${report.budget}`,
    );
  console.log(
    `Main document startup scripts: ${report.startupGzip} gzip bytes (budget ${report.budget}); iframe scripts measured separately.`,
  );
  return report;
}

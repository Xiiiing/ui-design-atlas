import { readFile, writeFile } from "node:fs/promises";
const fields = {
  marketResources: "resources",
  marketSources: "sources",
  marketLibraries: "libraries",
};
let text =
  "// Generated from content/market-*.json by scripts/generate-market-catalog.mjs.\n";
for (const [name, file] of Object.entries(fields))
  text += `export const ${name} = ${await readFile(`content/market-${file}.json`, "utf8")};\n`;
await writeFile("market-catalog.js", text);

const entries = JSON.parse(
  await readFile("content/market-resources.json", "utf8"),
);
await writeFile(
  "examples/ui-market/src/archive/resources.json",
  JSON.stringify(
    Object.fromEntries(
      entries.map((r) => [r.id, { name: r.name, sourceId: r.sourceId }]),
    ),
    null,
    2,
  ) + "\n",
);

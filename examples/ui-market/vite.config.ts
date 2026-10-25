import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";
function resourceNames(): Plugin {
  const canonical = path.resolve(
    import.meta.dirname,
    "../../content/resources.json",
  );
  // Downloaded standalone projects carry a generated, public name index.
  const file = existsSync(canonical)
    ? canonical
    : path.resolve(import.meta.dirname, "atlas-catalog.json");
  return {
    name: "atlas-resource-names",
    resolveId(id) {
      if (id === "atlas:resource-names") return "\0atlas:resource-names";
    },
    load(id) {
      if (id !== "\0atlas:resource-names") return;
      const entries = JSON.parse(readFileSync(file, "utf8")) as {
        id: string;
        name: Record<string, string>;
        sourceId: string;
      }[];
      return (
        "export default " +
        JSON.stringify(
          Object.fromEntries(
            entries.map((r) => [r.id, { name: r.name, sourceId: r.sourceId }]),
          ),
        )
      );
    },
    configureServer(server) {
      server.watcher.add(file);
    },
    handleHotUpdate(ctx) {
      if (ctx.file === file) {
        const m = ctx.server.moduleGraph.getModuleById(
          "\0atlas:resource-names",
        );
        if (m) ctx.server.moduleGraph.invalidateModule(m);
        ctx.server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}
export default defineConfig({
  base: "./",
  plugins: [resourceNames(), react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});

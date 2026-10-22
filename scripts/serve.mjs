import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const base = fileURLToPath(
  new URL(
    process.argv.includes("--dist") ? "../dist/" : "../",
    import.meta.url,
  ),
);
const baseArg = process.argv.find((x) => x.startsWith("--base="));
const prefix = baseArg
  ? "/" + baseArg.slice(7).replace(/^\/+|\/+$/g, "") + "/"
  : "/";
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".zip": "application/zip",
  ".md": "text/plain; charset=utf-8",
};
const server = http.createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (prefix !== "/") {
      if (!pathname.startsWith(prefix)) {
        response.writeHead(404).end();
        return;
      }
      pathname = "/" + pathname.slice(prefix.length);
    }
    let target = path.resolve(base, `.${pathname}`);
    const relative = path.relative(base, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      response.writeHead(403).end();
      return;
    }
    if ((await stat(target)).isDirectory())
      target = path.join(target, "index.html");
    const content = await readFile(target);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Local: http://127.0.0.1:${port}${prefix}`),
);

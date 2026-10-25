import { catalogBrowserPlugin } from "./catalog-data.mjs";
import { createServer } from "vite";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const base = "/ui-design-atlas/";
const port = Number(process.env.PORT || 4173);
const servers = [];
const workers = new Set();
const generated = await mkdtemp(path.join(tmpdir(), "atlas-delivery-"));
let revision = 0;
let delivery;
const generations = new Set();
let sourceNotification;
let stopping = false;

async function close() {
  if (stopping) return;
  stopping = true;
  clearTimeout(sourceNotification);
  await Promise.allSettled(
    [...workers].map(
      (worker) =>
        new Promise((resolve) => {
          worker.once("exit", resolve);
          worker.kill("SIGTERM");
        }),
    ),
  );
  await Promise.allSettled(servers.map((server) => server.close()));
  await rm(generated, { recursive: true, force: true });
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    void close().then(() => process.exit(0));
  });

function buildDelivery(version) {
  const directory = path.join(generated, String(version));
  return new Promise((resolve, reject) => {
    // A new process reads the current catalog as well as current source files.
    const worker = spawn(
      process.execPath,
      [path.join(root, "scripts/delivery.mjs"), directory],
      { cwd: root, stdio: ["ignore", "ignore", "pipe"] },
    );
    workers.add(worker);
    let errors = "";
    worker.stderr.on("data", (chunk) => {
      errors += chunk;
    });
    worker.on("error", (error) => {
      workers.delete(worker);
      reject(error);
    });
    worker.on("exit", (code) => {
      workers.delete(worker);
      if (code === 0) resolve(directory);
      else reject(new Error(errors || `Source generation exited ${code}`));
    });
  });
}
async function retireGenerations() {
  for (const job of generations) {
    if (job !== delivery && job.done && job.readers === 0) {
      generations.delete(job);
      await rm(path.join(generated, String(job.version)), {
        recursive: true,
        force: true,
      });
    }
  }
}
async function readDelivery(relative) {
  for (;;) {
    if (stopping) throw new Error("Development server is stopping");
    const version = revision;
    if (delivery && !delivery.done && delivery.version !== version) {
      await delivery.promise.catch(() => {});
      continue;
    }
    if (!delivery || delivery.version !== version) {
      const job = { version, readers: 0, done: false, promise: null };
      job.promise = buildDelivery(version).finally(() => {
        job.done = true;
      });
      delivery = job;
      generations.add(job);
    }
    const job = delivery;
    job.readers++;
    try {
      const directory = await job.promise;
      if (version !== revision) continue;
      return await readFile(path.join(directory, relative));
    } catch (error) {
      if (delivery === job) delivery = undefined;
      throw error;
    } finally {
      job.readers--;
      await retireGenerations();
    }
  }
}

try {
  const proxy = {};
  for (const name of ["shadcn-admin", "ui-market"]) {
    const prefix = `${base}examples/${name}/`;
    const child = await createServer({
      root: path.join(root, "examples", name),
      base: prefix,
      configFile: path.join(root, "examples", name, "vite.config.ts"),
      server: {
        host: "127.0.0.1",
        port: 0,
        strictPort: true,
        open: false,
        ws: { clientPort: port, path: "__hmr" },
      },
    });
    servers.push(child);
    await child.listen();
    const address = child.httpServer.address();
    proxy[prefix] = { target: `http://127.0.0.1:${address.port}`, ws: true };
  }
  const server = await createServer({
    root,
    base,
    configFile: false,
    optimizeDeps: { entries: ["app.js", "preview.js", "component-preview.js"] },
    // The shell's React islands use automatic JSX without accepting HMR boundaries.
    oxc: { jsx: { runtime: "automatic" } },
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true,
      proxy,
      fs: { strict: true },
      watch: {
        ignored: [
          "**/output/**",
          "**/dist/**",
          "**/21st-submissions/**",
          "**/docs/ui/**",
        ],
      },
    },
    plugins: [
      catalogBrowserPlugin(root),
      {
        name: "atlas-development",
        transformIndexHtml: {
          order: "pre",
          handler(html, context) {
            if (context.filename === path.join(root, "index.html"))
              return html
                .replace(
                  '<link rel="stylesheet" href="./atlas-shell.css" />',
                  "",
                )
                .replace('src="./atlas-shell.js"', 'src="./app.js"');
          },
        },
        configureServer(main) {
          const changed = (file) => {
            const relative = path
              .relative(root, file)
              .split(path.sep)
              .join("/");
            if (
              /^(?:node_modules|dist|output|test-results|playwright-report|\.git|21st-submissions)\//.test(
                relative,
              ) ||
              /(?:^|\/)(?:node_modules|dist|\.git)\//.test(relative) ||
              relative.endsWith(".tsbuildinfo")
            )
              return;
            revision++;
            clearTimeout(sourceNotification);
            sourceNotification = setTimeout(
              () =>
                main.ws.send({
                  type: "custom",
                  event: "atlas:source-changed",
                  data: { revision },
                }),
              50,
            );
          };
          for (const watched of [...servers, main])
            watched.watcher
              .on("change", changed)
              .on("add", changed)
              .on("unlink", changed);
          main.middlewares.use(async (req, res, next) => {
            try {
              const url = new URL(req.url, "http://localhost");
              const pathname = decodeURIComponent(url.pathname);
              const relative = pathname.startsWith(base)
                ? pathname.slice(base.length)
                : pathname.replace(/^\//, "");
              if (
                relative
                  .split("/")
                  .some((part) => part === ".." || part.startsWith("."))
              )
                return next();
              const isDelivery =
                /^(?:code\/|downloads\/|details\/)/.test(relative) ||
                /^examples\/(?:ui-market|shadcn-admin)\/THIRD_PARTY_NOTICES\.md$/.test(
                  relative,
                );
              if (!isDelivery && !url.searchParams.has("atlas-source"))
                return next();
              // Raw source requests are restricted to public original-demo files.
              if (
                !isDelivery &&
                ![
                  "preview.js",
                  "preview.css",
                  "legacy-theme.js",
                  "components.js",
                  "components.css",
                ].includes(relative)
              ) {
                res.writeHead(404).end();
                return;
              }
              const content = isDelivery
                ? await readDelivery(relative)
                : await readFile(path.join(root, relative));
              res.writeHead(200, {
                "Content-Type": relative.endsWith(".zip")
                  ? "application/zip"
                  : relative.endsWith(".json")
                    ? "application/json"
                    : "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
              });
              res.end(content);
            } catch (error) {
              res.writeHead(error.code === "ENOENT" ? 404 : 500, {
                "Content-Type": "text/plain",
              });
              res.end(error.message);
            }
          });
        },
        handleHotUpdate(context) {
          if (
            !context.file.includes(`${path.sep}examples${path.sep}`) &&
            /\.(?:[cm]?[jt]sx?|json|html)$/.test(context.file)
          ) {
            context.server.ws.send({ type: "full-reload", path: "*" });
            return [];
          }
        },
      },
    ],
  });
  servers.push(server);
  await server.listen();
  console.log(`Atlas development: http://127.0.0.1:${port}${base}`);
} catch (error) {
  console.error(error);
  await close();
  process.exitCode = 1;
}

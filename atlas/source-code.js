// @ts-check
import { element, maybe, all } from "./dom.js";
import { replaceShellHTML } from "../shell/controls.tsx";
import { componentDocument, escapeHTML as esc } from "../components.js";
import { icon } from "../icons.js";
import { libraries } from "../catalog.js";

/** @param {Pick<import("./types").BaseDependencies,"appState"|"t"|"l"> & {external:(url:string,label:string)=>string}} dependencies */
export function createSourceCode({ appState, t, l, external }) {
  let codeLoadSerial = 0;

  /** @type {Map<string,Promise<import("./types").SourceManifest>>} */
  const previewCache = new Map();
  if (import.meta.hot)
    import.meta.hot.on("atlas:source-changed", () => {
      previewCache.clear();
      if (appState.selected && appState.tab === "code")
        void loadCode(appState.selected);
    });

  /** @param {import("./types").Resource} r */
  async function loadCode(r, scope = "resource") {
    const target = maybe("#full-code");
    if (!target) return;
    const request = ++codeLoadSerial;
    const language = appState.locale;
    const active = () =>
      request === codeLoadSerial &&
      appState.selected?.id === r.id &&
      appState.selected?.type === r.type &&
      appState.tab === "code" &&
      target.isConnected &&
      language === appState.locale;
    replaceShellHTML(
      target,
      `<p role="status">${t("正在读取源码…", "Loading source…")}</p>`,
    );
    try {
      /** @type {Record<string,string>} */
      let files;
      /** @type {import("./types").SourceManifest|undefined} */
      let manifest;
      const project =
        r.sourceId === "shadcn-admin" ? "shadcn-admin" : "ui-market";
      if (r.sourceId === "original") {
        files =
          r.type === "component"
            ? {
                [r.id + ".html"]: await componentDocument(
                  { ...r, name: l(r.name) },
                  appState.locale,
                ),
              }
            : {};
        for (const f of r.files || []) {
          const res = await fetch("./" + f + "?atlas-source");
          if (!res.ok) throw Error(f);
          files[f] = await res.text();
        }
      } else {
        const url =
          scope === "project"
            ? `./code/${project}.json`
            : `./code/resources/${r.type}-${r.id}.json`;
        if (!previewCache.has(url))
          previewCache.set(
            url,
            fetch(url)
              .then(async (res) => {
                if (!res.ok) throw Error(String(res.status));
                return res.json();
              })
              .catch((error) => {
                previewCache.delete(url);
                throw error;
              }),
          );
        manifest = await previewCache.get(url);
        if (!manifest) throw new Error("Missing source manifest");
        files = manifest.files;
      }
      if (!active()) return;
      appState.currentFiles = files;
      const first =
        r.sourceId === "original" && r.type === "component"
          ? r.id + ".html"
          : r.files?.find((f) => files[f]) ||
            manifest?.entryFiles?.[0] ||
            Object.keys(files)[0];
      const options = [
        ...new Set([
          first,
          ...(r.files || []),
          ...(r.supportFiles || []),
          ...Object.keys(files),
        ]),
      ].filter((f) => f in files);
      const instructions = manifest?.instructions
        ? `<details class="code-integration"><summary>${t("接入说明与安装命令", "Integration & installation")}</summary>${manifest.instructions[appState.locale].map((line) => `<p>${esc(line)}</p>`).join("")}<pre class="code-text">${esc(manifest.install)}</pre><button class="button" data-copy-install>${icon("copy")}${t("复制安装命令", "Copy install commands")}</button></details>`
        : `<p>${r.sourceId === "original" ? t("原创组件的 HTML 文件可直接打开；其他文件保留原站点的实现与样式上下文。", "Original component HTML files can be opened directly; other files retain the original site implementation and style context.") : t("完整项目包含所有资源。下载完整项目 ZIP 后运行 npm ci、npm run dev；构建使用 npm run build。", "The full project contains all resources. Extract the full project ZIP, then run npm ci and npm run dev; build with npm run build.")}</p>`;
      replaceShellHTML(
        target,
        `<section class="detail-section"><div class="code-scope-heading"><h2>${t(scope === "project" ? "完整项目源码" : "当前资源源码", scope === "project" ? "Full project source" : "Resource source")}</h2><span>${options.length} ${t("个文件", "files")}</span></div>${instructions}<select data-shell-control id="code-file" aria-label="${t("源文件", "Source file")}">${options.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}</select><div class="button-row code-actions"><button class="button primary" data-copy-code>${t("复制当前文件", "Copy file")}</button><button class="button" data-download-code>${t("下载当前文件", "Download file")}</button>${r.sourceId !== "original" ? `<a class="button" href="./downloads/resources/${r.type}-${r.id}.zip" download>${t("下载资源文件包", "Download resource files")} ZIP</a><a class="button" href="./downloads/${project}.zip" download>${t("下载可运行项目", "Download project")} ZIP</a><button class="button" data-code-scope="${scope === "project" ? "resource" : "project"}">${t(scope === "project" ? "返回资源源码" : "查看完整项目源码", scope === "project" ? "Back to resource source" : "View full project source")}</button>` : ""}</div><pre id="code-text" class="code-text">${esc(files[first])}</pre></section>`,
      );
      for (const id of r.libraryIds) {
        const lib = libraries[id];
        element(".detail-section", target).insertAdjacentHTML(
          "afterbegin",
          `<p class="dependency-note">${external(lib.docs, lib.name)} <code>${esc(r.libraryVersions?.[id] || lib.version)}</code></p>`,
        );
      }
      return true;
    } catch {
      if (active())
        replaceShellHTML(
          target,
          `<p role="alert">${t("源码读取失败，请重试。", "Source could not be loaded.")}</p><button class="button" data-code-scope="${scope}">${t("重试", "Retry")}</button>`,
        );
    }
  }
  return { loadCode };
}

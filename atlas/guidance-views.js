// @ts-check
import {
  guidance,
  tools,
  guidanceKinds,
  toolKinds,
  purposes,
  findGuidance,
  findTool,
} from "../guidance-catalog.js";
import { resources } from "../catalog.js";
import { icon } from "../icons.js";
import { searchContent, contentEntries } from "./content-search.js";
import { contentCard } from "./content-cards.js";
import { escapeHTML as esc } from "./html.js";
import { loadGuidanceDetail } from "./guidance-data.js";
import {
  createInputScheduler,
  isComposing,
  beginComposition,
  endComposition,
} from "./input.js";
import {
  replaceShellHTML,
  browseScroll,
  scrollBrowseTo,
} from "../shell/controls.tsx";
import { parse } from "./navigation.js";
/** @param {import('./types').BaseDependencies & {copy:(text:string)=>Promise<void>;download:(text:string,name:string)=>void;notify:(text:string)=>void}} deps */
export function createGuidanceViews(deps) {
  const { appState, t, l, href, copy, download, notify } = deps;
  let active = new AbortController();
  /** @type {HTMLElement|null} */ let root = null;
  let lastGuidance = "#guidance",
    lastTools = "#tools";
  /** @type {ReturnType<typeof import("./composer-view.js").createComposer>|undefined} */ let composer;
  const scheduler = createInputScheduler(() => updateList());
  /** @type {import('./guidance-types').GuidanceDetail|undefined} */ let detail;
  /** @type {import('./guidance-types').Guidance|undefined} */ let chosen;
  function dispose() {
    scheduler.cancel();
    active.abort();
    composer?.dispose();
    composer = undefined;
    root = null;
    detail = undefined;
    chosen = undefined;
  }
  const button = (/** @type {string} */ key) =>
    `<button type="button" class="icon-button asset-save${appState.favorites.has(key) ? " saved" : ""}" data-save="${key}" aria-pressed="${appState.favorites.has(key)}" aria-label="${t("收藏", "Save")}">☆</button>`;
  const listURL = (/** @type {string} */ value) => {
    const [path, query = ""] = value.split("?");
    const params = new URLSearchParams(query);
    params.set("lang", appState.locale);
    return path + "?" + params;
  };
  const empty = () =>
    `<div class="market-empty"><h2 tabindex="-1">${t("没有匹配的内容", "No matching content")}</h2><p>${t("换个关键词，或清空筛选。", "Try another query or clear the filters.")}</p></div>`;
  /** @param {string} name @param {Record<string,string[]>} labels */
  function filterButtons(name, labels) {
    const value = appState.route.params.get(name) || "";
    return `<input type="hidden" name="${name}" value="${esc(value)}">${Object.entries(
      labels,
    )
      .map(
        ([id, label]) =>
          `<button type="button" data-content-filter="${name}" data-value="${id}" aria-pressed="${value === id}" class="${value === id ? "active" : ""}">${t(label[0], label[1])}<span data-filter-count></span></button>`,
      )
      .join("")}`;
  }
  function list() {
    if (!root) return;
    const tool = appState.route.view === "tools",
      p = appState.route.params;
    replaceShellHTML(
      root,
      `<section class="guidance-intro content-intro"><h1>${tool ? t("资源导航", "Resource directory") : t("设计指导", "Design guidance")}</h1><a class="button primary" href="${href("compose")}">${t("组合提示词", "Compose a prompt")} ↗</a></section><form id="content-filters" class="guidance-filters"><div class="catalog-toolbar"><div class="market-tabs content-types" role="group" aria-label="${t("类型", "Type")}">${filterButtons("kind", { "": ["全部类型", "All types"], ...(tool ? toolKinds : guidanceKinds) })}</div><label class="market-search">${icon("search")}<input type="search" name="q" aria-label="${t("搜索", "Search")}" value="${esc(p.get("q") || "")}" placeholder="${tool ? t("搜索组件库、规范、资料…", "Search libraries, specs, resources…") : t("搜索提示词、动效、排版…", "Search prompts, motion, typography…")}"><button type="submit" class="icon-button" aria-label="${t("搜索", "Search")}">${icon("arrow-right")}</button></label></div>${tool ? "" : `<fieldset class="category-facet"><legend class="sr-only">${t("用途", "Purpose")}</legend><div class="category-strip">${filterButtons("purpose", { "": ["全部用途", "All purposes"], ...purposes })}</div></fieldset>`}</form><p class="guidance-result-count" role="status"></p><div class="guidance-grid" data-content-results></div>`,
    );
    updateList(false);
  }
  /** @param {boolean} [updateURL] @param {boolean} [push] */
  function updateList(updateURL = true, push = false) {
    if (!root) return;
    const form = root.querySelector("#content-filters");
    if (!(form instanceof HTMLFormElement)) return;
    const params = new URLSearchParams({ lang: appState.locale });
    for (const [key, value] of new FormData(form))
      if (String(value).trim()) params.set(key, String(value).trim());
    if (updateURL) {
      const url = href(appState.route.view, "", Object.fromEntries(params));
      if (url !== location.hash)
        history[push ? "pushState" : "replaceState"](
          {
            ...history.state,
            browse: { hash: url, scroll: browseScroll(), limit: 24 },
          },
          "",
          url,
        );
      appState.route = parse();
    }
    const tool = appState.route.view === "tools",
      pool = searchContent(
        params.get("q") || "",
        contentEntries.filter((r) => r.domain === (tool ? "tool" : "guidance")),
      );
    const kind = params.get("kind"),
      purpose = params.get("purpose");
    const matches = (
      /** @type {typeof pool[number]} */ r,
      /** @type {string} */ omit = "",
    ) => {
      const item = r.item;
      return (
        !("preview" in item) &&
        (omit === "kind" || !kind || kind === item.kind) &&
        (omit === "purpose" ||
          !purpose ||
          ("purposes" in item &&
            item.purposes.includes(
              /** @type {import('./guidance-types').Purpose} */ (purpose),
            )))
      );
    };
    const items = pool.filter((r) => matches(r));
    const target = root.querySelector("[data-content-results]");
    if (target instanceof HTMLElement)
      replaceShellHTML(
        target,
        items.length
          ? items
              .map((r) =>
                "preview" in r.item ? "" : contentCard(r.item, deps),
              )
              .join("")
          : empty(),
      );
    const count = root.querySelector(".guidance-result-count");
    if (count) count.textContent = items.length + " " + t("项内容", "items");
    for (const button of form.querySelectorAll("[data-content-filter]")) {
      if (!(button instanceof HTMLButtonElement)) continue;
      const name = button.dataset.contentFilter || "",
        value = button.dataset.value || "",
        selected = (params.get(name) || "") === value;
      const n = pool.filter(
        (r) =>
          matches(r, name) &&
          (!value ||
            (name === "kind" && "kind" in r.item && r.item.kind === value) ||
            (name === "purpose" &&
              "purposes" in r.item &&
              r.item.purposes.includes(
                /** @type {import('./guidance-types').Purpose} */ (value),
              ))),
      ).length;
      button.disabled = !!value && !n && !selected;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("active", selected);
      const count = button.querySelector("[data-filter-count]");
      if (count) count.textContent = String(n);
    }
    if (tool) lastTools = location.hash;
    else lastGuidance = location.hash;
  }
  /** @param {import('./guidance-types').Tool} item */
  function toolDetail(item) {
    if (!root) return;
    const linked = guidance.filter((g) => g.toolId === item.id);
    replaceShellHTML(
      root,
      `<article class="guidance-reader"><a class="text-link" href="${esc(listURL(lastTools))}">← ${t("返回资源导航", "Back to directory")}</a><header><div class="guidance-card-heading"><span class="guidance-kind">${t(.../** @type {[string,string]} */ (toolKinds[item.kind]))}</span>${button("tool:" + item.id)}</div><h1>${esc(l(item.name))}</h1><p class="guidance-lead">${esc(l(item.description))}</p><div class="guidance-tags">${item.technologies.map((x) => `<span>${esc(x)}</span>`).join("")}</div><a class="button" href="${esc(item.repo)}" target="_blank" rel="noopener noreferrer">${t("打开原始仓库", "Open repository")} ↗</a></header><section><h2>${t("相关指导", "Related guidance")}</h2><div class="guidance-grid">${linked.length ? linked.map((g) => contentCard(g, deps)).join("") : `<p>${t("尚未逐项收录，使用原始仓库查看文档与内容。", "Individual entries have not been curated yet. Read the repository for documentation and content.")}</p>`}</div></section>${item.id === "ant-design" ? `<a class="text-link" href="${href("explore", "", { library: "antd" })}">${t("查看图鉴中的相关界面", "Explore related interfaces")} ↗</a>` : ""}</article>`,
    );
  }
  /** @param {import('./guidance-types').Guidance} item */
  async function guidanceDetail(item) {
    const signal = active.signal,
      container = root,
      locale = appState.locale;
    if (!container) return;
    replaceShellHTML(
      container,
      `<div class="guidance-reader" role="status">${t("正在读取指导…", "Loading guidance…")}</div>`,
    );
    try {
      const [data, { renderGuidanceMarkdown }] = await Promise.all([
        loadGuidanceDetail(item.id),
        import("./guidance-markdown.js"),
      ]);
      if (signal.aborted || root !== container || locale !== appState.locale)
        return;
      detail = data;
      chosen = item;
      const source = data.source;
      const related = resources.filter((r) =>
        item.related.includes(`${r.type}:${r.id}`),
      );
      const checks = l(data.checks) || [];
      let checked = /** @type {string[]} */ ([]);
      try {
        const value = JSON.parse(
          localStorage.getItem("atlas-checks-" + item.id) || "[]",
        );
        if (Array.isArray(value))
          checked = value.filter((x) => typeof x === "string");
      } catch {}
      replaceShellHTML(
        container,
        `<article class="guidance-reader"><a class="text-link" href="${esc(listURL(lastGuidance))}">← ${t("返回设计指导", "Back to guidance")}</a><header><div class="guidance-card-heading"><span class="guidance-kind">${t(.../** @type {[string,string]} */ (guidanceKinds[item.kind]))}</span>${button("guidance:" + item.id)}</div><h1>${esc(l(item.name))}</h1><p class="guidance-lead">${esc(l(item.description))}</p><div class="guidance-status"><span>${item.checked ? t("内容已核对", "Content checked") : t("内容待核对", "Content not checked")}</span><span>${t("AI 生成效果尚未验证", "AI outcome unverified")}</span></div><div class="button-row"><button type="button" class="button primary" data-guidance-copy="body">${t("复制内容", "Copy content")}</button><button type="button" class="button" data-guidance-download>${t("导出 Markdown", "Export Markdown")}</button><a class="button" href="./downloads/guidance/${item.id}.zip" download>${t("下载完整文件包", "Download complete bundle")}</a><a class="button" href="${href("compose", "", { [item.kind === "prompt" ? "template" : item.kind === "design" ? "design" : item.kind === "skill" ? "skill" : "check"]: item.id })}">${t("加入提示词组合", "Use in a prompt")}</a></div></header><section class="guidance-reading">${renderGuidanceMarkdown(l(data.body))}</section>${
          item.kind === "prompt" && l(data.body).includes("{{requirements}}")
            ? `<section class="guidance-template-fields"><h2>${t("填写后复制", "Fill and copy")}</h2><label>${t("项目需求", "Project requirements")}<textarea name="requirements" data-template-value="requirements" rows="3"></textarea></label>${[
                "audience",
                "technology",
                "direction",
              ]
                .map(
                  (name, i) =>
                    `<label>${t(
                      .../** @type {[string,string]} */ (
                        [
                          ["目标用户", "Audience"],
                          ["技术约束", "Technology constraints"],
                          ["视觉方向", "Visual direction"],
                        ][i]
                      ),
                    )}<input data-template-value="${name}"></label>`,
                )
                .join(
                  "",
                )}<button class="button" type="button" data-guidance-filled>${t("复制填写后的提示词", "Copy filled prompt")}</button></section>`
            : ""
        }${data.original ? `<details class="guidance-original"><summary>${t("用户原句与整理说明", "Original wording (translated) and editorial note")}</summary><p>${esc(l(data.original))}</p><button type="button" class="button" data-guidance-copy="original">${t("复制原句", "Copy original wording")}</button><p>${t("上方版本补充了适用条件与实际验收要求；原句本身不构成效果保证。", "The version above adds context and actionable acceptance criteria. The original sentence is not a guarantee of results.")}</p></details>` : ""}${item.kind === "design" ? `<section><h2>${t("视觉规则摘要 · 本站整理", "Visual notes · Atlas editorial")}</h2><div class="guidance-palette">${item.palette.map((color) => `<span style="--swatch:${color}" title="${color}"></span><code>${color}</code>`).join("")}</div><p>${esc(l(item.typography))}</p><p>${t("第三方分析，不是品牌官方规范。", "Third-party analysis, not an official brand specification.")}</p></section>` : ""}${checks.length ? `<section><h2>${t("检查清单", "Checklist")}</h2><p>${t("勾选记录个人进度，不代表真实生成效果已经验证。", "Checks record personal progress, not verified generation outcomes.")}</p><div class="guidance-checks">${checks.map((text, i) => `<label><input type="checkbox" data-check-progress="${i}" ${checked.includes(String(i)) ? "checked" : ""}>${esc(text)}</label>`).join("")}</div><button class="button" data-guidance-copy="checks">${t("复制审核要求", "Copy review requirements")}</button></section>` : ""}<section><h2>${t("使用方式", "How to use")}</h2><p>${esc(l(data.usage))}</p>${item.kind === "skill" ? `<p>${t("普通对话可使用本站任务要点；完整 Skill 用于支持读取项目文件的编程助手。解压文件包后明确要求助手读取入口文件，并保留配套文件。", "Ordinary chat can use the Atlas task notes. The complete skill is for coding assistants that read project files. Extract the bundle and explicitly ask the assistant to read its entry, retaining supporting files.")}</p><pre>${esc(data.entry || "")}</pre><button class="button" data-guidance-copy="task">${t("复制普通对话任务要点", "Copy chat task notes")}</button>` : ""}</section>${
          source
            ? `<section class="guidance-provenance"><h2>${t("原始文件与来源", "Original files & provenance")}</h2><p>${esc(source.author)} · ${esc(source.license)} · <code>${source.commit.slice(0, 12)}</code></p><a class="text-link" href="https://github.com/${esc(source.repo)}/tree/${source.commit}" target="_blank" rel="noopener noreferrer">${t("查看固定版本", "View pinned version")} ↗</a><p>${t("以下原文保留上游语言；本站中文摘要与原文分开展示。", "The files below retain the upstream language. Atlas summaries are separate from the originals.")}</p>${Object.entries(
                data.files,
              )
                .map(
                  ([name, text]) =>
                    `<details class="guidance-source"><summary>${esc(name)}</summary><pre>${esc(text)}</pre><button class="button" data-guidance-file="${esc(name)}">${t("复制原始文件", "Copy original file")}</button></details>`,
                )
                .join("")}</section>`
            : ""
        }<section><h2>${t("关联界面", "Related interfaces")}</h2><div class="guidance-related">${related.map((r) => `<a href="${href(r.type, r.id)}" data-open="${r.type}:${r.id}"><img src="${r.cover}" alt="" loading="lazy"><strong>${esc(l(r.name))}</strong></a>`).join("")}</div></section></article>`,
      );
    } catch {
      if (signal.aborted || root !== container) return;
      replaceShellHTML(
        container,
        `<div class="market-empty"><h1>${t("指导读取失败", "Could not load guidance")}</h1><p>${t("可以重试，已保存的收藏不受影响。", "Retry to load the content. Saved items are preserved.")}</p><button type="button" class="button" data-guidance-retry>${t("重试", "Retry")}</button></div>`,
      );
    }
  }
  /** @param {HTMLElement} target */
  async function mount(target) {
    dispose();
    root = target;
    active = new AbortController();
    const { signal } = active;
    const route = appState.route;
    root.classList.add("has-guidance");
    if (route.view === "compose") {
      const { createComposer } = await import("./composer-view.js");
      if (signal.aborted) return;
      composer = createComposer({ ...deps, root, signal });
      await composer.mount();
    } else if (route.id) {
      const item =
        route.view === "tools" ? findTool(route.id) : findGuidance(route.id);
      if (!item)
        replaceShellHTML(
          root,
          `<div class="market-empty"><h1>${t("内容不存在", "Content not found")}</h1><a href="${href(route.view)}">${t("返回列表", "Back to list")}</a></div>`,
        );
      else if ("repo" in item) toolDetail(item);
      else void guidanceDetail(item);
    } else list();
    if (signal.aborted) return;
    root.addEventListener(
      "compositionstart",
      (e) => {
        beginComposition(e);
        scheduler.cancel();
      },
      { signal },
    );
    root.addEventListener(
      "compositionend",
      (e) => {
        endComposition(e);
        if (
          e.target instanceof HTMLInputElement &&
          e.target.closest("#content-filters")
        )
          scheduler.schedule();
      },
      { signal },
    );
    root.addEventListener(
      "input",
      (e) => {
        if (
          e.target instanceof HTMLInputElement &&
          e.target.closest("#content-filters") &&
          !isComposing(e)
        )
          scheduler.schedule();
      },
      { signal },
    );
    root.addEventListener(
      "change",
      (e) => {
        if (
          e.target instanceof HTMLInputElement &&
          e.target.hasAttribute("data-check-progress") &&
          chosen &&
          root
        ) {
          try {
            localStorage.setItem(
              "atlas-checks-" + chosen.id,
              JSON.stringify(
                [
                  ...root.querySelectorAll(
                    "input[data-check-progress]:checked",
                  ),
                ].map((el) => el.getAttribute("data-check-progress")),
              ),
            );
          } catch {
            notify(
              t(
                "进度未保存，仍可继续使用。",
                "Progress was not saved. You can continue.",
              ),
            );
          }
        }
      },
      { signal },
    );
    root.addEventListener(
      "submit",
      (e) => {
        if (
          e.target instanceof HTMLFormElement &&
          e.target.id === "content-filters"
        ) {
          e.preventDefault();
          const field = e.target.querySelector("[name=q]");
          if (field && isComposing({ target: field })) return;
          scheduler.cancel();
          updateList(true, true);
        }
      },
      { signal },
    );
    root.addEventListener(
      "click",
      async (e) => {
        if (!(e.target instanceof Element)) return;
        if (e.target.closest("a")) scheduler.flush();
        const b = e.target.closest("button");
        if (!b) return;
        if (b.hasAttribute("data-content-filter")) {
          const name = b.dataset.contentFilter;
          if (name !== "kind" && name !== "purpose") return;
          const field = root?.querySelector(`#content-filters [name=${name}]`);
          if (field instanceof HTMLInputElement) {
            field.value = b.dataset.value || "";
            scheduler.cancel();
            updateList(true, true);
          }
          return;
        }
        if (b.hasAttribute("data-guidance-retry")) {
          const item = findGuidance(appState.route.id || "");
          if (item) void guidanceDetail(item);
          return;
        }
        if (!detail || !chosen) return;
        if (b.dataset.guidanceCopy) {
          const value = b.dataset.guidanceCopy;
          return copy(
            value === "checks"
              ? (l(detail.checks) || []).map((x) => "- " + x).join("\n")
              : l(
                  value === "original" && detail.original
                    ? detail.original
                    : value === "task"
                      ? detail.task
                      : detail.body,
                ),
          );
        }
        if (b.dataset.guidanceFile)
          return copy(detail.files[b.dataset.guidanceFile]);
        if (b.hasAttribute("data-guidance-download"))
          return download(
            l(detail.body) +
              (detail.checks
                ? "\n\n" +
                  l(detail.checks)
                    .map((x) => "- " + x)
                    .join("\n")
                : "") +
              "\n\n" +
              t(
                "本站整理。生成效果尚未验证。",
                "Atlas editorial. Generation outcome unverified.",
              ),
            chosen.id + ".md",
          );
        if (b.hasAttribute("data-guidance-filled") && root) {
          /** @type {Record<string,string>} */ const values = {};
          for (const field of root.querySelectorAll("[data-template-value]"))
            if (
              field instanceof HTMLInputElement ||
              field instanceof HTMLTextAreaElement
            )
              values[field.dataset.templateValue || ""] = field.value.trim();
          if (!values.requirements) {
            notify(
              t("请先填写项目需求。", "Enter project requirements first."),
            );
            root.querySelector("textarea")?.focus();
            return;
          }
          const { fillTemplate } = await import("./composer-model.js");
          if (!signal.aborted && detail)
            return copy(fillTemplate(l(detail.body), values));
        }
      },
      { signal },
    );
    document.title =
      t(
        route.view === "tools"
          ? "资源导航"
          : route.view === "compose"
            ? "提示词组合器"
            : "设计指导",
        route.view === "tools"
          ? "Directory"
          : route.view === "compose"
            ? "Prompt composer"
            : "Design guidance",
      ) + " · UI Design Atlas";
    const browse = history.state?.browse;
    if (browse && !route.id)
      requestAnimationFrame(() => {
        if (!signal.aborted) scrollBrowseTo(browse.scroll || 0);
      });
  }
  return { mount, dispose, flush: () => scheduler.flush() };
}

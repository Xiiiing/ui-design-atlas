import { icon } from "./icons.js";
import {
  resources,
  findResource,
  resourcePreview,
  resourcePrompt,
  resourceSource,
  resourceSearch,
  sourceProjects,
  libraries,
  getCase,
  getPage,
  localized,
} from "./catalog.js";
import { componentDocument, escapeHTML as esc } from "./components.js";
const main = document.querySelector("#main");
let locale = localStorage.getItem("atlas-language") === "en" ? "en" : "zh-CN";
let favorites;
try {
  favorites = new Set(
    JSON.parse(localStorage.getItem("design-atlas-favorites") || "[]").filter(
      validFavorite,
    ),
  );
} catch {
  favorites = new Set();
}
let route,
  selected,
  detailResource,
  tab = "notes",
  theme = "light",
  width = 0,
  fit = true,
  limit = 24,
  toastTimer;
let originBrowse = null,
  currentFiles = {},
  previewCache = new Map();
const t = (zh, en) => (locale === "en" ? en : zh);
const l = (v) => (v && typeof v === "object" ? v[locale] : v);
const key = (r) => `${r.type}:${r.id}`;
const types = {
  component: ["组件", "Component"],
  block: ["区块", "Block"],
  page: ["页面", "Page"],
  case: ["完整案例", "System"],
};
const categories = {
  buttons: ["按钮", "Buttons"],
  text: ["文字", "Text"],
  backgrounds: ["背景", "Backgrounds"],
  cards: ["卡片", "Cards"],
  navigation: ["导航", "Navigation"],
  forms: ["表单", "Forms"],
  data: ["数据展示", "Data"],
  loading: ["加载", "Loading"],
  feedback: ["反馈", "Feedback"],
  layout: ["布局", "Layout"],
};
const interactions = {
  hover: ["悬停", "Hover"],
  click: ["点击", "Click"],
  scroll: ["滚动", "Scroll"],
  auto: ["自动播放", "Autoplay"],
  input: ["输入", "Input"],
};
const href = (view = "explore", id = "", params = {}) =>
  "#" +
  view +
  (id ? "/" + id : "") +
  "?" +
  new URLSearchParams({ lang: locale, ...params });
const labelType = (r) => t(...types[r.type]);
const external = (url, label) =>
  `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${icon("arrow-up-right")}</a>`;
function validFavorite(k) {
  if (typeof k !== "string") return false;
  const [type, id] = k.split(":");
  return !!findResource(id, type);
}
function parse() {
  const [path, q = ""] = location.hash.slice(1).split("?");
  const [view = "explore", id] = path.split("/");
  return { view: view || "explore", id, params: new URLSearchParams(q) };
}
function saveButton(r) {
  return `<button class="icon-button asset-save ${favorites.has(key(r)) ? "saved" : ""}" data-save="${key(r)}" aria-pressed="${favorites.has(key(r))}" aria-label="${t("收藏", "Save")} ${esc(l(r.name))}">${icon("bookmark")}</button>`;
}
function language(viewer = false) {
  return `<select data-locale id="${viewer ? "locale" : "site-locale"}" aria-label="${t("语言", "Language")}"><option value="zh-CN" ${locale === "zh-CN" ? "selected" : ""}>中文</option><option value="en" ${locale === "en" ? "selected" : ""}>EN</option></select>`;
}
function header() {
  document.documentElement.lang = locale;
  document.querySelector("#sidebar").innerHTML = "";
  document.querySelector("#topbar").innerHTML =
    `<div class="market-header"><a class="brand" href="${href()}">${icon("layers")}<span>atlas<span class="brand-dot">.</span></span></a><nav aria-label="${t("主导航", "Main navigation")}"><a href="${href()}" class="${route.view === "explore" ? "active" : ""}">${t("探索 UI", "Explore UI")}</a><a href="${href("cases")}" class="${route.view === "cases" ? "active" : ""}">${t("完整案例", "Systems")}</a><a href="${href("favorites")}" class="${route.view === "favorites" ? "active" : ""}">${t("我的收藏", "Saved")}<span>${favorites.size || ""}</span></a></nav><div class="market-header-actions"><button class="icon-button" data-search aria-label="${t("搜索设计", "Search designs")}">${icon("search")}</button>${language()}${external("https://github.com/Xiiiing/ui-design-atlas", "GitHub")}</div></div>`;
  document.querySelector("#footer").innerHTML =
    `<div class="market-footer"><a class="brand" href="${href()}">atlas.</a><span>${t("找到喜欢的界面，把设计与代码一起带走。", "Find an interface. Take its ideas and code.")}</span><a href="${href("resources")}">${t("来源与许可", "Sources & licenses")}</a><a href="${href("guide")}">${t("使用指南", "How to reuse")}</a></div>`;
  document.querySelector("#copy-title").textContent = t(
    "复制内容",
    "Copy content",
  );
  document.querySelector("#copy-help").textContent = t(
    "请选择并复制下方内容。",
    "Select and copy the text below.",
  );
  document.querySelector("#quick-search").placeholder = t(
    "搜索流光边框、表格、Fluent…",
    "Search a UI, effect or library…",
  );
}
function card(r) {
  return `<article class="asset-card card" data-resource="${key(r)}"><div class="asset-preview" style="--canvas-width:${r.preview.width}px;--canvas-height:${r.preview.height}px"><img src="${esc(r.cover)}" alt="${esc(l(r.name))}" loading="lazy" width="640" height="420"><div class="asset-live" data-live="${key(r)}"></div><a class="asset-cover-link" data-open="${key(r)}" href="${href(r.type, r.id)}" aria-label="${t("查看", "View")} ${esc(l(r.name))}"></a>${saveButton(r)}<a class="asset-open" href="${href(r.type, r.id)}" data-open="${key(r)}" aria-label="${t("查看", "View")} ${esc(l(r.name))}">${icon("arrow-up-right")}</a>${r.motion ? `<span class="motion-badge">${icon("play")}${t("动效", "Motion")}</span>` : ""}</div><div class="asset-caption"><a data-open="${key(r)}" href="${href(r.type, r.id)}">${esc(l(r.name))}</a><span class="asset-type">${labelType(r)}</span><p>${esc(l(r.description))}</p><div class="asset-meta"><span>${r.libraryIds.map((id) => esc(libraries[id].name)).join(" · ")}</span><span>${r.sourceId === "original" ? t("本站原创", "Original") : esc(resourceSource(r).name)}</span></div></div></article>`;
}
function selectFilter(name, label, entries) {
  return `<label><span class="sr-only">${label}</span><select name="${name}" aria-label="${label}"><option value="all">${label}</option>${entries.map(([v, label]) => `<option value="${v}">${esc(label)}</option>`).join("")}</select></label>`;
}
const viewModes = {
  explore: ["全部", "All"],
  motion: ["动效", "Motion"],
  components: ["组件", "Components"],
  blocks: ["区块", "Blocks"],
  pages: ["页面", "Pages"],
  cases: ["完整案例", "Systems"],
};
function listing() {
  const favorite = route.view === "favorites";
  return `<section class="market-intro"><div><p class="eyebrow">A LIBRARY OF LITTLE POSSIBILITIES</p><h1>${favorite ? t("留住灵感，随时复用。", "Good finds. Kept close.") : t("下一个好界面，从这里开始。", "Your next interface starts here.")}</h1><p>${t("一个动效，一个组件，或一整套系统。先体验，再带走提示词与代码。", "An effect, a component, or an entire system. Try it. Take the prompt and code.")}</p></div>${favorite ? `<div class="button-row"><button class="button" data-export-favorites>${t("导出收藏", "Export saved")}</button><label class="button">${t("导入收藏", "Import saved")}<input type="file" hidden id="import-favorites" accept=".json"></label></div>` : `<span class="resource-total"><b>${resources.length}</b>${t("个可体验的 UI", "interfaces to explore")}</span>`}</section><section class="market-collection" id="collection"><div class="market-tabs">${Object.entries(
    viewModes,
  )
    .map(
      ([v, labels]) =>
        `<a href="${href(v)}" class="${route.view === v ? "active" : ""}" ${route.view === v ? 'aria-current="page"' : ""}>${t(...labels)}${v === "motion" ? `<span>${resources.filter((r) => r.motion).length}</span>` : ""}</a>`,
    )
    .join(
      "",
    )}</div><form id="filters" class="market-filters"><label class="market-search">${icon("search")}<input name="q" type="search" aria-label="${t("搜索 UI", "Search UI")}" placeholder="${t("找一个按钮、悬停效果、表格…", "Find a button, hover effect, table…")}" value="${esc(route.params.get("q") || "")}"><kbd>/</kbd></label>${selectFilter(
    "category",
    t("全部分类", "All categories"),
    Object.entries(categories).map(([id, labels]) => [id, t(...labels)]),
  )}${selectFilter(
    "library",
    t("全部组件库", "All libraries"),
    Object.values(libraries).map((x) => [x.id, x.name]),
  )}${selectFilter(
    "interaction",
    t("交互方式", "Interaction"),
    Object.entries(interactions).map(([id, labels]) => [id, t(...labels)]),
  )}${selectFilter("style", t("视觉风格", "Visual style"), [...new Map(resources.map((r) => [r.styleId, l(r.style)])).entries()])}${selectFilter(
    "source",
    t("全部来源", "All sources"),
    [
      ["open-source", t("开源收录", "Open source")],
      ["original", t("本站原创", "Original")],
    ],
  )}${selectFilter("audience", t("全部场景", "All audiences"), [
    ["b2b", t("B 端 / 工作工具", "B2B / Work tools")],
    ["b2c", t("C 端 / 网站", "B2C / Websites")],
  ])}<button type="button" class="icon-button" data-reset-filters aria-label="${t("重置筛选", "Reset filters")}">${icon("rotate-ccw")}</button></form><div id="results" aria-live="polite"></div></section>`;
}
function filtered() {
  const values = document.querySelector("#filters")
    ? Object.fromEntries(new FormData(document.querySelector("#filters")))
    : Object.fromEntries(route.params);
  const words = (values.q || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const mode = route.view === "favorites" ? "explore" : route.view;
  return resources.filter((r) => {
    if (route.view === "favorites" && !favorites.has(key(r))) return false;
    if (mode === "motion" && !r.motion) return false;
    const type = {
      components: "component",
      blocks: "block",
      pages: "page",
      cases: "case",
    }[mode];
    if (type && r.type !== type) return false;
    if (
      values.category &&
      values.category !== "all" &&
      r.category !== values.category
    )
      return false;
    if (
      values.library &&
      values.library !== "all" &&
      !r.libraryIds.includes(values.library)
    )
      return false;
    if (
      values.interaction &&
      values.interaction !== "all" &&
      !r.interactions.includes(values.interaction)
    )
      return false;
    if (values.style && values.style !== "all" && r.styleId !== values.style)
      return false;
    if (
      values.audience &&
      values.audience !== "all" &&
      r.audience !== values.audience
    )
      return false;
    if (
      values.source &&
      values.source !== "all" &&
      (values.source === "original") !== (r.sourceId === "original")
    )
      return false;
    return words.every((word) => resourceSearch(r).includes(word));
  });
}
function updateResults(updateURL = false) {
  if (!document.querySelector("#results")) return;
  stopAllLive();
  const items = filtered();
  document.querySelector("#results").innerHTML =
    `<div class="market-results-line"><span>${items.length} ${t("个界面，等你发现", "interfaces to discover")}</span><span>${t("真实预览 · 本站可用", "REAL PREVIEWS · READY TO REUSE")}</span></div>${items.length ? `<div class="market-grid">${items.slice(0, limit).map(card).join("")}</div>${items.length > limit ? `<button class="button load-more" data-more>${t("再看一些", "Explore more")} ${icon("arrow-down")}</button>` : ""}` : `<div class="market-empty">${icon("search")}<h2>${t("换个关键词试试", "Try another search")}</h2><p>${t("也可以清空筛选，看看其他界面。", "Clear the filters to discover more interfaces.")}</p><button class="button" data-reset-filters>${t("清空筛选", "Clear filters")}</button></div>`}`;
  if (updateURL) {
    const params = Object.fromEntries(
      new FormData(document.querySelector("#filters")),
    );
    for (const k in params)
      if (!params[k] || params[k] === "all") delete params[k];
    history.replaceState(
      { ...history.state, limit },
      "",
      href(route.view, "", params),
    );
    route = parse();
  }
  observeCards();
}
function resourceDetails(r) {
  const c = r.caseId
    ? getCase(r.caseId)
    : r.type === "case"
      ? getCase(r.id)
      : null;
  const principle = r.principle || c?.principle;
  const rules = r.rules || c?.rules;
  return `<section class="detail-section"><h3>${t("适用场景", "Use cases")}</h3><p>${esc(l(r.useCases || c?.scene || r.description))}</p></section><section class="detail-section"><h3>${t("设计解读 · 本站整理", "Design notes · Atlas interpretation")}</h3><p>${esc(l(principle) || l(r.description))}</p>${
    rules
      ? `<ul>${l(rules)
          .map((x) => `<li>${esc(x)}</li>`)
          .join("")}</ul>`
      : ""
  }</section><section class="detail-section"><div class="section-heading"><h3>${t("当前提示词", "Current prompt")}</h3><button class="button small" data-copy-prompt>${icon("copy")}${t("复制", "Copy")}</button></div><p class="curator-label">${t("本站整理 · 与左侧演示对应", "Curated by Atlas · Matches this preview")}</p><pre class="inline-prompt prompt-text">${esc(resourcePrompt(r, locale))}</pre></section>${provenance(r)}`;
}
function provenance(r) {
  const s = resourceSource(r);
  return `<section class="detail-section provenance"><h3>${t("来源与组件库", "Source & libraries")}</h3>${r.libraryIds
    .map((id) => {
      const lib = libraries[id];
      return `<div class="library-credit"><strong>${esc(lib.name)}</strong><code>${esc(lib.version)}</code>${external(lib.docs, t("官方文档", "Official docs"))}</div>`;
    })
    .join(
      "",
    )}<p><strong>${esc(s.name)}</strong> · ${esc(s.author)}</p><div class="credit-links">${external(r.originalUrl || s.docs || s.repo, t("原始示例", "Original example"))}${external(r.sourceUrl || s.repo, t("源码地址", "Source code"))}${s.licenseFile ? external(s.licenseFile, s.license) : `<span>${esc(s.license)}</span>`}</div>${s.commit ? `<p class="commit-credit">${t("固定源码版本", "Pinned source")} <code>${s.commit}</code></p>` : ""}<p class="curator-label">${t("保留上游视觉与实现；本站适配语言、本地数据和预览入口。设计解读与提示词由本站整理。", "Upstream visuals and implementation, adapted for language, local data and previews. Notes and prompts are curated by Atlas.")}</p></section>`;
}
function related(r) {
  const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId);
  const parts = c
    ? resources.filter(
        (x) =>
          x.type === "component" &&
          x.caseId === c.id &&
          (r.type === "case" ||
            x.pageIds?.includes(r.id) ||
            r.pageIds?.some((p) => x.pageIds?.includes(p))),
      )
    : resources
        .filter(
          (x) =>
            x.id !== r.id &&
            (x.category === r.category || x.sourceId === r.sourceId),
        )
        .slice(0, 6);
  const pages = c?.pages.map((p) => findResource(p.id, "page")) || [];
  return `<section class="detail-section" id="related"><h3>${t(c ? "可复用组件" : "相关资源", c ? "Reusable components" : "Related resources")}</h3><div class="related-list">${parts
    .filter((x) => x.id !== r.id)
    .map(
      (x) =>
        `<a href="${href(x.type, x.id)}" data-related="${key(x)}"><span>${esc(l(x.name))}</span>${icon("arrow-up-right")}</a>`,
    )
    .join(
      "",
    )}</div>${pages.length ? `<h3>${t("所属系统与页面", "System & pages")}</h3><div class="related-list"><a href="${href("case", c.id)}" data-related="case:${c.id}">${esc(l(c.name))} ${icon("layout-template")}</a>${pages.map((x) => `<a href="${href(x.type, x.id)}" data-related="${key(x)}">${esc(l(x.name))}${icon("arrow-up-right")}</a>`).join("")}</div>` : ""}</section>`;
}
function inspector() {
  if (!selected) return;
  const r = selected,
    s = resourceSource(r);
  document.querySelector("#inspector").innerHTML =
    `<div class="inspector-head"><div class="detail-eyebrow"><span>${labelType(r)}${r.motion ? " · " + t("动效", "Motion") : ""}</span>${saveButton(r)}</div><h2>${esc(l(r.name))}</h2><p>${esc(l(r.description))}</p></div><div class="detail-tabs tabs" role="tablist" aria-label="${t("设计详情", "Design details")}">${[
      ["notes", t("说明", "Notes")],
      ["prompt", t("提示词", "Prompt")],
      ["parts", t("关联", "Components")],
      ["code", t("代码", "Code")],
    ]
      .map(
        ([id, label]) =>
          `<button role="tab" id="tab-${id}" data-tab="${id}" aria-selected="${tab === id}" aria-controls="inspector-content">${label}</button>`,
      )
      .join(
        "",
      )}</div><div id="inspector-content" class="inspector-content" role="tabpanel" aria-labelledby="tab-${tab}">${tab === "notes" ? resourceDetails(r) : tab === "parts" ? related(r) : tab === "prompt" ? `<section class="detail-section"><p>${t("本站整理 · 对应当前资源", "Curated by Atlas · Current resource")}</p><select id="prompt-scope" aria-label="${t("提示词层级", "Prompt scope")}"><option value="current">${t("当前资源", "Current resource")}</option><option value="style">${t("只复用视觉风格", "Visual style only")}</option></select><pre class="prompt-text full-prompt">${esc(resourcePrompt(r, locale))}</pre><button class="button primary" data-copy-prompt>${icon("copy")}${t("复制提示词", "Copy prompt")}</button></section>` : `<p>${t("正在读取源码…", "Loading source…")}</p>`}</div>`;
  if (tab === "code") void loadCode(r);
}
async function loadCode(r) {
  const target = document.querySelector("#inspector-content");
  try {
    let files;
    if (r.sourceId === "original") {
      files =
        r.type === "component"
          ? {
              [r.id + ".html"]: await componentDocument(
                { ...r, name: l(r.name) },
                locale,
              ),
            }
          : {};
      for (const f of r.files) {
        const res = await fetch("./" + f);
        if (!res.ok) throw Error(f);
        files[f] = await res.text();
      }
    } else {
      const url =
        r.sourceId === "shadcn-admin"
          ? "./code/shadcn-admin.json"
          : "./code/ui-market.json";
      if (!previewCache.has(url))
        previewCache.set(
          url,
          fetch(url)
            .then(async (res) => {
              if (!res.ok) throw Error(res.status);
              return res.json();
            })
            .catch((e) => {
              previewCache.delete(url);
              throw e;
            }),
        );
      files = (await previewCache.get(url)).files;
    }
    if (selected?.id !== r.id || tab !== "code") return;
    currentFiles = files;
    const first =
      r.sourceId === "original" && r.type === "component"
        ? r.id + ".html"
        : r.files?.find((f) => files[f]) || Object.keys(files)[0];
    const options = [
      ...new Set([
        first,
        ...(r.files || []),
        ...(r.supportFiles || []),
        "package.json",
        ...Object.keys(files),
      ]),
    ].filter((f) => f in files);
    target.innerHTML = `<section class="detail-section"><p>${t("实际演示入口、组件实现与依赖上下文。", "Actual demo entry, implementation and dependencies.")}</p><p>${t("下载项目后运行 npm ci，再运行 npm run dev。构建命令为 npm run build。", "After extracting: npm ci, then npm run dev. Build with npm run build.")}</p><select id="code-file" aria-label="${t("源文件", "Source file")}">${options.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}</select><div class="button-row code-actions"><button class="button primary" data-copy-code>${t("复制当前文件", "Copy file")}</button><button class="button" data-download-code>${t("下载当前文件", "Download file")}</button>${r.sourceId !== "original" ? `<a class="button" href="./downloads/${r.sourceId === "shadcn-admin" ? "shadcn-admin" : "ui-market"}.zip" download>${t("下载可运行项目", "Download project")} ZIP</a>` : ""}</div><pre id="code-text" class="code-text">${esc(files[first])}</pre></section>`;
    for (const id of r.libraryIds) {
      const lib = libraries[id];
      target
        .querySelector(".detail-section")
        .insertAdjacentHTML(
          "afterbegin",
          `<p class="dependency-note">${external(lib.docs, lib.name)} <code>${esc(lib.version)}</code></p>`,
        );
    }
  } catch {
    if (selected?.id === r.id && tab === "code")
      target.innerHTML = `<p>${t("源码读取失败，请重试。", "Source could not be loaded.")}</p><button class="button" data-tab="code">${t("重试", "Retry")}</button>`;
  }
}
function viewer(r) {
  detailResource = r;
  selected =
    r.type === "case"
      ? findResource(
          r.pages.find((p) => p.key === route.params.get("page"))?.id ||
            r.pages[0].id,
          "page",
        )
      : r;
  const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId);
  const chosen = selected;
  return `<div class="market-viewer"><header class="market-viewer-toolbar"><div class="viewer-leading"><button class="icon-button" data-close-viewer aria-label="${t("返回资源市场", "Back to market")}">${icon("arrow-left")}</button><div class="viewer-title"><strong>${esc(l(r.type === "case" ? r.name : chosen.name))}</strong><small>${esc(resourceSource(chosen).name)}</small></div>${c && r.type !== "component" ? `<select id="preview-page" aria-label="${t("预览页面", "Preview page")}">${c.pages.map((p) => `<option value="${p.id}" ${p.id === chosen.id ? "selected" : ""}>${esc(l(p.name))}</option>`).join("")}</select>` : ""}</div><div class="viewer-tools">${
    ["page", "case", "block"].includes(r.type)
      ? `<div class="viewer-devices">${[
          ["0", "monitor"],
          ["768", "tablet"],
          ["375", "smartphone"],
        ]
          .map(
            ([w, i]) =>
              `<button class="icon-button ${width === Number(w) ? "selected" : ""}" data-device="${w}" aria-label="${w === "0" ? t("自动宽度", "Auto width") : w + "px"}" aria-pressed="${width === Number(w)}">${icon(i)}</button>`,
          )
          .join(
            "",
          )}<button class="icon-button" data-fit aria-label="${t("适应宽度", "Fit width")}" aria-pressed="${fit}">${icon("expand")}</button></div>`
      : ""
  }${chosen.motion ? `<button class="icon-button" data-replay aria-label="${t("重播动效", "Replay animation")}">${icon("rotate-ccw")}</button>` : ""}<button class="icon-button" data-theme aria-label="${t("切换主题", "Toggle theme")}">${icon(theme === "dark" ? "sun" : "moon")}</button><button class="icon-button" data-fullscreen aria-label="${t("全屏预览", "Fullscreen preview")}">${icon("maximize")}</button><a id="standalone" class="icon-button" href="${esc(resourcePreview(chosen, locale, theme))}" target="_blank" rel="noopener noreferrer" aria-label="${t("独立打开演示", "Open standalone demo")}">${icon("arrow-up-right")}</a><button class="icon-button" data-share aria-label="${t("复制分享链接", "Copy share link")}">${icon("link")}</button>${language(true)}<button class="button primary toolbar-copy" data-copy-prompt>${icon("copy")}<span>${t("复制提示词", "Copy prompt")}</span></button><button class="icon-button" data-close-viewer aria-label="${t("关闭预览", "Close preview")}">${icon("x")}</button></div></header><div class="market-detail-layout"><section class="market-preview-panel" id="preview-panel"><div class="market-preview-viewport" id="preview-viewport"><div id="preview-canvas"><iframe id="case-preview" src="${esc(resourcePreview(chosen, locale, theme))}" title="${esc(l(chosen.name))}" allow="clipboard-write"></iframe></div></div><div class="market-preview-bottom"><div><button class="icon-button" data-neighbor="-1" aria-label="${t("上一个资源", "Previous resource")}">${icon("chevron-left")}</button><button class="icon-button" data-neighbor="1" aria-label="${t("下一个资源", "Next resource")}">${icon("chevron-right")}</button><span>${labelType(chosen)} · ${esc(resourceSource(chosen).license)}</span></div><button class="text-link" data-tab="prompt">${t("查看提示词", "View prompt")}${icon("arrow-up-right")}</button></div></section><aside id="inspector" class="market-inspector" aria-label="${t("设计说明", "Design details")}"></aside></div></div>`;
}
function showViewer(r) {
  stopAllLive();
  tab = "notes";
  width = 0;
  fit = true;
  const isModal = !!history.state?.atlasModal;
  document.body.classList.toggle("is-viewer", !isModal);
  if (isModal) {
    const d = document.querySelector("#asset-dialog");
    d.innerHTML = viewer(r);
    d.showModal();
  } else {
    main.innerHTML = viewer(r);
    document.querySelector("#topbar").hidden = true;
    document.querySelector("#footer").hidden = true;
  }
  inspector();
  scalePreview();
  document.querySelector("[data-close-viewer]")?.focus({ preventScroll: true });
  document.title = l(r.name) + " · UI Design Atlas";
}
function openResource(id, type, replace = false) {
  const r = findResource(id, type);
  if (!r) return;
  if (!selected) {
    originBrowse = {
      hash: location.hash || href(),
      scroll: scrollY,
      limit,
      focus: key(r),
    };
    history.replaceState(
      { ...history.state, browse: originBrowse },
      "",
      location.href,
    );
  }
  const state = { atlasModal: !!originBrowse, background: originBrowse };
  const url = href(r.type, r.id, { theme });
  history[replace ? "replaceState" : "pushState"](state, "", url);
  route = parse();
  showViewer(r);
}
function closeViewer() {
  if (history.state?.atlasModal && history.state?.background) {
    history.back();
    return;
  }
  location.hash = href().slice(1);
}
function scalePreview() {
  const viewport = document.querySelector("#preview-viewport"),
    frame = document.querySelector("#case-preview"),
    canvas = document.querySelector("#preview-canvas");
  if (!viewport || !selected) return;
  const isSmall =
    selected.type === "component" &&
    !["table", "data", "navigation"].includes(
      selected.kind || selected.category,
    );
  const desired =
    width ||
    (isSmall
      ? Math.min(selected.preview.width, viewport.clientWidth)
      : viewport.clientWidth);
  const scale = fit ? Math.min(1, viewport.clientWidth / desired) : 1;
  const h = isSmall
    ? Math.max(selected.preview.height, viewport.clientHeight / scale)
    : viewport.clientHeight / scale;
  canvas.style.width = desired * scale + "px";
  canvas.style.height = h * scale + "px";
  frame.style.width = desired + "px";
  frame.style.height = h + "px";
  frame.style.transform = `scale(${scale})`;
}
function render() {
  const d = document.querySelector("#asset-dialog");
  if (d.open) d.close();
  d.innerHTML = "";
  selected = null;
  route = parse();
  if (["zh-CN", "en"].includes(route.params.get("lang")))
    locale = route.params.get("lang");
  if (["dark", "light"].includes(route.params.get("theme")))
    theme = route.params.get("theme");
  header();
  document.querySelector("#topbar").hidden = false;
  document.querySelector("#footer").hidden = false;
  document.body.classList.remove("is-viewer");
  if (types[route.view]) {
    const r = findResource(route.id, route.view);
    if (r) {
      if (history.state?.atlasModal) {
        originBrowse = history.state.background;
        const detailRoute = route;
        route = parseHash(originBrowse.hash);
        main.innerHTML = listing();
        restoreFilters();
        route = detailRoute;
      }
      showViewer(r);
      return;
    }
    main.innerHTML = `<div class="market-empty">${t("没有找到这个资源。", "Resource not found.")} <a href="${href()}">${t("返回市场", "Back to market")}</a></div>`;
    return;
  }
  if (route.view === "resources") {
    main.innerHTML = sourcePage();
    return;
  }
  if (route.view === "guide") {
    main.innerHTML = guidePage();
    return;
  }
  originBrowse = null;
  limit = history.state?.browse?.limit || history.state?.limit || 24;
  main.innerHTML = listing();
  restoreFilters();
  const b = history.state?.browse;
  if (b)
    requestAnimationFrame(() => {
      scrollTo(0, b.scroll);
      document
        .querySelector(`[data-open="${b.focus}"]`)
        ?.focus({ preventScroll: true });
    });
  document.title = t("UI 资源市场", "UI marketplace") + " · UI Design Atlas";
}
function parseHash(hash) {
  const [p, q = ""] = hash.replace(/^#/, "").split("?");
  return { view: p || "explore", params: new URLSearchParams(q) };
}
function restoreFilters() {
  for (const el of document.querySelectorAll("#filters select"))
    el.value = route.params.get(el.name) || "all";
  updateResults();
}
function sourcePage() {
  return `<section class="market-intro"><div><h1>${t("每个界面，都有出处。", "Every interface has a source.")}</h1><p>${t("实现来源、实际组件库与本站整理内容分别标注。", "Implementation sources, libraries and Atlas interpretations are credited separately.")}</p></div></section><div class="source-grid">${Object.values(
    sourceProjects,
  )
    .map(
      (s) =>
        `<section class="source-card"><h2>${esc(s.name)}</h2><p>${esc(s.author)} · ${esc(s.license)}</p>${external(s.repo, "GitHub")}${s.commit ? `<p><code>${s.commit}</code></p>` : ""}${s.licenseFile ? external(s.licenseFile, t("许可证", "License")) : ""}</section>`,
    )
    .join(
      "",
    )}</div><section class="source-card"><h2>${t("展示逻辑参考", "Browsing references")}</h2><p>${external("https://21st.dev/community/components", "21st.dev")} · ${external("https://uiverse.io/elements", "Uiverse")} · ${external("https://reactbits.dev/", "React Bits")}</p><p>${t("借鉴资源分类与预览交互。本站未再分发 React Bits 组件。", "References for discovery and preview interactions. React Bits components are not redistributed.")}</p>${external("./vendor/shadcn-ui/ATTRIBUTION.md", "shadcn/ui · MIT")} · ${external("./vendor/lucide/LICENSE", "Lucide · ISC")} · ${external("./vendor/inter/LICENSE", "Inter · OFL")}</section>`;
}
function guidePage() {
  return `<section class="market-intro"><div><h1>${t("从一个 UI，开始你的项目。", "From a UI to your project.")}</h1></div></section><div class="source-card guide-copy"><h2>1. ${t("搜索并体验", "Find and try")}</h2><p>${t("按名称、用途或组件库搜索，选择动效、组件、区块或完整案例。点击卡片打开真实交互预览，关闭后继续原来的浏览位置。", "Search by name, purpose or library. Open an effect, component, block or system. Close the preview to resume browsing.")}</p><h2>2. ${t("读说明，复制提示词", "Read and copy a prompt")}</h2><p>${t("右侧说明与当前预览同步。复制当前资源提示词，或选择只复用视觉风格，替换成自己的业务需求。", "The notes follow the current preview. Copy its prompt, or the visual style only, and substitute your business requirements.")}</p><h2>3. ${t("带走实际代码", "Take the actual code")}</h2><p>${t("代码标签提供入口、实现和依赖说明。下载 ZIP 后运行以下命令，官方文档和原始源码地址也保留在详情中。", "The Code tab includes the demo, implementation and dependencies. Extract the ZIP and run the commands below. Official documentation and original source links remain in the details.")}</p><pre>npm ci\nnpm run dev\n\n# Build\nnpm run build</pre><h2>4. ${t("收藏并备份", "Save and back up")}</h2><p>${t("收藏保存在当前浏览器，可导出或导入 JSON。原有案例与组件收藏继续有效。", "Favorites stay in this browser and can be exported or imported as JSON. Existing favorites still work.")}</p></div>`;
}
const liveFrames = new Map();
function stopLive(el) {
  const frame = liveFrames.get(el);
  if (frame) {
    frame.remove();
    liveFrames.delete(el);
  }
  el.closest(".asset-card")?.classList.remove("is-live");
}
function stopAllLive() {
  for (const el of liveFrames.keys()) stopLive(el);
}
function startLive(card) {
  if (!card || matchMedia("(hover: none)").matches || selected) return;
  const el = card.querySelector("[data-live]");
  if (!el || liveFrames.has(el)) return;
  const [type, id] = el.dataset.live.split(":");
  const r = findResource(id, type);
  while (liveFrames.size >= 2) stopLive(liveFrames.keys().next().value);
  const f = document.createElement("iframe");
  const url = resourcePreview(
    r,
    locale,
    r.sourceId === "shadcn-admin" ? "dark" : "light",
  );
  const [base, hash] = url.split("#");
  f.src = base + "&thumb=1" + (hash ? "#" + hash : "");
  f.title = l(r.name);
  f.tabIndex = -1;
  f.setAttribute("aria-hidden", "true");
  el.append(f);
  liveFrames.set(el, f);
  sizeLive(card);
  f.onload = () => card.classList.add("is-live");
}
function sizeLive(card) {
  const r = findResource(...card.dataset.resource.split(":").reverse());
  const el = card.querySelector(".asset-preview"),
    f = card.querySelector(".asset-live iframe");
  if (!r || !f) return;
  const scale = Math.min(
    el.clientWidth / r.preview.width,
    el.clientHeight / r.preview.height,
  );
  f.style.width = r.preview.width + "px";
  f.style.height = r.preview.height + "px";
  f.style.transform = `translate(-50%,-50%) scale(${scale})`;
}
const cardObserver = new IntersectionObserver((entries) => {
  for (const e of entries)
    if (!e.isIntersecting) {
      const el = e.target.querySelector("[data-live]");
      if (el) stopLive(el);
    }
});
function observeCards() {
  cardObserver.disconnect();
  document
    .querySelectorAll(".asset-card")
    .forEach((c) => cardObserver.observe(c));
}
function notify(text) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 2500);
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify(t("已复制，可以带走复用了。", "Copied. Ready to reuse."));
  } catch {
    document.querySelector("#fallback-text").value = text;
    document.querySelector("#copy-fallback").showModal();
    document.querySelector("#fallback-text").select();
  }
}
function download(text, name) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function currentPrompt() {
  return resourcePrompt(
    selected,
    locale,
    document.querySelector("#prompt-scope")?.value === "style"
      ? "style"
      : selected.type,
  );
}
function syncPage(id) {
  const p = findResource(id, "page");
  if (!p) return;
  selected = p;
  document.querySelector("#case-preview").src = resourcePreview(
    p,
    locale,
    theme,
  );
  updateContext();
}
function updateContext() {
  const select = document.querySelector("#preview-page");
  if (select) select.value = selected.id;
  document.querySelector("#standalone").href = resourcePreview(
    selected,
    locale,
    theme,
  );
  const url =
    detailResource.type === "case"
      ? href("case", detailResource.id, { page: selected.key, theme })
      : href(selected.type, selected.id, { theme });
  history.replaceState(history.state, "", url);
  route = parse();
  inspector();
  scalePreview();
}
document.addEventListener("click", async (e) => {
  const link = e.target.closest("[data-open],[data-related]");
  if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    document.querySelector("#search-dialog").close();
    const [type, id] = (link.dataset.open || link.dataset.related).split(":");
    openResource(id, type, !!selected);
    return;
  }
  if (e.target.closest("#search-results a"))
    document.querySelector("#search-dialog").close();
  const b = e.target.closest("button");
  if (!b) return;
  if (b.hasAttribute("data-close-viewer")) return closeViewer();
  if (b.dataset.save) {
    const k = b.dataset.save;
    favorites.has(k) ? favorites.delete(k) : favorites.add(k);
    try {
      localStorage.setItem(
        "design-atlas-favorites",
        JSON.stringify([...favorites]),
      );
    } catch {
      notify(t("请导出收藏备份。", "Export a backup of your favorites."));
    }
    document
      .querySelectorAll(`[data-save="${k}"]`)
      .forEach(
        (el) =>
          (el.outerHTML = saveButton(
            findResource(k.split(":")[1], k.split(":")[0]),
          )),
      );
    if (route.view === "favorites") updateResults();
    return;
  }
  if (b.dataset.tab) {
    tab = b.dataset.tab;
    inspector();
    document.querySelector(`[data-tab="${tab}"]`)?.focus();
    return;
  }
  if (b.dataset.device !== undefined) {
    width = Number(b.dataset.device);
    document.querySelectorAll("[data-device]").forEach((el) => {
      el.classList.toggle("selected", Number(el.dataset.device) === width);
      el.setAttribute("aria-pressed", Number(el.dataset.device) === width);
    });
    scalePreview();
    return;
  }
  if (b.hasAttribute("data-fit")) {
    fit = !fit;
    b.setAttribute("aria-pressed", fit);
    scalePreview();
    return;
  }
  if (b.hasAttribute("data-copy-prompt")) return copy(currentPrompt());
  if (b.hasAttribute("data-copy-code"))
    return copy(document.querySelector("#code-text").textContent);
  if (b.hasAttribute("data-download-code"))
    return download(
      document.querySelector("#code-text").textContent,
      document.querySelector("#code-file").value.split("/").at(-1),
    );
  if (b.hasAttribute("data-share")) return copy(location.href);
  if (b.hasAttribute("data-replay")) {
    const f = document.querySelector("#case-preview");
    f.contentWindow.postMessage({ type: "atlas:replay" }, location.origin);
    f.src = f.src;
    return;
  }
  if (b.hasAttribute("data-theme")) {
    theme = theme === "light" ? "dark" : "light";
    b.innerHTML = icon(theme === "dark" ? "sun" : "moon");
    document
      .querySelector("#case-preview")
      .contentWindow.postMessage(
        { type: "atlas:preview-config", locale, theme },
        location.origin,
      );
    document.querySelector("#standalone").href = resourcePreview(
      selected,
      locale,
      theme,
    );
    return;
  }
  if (b.hasAttribute("data-fullscreen")) {
    try {
      const p = document.querySelector("#preview-panel");
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await p.requestFullscreen();
    } catch {
      notify(t("可使用独立打开查看演示。", "Use the standalone preview."));
    }
    return;
  }
  if (b.dataset.neighbor) {
    const list = originBrowse
      ? (() => {
          const saved = route;
          route = parseHash(originBrowse.hash);
          const a = filtered();
          route = saved;
          return a;
        })()
      : resources;
    const i = list.findIndex((r) => key(r) === key(detailResource));
    const r =
      list[(i + Number(b.dataset.neighbor) + list.length) % list.length];
    if (r) openResource(r.id, r.type, true);
    return;
  }
  if (b.hasAttribute("data-more")) {
    limit += 24;
    updateResults(true);
    return;
  }
  if (b.hasAttribute("data-reset-filters")) {
    document.querySelector("#filters").reset();
    limit = 24;
    updateResults(true);
    return;
  }
  if (b.hasAttribute("data-export-favorites"))
    return download(
      JSON.stringify(
        { format: "ui-design-atlas", version: 1, favorites: [...favorites] },
        null,
        2,
      ),
      "design-atlas-favorites.json",
    );
  if (b.hasAttribute("data-search")) return openSearch();
  if (b.hasAttribute("data-close-search"))
    return document.querySelector("#search-dialog").close();
  if (b.id === "fallback-close")
    document.querySelector("#copy-fallback").close();
});
document.addEventListener("pointerover", (e) => {
  const c = e.target.closest(".asset-card");
  if (c && !c.contains(e.relatedTarget)) startLive(c);
});
document.addEventListener("focusin", (e) =>
  startLive(e.target.closest(".asset-card")),
);
document.addEventListener("input", (e) => {
  if (e.target.closest("#filters")) {
    limit = 24;
    updateResults(true);
  }
  if (e.target.id === "quick-search") searchResults();
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "filters") e.preventDefault();
});
document.addEventListener("change", async (e) => {
  if (e.target.matches("[data-locale]")) {
    locale = e.target.value;
    try {
      localStorage.setItem("atlas-language", locale);
    } catch {}
    const p = parse();
    p.params.set("lang", locale);
    history.replaceState(
      history.state,
      "",
      "#" + p.view + (p.id ? "/" + p.id : "") + "?" + p.params,
    );
    render();
  }
  if (e.target.closest("#filters") && e.target.matches("select")) {
    limit = 24;
    updateResults(true);
  }
  if (e.target.id === "preview-page") syncPage(e.target.value);
  if (e.target.id === "code-file")
    document.querySelector("#code-text").textContent =
      currentFiles[e.target.value];
  if (e.target.id === "prompt-scope")
    document.querySelector(".full-prompt").textContent = currentPrompt();
  if (e.target.id === "import-favorites") {
    try {
      const file = e.target.files[0];
      if (!file || file.size > 100000) throw Error();
      const data = JSON.parse(await file.text());
      if (
        data.format !== "ui-design-atlas" ||
        data.version !== 1 ||
        !Array.isArray(data.favorites) ||
        !data.favorites.every(validFavorite)
      )
        throw Error();
      data.favorites.forEach((x) => favorites.add(x));
      localStorage.setItem(
        "design-atlas-favorites",
        JSON.stringify([...favorites]),
      );
      render();
      notify(t("收藏已导入。", "Favorites imported."));
    } catch {
      notify(
        t("请选择有效的收藏备份文件。", "Choose a valid favorites backup."),
      );
    }
  }
});
window.addEventListener("message", (e) => {
  const f = document.querySelector("#case-preview");
  if (
    !selected ||
    e.origin !== location.origin ||
    e.source !== f?.contentWindow
  )
    return;
  if (e.data?.type === "atlas:escape") return closeViewer();
  if (
    e.data?.type !== "atlas:preview-state" ||
    e.data.caseId !== selected.caseId
  )
    return;
  if (["light", "dark"].includes(e.data.theme)) theme = e.data.theme;
  if (selected.type === "component") return;
  const c = getCase(selected.caseId);
  const p = c?.pages.find((p) =>
    c.source === "open-source" ? p.path === e.data.path : p.key === e.data.page,
  );
  if (p && p.id !== selected.id) {
    selected = findResource(p.id, "page");
    updateContext();
  }
});
function openSearch() {
  const d = document.querySelector("#search-dialog");
  if (d.open) return;
  d.showModal();
  document.querySelector("#quick-search").value = "";
  searchResults();
  document.querySelector("#quick-search").focus();
}
function searchResults() {
  const q = document.querySelector("#quick-search").value.toLowerCase().trim();
  const items = resources
    .filter((r) => q.split(/\s+/).every((w) => resourceSearch(r).includes(w)))
    .slice(0, 10);
  document.querySelector("#search-results").innerHTML = items.length
    ? items
        .map(
          (r) =>
            `<a href="${href(r.type, r.id)}" data-open="${key(r)}"><span class="search-result-icon">${icon("layers")}</span><span><strong>${esc(l(r.name))}</strong><small>${labelType(r)} · ${r.libraryIds.map((id) => libraries[id].name).join(" / ")}</small></span>${icon("arrow-up-right")}</a>`,
        )
        .join("")
    : `<p>${t("没有匹配的资源", "No matching resources")}</p>`;
}
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearch();
  }
  if (e.target.id === "quick-search" && e.key === "Enter") {
    e.preventDefault();
    document.querySelector("#search-results a")?.click();
    document.querySelector("#search-dialog").close();
  }
  if (e.target.id === "quick-search" && e.key === "ArrowDown") {
    e.preventDefault();
    document.querySelector("#search-results a")?.focus();
  }
  if (
    e.target.closest("#search-results a") &&
    ["ArrowDown", "ArrowUp"].includes(e.key)
  ) {
    e.preventDefault();
    const rows = [...document.querySelectorAll("#search-results a")],
      i = rows.indexOf(e.target.closest("a")),
      n = i + (e.key === "ArrowDown" ? 1 : -1);
    if (n < 0) document.querySelector("#quick-search").focus();
    else rows[Math.min(n, rows.length - 1)]?.focus();
  }
  if (
    e.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) &&
    !document.querySelector("dialog[open]")
  ) {
    e.preventDefault();
    document.querySelector("[name=q]")?.focus();
  }
  if (
    e.key === "Escape" &&
    selected &&
    !document.querySelector("#asset-dialog[open]") &&
    !document.querySelector("dialog[open]")
  )
    closeViewer();
  if (
    e.target.matches("[role=tab]") &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    e.preventDefault();
    const tabs = [...e.target.parentElement.children],
      i = tabs.indexOf(e.target),
      n =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? tabs.length - 1
            : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
    tab = tabs[n].dataset.tab;
    inspector();
    document.querySelector(`[data-tab="${tab}"]`).focus();
  }
});
const dialog = document.createElement("dialog");
dialog.id = "asset-dialog";
dialog.setAttribute("aria-label", "UI preview / UI 预览");
document.body.append(dialog);
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeViewer();
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) closeViewer();
});
window.addEventListener("hashchange", () => {
  document.querySelector("#search-dialog").close();
  render();
  if (!selected && !history.state?.browse) scrollTo(0, 0);
});
window.addEventListener("popstate", () => {
  render();
});
window.addEventListener("resize", () => {
  scalePreview();
  document.querySelectorAll(".asset-card.is-live").forEach(sizeLive);
});
window.addEventListener("fullscreenchange", scalePreview);
window.addEventListener("storage", (e) => {
  if (e.key === "design-atlas-favorites") {
    try {
      favorites = new Set(JSON.parse(e.newValue || "[]").filter(validFavorite));
      render();
    } catch {}
  }
});
new ResizeObserver(scalePreview).observe(document.body);
render();

document.addEventListener("pointermove", (e) => {
  const card = e.target.closest(".asset-card");
  if (!card) return;
  const el = card.querySelector("[data-live]"),
    f = liveFrames.get(el);
  if (!f) return;
  const box = f.getBoundingClientRect(),
    r = findResource(...card.dataset.resource.split(":").reverse());
  f.contentWindow.postMessage(
    {
      type: "atlas:preview-pointer",
      x: ((e.clientX - box.left) * r.preview.width) / box.width,
      y: ((e.clientY - box.top) * r.preview.height) / box.height,
    },
    location.origin,
  );
});

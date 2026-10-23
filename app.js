import {
  resourcePresentation,
  thumbnailURL,
  embeddedPreviewURL,
} from "./presentation.js";
import {
  replaceShellHTML,
  fieldValue,
  setFieldValue,
  showShellDialog,
  browseScroll,
  scrollBrowseTo,
} from "./shell/controls.tsx";
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
  discovery,
  discoveryResources,
  discoveryGallery,
  collectionResources,
} from "./catalog.js";
import { componentDocument, escapeHTML as esc } from "./components.js";
const main = document.querySelector("#main");
let locale = "zh-CN";
try {
  locale = localStorage.getItem("atlas-language") === "en" ? "en" : "zh-CN";
} catch {}
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
const previewValues = new Map();
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
const href = (view = "discover", id = "", params = {}) =>
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
  const [view = "discover", id] = path.split("/");
  return { view: view || "discover", id, params: new URLSearchParams(q) };
}
function saveButton(r) {
  return `<button class="icon-button asset-save ${favorites.has(key(r)) ? "saved" : ""}" data-save="${key(r)}" aria-pressed="${favorites.has(key(r))}" aria-label="${t("收藏", "Save")} ${esc(l(r.name))}">${icon("bookmark")}</button>`;
}
function language(viewer = false) {
  return `<select data-shell-control data-locale id="${viewer ? "locale" : "site-locale"}" aria-label="${t("语言", "Language")}"><option value="zh-CN" ${locale === "zh-CN" ? "selected" : ""}>中文</option><option value="en" ${locale === "en" ? "selected" : ""}>EN</option></select>`;
}
function header() {
  document.documentElement.lang = locale;
  document.querySelector("#sidebar").innerHTML = "";
  replaceShellHTML(
    document.querySelector("#topbar"),
    `<div class="market-header"><a class="brand" href="${href()}"><span class="brand-mark">${icon("layers")}</span><span>atlas<span class="brand-dot">.</span></span></a><nav class="market-navigation" data-shell-group data-shell-key="primary-navigation" data-shell-variant="underline" aria-label="${t("主导航", "Main navigation")}"><a href="${href("discover")}" class="${route.view === "discover" ? "active" : ""}">${t("发现", "Discover")}</a><a href="${href("explore")}" class="${["explore", "motion", "components", "blocks", "pages"].includes(route.view) ? "active" : ""}">${t("探索资源", "Explore")}</a><a href="${href("cases")}" class="${route.view === "cases" ? "active" : ""}">${t("完整案例", "Systems")}</a><a href="${href("favorites")}" class="${route.view === "favorites" ? "active" : ""}">${icon("bookmark")}${t("我的收藏", "Saved")}<span>${favorites.size || ""}</span></a></nav><div class="market-header-actions"><span data-shell-navigation></span><span data-shell-appearance></span><button class="icon-button" data-search aria-label="${t("搜索设计", "Search designs")}">${icon("search")}</button>${language()}${external("https://github.com/Xiiiing/ui-design-atlas", "GitHub")}</div></div>`,
  );
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
  document.querySelector(".search-dialog-footer span").textContent = t(
    "↵ 打开 · Esc 关闭",
    "↵ Open · Esc Close",
  );
  document.querySelector("#quick-search").placeholder = t(
    "搜索流光边框、表格、Fluent…",
    "Search a UI, effect or library…",
  );
}
function card(r) {
  const framing = resourcePresentation(r);
  const name =
    r.type === "page"
      ? `${l(getCase(r.caseId).name).split(" · ")[0]} · ${l(r.name)}`
      : l(r.name);
  return `<article class="asset-card card" data-resource="${key(r)}" data-layout="${framing.layout}"><div class="asset-preview" style="--canvas-width:${framing.width}px;--canvas-height:${framing.height}px"><img src="${esc(r.cover)}" alt="${esc(name)}" loading="lazy" width="${framing.width}" height="${framing.height}"><div class="asset-live" data-live="${key(r)}"></div><a class="asset-cover-link" data-open="${key(r)}" href="${href(r.type, r.id)}" aria-label="${t("查看", "View")} ${esc(name)}" aria-describedby="description-${r.id}"></a>${saveButton(r)}<a class="asset-open" href="${href(r.type, r.id)}" data-open="${key(r)}" aria-label="${t("查看", "View")} ${esc(name)}">${icon("arrow-up-right")}</a>${r.motion ? `<span class="motion-badge">${icon("play")}${t("动效", "Motion")}</span>` : ""}<p class="asset-description" id="description-${r.id}">${esc(l(r.description))}</p></div><div class="asset-caption"><a data-open="${key(r)}" href="${href(r.type, r.id)}">${esc(name)}</a><span class="asset-libraries">${r.libraryIds.map((id) => `<span class="library-badge" data-library="${esc(id)}" title="${esc(libraries[id].name)}">${id === "native" ? "HTML / CSS" : id === "fluent" ? "Fluent UI" : esc(libraries[id].name)}</span>`).join("") || `<span class="library-badge">${t("原生 UI", "Native UI")}</span>`}</span></div>${r.type === "case" ? `<p class="system-summary">${esc(l(r.description))}</p><span class="system-page-count">${r.pages.length} ${t("个页面", "pages")}</span>` : ""}</article>`;
}
function typeCount(v) {
  return v === "explore"
    ? resources.length
    : v === "motion"
      ? resources.filter((r) => r.motion).length
      : resources.filter(
          (r) =>
            r.type ===
            {
              components: "component",
              blocks: "block",
              pages: "page",
              cases: "case",
            }[v],
        ).length;
}
function discoveryPage() {
  const items = discoveryGallery().slice(0, limit);
  const recommendedCases = discoveryResources("cases").filter(
    (r) => !items.some((item) => key(item) === key(r)),
  );
  return `<section class="discovery-hero"><h1>${esc(l(discovery.title))}</h1><p>${esc(l(discovery.description))}</p></section>
  <section class="library-browser" aria-label="${t("浏览资源", "Browse resources")}"><div class="library-toolbar"><nav class="library-types" data-shell-group data-shell-key="market-types" aria-label="${t("资源类型", "Resource types")}">${Object.entries(
    viewModes,
  )
    .map(
      ([v, labels]) =>
        `<a data-market-mode="${v}" class="${v === "explore" ? "active" : ""}" href="${href(v === "explore" ? "discover" : v)}" ${v === "explore" ? 'aria-current="page"' : ""}>${t(...labels)}<span>${typeCount(v)}</span></a>`,
    )
    .join(
      "",
    )}</nav><form id="discovery-search"><label class="market-search">${icon("search")}<input name="q" type="search" aria-label="${t("搜索 UI", "Search UI")}" placeholder="${t("搜索组件、界面…", "Search the library…")}"><button class="icon-button" type="submit" aria-label="${t("搜索", "Search")}">${icon("arrow-right")}</button></label></form></div>
  <nav class="library-category-row" data-shell-group data-shell-key="resource-categories" aria-label="${t("用途分类", "Categories")}"><a class="all-categories active" href="${href("discover")}">${t("全部", "All")}<span>${resources.length}</span></a><div class="discovery-shortcuts discovery-categories">${discovery.categories.map((id) => `<a href="${href("explore", "", { category: id })}"><strong>${t(...categories[id])}</strong><span>${resources.filter((r) => r.category === id).length}</span></a>`).join("")}</div></nav>
  <section class="featured-section"><h2 class="sr-only">${t("精选 UI", "Featured UI")}</h2><div class="market-grid discovery-grid">${items.slice(0, 8).map(card).join("")}</div></section><div class="market-grid discovery-grid library-continuation">${items.slice(8).map(card).join("")}</div>${items.length < resources.length ? `<button class="button load-more" data-discovery-more>${t("继续浏览", "Keep exploring")}${icon("arrow-down")}</button>` : ""}</section>
  <section class="discovery-section collection-section"><div class="discovery-section-heading"><h2>${t("主题合集", "Collections")}</h2></div><div class="discovery-collections">${discovery.collections
    .map((c) => {
      const parts = collectionResources(c.id);
      return `<a class="collection-card" href="${href("explore", "", { collection: c.id })}"><div class="collection-cover"><img loading="lazy" src="${parts[0].cover}" alt=""><img loading="lazy" src="${parts[1].cover}" alt=""></div><h3>${esc(l(c.name))}${icon("arrow-up-right")}</h3><p>${esc(l(c.description))}</p><span>${parts.length} ${t("项资源", "resources")}</span></a>`;
    })
    .join("")}</div></section>
  <section class="discovery-section systems-section" ${recommendedCases.length ? "" : "hidden"}><div class="discovery-section-heading"><h2>${t("完整网站与系统", "Websites & systems")}</h2><a class="text-link" href="${href("cases")}">${t("查看全部", "View all")}${icon("arrow-right")}</a></div><div class="market-grid discovery-grid">${recommendedCases.map(card).join("")}</div></section>`;
}
function resultGroups(items) {
  return ["component", "block", "page", "case"]
    .map((type) => {
      const group = items.filter((r) => r.type === type);
      return group.length
        ? `<section class="resource-group" data-type="${type}"><h2>${t(...types[type])}<span>${group.length}</span></h2><div class="market-grid comparison-grid comparison-${type}">${group.map(card).join("")}</div></section>`
        : "";
    })
    .join("");
}
function selectFilter(name, label, entries) {
  return `<label class="filter-select"><span class="sr-only">${label}</span><select data-shell-control name="${name}" aria-label="${label}"><option value="all">${label}</option>${entries.map(([v, label]) => `<option value="${v}">${esc(label)}</option>`).join("")}</select>${icon("chevron-right")}</label>`;
}
const viewIcons = {
  explore: "grid-2x2",
  motion: "play",
  components: "layers",
  blocks: "layout-template",
  pages: "monitor",
  cases: "code-xml",
};
const viewModes = {
  explore: ["全部", "All"],
  motion: ["动效", "Motion"],
  components: ["组件", "Components"],
  blocks: ["区块", "Blocks"],
  pages: ["页面", "Pages"],
  cases: ["完整案例", "Systems"],
};
function listing() {
  const collection = discovery.collections.find(
    (c) => c.id === route.params.get("collection"),
  );
  const favorite = route.view === "favorites";
  const expanded = ["interaction", "style", "source", "audience"].some((k) =>
    route.params.has(k),
  );
  return `<section class="market-intro"><div><h1>${favorite ? t("我的收藏", "Saved resources") : route.view === "cases" ? t("完整案例", "Complete systems") : collection ? esc(l(collection.name)) : t("探索资源", "Explore resources")}</h1><p>${t("真实体验，从一个组件到完整系统。带走提示词与代码。", "Real interfaces, from a component to a complete system. Take the prompt and code.")}</p></div>${favorite ? `<div class="button-row"><button class="button" data-export-favorites>${t("导出收藏", "Export saved")}</button><label class="button">${t("导入收藏", "Import saved")}<input type="file" hidden id="import-favorites" accept=".json"></label></div>` : ""}</section>
  <section class="market-collection" id="collection"><form id="filters" class="market-filters" data-expanded="${expanded}">
  <div class="catalog-toolbar">  <nav class="market-tabs" data-shell-group data-shell-key="market-types" aria-label="${t("资源类型", "Resource types")}">${Object.entries(
    viewModes,
  )
    .map(
      ([v, labels]) =>
        `<a href="${href(v, "", Object.fromEntries(route.params))}" data-market-mode="${v}" class="${route.view === v ? "active" : ""}" ${route.view === v ? 'aria-current="page"' : ""}>${icon(viewIcons[v])}${t(...labels)}<span>${typeCount(v)}</span></a>`,
    )
    .join(
      "",
    )}</nav><label class="market-search">${icon("search")}<input name="q" type="search" aria-label="${t("搜索 UI", "Search UI")}" placeholder="${t("找一个按钮、悬停效果、表格…", "Find a button, hover effect, table…")}" value="${esc(route.params.get("q") || "")}"><kbd>/</kbd></label></div><div class="catalog-facets">
  ${selectFilter(
    "library",
    t("全部组件库", "All libraries"),
    Object.values(libraries).map((x) => [x.id, x.name]),
  )}
  <button type="button" class="button advanced-filters-toggle" data-advanced-filters aria-controls="advanced-filters" aria-expanded="${expanded}">${icon("sliders-horizontal")}${t("更多筛选", "Filters")}</button></div>
  ${collection ? `<input type="hidden" name="collection" value="${collection.id}">` : ""}<input type="hidden" name="category" value="${esc(route.params.get("category") || "all")}">
  <nav class="category-strip" data-shell-group data-shell-key="resource-categories" aria-label="${t("资源分类", "Resource categories")}">${[["all", ["全部分类", "All categories"]], ...Object.entries(categories)].map(([id, labels]) => `<button type="button" data-category="${id}" aria-pressed="${(route.params.get("category") || "all") === id}">${t(...labels)}</button>`).join("")}</nav>
  <div class="advanced-filters" id="advanced-filters">${selectFilter(
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
  ])}</div>
  <div class="active-filters" id="active-filters" aria-label="${t("已选条件", "Selected filters")}"></div></form><div id="results" aria-live="polite"></div></section>`;
}
function updateFilterChips() {
  const form = document.querySelector("#filters");
  if (!form) return;
  const values = Object.fromEntries(new FormData(form));
  const labels = {
    q: t("搜索", "Search"),
    category: t("分类", "Category"),
    library: t("组件库", "Library"),
    interaction: t("交互", "Interaction"),
    style: t("风格", "Style"),
    source: t("来源", "Source"),
    audience: t("场景", "Audience"),
    collection: t("主题", "Collection"),
  };
  const chips = Object.entries(values).filter(([, v]) => v && v !== "all");
  document.querySelector("#active-filters").innerHTML =
    chips
      .map(([name, value]) => {
        const label =
          name === "collection"
            ? l(discovery.collections.find((c) => c.id === value)?.name)
            : name === "category"
              ? t(...(categories[value] || [value, value]))
              : name === "q"
                ? value
                : form.querySelector(`select[name="${name}"] option:checked`)
                    ?.textContent || value;
        return `<button type="button" class="filter-chip" data-remove-filter="${name}" aria-label="${t("清除", "Remove")} ${esc(labels[name])}: ${esc(label)}"><span>${esc(label)}</span>${icon("x")}</button>`;
      })
      .join("") +
    (chips.length
      ? `<button type="button" class="clear-filters" data-reset-filters>${t("清空条件", "Clear all")}</button>`
      : "");
  document
    .querySelectorAll("[data-category]")
    .forEach((el) =>
      el.setAttribute(
        "aria-pressed",
        String(el.dataset.category === values.category),
      ),
    );
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
    if (
      values.collection &&
      !collectionResources(values.collection).some((x) => x.id === r.id)
    )
      return false;
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
    `<div class="market-results-line"><span><strong>${items.length}</strong> ${t("个设计资源", "design resources")}</span><span><i class="status-dot"></i>${t("真实交互预览 · 提示词与源码", "LIVE PREVIEWS · PROMPTS & SOURCE")}</span></div>${items.length ? `${resultGroups(items.slice(0, limit))}${items.length > limit ? `<button class="button load-more" data-more>${t("再看一些", "Explore more")} ${icon("arrow-down")}</button>` : ""}` : `<div class="market-empty">${icon("search")}<h2>${t("换个关键词试试", "Try another search")}</h2><p>${t("也可以清空筛选，看看其他界面。", "Clear the filters to discover more interfaces.")}</p><button class="button" data-reset-filters>${t("清空筛选", "Clear filters")}</button></div>`}`;
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
  document.querySelectorAll("[data-market-mode]").forEach((el) => {
    el.href = href(el.dataset.marketMode, "", Object.fromEntries(route.params));
  });
  updateFilterChips();
  observeCards();
}
function resourceDetails(r, promptHTML) {
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
  }</section>${promptHTML}${provenance(r)}`;
}
function provenance(r) {
  const s = resourceSource(r);
  return `<section class="detail-section provenance"><h3>${t("来源与组件库", "Source & libraries")}</h3>${r.libraryIds
    .map((id) => {
      const lib = libraries[id];
      return `<div class="library-credit"><strong>${esc(lib.name)}</strong><code>${esc(r.libraryVersions?.[id] || lib.version)}</code>${external(lib.docs, t("官方文档", "Official docs"))}</div>`;
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
  const r = selected;
  const quick = !!history.state?.atlasModal;
  const head = `<div class="inspector-head"><div class="detail-eyebrow"><span>${labelType(r)}${r.motion ? " · " + t("动效", "Motion") : ""}</span>${saveButton(r)}</div><h2>${esc(l(r.name))}</h2><p>${esc(l(r.description))}</p></div>`;
  const prompt = `<section class="detail-section"><div class="section-heading"><h3>${t("当前提示词", "Current prompt")}</h3></div><p class="curator-label">${t("本站整理 · 对应当前演示", "Curated by Atlas · Matches this preview")}</p><select data-shell-control id="prompt-scope" aria-label="${t("提示词层级", "Prompt scope")}"><option value="current">${t("当前资源", "Current resource")}</option><option value="style">${t("只复用视觉风格", "Visual style only")}</option></select><pre class="inline-prompt full-prompt prompt-text ${quick ? "prompt-summary" : ""}">${esc(promptText(r))}</pre><button class="button primary" data-copy-prompt>${icon("copy")}${t("复制提示词", "Copy prompt")}</button></section>`;
  replaceShellHTML(
    document.querySelector("#inspector"),
    `${head}<div class="inspector-content">${quick ? `<section class="detail-section"><h3>${t("适用场景", "Use cases")}</h3><p>${esc(l(r.useCases || getCase(r.caseId)?.scene || r.description))}</p></section>${prompt}<div class="quick-detail-actions"><a class="button primary" href="${href(detailResource.type, detailResource.id)}" data-full-detail>${t("完整详情", "Full details")}${icon("arrow-right")}</a><a class="button" href="${href(detailResource.type, detailResource.id, { tab: "code" })}" data-full-detail="code">${icon("code-xml")}${t("查看代码", "View code")}</a></div>` : resourceDetails(r, prompt)}</div>`,
  );
  if (!quick) {
    const code = document.querySelector("#full-code");
    code.hidden = tab !== "code";
    document.querySelector("#preview-panel").hidden = tab === "code";
    document.querySelectorAll("[data-full-tab]").forEach((el) => {
      el.setAttribute("aria-selected", String(el.dataset.tab === tab));
      el.tabIndex = el.dataset.tab === tab ? 0 : -1;
    });
    if (tab === "code") void loadCode(r);
  }
}
async function loadCode(r) {
  const target = document.querySelector("#full-code");
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
    if (selected?.id !== r.id || tab !== "code" || !target?.isConnected) return;
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
    target.innerHTML = `<section class="detail-section"><p>${t("实际演示入口、组件实现与依赖上下文。", "Actual demo entry, implementation and dependencies.")}</p><p>${t("下载项目后运行 npm ci，再运行 npm run dev。构建命令为 npm run build。", "After extracting: npm ci, then npm run dev. Build with npm run build.")}</p><select data-shell-control id="code-file" aria-label="${t("源文件", "Source file")}">${options.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}</select><div class="button-row code-actions"><button class="button primary" data-copy-code>${t("复制当前文件", "Copy file")}</button><button class="button" data-download-code>${t("下载当前文件", "Download file")}</button>${r.sourceId !== "original" ? `<a class="button" href="./downloads/${r.sourceId === "shadcn-admin" ? "shadcn-admin" : "ui-market"}.zip" download>${t("下载可运行项目", "Download project")} ZIP</a>` : ""}</div><pre id="code-text" class="code-text">${esc(files[first])}</pre></section>`;
    for (const id of r.libraryIds) {
      const lib = libraries[id];
      target
        .querySelector(".detail-section")
        .insertAdjacentHTML(
          "afterbegin",
          `<p class="dependency-note">${external(lib.docs, lib.name)} <code>${esc(r.libraryVersions?.[id] || lib.version)}</code></p>`,
        );
    }
  } catch {
    if (selected?.id === r.id && tab === "code" && target?.isConnected)
      target.innerHTML = `<p>${t("源码读取失败，请重试。", "Source could not be loaded.")}</p><button class="button" data-tab="code">${t("重试", "Retry")}</button>`;
  }
}
function previewParameters(r) {
  const config =
    r.id === "magicui-border-beam"
      ? ["duration", t("时长（秒）", "Duration (seconds)"), 1, 20, 8]
      : r.id === "magicui-shimmer-button"
        ? ["duration", t("时长（秒）", "Duration (seconds)"), 1, 20, 3]
        : r.id === "magicui-particles"
          ? ["quantity", t("粒子数量", "Particle count"), 10, 250, 100]
          : r.id === "magicui-number-ticker"
            ? ["value", t("目标数值", "Target value"), 0, 99999, 100]
            : null;
  return config;
}
function promptText(r, scope = r.type) {
  const text = resourcePrompt(r, locale, scope),
    config = previewParameters(r);
  const input = document.querySelector("[data-preview-setting]");
  return config &&
    selected?.id === r.id &&
    input &&
    Number(input.dataset.appliedValue) !== config[4]
    ? text +
        "\n\n" +
        t(
          "当前预览参数覆盖（以此为准）：",
          "Current preview parameter override (takes precedence): ",
        ) +
        config[0] +
        " = " +
        input.dataset.appliedValue +
        "."
    : text;
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
  const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId),
    chosen = selected;
  const framing = resourcePresentation(
      chosen,
      history.state?.atlasModal ? "quick" : "detail",
    ),
    parameter = previewParameters(chosen);
  if (parameter && previewValues.has(chosen.id))
    parameter[4] = previewValues.get(chosen.id);
  const quick = !!history.state?.atlasModal;
  const pageDirectory =
    r.type === "case"
      ? `<section class="case-directory"><div class="discovery-section-heading"><div><h2>${t("这个案例有哪些页面？", "Inside this system")}</h2><p>${r.pages.length} ${t("个页面 · 选择页面开始体验", "pages · Choose a page to try")}</p></div></div><div class="case-page-grid">${r.pages
          .map((p) => {
            const item = findResource(p.id, "page");
            return `<button data-page-preview="${p.id}" aria-pressed="${p.id === chosen.id}"><img loading="lazy" src="${item.cover}" alt=""><span>${esc(l(p.name))}</span></button>`;
          })
          .join("")}</div></section>`
      : "";
  const pageHead = `<div class="resource-page-heading"><a class="text-link" href="${href("explore")}">${icon("arrow-left")}${t("探索资源", "Explore resources")}</a><div class="resource-title-line"><h1>${esc(l(r.name))}</h1>${saveButton(r)}</div><p>${esc(l(r.description))}</p><div class="resource-meta"><span>${labelType(r)}</span>${r.libraryIds.map((id) => `<span>${esc(libraries[id].name)}</span>`).join("")}${external(resourceSource(r).repo, resourceSource(r).name)}<span>${esc(resourceSource(r).license)}</span></div></div>${pageDirectory}`;
  return `${quick ? "" : `<article class="resource-page">${pageHead}`}<div class="market-viewer ${quick ? "quick-viewer" : "full-viewer"}"><header class="market-viewer-toolbar"><div class="viewer-leading"><button class="icon-button" data-close-viewer aria-label="${t("返回资源市场", "Back to market")}">${icon("arrow-left")}</button><div class="viewer-title"><strong>${esc(l(r.type === "case" ? r.name : chosen.name))}</strong><small>${esc(resourceSource(chosen).name)}</small></div>${c && r.type !== "component" ? `<select data-shell-control id="preview-page" aria-label="${t("预览页面", "Preview page")}">${c.pages.map((p) => `<option value="${p.id}" ${p.id === chosen.id ? "selected" : ""}>${esc(l(p.name))}</option>`).join("")}</select>` : ""}</div><div class="viewer-tools"><button class="icon-button" data-share aria-label="${t("复制分享链接", "Copy share link")}">${icon("link")}</button><span data-shell-appearance></span>${language(true)}<button class="icon-button" data-close-viewer aria-label="${t("关闭预览", "Close preview")}">${icon("x")}</button></div></header>
  ${quick ? "" : `<div class="full-resource-tabs" role="tablist" aria-label="${t("资源内容", "Resource content")}"><button data-full-tab data-tab="notes" role="tab" aria-selected="${tab !== "code"}" aria-controls="preview-panel">${t("预览", "Preview")}</button><button data-full-tab data-tab="code" role="tab" aria-selected="${tab === "code"}" aria-controls="full-code">${t("代码", "Code")}</button></div>`}<div class="market-detail-layout">${quick ? "" : `<div class="full-preview-column">`}<section class="market-preview-panel" id="preview-panel" data-layout="${framing.layout}" style="--stage-height:${framing.stageHeight}px"><div class="preview-toolbar"><span class="preview-label">${t("交互预览", "Live preview")}</span>${
    framing.layout === "wide"
      ? `<div class="viewer-devices">${[
          ["0", "monitor", t("桌面画布", "Desktop canvas")],
          ["768", "tablet", "768px"],
          ["375", "smartphone", "375px"],
        ]
          .map(
            ([w, i, label]) =>
              `<button class="icon-button ${width === Number(w) ? "selected" : ""}" data-device="${w}" aria-label="${label}" aria-pressed="${width === Number(w)}">${icon(i)}</button>`,
          )
          .join(
            "",
          )}<button class="icon-button" data-fit aria-label="${t("适应宽度", "Fit width")}" aria-pressed="${fit}">${icon("expand")}</button></div>`
      : ""
  }<div class="preview-actions">${chosen.motion ? `<button class="icon-button" data-replay aria-label="${t("重播动效", "Replay animation")}">${icon("rotate-ccw")}</button>` : ""}<button class="icon-button" data-preview-theme aria-label="${t("切换演示主题", "Toggle preview theme")}">${icon(theme === "dark" ? "sun" : "moon")}</button><button class="icon-button" data-fullscreen aria-label="${t("全屏预览", "Fullscreen preview")}">${icon("maximize")}</button><a id="standalone" class="icon-button" href="${esc(resourcePreview(chosen, locale, theme))}" target="_blank" rel="noopener noreferrer" aria-label="${t("独立打开演示", "Open standalone demo")}">${icon("arrow-up-right")}</a></div></div>
  <div class="market-preview-viewport" id="preview-viewport"><div id="preview-canvas"><iframe id="case-preview" src="${esc(embeddedPreviewURL(resourcePreview(chosen, locale, theme)))}" title="${esc(l(chosen.name))}" allow="clipboard-write"></iframe></div></div>
  ${parameter ? `<div class="preview-parameters"><label>${parameter[1]}<input type="number" data-preview-setting="${parameter[0]}" data-applied-value="${parameter[4]}" min="${parameter[2]}" max="${parameter[3]}" value="${parameter[4]}" aria-label="${parameter[1]}"></label><span>${t("上游原有参数", "Original component parameter")}</span></div>` : ""}
  <div class="market-preview-bottom"><div><button class="icon-button" data-neighbor="-1" aria-label="${t("上一个资源", "Previous resource")}">${icon("chevron-left")}</button><button class="icon-button" data-neighbor="1" aria-label="${t("下一个资源", "Next resource")}">${icon("chevron-right")}</button><span>${labelType(chosen)} · ${esc(resourceSource(chosen).license)}</span></div><button class="text-link" data-focus-prompt>${t("查看提示词", "View prompt")}${icon("arrow-up-right")}</button></div></section>${quick ? "" : `<div id="full-code" role="tabpanel" hidden></div></div>`}<aside id="inspector" class="market-inspector" aria-label="${t("设计说明", "Design details")}"></aside></div></div>${quick ? "" : `<div class="full-related">${related(r)}</div></article>`}`;
}
function showViewer(r) {
  stopAllLive();
  tab = route.params.get("tab") === "code" ? "code" : "notes";
  width = 0;
  fit = true;
  const isModal = !!history.state?.atlasModal;
  document.body.classList.remove("is-viewer");
  if (isModal) {
    const d = document.querySelector("#asset-dialog");
    replaceShellHTML(d, viewer(r));
    showShellDialog(d);
  } else {
    replaceShellHTML(main, viewer(r));
  }
  inspector();
  scalePreview();
  const frame = document.querySelector("#case-preview");
  frame.addEventListener("load", () => {
    const input = document.querySelector("[data-preview-setting]");
    if (input && previewValues.has(selected?.id))
      frame.contentWindow.postMessage(
        {
          type: "atlas:preview-settings",
          settings: {
            [input.dataset.previewSetting]: Number(input.dataset.appliedValue),
          },
        },
        location.origin,
      );
  });
  if (isModal && history.state?.quickScroll)
    document.querySelector(".market-detail-layout").scrollTop =
      history.state.quickScroll;
  if (isModal)
    document
      .querySelector("[data-close-viewer]")
      ?.focus({ preventScroll: true });
  document.title = l(r.name) + " · UI Design Atlas";
}
function openResource(id, type, replace = false) {
  const r = findResource(id, type);
  if (!r) return;
  if (!selected) {
    theme = resourcePresentation(r).theme;
    originBrowse = {
      hash: location.hash || href(),
      scroll: browseScroll(),
      limit,
      focus: key(r),
      items: [...document.querySelectorAll(".asset-card")].map(
        (el) => el.dataset.resource,
      ),
    };
    history.replaceState(
      { ...history.state, browse: originBrowse },
      "",
      location.href,
    );
  }
  const state = {
    atlasModal: !selected ? true : !!history.state?.atlasModal,
    background: originBrowse,
    resourceFrom: !!selected && !history.state?.atlasModal,
  };
  const url = href(r.type, r.id, { theme });
  history[replace ? "replaceState" : "pushState"](state, "", url);
  route = parse();
  render();
  if (!state.atlasModal) scrollBrowseTo(0);
}
function closeViewer() {
  if (history.state?.atlasModal && history.state?.background) {
    history.back();
    return;
  }
  if (history.state?.fromQuick || history.state?.resourceFrom) {
    history.back();
    return;
  }
  location.hash = href("explore").slice(1);
}
function scalePreview() {
  const viewport = document.querySelector("#preview-viewport"),
    frame = document.querySelector("#case-preview"),
    canvas = document.querySelector("#preview-canvas");
  if (!viewport || !selected || !viewport.clientWidth) return;
  const framing = resourcePresentation(
      selected,
      history.state?.atlasModal ? "quick" : "detail",
    ),
    isSmall = framing.layout === "compact";
  const desired =
    width || (isSmall ? viewport.clientWidth : selected.preview.width);
  const scale = fit ? Math.min(1, viewport.clientWidth / desired) : 1;
  const h = isSmall
    ? Math.max(framing.height, viewport.clientHeight / scale)
    : Math.max(selected.preview.height, viewport.clientHeight / scale);
  canvas.style.width = desired * scale + "px";
  canvas.style.height = h * scale + "px";
  frame.style.width = desired + "px";
  frame.style.height = h + "px";
  frame.style.transform = `scale(${scale})`;
}
let renderedNavigation;
function render() {
  stopAllLive();
  renderedNavigation = location.href + JSON.stringify(history.state);
  const d = document.querySelector("#asset-dialog");
  if (d.open) d.close();
  replaceShellHTML(d, "");
  selected = null;
  route = parse();
  if (["zh-CN", "en"].includes(route.params.get("lang")))
    locale = route.params.get("lang");
  if (["dark", "light"].includes(route.params.get("theme")))
    theme = route.params.get("theme");
  header();
  main.classList.toggle(
    "library-page",
    !types[route.view] || !!history.state?.atlasModal,
  );
  document.querySelector("#topbar").hidden = false;
  document.querySelector("#footer").hidden = false;
  document.body.classList.remove("is-viewer");
  if (types[route.view]) {
    const r = findResource(route.id, route.view);
    if (r) {
      if (history.state?.atlasModal) {
        originBrowse = history.state.background;
        limit = originBrowse.limit || 24;
        const detailRoute = route;
        route = parseHash(originBrowse.hash);
        replaceShellHTML(
          main,
          route.view === "discover" ? discoveryPage() : listing(),
        );
        restoreFilters();
        route = detailRoute;
      }
      if (!history.state?.atlasModal)
        originBrowse = history.state?.background || null;
      showViewer(r);
      return;
    }
    replaceShellHTML(
      main,
      `<div class="market-empty">${t("没有找到这个资源。", "Resource not found.")} <a href="${href()}">${t("返回市场", "Back to market")}</a></div>`,
    );
    return;
  }
  if (route.view === "resources") {
    replaceShellHTML(main, sourcePage());
    return;
  }
  if (route.view === "guide") {
    replaceShellHTML(main, guidePage());
    return;
  }
  originBrowse = null;
  limit = history.state?.browse?.limit || history.state?.limit || 24;
  replaceShellHTML(
    main,
    route.view === "discover" ? discoveryPage() : listing(),
  );
  restoreFilters();
  const b = history.state?.browse;
  if (b)
    requestAnimationFrame(() => {
      scrollBrowseTo(b.scroll);
      document
        .querySelector(`[data-open="${b.focus}"]`)
        ?.focus({ preventScroll: true });
    });
  document.title = t("UI 资源市场", "UI marketplace") + " · UI Design Atlas";
}
function parseHash(hash) {
  const [p, q = ""] = hash.replace(/^#/, "").split("?");
  return { view: p || "discover", params: new URLSearchParams(q) };
}
function restoreFilters() {
  for (const el of document.querySelectorAll(
    "#filters select, #filters input[name=category]",
  ))
    el.value = route.params.get(el.name) || "all";
  updateResults();
  observeCards();
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
    )}</div><section class="source-card"><h2>${t("图鉴界面设计基线", "Atlas shell design baseline")}</h2><p>${t("21st：资源优先的浏览层级、中性明暗表面、轻量边界与统一字级。固定源码提交 b96d84d，图鉴按静态资源市场需求适配。", "21st: preview-first discovery, neutral light/dark surfaces, quiet borders and a shared type scale. Adapted from pinned source b96d84d for this static resource marketplace.")}</p>${external("./vendor/21st-market/ATTRIBUTION.md", t("来源与适配说明", "Source & adaptations"))}</section><section class="source-card"><h2>${t("展示逻辑参考", "Browsing references")}</h2><p>${external("https://21st.dev/community/components", "21st.dev")} · ${external("https://coss.com/origin/button", "Origin UI")} · ${external("https://blocks.so/tables", "Blocks.so")} · ${external("https://reactbits.dev/", "React Bits")}</p><p>${t("借鉴资源分类与预览交互。本站未再分发 React Bits 组件。", "References for discovery and preview interactions. React Bits components are not redistributed.")}</p>${external("./vendor/shadcn-ui/ATTRIBUTION.md", "shadcn/ui · MIT")} · ${external("./vendor/lucide/LICENSE", "Lucide · ISC")} · ${external("./vendor/inter/LICENSE", "Inter · OFL")} · ${external("./vendor/geist/LICENSE", "Geist · OFL")}</section>`;
}
function guidePage() {
  return `<section class="market-intro"><div><h1>${t("从一个 UI，开始你的项目。", "From a UI to your project.")}</h1></div></section><div class="source-card guide-copy"><h2>1. ${t("搜索并体验", "Find and try")}</h2><p>${t("按名称、用途或组件库搜索，选择动效、组件、区块或完整案例。点击卡片打开真实交互预览，关闭后继续原来的浏览位置。", "Search by name, purpose or library. Open an effect, component, block or system. Close the preview to resume browsing.")}</p><h2>2. ${t("读说明，复制提示词", "Read and copy a prompt")}</h2><p>${t("右侧说明与当前预览同步。复制当前资源提示词，或选择只复用视觉风格，替换成自己的业务需求。", "The notes follow the current preview. Copy its prompt, or the visual style only, and substitute your business requirements.")}</p><h2>3. ${t("带走实际代码", "Take the actual code")}</h2><p>${t("从快速预览进入「完整详情」或「查看代码」。完整资源页提供实际入口、实现、依赖与来源说明；完整案例先浏览页面目录，再体验系统。下载 ZIP 后运行以下命令。", "Choose Full details or View code in quick preview. The full resource page includes implementation, dependencies and provenance. Systems start with a page directory. Extract the ZIP and run the commands below.")}</p><pre>npm ci\nnpm run dev\n\n# Build\nnpm run build</pre><h2>4. ${t("收藏并备份", "Save and back up")}</h2><p>${t("收藏保存在当前浏览器，可导出或导入 JSON。原有案例与组件收藏继续有效。", "Favorites stay in this browser and can be exported or imported as JSON. Existing favorites still work.")}</p></div>`;
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
  const url = resourcePreview(r, locale, resourcePresentation(r).theme);
  f.src = thumbnailURL(url);
  f.title = l(r.name);
  f.tabIndex = -1;
  f.inert = true;
  f.setAttribute("aria-hidden", "true");
  el.append(f);
  liveFrames.set(el, f);
  sizeLive(card);
  f.onload = () => card.classList.add("is-live");
}
function sizeLive(card) {
  const r = findResource(...card.dataset.resource.split(":").reverse());
  const el = card.querySelector(".asset-preview > img"),
    f = card.querySelector(".asset-live iframe");
  if (!r || !f) return;
  const framing = resourcePresentation(r);
  const scale = (
    getComputedStyle(el).objectFit === "cover" ? Math.max : Math.min
  )(el.clientWidth / framing.width, el.clientHeight / framing.height);
  f.style.width = framing.width + "px";
  f.style.height = framing.height + "px";
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
    showShellDialog(document.querySelector("#copy-fallback"));
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
  return promptText(
    selected,
    fieldValue("prompt-scope") === "style" ? "style" : selected.type,
  );
}
function syncPage(id) {
  const p = findResource(id, "page");
  if (!p) return;
  selected = p;
  document.querySelector("#case-preview").src = embeddedPreviewURL(
    resourcePreview(p, locale, theme),
  );
  updateContext();
}
function updateContext() {
  const select = document.querySelector("#preview-page");
  if (select) setFieldValue("preview-page", selected.id);
  document.querySelector("#standalone").href = resourcePreview(
    selected,
    locale,
    theme,
  );
  const url =
    detailResource.type === "case"
      ? href("case", detailResource.id, {
          page: selected.key,
          theme,
          ...(tab === "code" ? { tab: "code" } : {}),
        })
      : href(selected.type, selected.id, {
          theme,
          ...(tab === "code" ? { tab: "code" } : {}),
        });
  history.replaceState(history.state, "", url);
  route = parse();
  inspector();
  document
    .querySelectorAll("[data-page-preview]")
    .forEach((el) =>
      el.setAttribute(
        "aria-pressed",
        String(el.dataset.pagePreview === selected.id),
      ),
    );
  scalePreview();
}
document.addEventListener("submit", (e) => {
  if (e.target.id !== "discovery-search") return;
  e.preventDefault();
  location.hash = href("explore", "", { q: new FormData(e.target).get("q") });
});
document.addEventListener("click", async (e) => {
  const fullLink = e.target.closest("[data-full-detail]");
  if (fullLink && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    history.replaceState(
      {
        ...history.state,
        quickScroll:
          document.querySelector(".market-detail-layout")?.scrollTop || 0,
      },
      "",
      location.href,
    );
    history.pushState(
      { atlasModal: false, fromQuick: true, background: originBrowse },
      "",
      href(detailResource.type, detailResource.id, {
        theme,
        ...(detailResource.type === "case" ? { page: selected.key } : {}),
        ...(fullLink.dataset.fullDetail === "code" ? { tab: "code" } : {}),
      }),
    );
    render();
    scrollBrowseTo(0);
    return;
  }
  const link = e.target.closest("[data-open],[data-related]");
  if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    document.querySelector("#search-dialog").close();
    const [type, id] = (link.dataset.open || link.dataset.related).split(":");
    openResource(id, type, !!selected && !!history.state?.atlasModal);
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
    const params = new URLSearchParams(route.params);
    if (tab === "code") params.set("tab", "code");
    else params.delete("tab");
    history.replaceState(
      history.state,
      "",
      href(route.view, route.id, Object.fromEntries(params)),
    );
    inspector();
    document.querySelector(`[data-full-tab][data-tab="${tab}"]`)?.focus();
    return;
  }
  if (b.dataset.pagePreview) {
    syncPage(b.dataset.pagePreview);
    document.querySelector(".full-viewer")?.scrollIntoView({ block: "start" });
    return;
  }
  if (b.hasAttribute("data-focus-prompt")) {
    document.querySelector("#prompt-scope")?.focus();
    document
      .querySelector("#prompt-scope")
      ?.scrollIntoView({ block: "center" });
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
      fieldValue("code-file").split("/").at(-1),
    );
  if (b.hasAttribute("data-share")) return copy(location.href);
  if (b.hasAttribute("data-replay")) {
    const f = document.querySelector("#case-preview");
    f.contentWindow.postMessage({ type: "atlas:replay" }, location.origin);
    return;
  }
  if (b.hasAttribute("data-preview-theme")) {
    theme = theme === "light" ? "dark" : "light";
    updateThemeURL();
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
    const list = originBrowse?.items?.length
      ? originBrowse.items
          .map((k) => {
            const [type, id] = k.split(":");
            return findResource(id, type);
          })
          .filter(Boolean)
      : originBrowse
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
  if (b.hasAttribute("data-discovery-more")) {
    stopAllLive();
    limit += 24;
    const browse = { ...history.state?.browse, limit };
    history.replaceState(
      { ...history.state, limit, ...(history.state?.browse ? { browse } : {}) },
      "",
      location.href,
    );
    document.querySelector(".library-continuation").innerHTML =
      discoveryGallery().slice(8, limit).map(card).join("");
    const visible = discoveryGallery().slice(0, limit);
    const cases = discoveryResources("cases").filter(
      (r) => !visible.some((item) => key(item) === key(r)),
    );
    const section = document.querySelector(".systems-section");
    section.hidden = !cases.length;
    section.querySelector(".discovery-grid").innerHTML = cases
      .map(card)
      .join("");
    if (limit >= resources.length) b.remove();
    observeCards();
    return;
  }
  if (b.hasAttribute("data-more")) {
    limit += 24;
    updateResults(true);
    return;
  }
  if (b.dataset.category) {
    document.querySelector("#filters [name=category]").value =
      b.dataset.category;
    limit = 24;
    updateResults(true);
    return;
  }
  if (b.dataset.removeFilter) {
    const name = b.dataset.removeFilter;
    const field = document.querySelector(`#filters [name="${name}"]`);
    if (name === "q") field.value = "";
    else if (name === "collection") field.remove();
    else if (name === "category") field.value = "all";
    else setFieldValue("filter-" + name, "all");
    limit = 24;
    updateResults(true);
    return;
  }
  if (b.hasAttribute("data-advanced-filters")) {
    const expanded = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", expanded);
    document.querySelector("#filters").dataset.expanded = String(expanded);
    return;
  }
  if (b.hasAttribute("data-reset-filters")) {
    const form = document.querySelector("#filters");
    form.reset();
    queueMicrotask(() => {
      for (const el of form.querySelectorAll("select.atlas-select-native"))
        setFieldValue(el.dataset.shellField, "all");
      form.querySelector("[name=q]").value = "";
      form.querySelector("[name=category]").value = "all";
      form.querySelector("[name=collection]")?.remove();
      limit = 24;
      updateResults(true);
    });
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
  if (e.target.matches("[data-preview-setting]")) {
    const field = e.target,
      value = Number(field.value);
    if (field.value === "" || !Number.isFinite(value) || !field.checkValidity())
      return;
    document.querySelector("#case-preview")?.contentWindow.postMessage(
      {
        type: "atlas:preview-settings",
        settings: { [field.dataset.previewSetting]: value },
      },
      location.origin,
    );
    field.dataset.appliedValue = String(value);
    previewValues.set(selected.id, value);
    const text = document.querySelector(".inline-prompt, .full-prompt");
    if (text) text.textContent = currentPrompt();
    return;
  }

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
  if ((e.target.dataset.shellField || e.target.id) === "preview-page")
    syncPage(e.target.value);
  if ((e.target.dataset.shellField || e.target.id) === "code-file")
    document.querySelector("#code-text").textContent =
      currentFiles[e.target.value];
  if ((e.target.dataset.shellField || e.target.id) === "prompt-scope")
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
    e.data?.type === "atlas:resource-state" &&
    e.data.resourceId === selected.id
  ) {
    if (["light", "dark"].includes(e.data.theme)) {
      theme = e.data.theme;
      document.querySelector("[data-preview-theme]").innerHTML = icon(
        theme === "dark" ? "sun" : "moon",
      );
      updateThemeURL();
    }
    return;
  }
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
  showShellDialog(d);
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
    !e.defaultPrevented &&
    !e.target.closest(".atlas-select-content, .atlas-menu-content") &&
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
    const tabs = [...e.target.parentElement.querySelectorAll("[role=tab]")],
      i = tabs.indexOf(e.target),
      n =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? tabs.length - 1
            : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
    tabs[n].click();
    document.querySelector(`[data-full-tab][data-tab="${tab}"]`)?.focus();
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
function navigationChanged() {
  if (renderedNavigation === location.href + JSON.stringify(history.state))
    return;
  document.querySelector("#search-dialog").close();
  render();
  if (!history.state?.browse) scrollBrowseTo(0);
}
window.addEventListener("hashchange", navigationChanged);
window.addEventListener("popstate", navigationChanged);
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
      x: ((e.clientX - box.left) * resourcePresentation(r).width) / box.width,
      y: ((e.clientY - box.top) * resourcePresentation(r).height) / box.height,
    },
    location.origin,
  );
});

function updateThemeURL() {
  const p = parse();
  p.params.set("theme", theme);
  history.replaceState(
    history.state,
    "",
    "#" + p.view + (p.id ? "/" + p.id : "") + "?" + p.params,
  );
  document.querySelector("#standalone").href = resourcePreview(
    selected,
    locale,
    theme,
  );
}

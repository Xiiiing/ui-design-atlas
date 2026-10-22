import { icon } from "./icons.js";
import {
  cases,
  pages,
  components,
  getCase,
  getPage,
  getComponent,
  promptFor,
  previewURL,
  upstream,
} from "./catalog.js";
import { componentDocument, escapeHTML as esc } from "./components.js";
const main = document.getElementById("main");
let locale = "zh-CN";
try {
  locale = localStorage.getItem("atlas-language") === "en" ? "en" : "zh-CN";
} catch {}
let favorites = new Set();
try {
  const saved = JSON.parse(
    localStorage.getItem("design-atlas-favorites") || "[]",
  );
  if (Array.isArray(saved)) favorites = new Set(saved.filter(validFavorite));
} catch {}
let route,
  selected,
  activeTab = "notes",
  scope = "page",
  device = 0,
  fit = true,
  theme = "light",
  timer,
  codeCache,
  panelState = null;
const l = (x) => (typeof x === "object" && x !== null ? x[locale] : x);
const t = (zh, en) => (locale === "en" ? en : zh);
const href = (view, id = "", params = {}) =>
  "#" +
  view +
  (id ? "/" + id : "") +
  "?" +
  new URLSearchParams({ ...params, lang: locale });
const labelView = (v) =>
  ({
    explore: t("探索图鉴", "Explore"),
    cases: t("完整案例", "Systems"),
    pages: t("页面目录", "Pages"),
    components: t("可复用组件", "Components"),
    favorites: t("我的收藏", "Favorites"),
    resources: t("来源与许可", "Sources & licenses"),
    guide: t("使用指南", "How to reuse"),
  })[v] || t("设计详情", "Design detail");
const sourceLabel = (c) =>
  c.source === "open-source"
    ? t("开源收录", "Open-source archive")
    : t("本站原创", "Atlas original");
const itemType = (i) => (i.pages ? "case" : i.pageIds ? "component" : "page");
const itemCase = (i) => (i.pages ? i : getCase(i.caseId));
function validFavorite(value) {
  if (typeof value !== "string") return false;
  const [type, id] = value.split(":");
  return Boolean(
    { case: getCase, page: getPage, component: getComponent }[type]?.(id),
  );
}
function saveButton(item) {
  const key = `${itemType(item)}:${item.id}`;
  return `<button class="button small save ${favorites.has(key) ? "saved" : ""}" data-save="${key}" aria-pressed="${favorites.has(key)}" aria-label="${esc(t("收藏", "Save") + " " + l(item.name))}">${icon("bookmark")} <span>${favorites.has(key) ? t("已收藏", "Saved") : t("收藏", "Save")}</span></button>`;
}
function frameURL(c, item) {
  if (item?.pageIds && c.source === "original")
    return `./component-preview.html?id=${item.id}&lang=${locale}`;
  return previewURL(c, item, locale, theme);
}
function localeSelect() {
  return `<select id="locale" aria-label="${t("语言", "Language")}"><option value="zh-CN" ${locale === "zh-CN" ? "selected" : ""}>中文</option><option value="en" ${locale === "en" ? "selected" : ""}>EN</option></select>`;
}
function shell() {
  document.documentElement.lang = locale;
  const viewer = ["case", "page", "component"].includes(route.view);
  document.body.classList.toggle("is-viewer", viewer);
  const nav = ["explore", "cases", "pages", "components", "favorites"]
    .map(
      (v) =>
        `<a href="${href(v)}" class="${route.view === v ? "active" : ""}" ${route.view === v ? 'aria-current="page"' : ""}>${labelView(v)}${v === "favorites" && favorites.size ? `<span>${favorites.size}</span>` : ""}</a>`,
    )
    .join("");
  document.getElementById("sidebar").innerHTML =
    `<nav aria-label="${t("导航", "Navigation")}">${nav}<a href="${href("guide")}">${labelView("guide")}</a><a href="${href("resources")}">${labelView("resources")}</a></nav>`;
  document.getElementById("topbar").innerHTML = viewer
    ? ""
    : `<div class="site-header-inner"><a class="brand" href="${href("explore")}">${icon("layout-template")}<span>atlas<span class="brand-dot">.</span></span></a><nav class="main-nav" aria-label="${t("主导航", "Main navigation")}">${nav}</nav><div class="top-actions"><button class="search-trigger" data-search aria-label="${t("搜索设计", "Search designs")}">${icon("search")}<span>${t("搜索设计…", "Find a design…")}</span><kbd>⌘ K</kbd></button>${localeSelect()}<button class="icon-button mobile-menu" data-menu aria-label="${t("打开导航", "Open navigation")}" aria-expanded="${document.body.classList.contains("menu-open")}">${icon("menu")}</button></div></div>`;
  document.getElementById("footer").innerHTML =
    `<a href="${href("explore")}" class="footer-brand">atlas.</a><span>${t("看见界面，理解设计，带走代码。", "See the interface. Understand the design. Take the code.")}</span><div><a href="${href("resources")}">${labelView("resources")}</a><a href="${href("guide")}">${labelView("guide")}</a><a href="https://github.com/Xiiiing/ui-design-atlas" target="_blank" rel="noopener noreferrer">GitHub ${icon("arrow-up-right")}</a></div>`;
  document.getElementById("copy-title").textContent = t(
    "复制内容",
    "Copy content",
  );
  document.getElementById("copy-help").textContent = t(
    "自动复制不可用，请选中下方内容手动复制。",
    "Automatic copying is unavailable. Select and copy the text below.",
  );
  document.querySelector(".search-dialog-footer").innerHTML =
    `UI Design Atlas <span>↵ ${t("打开", "Open")} · Esc ${t("关闭", "Close")}</span>`;
  document.getElementById("quick-search").placeholder = t(
    "搜索风格、界面、组件…",
    "Search styles, pages, components…",
  );
  updateViewerPanels();
}
function galleryURL(c, item) {
  const url =
    c.source === "open-source"
      ? previewURL(c, item, locale, "dark")
      : frameURL(c, item);
  if (!item?.pageIds) return url;
  const [base, hash] = url.split("#");
  return (
    base +
    (base.includes("?") ? "&" : "?") +
    "thumb=1" +
    (hash ? "#" + hash : "")
  );
}

function card(item) {
  const c = itemCase(item),
    type = itemType(item),
    url = href(
      type,
      item.id,
      c.source === "open-source" ? { theme: "dark" } : {},
    );
  return `<article class="card ${type === "case" ? "system-card" : ""}" data-case="${c.id}"><div class="card-preview">${saveButton(item)}<a class="card-cover" href="${url}" aria-label="${esc(l(item.name))}"><div class="browser-bar"><span class="browser-dots"><i></i><i></i><i></i></span><span>${esc(c.id)} / ${type === "case" ? t("完整系统", "system") : esc(item.key)}</span>${icon("arrow-up-right")}</div><div class="cover-canvas"><iframe src="${esc(galleryURL(c, type === "case" ? c.pages[0] : item))}" title="${esc(l(item.name))}" loading="lazy" tabindex="-1" aria-hidden="true"></iframe></div><span class="cover-open">${t("进入体验", "Explore design")} ${icon("arrow-up-right")}</span></a></div><div class="card-body"><div class="card-title-row"><h3><a href="${url}">${esc(l(item.name))}</a></h3><span class="card-arrow">${icon("arrow-up-right")}</span></div><p>${esc(l(item.description))}</p><div class="card-bottom"><span>${esc(l(c.style))}<i>·</i>${sourceLabel(c)}</span><span>${type === "case" ? `${c.pages.length} ${t("页面", "pages")} · ${components.filter((x) => x.caseId === c.id).length} ${t("组件", "components")}` : esc(l(c.scene))}</span></div></div></article>`;
}
function home() {
  return `<section class="gallery-hero"><a class="hero-note" href="${href("case", "shadcn-admin", { theme: "dark" })}"><span class="status-dot"></span>${t("新收录 · Shadcn Admin", "NEW · Shadcn Admin")}${icon("chevron-right")}</a><h1>${t("好界面，<span>留给下一个项目。</span>", "Good interfaces.<span>For your next project.</span>")}</h1><p>${t("从完整系统到一个组件。直接体验喜欢的设计，<br>连同理念、提示词和代码，一起带走。", "From a complete system to a single component. Explore the real interface,<br>then take its design notes, prompts and working code.")}</p><div class="hero-actions"><a class="button primary" href="#collection">${t("探索设计", "Explore the collection")}${icon("arrow-up-right")}</a><button class="button subtle" data-search>${icon("search")}${t("找一个具体界面", "Find something specific")}<kbd>⌘ K</kbd></button></div></section><section id="collection"><div class="collection-heading"><div class="collection-tabs"><a href="${href("explore")}" class="active">${t("精选", "Selected")}</a><a href="${href("cases")}">${t("系统", "Systems")}<span>${cases.length}</span></a><a href="${href("pages")}">${t("页面", "Pages")}<span>${pages.length}</span></a><a href="${href("components")}">${t("组件", "Components")}<span>${components.length}</span></a></div><span class="collection-caption">${t("真实界面，可交互体验", "REAL INTERFACES. FULLY INTERACTIVE.")}</span></div><div class="case-grid featured-grid">${cases.map(card).join("")}</div></section><section class="home-components"><div class="section-title"><div><p class="eyebrow">SMALL PIECES. SAME CRAFT.</p><h2>${t("从一个组件开始，也很好。", "A small place to start.")}</h2></div><a class="text-link" href="${href("components")}">${t("浏览组件", "Browse components")}${icon("arrow-up-right")}</a></div><div class="asset-grid">${components.slice(3, 7).map(card).join("")}</div></section>`;
}
function filters() {
  return `<form class="filters" id="filters"><label class="search">${t("搜索", "Search")}<input name="q" type="search" value="${esc(route.params.get("q") || "")}" placeholder="${t("搜索中英文名称、用途、风格…", "Search names, use cases, styles…")}"></label>${route.view === "favorites" ? `<label>${t("内容", "Content")}<select name="type"><option value="all">${t("全部", "All")}</option>${["case", "page", "component"].map((x) => `<option value="${x}">${{ case: t("系统", "Systems"), page: t("页面", "Pages"), component: t("组件", "Components") }[x]}</option>`).join("")}</select></label>` : ""}<label>${t("场景", "Audience")}<select name="audience"><option value="all">${t("全部场景", "All audiences")}</option><option value="b2b">${t("B 端 / 工作工具", "B2B / Work tools")}</option><option value="b2c">${t("C 端 / 网站与商店", "B2C / Sites & stores")}</option></select></label><label>${t("风格", "Style")}<select name="style"><option value="all">${t("全部风格", "All styles")}</option>${cases.map((c) => `<option value="${c.id}">${esc(l(c.style))}</option>`).join("")}</select></label><label>${t("来源", "Source")}<select name="source"><option value="all">${t("全部来源", "All sources")}</option><option value="open-source">${t("开源收录", "Open source")}</option><option value="original">${t("本站原创", "Atlas original")}</option></select></label><button type="button" class="button" data-reset-filters>${t("重置", "Reset")}</button></form>`;
}
function results() {
  const form = document.getElementById("filters"),
    data = form ? new FormData(form) : new URLSearchParams();
  let items =
    route.view === "cases"
      ? cases
      : route.view === "pages"
        ? pages
        : route.view === "components"
          ? components
          : [...cases, ...pages, ...components].filter((i) =>
              favorites.has(`${itemType(i)}:${i.id}`),
            );
  const q = (data.get("q") || "").trim().toLowerCase();
  items = items.filter((i) => {
    const c = itemCase(i);
    return (
      (!q ||
        JSON.stringify([
          i.name,
          i.description,
          c.name,
          c.style,
          c.scene,
          i.pages ? c.tags : [],
        ])
          .toLowerCase()
          .includes(q)) &&
      ["audience", "source"].every(
        (k) => !data.get(k) || data.get(k) === "all" || c[k] === data.get(k),
      ) &&
      (!data.get("style") ||
        data.get("style") === "all" ||
        c.id === data.get("style")) &&
      (!data.get("type") ||
        data.get("type") === "all" ||
        itemType(i) === data.get("type"))
    );
  });
  return `<p class="filter-meta">${items.length} ${t("个结果", "results")}</p>${items.length ? `<div class="${route.view === "cases" ? "case-grid" : "asset-grid"}">${items.map(card).join("")}</div>` : `<div class="empty">${t("暂时没有内容，试试其他筛选或先收藏喜欢的设计。", "No results yet. Try another filter or save a design first.")}</div>`}`;
}
function listing() {
  return `<section class="intro"><div><p class="eyebrow">YOUR DESIGN LIBRARY</p><h1>${labelView(route.view)}</h1><p>${t("按用途和视觉风格选择。每个条目都能在本站预览，并提供对应提示词与代码。", "Browse by purpose and visual language. Every entry has an on-site preview, prompts and code.")}</p></div>${route.view === "favorites" ? `<div class="button-row"><button class="button" data-export-favorites>${t("导出收藏", "Export favorites")}</button><label class="button">${t("导入收藏", "Import favorites")}<input type="file" id="import-favorites" accept="application/json,.json" hidden></label></div>` : ""}</section>${filters()}<div id="results" aria-live="polite"></div>`;
}
function collectionNeighbors(c) {
  const all =
    route.view === "component"
      ? components
      : route.view === "page"
        ? pages
        : cases;
  const current = route.view === "case" ? c : selected;
  const index = all.findIndex((x) => x.id === current.id);
  return {
    all,
    index,
    prev: all[(index - 1 + all.length) % all.length],
    next: all[(index + 1) % all.length],
  };
}
function neighborLink(item, direction) {
  const c = itemCase(item);
  return `<a class="icon-button" href="${href(itemType(item), item.id, c.source === "open-source" ? { theme: "dark" } : {})}" aria-label="${direction === "prev" ? t("上一个设计", "Previous design") : t("下一个设计", "Next design")}">${icon(direction === "prev" ? "chevron-left" : "chevron-right")}</a>`;
}
function viewerToolbar(c) {
  const n = collectionNeighbors(c);
  return `<header class="viewer-toolbar"><div class="viewer-leading"><a class="icon-button viewer-back" href="${href(route.view === "component" ? "components" : route.view === "page" ? "pages" : "explore")}" aria-label="${t("返回画廊", "Back to gallery")}">${icon("arrow-left")}</a><span class="toolbar-separator"></span><div class="viewer-name"><a href="${href("case", c.id, { theme })}">${esc(l(c.name))}</a>${route.view !== "component" ? `<select id="preview-page" aria-label="${t("预览页面", "Preview page")}">${c.pages.map((p) => `<option value="${p.id}" ${p.id === selected.id ? "selected" : ""}>${esc(l(p.name))}</option>`).join("")}</select>` : `<span id="viewer-current">${esc(l(selected.name))}</span>`}</div></div><div class="viewer-devices" aria-label="${t("预览尺寸", "Viewport")}">${[
    [0, "monitor", t("桌面", "Desktop")],
    [768, "tablet", t("平板", "Tablet")],
    [375, "smartphone", t("手机", "Mobile")],
  ]
    .map(
      ([w, i, label]) =>
        `<button class="icon-button ${device === w ? "selected" : ""}" data-device="${w}" aria-label="${label}" title="${label}" aria-pressed="${device === w}">${icon(i)}</button>`,
    )
    .join(
      "",
    )}<span class="toolbar-separator"></span><button class="icon-button" data-fit aria-label="${fit ? t("适应宽度", "Fit width") : t("原尺寸", "Actual size")}" title="${fit ? t("适应宽度", "Fit width") : t("原尺寸", "Actual size")}" aria-pressed="${fit}">${icon("expand")}</button></div><div class="viewer-actions">${c.source === "open-source" ? `<button class="icon-button theme-control" data-theme aria-label="${theme === "dark" ? t("切换浅色", "Switch to light") : t("切换深色", "Switch to dark")}" title="${t("切换主题", "Toggle theme")}">${icon(theme === "dark" ? "sun" : "moon")}</button>` : ""}<a class="icon-button standalone-control" id="standalone" href="${esc(frameURL(c, selected))}" target="_blank" rel="noopener noreferrer" aria-label="${t("独立打开演示", "Open standalone demo")}" title="${t("独立打开演示", "Open standalone demo")}">${icon("arrow-up-right")}</a><button class="icon-button fullscreen-control" data-fullscreen aria-label="${t("全屏", "Fullscreen")}" title="${t("全屏", "Fullscreen")}">${icon("maximize")}</button><span class="toolbar-separator action-separator"></span><button class="button primary copy-main" aria-label="${t("复制当前提示词", "Copy current prompt")}" data-copy-prompt>${icon("copy")}<span>${t("复制提示词", "Copy prompt")}</span></button><button class="icon-button inspector-toggle" data-inspector aria-label="${t("设计说明", "Design details")}" title="${t("收起 / 展开设计说明", "Hide / show design details")}" aria-expanded="true">${icon("panel-right")}</button>${localeSelect()}</div></header>`;
}
function previewPanel(c) {
  const n = collectionNeighbors(c);
  return `<section class="preview-panel" id="preview-panel"><div class="preview-viewport" id="preview-viewport"><div class="preview-canvas" id="preview-canvas"><iframe id="case-preview" src="${esc(frameURL(c, selected))}" title="${esc(l(selected.name))}" allow="clipboard-write"></iframe></div></div><div class="preview-bottom"><div class="design-switcher">${neighborLink(n.prev, "prev")}<span><b>${String(n.index + 1).padStart(2, "0")}</b> / ${String(n.all.length).padStart(2, "0")}</span>${neighborLink(n.next, "next")}</div><span class="preview-caption">${c.source === "open-source" ? "Shadcn Admin · MIT" : t("本站原创演示", "Atlas original demo")}</span><button class="button small" data-inspector data-open-tab="prompt">${t("查看提示词", "View prompt")}${icon("chevron-right")}</button></div></section>`;
}

function related(c) {
  const ids = selected.pageIds || [selected.id];
  const siblings = components.filter(
    (x) =>
      x.caseId === c.id &&
      (route.view === "case" || ids.some((id) => x.pageIds.includes(id))),
  );
  return `<div id="related"><h3>${t("这个页面里的组件", "Components on this page")}<span class="count-badge">${siblings.length}</span></h3><p>${t("和系统页面共用实现，可以单独体验和复用。", "The same implementations as the system. Preview and reuse them separately.")}</p><div class="part-list">${siblings
    .filter((x) => x.id !== selected.id)
    .map(
      (x) =>
        `<a href="${href("component", x.id, { theme })}"><span class="part-icon">${icon(x.kind === "table" ? "grid-2x2" : x.kind === "navigation" ? "panel-right" : "layers")}</span><div><strong>${esc(l(x.name))}</strong><small>${esc(l(x.description))}</small></div>${icon("chevron-right")}</a>`,
    )
    .join(
      "",
    )}</div><h3>${t("其他页面", "More pages")}</h3><div class="related-list">${c.pages.map((p) => `<a href="${href("page", p.id, { theme })}">${esc(l(p.name))}${icon("arrow-up-right")}</a>`).join("")}</div></div>`;
}

function detail(c, item) {
  selected = item;
  return `<div class="viewer-shell">${viewerToolbar(c)}<div class="detail-layout">${previewPanel(c)}<aside class="inspector" id="inspector" aria-label="${t("设计说明", "Design details")}"></aside><button class="inspector-scrim" data-inspector aria-label="${t("关闭设计说明", "Close design details")}"></button></div></div>`;
}
function notes(c) {
  return `<section><h3>${t("适用场景", "Use cases")}</h3><p>${esc(l(c.scene))}</p><p>${esc(l(c.description))}</p></section><section><h3>${t("设计理念 · 归档解读", "Design principles · Curated interpretation")}</h3><p>${esc(l(c.principle))}</p><ul>${l(
    c.rules,
  )
    .map((r) => `<li>${esc(r)}</li>`)
    .join(
      "",
    )}</ul></section><section><h3>${t("设计变量", "Design tokens")}</h3><dl class="token-list">${Object.entries(
    c.tokens,
  )
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join(
      "",
    )}</dl></section><section><h3>${t("来源与适配", "Source & adaptations")}</h3><div class="source-info">${c.source === "open-source" ? `<strong>${upstream.name}</strong> · ${upstream.author}<br><a href="${upstream.repo}" target="_blank" rel="noopener noreferrer">GitHub ↗</a> · <a href="${upstream.licenseFile}" target="_blank">MIT</a><br>Commit: ${upstream.commit}<br>${t("本站适配：中英双语、本地数据操作、组件独立预览、hash 路由。布局与组件沿用上游。理念为本站解读，提示词为本站整理。", "Atlas adaptations: Chinese/English, local data operations, isolated component previews and hash routing. Layout and components come from upstream. Design notes and prompts are curated by Atlas.")}` : t("本站原创虚构案例，使用原生 HTML、CSS 与 JavaScript 实现。", "An original fictional Atlas case, implemented in HTML, CSS and JavaScript.")}</div></section>${
    selected.pageIds
      ? `<section><h3>${t("回到所属页面", "Used on these pages")}</h3><div class="related-list">${selected.pageIds
          .map((id) => {
            const p = getPage(id);
            return `<a href="${href("page", id)}">${esc(l(p.name))}<span>↗</span></a>`;
          })
          .join("")}</div></section>`
      : ""
  }`;
}
function promptContent(c) {
  const choices = [
    ["style", t("只复用视觉风格", "Visual style only")],
    ["system", t("完整系统提示词", "Complete system")],
    [
      selected.pageIds ? "component" : "page",
      selected.pageIds
        ? t("当前组件提示词", "Current component")
        : t("当前页面提示词", "Current page"),
    ],
  ];
  if (!choices.some(([key]) => key === scope)) scope = choices.at(-1)[0];
  const text = promptFor(c, selected, scope, locale);
  return `<p>${t("本站整理 · 与当前预览对应。将业务内容替换为你自己的项目。", "Curated by Atlas to match this preview. Substitute your own project context.")}</p><select class="prompt-select" id="prompt-scope" aria-label="${t("提示词层级", "Prompt scope")}">${choices.map(([key, label]) => `<option value="${key}" ${key === scope ? "selected" : ""}>${label}</option>`).join("")}</select><button class="button primary" data-copy-prompt>${t("复制提示词", "Copy prompt")}</button><pre class="prompt-text">${esc(text)}</pre>`;
}
function usage(c) {
  return c.source === "open-source"
    ? t(
        "React + TypeScript / Vite / Tailwind CSS / Radix / TanStack Table / Recharts。\n以下为实际演示源码。导入 @/ 别名、共享组件、主题样式、翻译文件和所需 Provider 后复用。\n完整依赖见 package.json；下载项目后：\nnpm ci\nnpm run dev\n构建：npm run build\n来源许可与依赖许可随下载包提供。",
        "React + TypeScript / Vite / Tailwind CSS / Radix / TanStack Table / Recharts.\nThis is the actual demo source. Include the @/ alias, shared UI, theme CSS, translations and required providers.\nSee package.json for all dependencies. After downloading:\nnpm ci\nnpm run dev\nBuild: npm run build\nSource and dependency licenses are included.",
      )
    : t(
        "原生 HTML / CSS / JavaScript。组件可下载含样式的独立 HTML；页面源码使用同目录的共享样式与脚本。",
        "HTML / CSS / JavaScript. Download a standalone HTML component with its styles; page source uses the shared scripts and styles in this repository.",
      );
}
async function codeContent(c) {
  const target = document.getElementById("inspector-content");
  if (!target) return;
  target.innerHTML = `<p>${t("正在读取本地源码…", "Loading local source…")}</p>`;
  const selection = selected.id;
  try {
    let files;
    if (c.source === "open-source") {
      codeCache ??= fetch("./code/shadcn-admin.json")
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .catch((e) => {
          codeCache = null;
          throw e;
        });
      files = (await codeCache).files;
    } else if (selected.pageIds) {
      files = {
        [selected.id + ".html"]: await componentDocument(
          { ...selected, name: l(selected.name) },
          locale,
        ),
        "components.js": await fetch("./components.js").then((r) => r.text()),
        "components.css": await fetch("./components.css").then((r) => r.text()),
      };
    } else {
      files = {};
      for (const file of selected.files)
        files[file] = await fetch("./" + file).then((r) => r.text());
    }
    if (selected?.id !== selection || activeTab !== "code") return;
    const first =
      c.source === "original" && selected.pageIds
        ? selected.id + ".html"
        : selected.files.find((f) => files[f]) || Object.keys(files)[0];
    target.innerHTML = `<p>${t("实际源码与依赖上下文", "Actual source & dependency context")}</p><div class="usage">${esc(usage(c))}</div><select class="code-file" id="code-file" aria-label="${t("源文件", "Source file")}">${[...new Set([first, ...Object.keys(files)])].map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}</select><div class="button-row" style="margin-top:10px"><button class="button primary" data-copy-code>${t("复制当前文件", "Copy file")}</button><button class="button" data-download-code>${t("下载当前文件", "Download file")}</button>${c.source === "open-source" ? `<a class="button" href="./downloads/shadcn-admin.zip" download>ZIP ↓</a>` : ""}</div><pre class="code-text" id="code-text">${esc(files[first])}</pre>`;
    target._files = files;
  } catch {
    if (selected?.id === selection)
      target.innerHTML = `<p>${t("源码读取失败，请检查本地构建是否完成并重试。", "Source could not be loaded. Check the local build and retry.")}</p><button class="button" data-tab="code">${t("重试", "Retry")}</button>`;
  }
}
function inspector() {
  const c = itemCase(selected);
  const target = document.getElementById("inspector");
  if (!target) return;
  target.innerHTML = `<div class="inspector-head"><div class="inspector-eyebrow"><span class="badge">${sourceLabel(c)}</span><button class="icon-button inspector-close" data-inspector aria-label="${t("关闭设计说明", "Close design details")}">${icon("x")}</button></div><h2>${esc(l(selected.name))}</h2><p>${esc(l(selected.description))}</p><div class="button-row">${saveButton(selected)}<a class="button small" href="${href("case", c.id, { page: selected.pageIds ? getPage(selected.pageIds[0]).key : selected.key })}">${t("所属系统", "System")} ↗</a></div><div class="inspector-downloads">${c.source === "open-source" ? `<a href="./downloads/shadcn-admin.zip" download>${icon("download")}${t("下载项目", "Download project")}</a>` : ""}<button data-export-brief>${icon("code-xml")}${t("导出说明", "Export brief")}</button></div></div><div class="tabs" role="tablist" aria-label="${t("设计详情", "Design details")}">${[
    ["notes", t("说明", "Notes")],
    ["prompt", t("提示词", "Prompt")],
    ["parts", t("组件", "Components")],
    ["code", t("代码", "Code")],
  ]
    .map(
      ([key, label]) =>
        `<button role="tab" data-tab="${key}" aria-selected="${activeTab === key}" aria-controls="inspector-content" id="tab-${key}">${label}</button>`,
    )
    .join(
      "",
    )}</div><div class="inspector-content" id="inspector-content" role="tabpanel" aria-labelledby="tab-${activeTab}">${activeTab === "notes" ? notes(c) : activeTab === "prompt" ? promptContent(c) : activeTab === "parts" ? related(c) : ""}</div>`;
  if (activeTab === "code") void codeContent(c);
}
function resources() {
  return `<section class="intro"><div><p class="eyebrow">TRACEABLE BY DESIGN</p><h1>${labelView("resources")}</h1></div></section><div class="prose"><h2>${t("画廊与预览器", "Gallery and viewer")} · shadcn/ui</h2><p>${t("浏览界面按 shadcn/ui 官方 Blocks 的顶部导航、大幅预览和精简工具栏适配；图标使用 Lucide，字体使用 Inter。原始文件与许可证均随站点保留。", "The gallery adapts shadcn/ui’s official Blocks navigation, large previews and compact toolbar. Icons are Lucide; type is Inter. Original references and licenses are included with this site.")}</p><p><a href="https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/components/block-viewer.tsx">shadcn/ui Block Viewer ↗</a> · <a href="./vendor/shadcn-ui/ATTRIBUTION.md">${t("来源与适配", "Source & adaptations")}</a> · <a href="./vendor/shadcn-ui/LICENSE.md">MIT</a></p><h2>Shadcn Admin · Sat Naing</h2><p>${t("首套开源系统直接收录源代码，在本站本地构建与演示。", "The first archived system is built from its source and hosted within this site.")}</p><p><a href="${upstream.repo}">${upstream.repo}</a><br>Commit: <code>${upstream.commit}</code><br><a href="${upstream.licenseFile}">MIT License</a></p><h2>${t("本站做了哪些适配", "Atlas adaptations")}</h2><p>${t("中英双语、本地演示数据读写、六个页面的导航、组件预览、静态部署和可运行下载包。原版视觉与组件代码保留，源码文件中标注来源。", "Chinese/English, local data operations, six-page navigation, component previews, static hosting and a runnable download. Original visuals and component code are retained with attribution.")}</p><p>${t("设计理念为本站根据界面整理的解读；提示词为本站编写，不代表原作者原文。", "Design notes are Atlas interpretations of the interface. Prompts are written by Atlas, rather than quoted from the author.")}</p><h2>${t("本站原创案例", "Atlas original cases")}</h2><p>Morrow / Orbit / Forma / Bloom — ${t("原创虚构前端演示，继续保留并可独立浏览。", "original fictional frontend examples, preserved as browsable cases.")}</p></div>`;
}
function guide() {
  return `<section class="intro"><div><p class="eyebrow">FROM PREVIEW TO IMPLEMENTATION</p><h1>${labelView("guide")}</h1></div></section><div class="prose"><h2>1. ${t("先体验界面", "Explore the interface")}</h2><p>${t("打开系统案例，切换页面、尺寸与主题。你在演示里点击导航时，右侧说明也会切换到对应页面。", "Open a system and switch pages, viewport sizes and themes. Navigation within the demo also updates the notes beside it.")}</p><h2>2. ${t("选择复用的规模", "Choose what to reuse")}</h2><p>${t("从系统进入页面，再进入关联组件。仅喜欢外观时复制风格提示词；需要整体结构时复制页面或系统提示词。", "Go from a system to a page and its related components. Copy the visual-style prompt for appearance, or the page/system prompt for its structure.")}</p><h2>3. ${t("带走真实代码", "Take the actual code")}</h2><p>${t("代码标签展示实际源码及依赖说明。整套 Shadcn Admin 可下载为独立项目，解压后执行：", "The Code tab contains actual source and dependency notes. Download the complete Shadcn Admin project, extract it and run:")}</p><pre>npm ci\nnpm run dev\n\n# ${t("构建静态页面", "Build static assets")}\nnpm run build</pre><h2>4. ${t("替换业务，再保存收藏", "Adapt the business context and save")}</h2><p>${t("替换项目名称、数据和业务需求，保留设计规则。收藏按浏览器保存，可导出 JSON 备份。演示数据可重置，所有操作均在本地完成。", "Replace names, data and requirements while retaining the design rules. Favorites stay in your browser and can be exported as JSON. Demo data can be reset; operations remain local.")}</p></div>`;
}
const coverObserver = new ResizeObserver((entries) =>
  entries.forEach((e) =>
    e.target.style.setProperty("--scale", e.contentRect.width / 1280),
  ),
);
const previewObserver = new ResizeObserver(() => scalePreview());
function observe() {
  coverObserver.disconnect();
  document
    .querySelectorAll(".cover-canvas")
    .forEach((el) => coverObserver.observe(el));
  previewObserver.disconnect();
  const v = document.getElementById("preview-viewport");
  if (v) previewObserver.observe(v);
  scalePreview();
}
function scalePreview() {
  const frame = document.getElementById("case-preview"),
    canvas = document.getElementById("preview-canvas"),
    v = document.getElementById("preview-viewport");
  if (!frame || !canvas || !v) return;
  const width = device || v.clientWidth;
  const scale = fit ? Math.min(1, v.clientWidth / width) : 1;
  const height = Math.ceil(v.clientHeight / scale);
  canvas.style.width = width * scale + "px";
  canvas.style.height = height * scale + "px";
  frame.style.width = width + "px";
  frame.style.height = height + "px";
  frame.style.transform = `scale(${scale})`;
}
function parseRoute() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  const [view = "explore", id] = path.split("/");
  return { view: view || "explore", id, params: new URLSearchParams(query) };
}
function render() {
  route = parseRoute();
  const lang = route.params.get("lang");
  if (["en", "zh-CN"].includes(lang)) locale = lang;
  if (["light", "dark"].includes(route.params.get("theme")))
    theme = route.params.get("theme");
  shell();
  selected = null;
  let content;
  if (["case", "page", "component"].includes(route.view)) {
    const item =
      route.view === "case"
        ? getCase(route.id)
        : route.view === "page"
          ? getPage(route.id)
          : getComponent(route.id);
    if (item) {
      const c = itemCase(item);
      content = detail(
        c,
        route.view === "case"
          ? c.pages.find((p) => p.key === route.params.get("page")) ||
              c.pages[0]
          : item,
      );
    } else
      content = `<div class="empty">${t("没有找到这个设计。", "Design not found.")} <a href="${href("explore")}">${t("返回图鉴", "Back to library")}</a></div>`;
  } else if (["cases", "pages", "components", "favorites"].includes(route.view))
    content = listing();
  else if (route.view === "resources") content = resources();
  else if (route.view === "guide") content = guide();
  else content = home();
  main.innerHTML = content;
  if (selected) inspector();
  updateViewerPanels();
  if (document.getElementById("filters")) {
    for (const select of document.querySelectorAll("#filters select"))
      select.value = route.params.get(select.name) || "all";
    refreshResults(false);
  }
  observe();
  document.body.classList.remove("menu-open");
  document.title =
    (selected ? l(selected.name) : labelView(route.view)) +
    " · UI Design Atlas";
}
function refreshResults(updateURL = true) {
  const el = document.getElementById("results");
  if (!el) return;
  el.innerHTML = results();
  if (updateURL) {
    const params = Object.fromEntries(
      new FormData(document.getElementById("filters")),
    );
    for (const k of Object.keys(params))
      if (params[k] === "all" || !params[k]) delete params[k];
    history.replaceState(null, "", href(route.view, "", params));
  }
  observe();
}
function notify(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("visible"), 3500);
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify(
      t(
        "已复制，可用于你的下一个项目。",
        "Copied. Ready for your next project.",
      ),
    );
  } catch {
    document.getElementById("fallback-text").value = text;
    document.getElementById("copy-fallback").showModal();
    document.getElementById("fallback-text").select();
  }
}
function download(text, name, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function navigatePreview(id) {
  const p = getPage(id);
  if (!p) return;
  selected = p;
  const c = getCase(p.caseId);
  document.getElementById("case-preview").src = frameURL(c, p);
  updatePreviewContext(c);
}
function updatePreviewContext(c) {
  const sel = document.getElementById("preview-page");
  if (sel) sel.value = selected.id;
  document.getElementById("standalone").href = frameURL(c, selected);
  const frame = document.getElementById("case-preview");
  frame.title = l(selected.name);
  if (route.view === "case")
    history.replaceState(
      null,
      "",
      href("case", c.id, { page: selected.key, theme }),
    );
  else if (route.view === "page")
    history.replaceState(null, "", href("page", selected.id, { theme }));
  route = parseRoute();
  inspector();

  observe();
}
document.addEventListener("click", async (e) => {
  if (e.target.closest("#search-results a"))
    document.getElementById("search-dialog").close();
  const button = e.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-search")) {
    openSearch();
    return;
  }
  if (button.hasAttribute("data-close-search")) {
    document.getElementById("search-dialog").close();
    return;
  }
  if (button.hasAttribute("data-inspector")) {
    const force = button.dataset.openTab;
    if (force) {
      activeTab = force;
      panelState = true;
      inspector();
    } else panelState = !document.body.classList.contains("inspector-open");
    updateViewerPanels();
    if (panelState && innerWidth < 1100)
      document.querySelector(".inspector-close")?.focus();
    return;
  }
  if (button.hasAttribute("data-menu")) {
    document.body.classList.toggle("menu-open");
    document
      .querySelector(".mobile-menu")
      .setAttribute(
        "aria-expanded",
        document.body.classList.contains("menu-open"),
      );
    return;
  }
  if (button.dataset.save) {
    const key = button.dataset.save;
    favorites.has(key) ? favorites.delete(key) : favorites.add(key);
    try {
      localStorage.setItem(
        "design-atlas-favorites",
        JSON.stringify([...favorites]),
      );
    } catch {
      notify(
        t(
          "收藏仅在当前会话有效，请导出备份。",
          "Favorites last for this session; export a backup.",
        ),
      );
    }
    shell();
    document.querySelectorAll("[data-save]").forEach((b) => {
      const [type, id] = b.dataset.save.split(":");
      const i = { case: getCase, page: getPage, component: getComponent }[type](
        id,
      );
      b.outerHTML = saveButton(i);
    });
    if (route.view === "favorites") refreshResults();
    return;
  }
  if (button.dataset.tab) {
    activeTab = button.dataset.tab;
    inspector();
    document
      .querySelector(`[data-tab="${activeTab}"]`)
      .focus({ preventScroll: true });
    return;
  }
  if (button.dataset.device) {
    device = Number(button.dataset.device);
    document.querySelectorAll("[data-device]").forEach((b) => {
      const yes = Number(b.dataset.device) === device;
      b.classList.toggle("selected", yes);
      b.setAttribute("aria-pressed", yes);
    });
    scalePreview();
    return;
  }
  if (button.hasAttribute("data-fit")) {
    fit = !fit;
    button.title = fit
      ? t("适应宽度", "Fit width")
      : t("原尺寸", "Actual size");
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-pressed", fit);
    scalePreview();
    return;
  }
  if (button.hasAttribute("data-theme")) {
    theme = theme === "light" ? "dark" : "light";
    syncThemeControls();
    document
      .getElementById("case-preview")
      .contentWindow.postMessage(
        { type: "atlas:preview-config", locale, theme },
        location.origin,
      );
    document.getElementById("standalone").href = frameURL(
      itemCase(selected),
      selected,
    );
    return;
  }
  if (button.hasAttribute("data-fullscreen")) {
    const p = document.getElementById("preview-panel");
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await p.requestFullscreen();
    } catch {
      notify(
        t(
          "请使用独立打开按钮查看大尺寸演示。",
          "Use the standalone button to view the full-size demo.",
        ),
      );
    }
    return;
  }
  if (button.hasAttribute("data-copy-prompt")) {
    await copy(promptFor(itemCase(selected), selected, scope, locale));
    return;
  }
  if (button.hasAttribute("data-copy-code")) {
    await copy(document.getElementById("code-text").textContent);
    return;
  }
  if (button.hasAttribute("data-download-code")) {
    download(
      document.getElementById("code-text").textContent,
      document.getElementById("code-file").value.split("/").at(-1),
    );
    return;
  }
  if (button.hasAttribute("data-export-brief")) {
    const c = itemCase(selected);
    download(
      `# ${l(c.name)}\n\n${l(c.description)}\n\n${["style", "system", selected.pageIds ? "component" : "page"].map((s) => `## ${s}\n\n${promptFor(c, selected, s, locale)}`).join("\n\n")}\n\n${c.source === "open-source" ? `${upstream.repo}\n${upstream.commit}\nMIT · ${upstream.author}` : "UI Design Atlas original"}`,
      `${c.id}-${locale}.md`,
      "text/markdown;charset=utf-8",
    );
    return;
  }
  if (button.hasAttribute("data-reset-filters")) {
    document.getElementById("filters").reset();
    refreshResults();
    return;
  }
  if (button.hasAttribute("data-export-favorites")) {
    download(
      JSON.stringify(
        { format: "ui-design-atlas", version: 1, favorites: [...favorites] },
        null,
        2,
      ),
      "design-atlas-favorites.json",
      "application/json",
    );
    return;
  }
  if (button.id === "fallback-close")
    document.getElementById("copy-fallback").close();
});
document.addEventListener("input", (e) => {
  if (e.target.closest("#filters")) refreshResults();
  if (e.target.id === "quick-search") searchResults();
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "filters") e.preventDefault();
});
document.addEventListener("change", async (e) => {
  if (e.target.id === "locale") {
    locale = e.target.value;
    try {
      localStorage.setItem("atlas-language", locale);
    } catch {}
    const u = parseRoute();
    u.params.set("lang", locale);
    history.replaceState(
      null,
      "",
      "#" + u.view + (u.id ? "/" + u.id : "") + "?" + u.params,
    );
    render();
  }
  if (e.target.id === "preview-page") navigatePreview(e.target.value);
  if (e.target.id === "prompt-scope") {
    scope = e.target.value;
    inspector();
  }
  if (e.target.id === "code-file") {
    const files = document.getElementById("inspector-content")._files;
    document.getElementById("code-text").textContent = files[e.target.value];
  }
  if (e.target.closest("#filters")) refreshResults();
  if (e.target.id === "import-favorites") {
    try {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 100000) throw Error();
      const data = JSON.parse(await f.text());
      if (
        data.format !== "ui-design-atlas" ||
        data.version !== 1 ||
        !Array.isArray(data.favorites) ||
        !data.favorites.every(validFavorite)
      )
        throw Error();
      data.favorites.forEach((v) => favorites.add(v));
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
  const frame = document.getElementById("case-preview");
  if (
    !frame ||
    e.origin !== location.origin ||
    e.source !== frame.contentWindow ||
    e.data?.type !== "atlas:preview-state" ||
    !selected
  )
    return;
  const c = itemCase(selected);
  if (e.data.caseId !== c.id) return;
  if (["light", "dark"].includes(e.data.theme)) {
    theme = e.data.theme;
    const b = document.querySelector("[data-theme]");
    if (b) syncThemeControls();
  }
  if (route.view === "component") return;
  const p = c.pages.find((p) =>
    c.source === "open-source" ? p.path === e.data.path : p.key === e.data.page,
  );
  if (p && p.id !== selected.id) {
    selected = p;
    updatePreviewContext(c);
  }
});
window.addEventListener("hashchange", () => {
  if (location.hash === "#collection") {
    document
      .getElementById("collection")
      ?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  activeTab = "notes";
  document.getElementById("search-dialog").close();
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
});
window.addEventListener("storage", (e) => {
  if (e.key === "design-atlas-favorites") {
    try {
      const list = JSON.parse(e.newValue || "[]");
      if (Array.isArray(list)) {
        favorites = new Set(list.filter(validFavorite));
        render();
      }
    } catch {}
  }
});
document.addEventListener("fullscreenchange", scalePreview);
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearch();
    return;
  }
  if (e.target.id === "quick-search" && e.key === "Enter") {
    e.preventDefault();
    document.querySelector("#search-results a")?.click();
    return;
  }
  if (
    e.target.closest("#search-results a") &&
    ["ArrowDown", "ArrowUp"].includes(e.key)
  ) {
    e.preventDefault();
    const rows = [...document.querySelectorAll("#search-results a")];
    const index = rows.indexOf(e.target.closest("a"));
    const next = index + (e.key === "ArrowDown" ? 1 : -1);
    if (next < 0) document.getElementById("quick-search").focus();
    else rows[Math.min(next, rows.length - 1)]?.focus();
    return;
  }
  if (e.target.id === "quick-search" && e.key === "ArrowDown") {
    e.preventDefault();
    document.querySelector("#search-results a")?.focus();
    return;
  }
  if (
    e.key === "Escape" &&
    document.body.classList.contains("is-viewer") &&
    !document.querySelector("dialog[open]") &&
    document.body.classList.contains("inspector-open")
  ) {
    panelState = false;
    updateViewerPanels();
    document.querySelector("[data-inspector]")?.focus();
  }
  if (e.key === "Escape") {
    document.body.classList.remove("menu-open");
    document
      .querySelector(".mobile-menu")
      ?.setAttribute("aria-expanded", "false");
  }
  if (
    e.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) &&
    !document.querySelector("dialog[open]")
  ) {
    const s = document.querySelector("#filters input");
    e.preventDefault();
    openSearch();
  }
  if (
    e.target.matches("[role=tab]") &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    e.preventDefault();
    const tabs = [...e.target.parentElement.children];
    const i = tabs.indexOf(e.target);
    const n =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    activeTab = tabs[n].dataset.tab;
    inspector();
    document.querySelector(`[data-tab="${activeTab}"]`).focus();
  }
});

function updateViewerPanels() {
  const open = panelState ?? innerWidth >= 1100;
  document.body.classList.toggle("inspector-open", open);
  document
    .querySelectorAll("[data-inspector]")
    .forEach((b) => b.setAttribute("aria-expanded", String(open)));
  if (document.getElementById("inspector"))
    document.getElementById("inspector").inert = !open;
  scalePreview();
}
function syncThemeControls() {
  const b = document.querySelector("[data-theme]");
  if (b) {
    b.innerHTML = icon(theme === "dark" ? "sun" : "moon");
    b.setAttribute(
      "aria-label",
      theme === "dark"
        ? t("切换浅色", "Switch to light")
        : t("切换深色", "Switch to dark"),
    );
  }
}
function openSearch() {
  const d = document.getElementById("search-dialog");
  if (d.open) return;
  d.showModal();
  document.getElementById("quick-search").value = "";
  searchResults();
  document.getElementById("quick-search").focus();
}
function searchResults() {
  const q = document.getElementById("quick-search").value.trim().toLowerCase();
  const all = [...cases, ...pages, ...components]
    .filter(
      (i) =>
        !q ||
        JSON.stringify([i.name, i.description, itemCase(i).style])
          .toLowerCase()
          .includes(q),
    )
    .slice(0, 9);
  document.getElementById("search-results").innerHTML = all.length
    ? all
        .map(
          (i) =>
            `<a href="${href(itemType(i), i.id, itemCase(i).source === "open-source" ? { theme: "dark" } : {})}"><span class="search-result-icon">${icon(itemType(i) === "component" ? "layers" : "layout-template")}</span><span><strong>${esc(l(i.name))}</strong><small>${esc(l(itemCase(i).style))} · ${{ case: t("系统", "System"), page: t("页面", "Page"), component: t("组件", "Component") }[itemType(i)]}</small></span>${icon("arrow-up-right")}</a>`,
        )
        .join("")
    : `<p class="search-empty">${t("没有匹配的设计", "No matching designs")}</p>`;
}
window.addEventListener("resize", updateViewerPanels);
render();

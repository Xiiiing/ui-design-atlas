// @ts-check
import { element, maybe, all } from "./dom.js";
import { icon } from "../icons.js";
import { replaceShellHTML } from "../shell/controls.tsx";
import { escapeHTML as esc } from "../components.js";
import { parseHash } from "./navigation.js";
import { resourceTags, interactions } from "../resource-tags.js";
import { resourcePresentation } from "../presentation.js";
import {
  getCase,
  libraries,
  resourceSource,
  resources,
  findResource,
  sourceProjects,
} from "../catalog.js";

/** @param {import("./types").Resource} r */
export const key = (r) => `${r.type}:${r.id}`;

/** @type {Record<string,[string,string]>} */
export const types = {
  component: ["组件", "Component"],
  block: ["区块", "Block"],
  page: ["页面", "Page"],
  case: ["完整案例", "System"],
};

/** @param {string} cover @param {import("./types").Theme} theme */
export const coverURL = (cover, theme) =>
  theme === "dark" ? cover.replace(/\.png$/, "-dark.png") : cover;

export { validFavorite } from "./favorite-data.js";

/** @param {import("./types").BaseDependencies & {syncNavigation:()=>void;shellTheme:()=>import("./types").Theme}} dependencies */
export function createResourceViews({
  appState,
  t,
  href,
  syncNavigation,
  l,
  shellTheme,
}) {
  function header() {
    document.documentElement.lang = appState.locale;
    element("#sidebar").innerHTML = "";
    const nav = [
      ["discover", "发现", "Discover", "grid-2x2"],
      ["explore", "探索资源", "Explore", "layers"],
      ["cases", "完整案例", "Systems", "layout-template"],
      ["favorites", "我的收藏", "Saved", "bookmark"],
    ]
      .map(([view, zh, en, glyph]) => {
        const active =
          appState.route.view === view ||
          (view === "explore" &&
            ["motion", "components", "blocks", "pages"].includes(
              appState.route.view,
            ));
        const label = t(zh, en);
        return `<a data-primary-view="${view}" href="${href(view)}" class="${active ? "active" : ""}" aria-label="${label}" title="${label}" ${active ? 'aria-current="page"' : ""}>${icon(glyph)}<span class="nav-label">${label}${view === "favorites" ? ` <small data-favorite-count${appState.favorites.size ? "" : " hidden"}>${appState.favorites.size}</small>` : ""}</span></a>`;
      })
      .join("");
    replaceShellHTML(
      element("#topbar"),
      `<div class="market-header"><a class="brand" href="${href()}" aria-label="${t("UI 设计图鉴首页", "UI Design Atlas home")}"><img class="brand-mark brand-light" src="./logo.svg" width="32" height="32" alt=""><img class="brand-mark brand-dark" src="./logo-reverse.svg" width="32" height="32" alt=""><span class="brand-name">atlas<span class="brand-dot">.</span></span></a><nav class="market-navigation" data-shell-group data-shell-key="primary-navigation" data-shell-variant="underline" aria-label="${t("主导航", "Main navigation")}">${nav}</nav><div class="market-header-actions"><span data-shell-navigation></span><span data-shell-appearance></span><button class="icon-button" data-search aria-label="${t("搜索设计", "Search designs")}" title="${t("搜索设计", "Search designs")}">${icon("search")}</button>${language()}<a class="header-github" href="https://github.com/Xiiiing/ui-design-atlas" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><span class="nav-label">GitHub</span>${icon("github")}</a></div></div>`,
    );
    syncNavigation();
    element("#footer").innerHTML =
      `<div class="market-footer"><a class="brand" href="${href()}" aria-label="${t("UI 设计图鉴首页", "UI Design Atlas home")}"><img class="brand-mark brand-light" src="./logo.svg" width="32" height="32" alt=""><img class="brand-mark brand-dark" src="./logo-reverse.svg" width="32" height="32" alt=""><span>atlas.</span></a><span>${t("找到喜欢的界面，把设计与代码一起带走。", "Find an interface. Take its ideas and code.")}</span><a href="${href("resources")}">${t("来源与许可", "Sources & licenses")}</a><a href="${href("guide")}">${t("使用指南", "How to reuse")}</a></div>`;
    element("#copy-title").textContent = t("复制内容", "Copy content");
    element("#copy-help").textContent = t(
      "请选择并复制下方内容。",
      "Select and copy the text below.",
    );
    element(".search-dialog-footer span").textContent = t(
      "↵ 打开 · Esc 关闭",
      "↵ Open · Esc Close",
    );
    element("#quick-search").placeholder = t(
      "搜索流光边框、表格、Fluent…",
      "Search a UI, effect or library…",
    );
  }

  /** @type {import("./types").Card} */
  const labelType = (r) => t(...types[r.type]);

  /** @param {string} url @param {string} label */
  const external = (url, label) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${icon("arrow-up-right")}</a>`;

  /** @param {import("./types").Resource} r */
  function saveButton(r) {
    return `<button class="icon-button asset-save ${appState.favorites.has(key(r)) ? "saved" : ""}" data-save="${key(r)}" aria-pressed="${appState.favorites.has(key(r))}" aria-label="${t("收藏", "Save")} ${esc(l(r.name))}">${icon("bookmark")}</button>`;
  }

  function language(viewer = false) {
    return `<select data-shell-control data-locale id="${viewer ? "locale" : "site-locale"}" aria-label="${t("语言", "Language")}"><option value="zh-CN" ${appState.locale === "zh-CN" ? "selected" : ""}>中文</option><option value="en" ${appState.locale === "en" ? "selected" : ""}>English</option></select>`;
  }

  /** @param {string} name @param {string} value */
  function tagURL(name, value) {
    const context = appState.originBrowse
      ? parseHash(appState.originBrowse.hash)
      : appState.route;
    const params = Object.fromEntries(context.params);
    for (const field of ["panel", "tab", "theme", "page"]) delete params[field];
    params[name] = value;
    return href(
      types[context.view] || context.view === "discover"
        ? "explore"
        : context.view,
      "",
      params,
    );
  }

  /** @param {import("./types").Resource} r */
  function tagLinks(r, full = false) {
    const tags = resourceTags(r, appState.locale);
    if (full)
      for (const value of r.interactions) {
        if (
          !tags.some((tag) => tag.name === "interaction" && tag.value === value)
        )
          tags.push({
            name: "interaction",
            value,
            label: t(...interactions[value]),
          });
      }
    return `<div class="resource-tags" aria-label="${t("标签", "Tags")}">${tags.map((tag) => `<a href="${tagURL(tag.name, tag.value)}" data-resource-tag="${tag.name}" data-tag-value="${esc(tag.value)}">${esc(tag.label)}</a>`).join("")}${
      full
        ? [...new Set(l(r.tags) || [])]
            .filter((label) => !tags.some((tag) => tag.label === label))
            .map((label) => `<span>${esc(label)}</span>`)
            .join("")
        : ""
    }</div>`;
  }

  /** @param {import("./types").Resource} r */
  function card(r) {
    const framing = resourcePresentation(r),
      inline = framing.mode === "inline";
    const name =
      r.type === "page" && r.caseId
        ? `${l(getCase(r.caseId)?.name || r.name).split(" · ")[0]} · ${l(r.name)}`
        : l(r.name);
    return `<article class="asset-card card" data-resource="${key(r)}" data-layout="${framing.layout}" data-experience="${framing.mode}" data-cover-layout="${framing.layout}">
  <div class="asset-preview"><img data-cover="${esc(r.cover)}" src="${esc(coverURL(r.cover, shellTheme()))}" alt="${esc(name)}" loading="lazy" width="${framing.width}" height="${framing.height}">${inline ? `<div class="asset-live" data-live="${key(r)}"></div><div class="preview-state" role="status"><span>${t("正在加载体验…", "Loading experience…")}</span><button type="button" class="button" data-retry-preview hidden>${t("重试", "Retry")}</button></div>` : `<a class="asset-cover-link" data-open="${key(r)}" href="${href(r.type, r.id)}" aria-label="${t("打开体验", "Open experience")} ${esc(name)}"><span>${icon("arrow-up-right")}${t("打开体验", "Open experience")}</span></a>`}</div>
  <div class="asset-caption"><a data-open="${key(r)}" data-details href="${href(r.type, r.id, { panel: "details" })}">${esc(name)}</a><span class="asset-libraries">${r.libraryIds.map((id) => `<span class="library-badge" title="${esc(libraries[id].name)}">${esc(libraries[id].name)}</span>`).join("")}</span></div>
  <p class="asset-description" id="description-${r.id}" title="${esc(l(r.description))}">${esc(l(r.description))}</p><div class="asset-footer">${tagLinks(r)}
  <div class="asset-actions"><button class="icon-button" data-card-prompt="${key(r)}" aria-label="${t("复制提示词", "Copy prompt")}" title="${t("复制提示词", "Copy prompt")}">${icon("copy")}</button><a class="icon-button" data-open="${key(r)}" data-details href="${href(r.type, r.id, { panel: "details" })}" aria-label="${t("查看详情", "Details")}" title="${t("查看详情", "Details")}">${icon("panel-right")}</a>${saveButton(r)}</div></div></article>`;
  }

  /** @param {import("./types").Resource} r @param {string} promptHTML */
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

  /** @param {import("./types").Resource} r */
  function provenance(r) {
    const s = resourceSource(r);
    return `<section class="detail-section provenance"><h3>${t("来源与组件库", "Source & libraries")}</h3>${r.libraryIds
      .map((id) => {
        const lib = libraries[id];
        return `<div class="library-credit"><strong>${esc(lib.name)}</strong><code>${esc(r.libraryVersions?.[id] || lib.version)}</code>${external(lib.docs, t("官方文档", "Official docs"))}</div>`;
      })
      .join(
        "",
      )}<p><strong>${esc(s.name)}</strong> · ${esc(s.author)}</p><div class="credit-links">${external(r.originalUrl || s.docs || s.repo, t("原始示例", "Original example"))}${external(r.sourceUrl || s.repo, t("源码地址", "Source code"))}${s.licenseFile ? external(s.licenseFile, s.license) : `<span>${esc(s.license)}</span>`}</div>${s.commit ? `<p class="commit-credit">${t("固定源码版本", "Pinned source")} <code>${s.commit}</code></p>` : ""}<p class="curator-label">${s.original ? t("本站原创组合；使用所列组件库，不代表上游官方页面。提示词、样式和业务交互随资源源码交付。", "An original Atlas composition using the listed libraries, not an official upstream page. Prompts, styles and interactions are included with the resource source.") : t("保留上游视觉与实现；本站适配语言、本地数据和预览入口。设计解读与提示词由本站整理。", "Upstream visuals and implementation, adapted for language, local data and previews. Notes and prompts are curated by Atlas.")}</p></section>`;
  }

  /** @param {import("./types").Resource} r */
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
    const pages =
      c?.pages
        .map((p) => findResource(p.id, "page"))
        .filter((r) => r !== undefined) || [];
    return `<section class="detail-section" id="related"><h3>${t(c ? "可复用组件" : "相关资源", c ? "Reusable components" : "Related resources")}</h3><div class="related-list">${parts
      .filter((x) => x.id !== r.id)
      .map(
        (x) =>
          `<a href="${href(x.type, x.id)}" data-related="${key(x)}"><span>${esc(l(x.name))}</span>${icon("arrow-up-right")}</a>`,
      )
      .join(
        "",
      )}</div>${c && pages.length ? `<h3>${t("所属系统与页面", "System & pages")}</h3><div class="related-list"><a href="${href("case", c.id)}" data-related="case:${c.id}">${esc(l(c.name))} ${icon("layout-template")}</a>${pages.map((x) => `<a href="${href(x.type, x.id)}" data-related="${key(x)}">${esc(l(x.name))}${icon("arrow-up-right")}</a>`).join("")}</div>` : ""}</section>`;
  }

  function caseDirectory() {
    const detail = appState.detailResource;
    if (detail?.type !== "case" || !detail.pages) return "";
    return `<section class="detail-section case-directory"><h3>${t("案例页面", "System pages")}</h3><div class="case-page-grid">${detail.pages
      .map((p) => {
        const item = findResource(p.id, "page");
        if (!item) return "";
        return `<button data-page-preview="${p.id}" aria-pressed="${p.id === appState.selected?.id}"><img loading="lazy" src="${item.cover}" alt=""><span>${esc(l(p.name))}</span></button>`;
      })
      .join("")}</div></section>`;
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
    return `<section class="market-intro"><div><h1>${t("从一个 UI，开始你的项目。", "From a UI to your project.")}</h1></div></section><div class="source-card guide-copy"><h2>1. ${t("搜索并体验", "Find and try")}</h2><p>${t("按名称、用途或组件库搜索，选择动效、组件、区块或完整案例。小组件可直接操作；大资源打开宽屏体验，返回后继续原来的浏览位置。", "Search by name, purpose or library. Try compact components in their cards; open larger resources in the wide experience. Return to resume browsing.")}</p><h2>2. ${t("读说明，复制提示词", "Read and copy a prompt")}</h2><p>${t("右侧说明与当前预览同步。复制当前资源提示词，或选择只复用视觉风格，替换成自己的业务需求。", "The notes follow the current preview. Copy its prompt, or the visual style only, and substitute your business requirements.")}</p><h2>3. ${t("带走实际代码", "Take the actual code")}</h2><p>${t("在体验页选择「详情」或「代码」。资源页提供实际入口、实现、依赖与来源说明；完整案例可切换页面继续体验。下载 ZIP 后运行以下命令。", "Choose Details or Code in the experience page for implementation, dependencies and provenance. Switch pages within a complete system. Extract the ZIP and run the commands below.")}</p><pre>npm ci\nnpm run dev\n\n# Build\nnpm run build</pre><h2>4. ${t("收藏并备份", "Save and back up")}</h2><p>${t("收藏保存在当前浏览器，可导出或导入 JSON。原有案例与组件收藏继续有效。", "Favorites stay in this browser and can be exported or imported as JSON. Existing favorites still work.")}</p></div>`;
  }
  return {
    header,
    labelType,
    external,
    saveButton,
    language,
    tagURL,
    tagLinks,
    card,
    resourceDetails,
    related,
    caseDirectory,
    sourcePage,
    guidePage,
  };
}

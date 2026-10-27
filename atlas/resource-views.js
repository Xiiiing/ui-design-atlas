// @ts-check
import { element, maybe, all } from "./dom.js";
import { icon } from "../icons.js";
import { replaceShellHTML } from "../shell/controls.tsx";
import { escapeHTML as esc } from "./html.js";
import { parseHash } from "./navigation.js";
import { guidanceForResource } from "../guidance-registry.js";
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
      ["explore", "资源库", "Library", "layers"],
      ["guidance", "设计指导", "Guidance", "layers"],
      ["tools", "资源导航", "Directory", "code-xml"],
    ]
      .map(([view, zh, en, glyph]) => {
        const active =
          appState.route.view === view ||
          (view === "guidance" && appState.route.view === "compose") ||
          (view === "explore" &&
            ["motion", "components", "blocks", "pages", "cases"].includes(
              appState.route.view,
            ));
        const label = t(zh, en);
        return `<a data-primary-view="${view}" href="${href(view)}" class="${active ? "active" : ""}" aria-label="${label}" title="${label}" ${active ? 'aria-current="page"' : ""}>${icon(glyph)}<span class="nav-label">${label}${view === "favorites" ? ` <small data-favorite-count${appState.favorites.size ? "" : " hidden"}>${appState.favorites.size}</small>` : ""}</span></a>`;
      })
      .join("");
    replaceShellHTML(
      element("#topbar"),
      `<div class="market-header"><a class="brand" href="${href()}" aria-label="${t("UI 设计图鉴首页", "UI Design Atlas home")}"><img class="brand-mark brand-light" src="./logo.svg" width="32" height="32" alt=""><img class="brand-mark brand-dark" src="./logo-reverse.svg" width="32" height="32" alt=""><span class="brand-name">atlas<span class="brand-dot">.</span></span></a><nav class="market-navigation" data-shell-group data-shell-key="primary-navigation" data-shell-variant="underline" aria-label="${t("主导航", "Main navigation")}">${nav}</nav><div class="market-header-actions"><a class="saved-shortcut icon-button ${appState.route.view === "favorites" ? "active" : ""}" data-primary-view="favorites" href="${href("favorites")}" aria-label="${t("我的收藏", "Saved")}" title="${t("我的收藏", "Saved")}" ${appState.route.view === "favorites" ? 'aria-current="page"' : ""}>${icon("bookmark")}<small data-favorite-count${appState.favorites.size ? "" : " hidden"}>${appState.favorites.size}</small></a><span data-shell-navigation></span><span data-shell-appearance></span><button class="icon-button" data-search aria-label="${t("搜索设计", "Search designs")}" title="${t("搜索设计", "Search designs")}">${icon("search")}</button>${language()}<a class="header-github" href="https://github.com/Xiiiing/ui-design-atlas" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><span class="nav-label">GitHub</span>${icon("github")}</a></div></div>`,
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
      "搜索界面、提示词、Skill…",
      "Search interfaces, prompts or skills…",
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
    const tags = resourceTags(r, appState.locale)
      .filter((tag) => full || tag.name !== "interaction")
      .slice(0, full ? undefined : 2);
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
    const redundant = new Set(
      [
        ...tags.map((tag) => tag.label),
        l(r.name),
        labelType(r),
        t("动效", "Motion"),
        t("交互", "Interaction"),
      ].map((label) => label.toLowerCase()),
    );
    return `<div class="resource-tags" aria-label="${t("标签", "Tags")}">${tags.map((tag) => `<a href="${tagURL(tag.name, tag.value)}" data-resource-tag="${tag.name}" data-tag-value="${esc(tag.value)}">${esc(tag.label)}</a>`).join("")}${
      full
        ? [...new Set(l(r.tags) || [])]
            .filter((label) => !redundant.has(label.toLowerCase()))
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
  <div class="asset-actions">${saveButton(r)}<span data-shell-card-menu></span><span hidden data-card-actions><button class="icon-button" data-card-prompt="${key(r)}" aria-label="${t("复制提示词", "Copy prompt")}" title="${t("复制提示词", "Copy prompt")}">${icon("copy")}</button><a class="icon-button" data-open="${key(r)}" data-details href="${href(r.type, r.id, { panel: "details" })}" aria-label="${t("查看详情", "Details")}" title="${t("查看详情", "Details")}">${icon("panel-right")}</a></span></div></div></article>`;
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
    const linked = guidanceForResource(key(r));
    const linkedHTML = linked.length
      ? `<section class="detail-section related-guidance"><h3>${t("相关设计指导", "Related guidance")}</h3>${linked.map((g) => `<a class="text-link" href="${href("guidance", g.id)}">${esc(l(g.name))}${icon("arrow-up-right")}</a>`).join("")}<a class="button" href="${href("compose", "", { reference: key(r) })}">${t("加入提示词组合", "Use in a prompt")}</a></section>`
      : "";
    return `<section class="detail-section"><h3>${t("适用场景", "Use cases")}</h3><p>${esc(l(r.useCases || c?.scene || r.description))}</p></section><section class="detail-section"><h3>${t("设计解读 · 本站整理", "Design notes · Atlas interpretation")}</h3><p>${esc(l(principle) || l(r.description))}</p>${
      rules
        ? `<ul>${l(rules)
            .map((x) => `<li>${esc(x)}</li>`)
            .join("")}</ul>`
        : ""
    }</section>${promptHTML}${provenance(r)}${linkedHTML}`;
  }

  /** @param {import("./types").Resource} r */
  function provenance(r) {
    const s = resourceSource(r);
    return `<details class="detail-section provenance"><summary>${t("来源与组件库", "Source & libraries")}</summary><div class="provenance-content">${r.libraryIds
      .map((id) => {
        const lib = libraries[id];
        return `<div class="library-credit"><strong>${esc(lib.name)}</strong><code>${esc(r.libraryVersions?.[id] || lib.version)}</code>${external(lib.docs, t("官方文档", "Official docs"))}</div>`;
      })
      .join(
        "",
      )}<p><strong>${esc(s.name)}</strong> · ${esc(s.author)}</p><div class="credit-links">${external(r.originalUrl || s.docs || s.repo, t("原始示例", "Original example"))}${external(r.sourceUrl || s.repo, t("源码地址", "Source code"))}${s.licenseFile ? external(s.licenseFile, s.license) : `<span>${esc(s.license)}</span>`}</div>${s.commit ? `<p class="commit-credit">${t("固定源码版本", "Pinned source")} <code>${s.commit}</code></p>` : ""}<p class="curator-label">${s.original ? t("本站原创组合；使用所列组件库，不代表上游官方页面。提示词、样式和业务交互随资源源码交付。", "An original Atlas composition using the listed libraries, not an official upstream page. Prompts, styles and interactions are included with the resource source.") : t("保留上游视觉与实现；本站适配语言、本地数据和预览入口。设计解读与提示词由本站整理。", "Upstream visuals and implementation, adapted for language, local data and previews. Notes and prompts are curated by Atlas.")}</p></div></details>`;
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
  };
}

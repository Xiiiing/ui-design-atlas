// @ts-check
import { element, maybe, all } from "./dom.js";
import { icon } from "../icons.js";
import { replaceShellHTML } from "../shell/controls.tsx";
import { escapeHTML as esc } from "./html.js";
import { parseHash } from "./navigation.js";
import { resourceTags, interactions, visualStyles } from "../resource-tags.js";
import { resourcePresentation } from "../presentation.js";
import { responsiveCovers, coverSrcset } from "../preview-covers.js";
import {
  getCase,
  libraries,
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
    if (params.category !== "cards") delete params.compare;
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
    const cover = coverURL(r.cover, shellTheme());
    const source = responsiveCovers.has(r.cover)
      ? `<source type="image/webp" srcset="${esc(coverSrcset(cover))}" sizes="(max-width: 599px) 90vw, (max-width: 899px) 90vw, (max-width: 1199px) 60vw, 620px">`
      : "";
    return `<article class="asset-card card" data-resource="${key(r)}" data-layout="${framing.layout}" data-experience="${framing.mode}" ${inline ? 'data-preview-state="idle"' : ""} data-cover-layout="${framing.layout}">
  <div class="asset-preview"><picture>${source}<img data-cover="${esc(r.cover)}" src="${esc(cover)}" alt="${esc(name)}" loading="lazy" decoding="async" width="${framing.width}" height="${framing.height}"></picture>${inline ? `<div class="asset-live" data-live="${key(r)}"></div><button class="asset-cover-link" type="button" data-start-preview><span><span data-preview-label>${t("启动预览", "Start preview")}</span><span class="sr-only"> ${esc(name)}</span></span></button><span class="sr-only" role="status" data-preview-status></span>` : `<a class="asset-cover-link" data-open="${key(r)}" href="${href(r.type, r.id)}" aria-label="${t("打开体验", "Open experience")} ${esc(name)}"><span>${icon("arrow-up-right")}${t("打开体验", "Open experience")}</span></a>`}</div>
  <span class="asset-type">${labelType(r)}</span><span class="asset-style">${t(...visualStyles[r.styleIds[0]])}</span>
  <div class="asset-caption"><a data-open="${key(r)}" data-details href="${href(r.type, r.id, { panel: "details" })}">${esc(name)}</a><span class="asset-libraries">${r.libraryIds.map((id) => `<span class="library-badge" title="${esc(libraries[id].name)}">${esc(libraries[id].name)}</span>`).join("")}</span></div>
  <p class="asset-description" id="description-${r.id}" title="${esc(l(r.description))}">${esc(l(r.description))}</p><div class="asset-footer">${tagLinks(r)}
  <div class="asset-actions">${saveButton(r)}<span data-shell-card-menu></span><span hidden data-card-actions><button class="icon-button" data-card-prompt="${key(r)}" aria-label="${t("复制提示词", "Copy prompt")}" title="${t("复制提示词", "Copy prompt")}">${icon("copy")}</button><a class="icon-button" data-open="${key(r)}" data-details href="${href(r.type, r.id, { panel: "details" })}" aria-label="${t("查看详情", "Details")}" title="${t("查看详情", "Details")}">${icon("panel-right")}</a></span></div></div></article>`;
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
  };
}

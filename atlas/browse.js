// @ts-check
import { element, maybe, all } from "./dom.js";
import { reconcileResults } from "./results.js";
import {
  sourceProjects,
  resources,
  discovery,
  libraries,
  searchResources,
  resourceSource,
} from "../catalog.js";
import { key, types } from "./resource-views.js";
import { icon } from "../icons.js";
import { escapeHTML as esc } from "./html.js";
import { categories, interactions, visualStyles } from "../resource-tags.js";
import taxonomy from "../content/taxonomy.json" with { type: "json" };
import { filterResources, facetCounts, selections } from "./filter-model.js";
import { parse } from "./navigation.js";

/** @param {import("./types").BaseDependencies & {card:import("./types").Card;observeCards:()=>void;extraSaved:(values:Record<string,string>,domain:string)=>{count:number;html:string;counts:Record<string,number>}}} dependencies */
export function createBrowse({
  appState,
  t,
  card,
  href,
  l,
  observeCards,
  extraSaved,
}) {
  /** @type {Record<string,string>} */
  const viewIcons = {
    explore: "grid-2x2",
    motion: "play",
    components: "layers",
    blocks: "layout-template",
    pages: "monitor",
    cases: "code-xml",
  };

  /** @type {Record<string,[string,string]>} */
  const viewModes = {
    explore: ["全部", "All"],
    motion: ["动效", "Motion"],
    components: ["组件", "Components"],
    blocks: ["区块", "Blocks"],
    pages: ["页面", "Pages"],
    cases: ["完整案例", "Systems"],
  };

  /** @type {Record<string,string>} */
  const modeTypes = {
    components: "component",
    blocks: "block",
    pages: "page",
    cases: "case",
    motion: "motion",
  };
  const classificationLabels = { category: categories, visual: visualStyles };
  /** @param {string} facet */
  const countsFor = (facet) =>
    facetCounts(
      resources,
      appState.route,
      appState.favorites,
      currentValues(),
      facet,
    );
  function activeMode() {
    return appState.route.view === "favorites"
      ? Object.keys(modeTypes).find(
          (mode) => modeTypes[mode] === appState.route.params.get("type"),
        ) || "explore"
      : appState.route.view;
  }
  /** @param {string} mode */
  function modeURL(mode) {
    const params = Object.fromEntries(appState.route.params);
    if (appState.route.view !== "favorites") return href(mode, "", params);
    if (modeTypes[mode]) params.type = modeTypes[mode];
    else delete params.type;
    return href("favorites", "", params);
  }
  /** @param {Map<string,number>} counts @param {string} v */
  function typeCount(counts, v) {
    return counts.get(v === "explore" ? "all" : modeTypes[v]) || 0;
  }
  function currentValues() {
    return maybe("#filters")
      ? formValues()
      : Object.fromEntries(appState.route.params);
  }

  /** @param {import("./types").Resource[]} items */
  function resultGroups(items) {
    if (currentValues().q?.trim())
      return `<section class="resource-group" data-type="search"><h2>${t("搜索结果", "Search results")}<span>${items.length}</span></h2><div class="market-grid comparison-grid">${items.map(card).join("")}</div></section>`;
    const order = ["component", "block", "page", "case"];
    return order
      .map((type) => {
        const group = items.filter((r) => r.type === type);
        return group.length
          ? `<section class="resource-group" data-type="${type}"><h2>${t(...types[type])}<span>${group.length}</span></h2><div class="market-grid comparison-grid comparison-${type}">${group.map(card).join("")}</div></section>`
          : "";
      })
      .join("");
  }

  /** @param {string} name @param {string} label @param {[string,string][]} entries */
  function selectFilter(name, label, entries) {
    const selected = selections(appState.route.params.get(name));
    return `<fieldset class="facet-group" data-facet="${name}"><legend>${label}</legend>${entries.map(([v, label]) => `<label><input type="checkbox" name="${name}" value="${v}" ${selected.includes(v) ? "checked" : ""}>${esc(label)} <span data-facet-count></span></label>`).join("")}</fieldset>`;
  }
  /** @param {"category"|"visual"} name @param {string} label @param {[string,string]} allLabels */
  function classification(name, label, allLabels) {
    const value = appState.route.params.get(name) || "all";
    const selected = selections(value);
    const counts = countsFor(name);
    return `<input type="hidden" name="${name}" value="${esc(value)}"><fieldset class="category-facet classification-facet"><legend>${label}</legend><div class="classification-options${name === "category" ? " category-strip" : ""}">${Object.entries(
      { all: allLabels, ...classificationLabels[name] },
    )
      .map(([id, labels]) => {
        const count = counts.get(id) || 0;
        const pressed = id === "all" ? !selected.length : selected.includes(id);
        return `<button type="button" data-${name}="${id}" aria-pressed="${pressed}" ${id !== "all" && !pressed && !count ? "disabled" : ""}>${t(...labels)}<span>${count}</span></button>`;
      })
      .join("")}</div></fieldset>`;
  }
  function savedDomain() {
    const value = appState.route.params.get("domain");
    return value === "guidance" || value === "tool" || value === "ui"
      ? value
      : [
            "type",
            "category",
            "library",
            "visual",
            "technology",
            "project",
            "motion",
            "interaction",
            "source",
            "style",
            "audience",
            "collection",
          ].some((key) => {
            const value = appState.route.params.get(key);
            return value && value !== "all";
          })
        ? "ui"
        : "all";
  }
  function savedContentOnly() {
    return (
      appState.route.view === "favorites" &&
      (["guidance", "tool"].includes(savedDomain()) ||
        (savedDomain() === "all" &&
          [...appState.favorites].some((key) => /^(guidance|tool):/.test(key))))
    );
  }
  function savedDomains() {
    if (appState.route.view !== "favorites") return "";
    return `<nav class="saved-domains" aria-label="${t("收藏范围", "Saved content scope")}">${Object.entries(
      {
        all: ["全部内容", "All content"],
        ui: ["界面", "Interfaces"],
        guidance: ["设计指导", "Guidance"],
        tool: ["资源导航", "Directory"],
      },
    )
      .map(
        ([domain, labels]) =>
          `<a data-saved-domain="${domain}" class="${savedDomain() === domain ? "active" : ""}" href="${href("favorites", "", { ...(domain !== "all" ? { domain } : {}), ...(appState.route.params.get("q") ? { q: appState.route.params.get("q") || "" } : {}) })}">${t(labels[0], labels[1])} <span></span></a>`,
      )
      .join("")}</nav>`;
  }
  function browseIntro() {
    const collection = discovery.collections.find(
      (c) => c.id === appState.route.params.get("collection"),
    );
    const favorite = appState.route.view === "favorites";
    return `<section class="market-intro browse-intro"><div><h1>${favorite ? t("我的收藏", "Saved resources") : collection ? esc(l(collection.name)) : t("界面资源库", "Interface library")}</h1></div>${favorite ? `<div class="button-row"><button class="button" data-export-favorites>${t("导出收藏", "Export saved")}</button><button type="button" class="button" data-import-favorites>${t("导入收藏", "Import saved")}</button><input type="file" hidden id="import-favorites" accept=".json"></div>` : ""}</section>`;
  }

  function listing() {
    return `${browseIntro()}${savedDomains()}<section class="market-collection" id="collection">${browseFilters()}<div id="results" class="browse-results" aria-live="polite"></div></section>`;
  }

  function browseFilters() {
    const collection = discovery.collections.find(
      (c) => c.id === appState.route.params.get("collection"),
    );
    const expanded = (appState.browseFiltersExpanded ??= [
      "library",
      "technology",
      "project",
      "motion",
      "interaction",
      "style",
      "source",
      "audience",
    ].some((k) => appState.route.params.has(k)));
    const contentOnly = savedContentOnly();
    const typeCounts = countsFor("type");
    return `<form id="filters" class="market-filters${contentOnly ? " content-only-filters" : ""}" data-expanded="${expanded}">${appState.route.view === "favorites" ? `<input type="hidden" name="domain" value="${savedDomain()}">` : ""}
  <div class="catalog-toolbar">  <nav class="market-tabs" data-shell-group data-shell-key="market-types" aria-label="${t("资源类型", "Resource types")}">${Object.entries(
    viewModes,
  )
    .map(
      ([v, labels]) =>
        `<a href="${modeURL(v)}" data-market-mode="${v}" class="${activeMode() === v ? "active" : ""}" ${activeMode() === v ? 'aria-current="page"' : ""}>${icon(viewIcons[v])}${t(labels[0], labels[1])}<span>${typeCount(typeCounts, v)}</span></a>`,
    )
    .join(
      "",
    )}</nav><label class="market-search">${icon("search")}<input name="q" type="search" aria-label="${appState.route.view === "favorites" ? t("搜索收藏", "Search saved") : t("搜索 UI", "Search UI")}" placeholder="${t("找一个按钮、悬停效果、表格…", "Find a button, hover effect, table…")}" value="${esc(appState.route.params.get("q") || "")}"><button class="icon-button" type="submit" aria-label="${t("搜索", "Search")}">${icon("arrow-right")}</button></label><div class="catalog-facets">
  <button type="button" class="button advanced-filters-toggle" data-advanced-filters aria-controls="advanced-filters" aria-expanded="${expanded}">${icon("sliders-horizontal")}${t("更多筛选", "More filters")}</button></div></div>
  ${collection ? `<input type="hidden" name="collection" value="${collection.id}">` : ""}
  ${classification("category", t("用途", "Purpose"), ["全部用途", "All purposes"])}
  ${classification("visual", t("视觉风格", "Visual style"), ["全部风格", "All styles"])}
  <div class="filter-options-row"><div class="active-filters" id="active-filters" aria-label="${t("已选条件", "Selected filters")}"></div></div>
  <div class="advanced-filters" id="advanced-filters"><fieldset class="facet-group collection-shortcuts"><legend>${t("主题合集", "Collections")}</legend>${discovery.collections.map((c) => `<a class="text-link" href="${href("explore", "", { collection: c.id })}">${esc(l(c.name))}${icon("arrow-up-right")}</a>`).join("")}</fieldset>${selectFilter(
    "library",
    t("组件库", "Libraries"),
    Object.values(libraries).map((x) => [x.id, x.name]),
  )}${selectFilter(
    "project",
    t("来源项目", "Source projects"),
    Object.values(sourceProjects).map((x) => [x.id, l(x.name)]),
  )}${selectFilter(
    "technology",
    t("实现技术", "Technology"),
    Object.entries(taxonomy.technologies).map(([id, labels]) => [
      id,
      t(labels[0], labels[1]),
    ]),
  )}${selectFilter("motion", t("动效能力", "Motion capability"), [
    ["yes", t("含动效", "Animated")],
    ["no", t("无动效", "Static")],
  ])}${selectFilter(
    "interaction",
    t("交互方式", "Interaction"),
    Object.entries(interactions).map(([id, labels]) => [
      id,
      t(labels[0], labels[1]),
    ]),
  )}${selectFilter(
    "source",
    t("全部来源", "All sources"),
    Object.entries(taxonomy.provenance).map(([id, labels]) => [
      id,
      t(labels[0], labels[1]),
    ]),
  )}${["style", "audience"]
    .filter((name) => appState.route.params.has(name))
    .map(
      (name) =>
        `<input type="hidden" name="${name}" value="${esc(appState.route.params.get(name) || "")}">`,
    )
    .join("")}</div>
  </form>`;
  }

  function formValues() {
    /** @type {Record<string,string>} */
    const values = {};
    for (const [name, value] of new FormData(element("#filters")))
      values[name] = values[name]
        ? values[name] + "," + String(value)
        : String(value);
    return values;
  }

  function updateFilterChips() {
    const form = maybe("#filters");
    if (!form) return;
    const values = formValues();
    /** @type {Record<string,string>} */
    const labels = {
      q: t("搜索", "Search"),
      category: t("分类", "Category"),
      library: t("组件库", "Library"),
      interaction: t("交互", "Interaction"),
      visual: t("风格", "Style"),
      technology: t("技术", "Technology"),
      motion: t("动效", "Motion"),
      style: t("风格", "Style"),
      source: t("来源", "Source"),
      project: t("来源项目", "Source project"),
      audience: t("场景", "Audience"),
      collection: t("主题", "Collection"),
    };
    const chips = Object.entries(values)
      .flatMap(([name, value]) =>
        (name === "q" ? [value] : selections(value)).map((v) => [name, v]),
      )
      .filter(([name, v]) => name !== "domain" && v && v !== "all");
    element("#active-filters").innerHTML =
      chips
        .map(([name, value]) => {
          const classificationLabel =
            (name === "category" || name === "visual") &&
            Object.hasOwn(classificationLabels[name], value)
              ? classificationLabels[name][value]
              : undefined;
          const label = classificationLabel
            ? t(...classificationLabel)
            : name === "collection"
              ? l(discovery.collections.find((c) => c.id === value)?.name)
              : name === "q"
                ? value
                : form
                    .querySelector(
                      `input[name="${name}"][value="${CSS.escape(value)}"]`,
                    )
                    ?.closest("label")
                    ?.textContent?.replace(/\s*\d+\s*$/, "") || value;
          return `<button type="button" class="filter-chip" data-remove-filter="${name}" data-filter-value="${esc(value)}" aria-label="${t("清除", "Remove")} ${esc(labels[name])}: ${esc(label)}"><span>${esc(label)}</span>${icon("x")}</button>`;
        })
        .join("") +
      (chips.length
        ? `<button type="button" class="clear-filters" data-reset-filters>${t("清空条件", "Clear all")}</button>`
        : "");
  }

  /** @param {import("./types").Route} [route] */
  function filtered(route = appState.route) {
    return filterResources(
      resources,
      route,
      appState.favorites,
      route === appState.route
        ? currentValues()
        : Object.fromEntries(route.params),
    );
  }
  function updateFacetCounts() {
    const typeCounts = countsFor("type");
    all("[data-market-mode]").forEach((el) => {
      const count = typeCount(typeCounts, el.dataset.marketMode || "explore");
      const unavailable = count === 0 && el.dataset.marketMode !== activeMode();
      el.setAttribute("aria-disabled", String(unavailable));
      el.tabIndex = unavailable ? -1 : 0;
      el.href = modeURL(el.dataset.marketMode || "explore");
      element("span", el).textContent = String(count);
    });
    const values = currentValues();
    for (const group of all("[data-facet]")) {
      const name = group.dataset.facet || "";
      const counts = facetCounts(
        resources,
        appState.route,
        appState.favorites,
        values,
        name,
      );
      for (const field of group.querySelectorAll("input")) {
        const count = counts.get(field.value) || 0;
        field.disabled = !field.checked && !count;
        const label = field.closest("label");
        if (label)
          element("[data-facet-count]", label).textContent = String(count);
      }
    }
    for (const name of ["category", "visual"]) {
      const counts = countsFor(name);
      const selected = selections(values[name]);
      for (const button of all(`[data-${name}]`)) {
        if (!(button instanceof HTMLButtonElement)) continue;
        const id = button.dataset[name] || "all";
        const count = counts.get(id) || 0;
        const pressed = id === "all" ? !selected.length : selected.includes(id);
        button.setAttribute("aria-pressed", String(pressed));
        button.disabled = id !== "all" && !pressed && !count;
        element("span", button).textContent = String(count);
      }
    }
  }

  /** @param {number} count */
  function resultsSummary(count) {
    return `<div class="market-results-line"><span><strong>${count}</strong> ${appState.route.view === "favorites" ? t("项收藏", "saved items") : t("个设计资源", "design resources")}</span><span><i class="status-dot"></i>${appState.route.view === "favorites" ? t("界面 · 指导 · 资源", "INTERFACES · GUIDANCE · RESOURCES") : t("真实交互预览 · 提示词与源码", "LIVE PREVIEWS · PROMPTS & SOURCE")}</span></div>`;
  }

  function filterParameters() {
    const params = formValues();
    for (const k in params)
      if (!params[k] || params[k] === "all") delete params[k];
    if (appState.route.view === "favorites" && modeTypes[activeMode()])
      params.type = modeTypes[activeMode()];
    return params;
  }

  function updateResults(updateURL = false) {
    if (!maybe("#results")) return;
    if (updateURL) {
      history.replaceState(
        { ...history.state, limit: appState.limit },
        "",
        href(appState.route.view, "", filterParameters()),
      );
      appState.route = parse();
    }
    maybe("#filters")?.classList.toggle(
      "content-only-filters",
      savedContentOnly(),
    );
    const domain = appState.route.view === "favorites" ? savedDomain() : "ui";
    const items = domain === "tool" || domain === "guidance" ? [] : filtered();
    const extra =
      appState.route.view === "favorites"
        ? extraSaved(currentValues(), domain)
        : { count: 0, html: "", counts: {} };
    for (const link of all("[data-saved-domain]"))
      element("span", link).textContent = String(
        extra.counts[link.dataset.savedDomain || "all"] || 0,
      );
    reconcileResults(
      element("#results"),
      `${resultsSummary(items.length + extra.count)}${items.length + extra.count ? `${resultGroups(items.slice(0, appState.limit))}${extra.html}${items.length > appState.limit ? `<button class="button load-more" data-more>${t("再看一些", "Explore more")} ${icon("arrow-down")}</button>` : ""}` : `<div class="market-empty">${icon("search")}<h2 tabindex="-1">${t("换个关键词试试", "Try another search")}</h2><p>${t("也可以清空筛选，看看其他界面。", "Clear the filters to discover more interfaces.")}</p><button class="button" data-reset-filters>${t("清空筛选", "Clear filters")}</button></div>`}`,
    );
    updateFilterChips();
    updateFacetCounts();
    observeCards();
  }

  function restoreFilters() {
    for (const el of all(
      "#filters select, #filters input:is([name=category], [name=visual])",
    ))
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement)
        el.value = appState.route.params.get(el.name) || "all";
    updateResults();
    updateFacetCounts();
    observeCards();
  }
  return { listing, filtered, updateResults, restoreFilters };
}

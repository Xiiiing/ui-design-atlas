import {
  resourceCounts,
  discoveryGallery,
  discoveryResources,
  resources,
  discovery,
  collectionResources,
  libraries,
  searchResources,
  resourceSource,
} from "../catalog.js";
import { key, types } from "./resource-views.js";
import { icon } from "../icons.js";
import { escapeHTML as esc } from "../components.js";
import { categories, interactions } from "../resource-tags.js";
import { parse } from "./navigation.js";

export function createBrowse({
  appState,
  t,
  card,
  href,
  l,
  stopAllLive,
  observeCards,
}) {
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

  function typeCount(v) {
    return v === "explore"
      ? resourceCounts.total
      : v === "motion"
        ? resourceCounts.motion
        : resourceCounts.byType.get(
            {
              components: "component",
              blocks: "block",
              pages: "page",
              cases: "case",
            }[v],
          ) || 0;
  }

  function discoveryPage() {
    const items = discoveryGallery().slice(0, appState.limit);
    const recommendedCases = discoveryResources("cases").filter(
      (r) => !items.some((item) => key(item) === key(r)),
    );
    return `${browseIntro()}
  <section class="library-browser" aria-label="${t("浏览资源", "Browse resources")}">${browseFilters()}
  <div class="browse-results">${resultsSummary(resources.length)}<section class="featured-section resource-group"><h2>${t("精选 UI", "Featured UI")}</h2><div class="market-grid discovery-grid">${items.slice(0, 8).map(card).join("")}</div></section><div class="market-grid discovery-grid library-continuation">${items.slice(8).map(card).join("")}</div></div>${items.length < resources.length ? `<button class="button load-more" data-discovery-more>${t("继续浏览", "Keep exploring")}${icon("arrow-down")}</button>` : ""}</section>
  <section class="discovery-section collection-section"><div class="discovery-section-heading"><h2>${t("主题合集", "Collections")}</h2></div><div class="discovery-collections">${discovery.collections
    .map((c) => {
      const parts = collectionResources(c.id);
      return `<a class="collection-card" href="${href("explore", "", { collection: c.id })}"><div class="collection-cover"><img loading="lazy" src="${parts[0].cover}" alt=""><img loading="lazy" src="${parts[1].cover}" alt=""></div><h3>${esc(l(c.name))}${icon("arrow-up-right")}</h3><p>${esc(l(c.description))}</p><span>${parts.length} ${t("项资源", "resources")}</span></a>`;
    })
    .join("")}</div></section>
  <section class="discovery-section systems-section" ${recommendedCases.length ? "" : "hidden"}><div class="discovery-section-heading"><h2>${t("完整网站与系统", "Websites & systems")}</h2><a class="text-link" href="${href("cases")}">${t("查看全部", "View all")}${icon("arrow-right")}</a></div><div class="market-grid discovery-grid">${recommendedCases.map(card).join("")}</div></section>`;
  }

  function resultGroups(items) {
    const order = document.querySelector("#filters [name=q]")?.value.trim()
      ? [...new Set(items.map((r) => r.type))]
      : ["component", "block", "page", "case"];
    return order
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

  function browseIntro() {
    const collection = discovery.collections.find(
      (c) => c.id === appState.route.params.get("collection"),
    );
    const favorite = appState.route.view === "favorites";
    return `<section class="market-intro browse-intro"><div><h1>${favorite ? t("我的收藏", "Saved resources") : collection ? esc(l(collection.name)) : esc(l(discovery.title))}</h1><p>${esc(l(discovery.description))}</p></div>${favorite ? `<div class="button-row"><button class="button" data-export-favorites>${t("导出收藏", "Export saved")}</button><label class="button">${t("导入收藏", "Import saved")}<input type="file" hidden id="import-favorites" accept=".json"></label></div>` : ""}</section>`;
  }

  function listing() {
    return `${browseIntro()}<section class="market-collection" id="collection">${browseFilters()}<div id="results" class="browse-results" aria-live="polite"></div></section>`;
  }

  function browseFilters() {
    const isDiscovery = appState.route.view === "discover";
    const collection = discovery.collections.find(
      (c) => c.id === appState.route.params.get("collection"),
    );
    const expanded = (appState.browseFiltersExpanded ??= [
      "interaction",
      "style",
      "source",
      "audience",
    ].some((k) => appState.route.params.has(k)));
    return `<form id="filters" class="market-filters" data-expanded="${expanded}">
  <div class="catalog-toolbar">  <nav class="market-tabs" data-shell-group data-shell-key="market-types" aria-label="${t("资源类型", "Resource types")}">${Object.entries(
    viewModes,
  )
    .map(
      ([v, labels]) =>
        `<a href="${href(v, "", Object.fromEntries(appState.route.params))}" data-market-mode="${v}" class="${(isDiscovery ? "explore" : appState.route.view) === v ? "active" : ""}" ${(isDiscovery ? "explore" : appState.route.view) === v ? 'aria-current="page"' : ""}>${icon(viewIcons[v])}${t(...labels)}<span>${typeCount(v)}</span></a>`,
    )
    .join(
      "",
    )}</nav><label class="market-search">${icon("search")}<input name="q" type="search" aria-label="${t("搜索 UI", "Search UI")}" placeholder="${t("找一个按钮、悬停效果、表格…", "Find a button, hover effect, table…")}" value="${esc(appState.route.params.get("q") || "")}"><button class="icon-button" type="submit" aria-label="${t("搜索", "Search")}">${icon("arrow-right")}</button></label></div>
  ${collection ? `<input type="hidden" name="collection" value="${collection.id}">` : ""}<input type="hidden" name="category" value="${esc(appState.route.params.get("category") || "all")}">
  <nav class="category-strip" data-shell-group data-shell-key="resource-categories" aria-label="${t("资源分类", "Resource categories")}">${[["all", ["全部分类", "All categories"]], ...Object.entries(categories)].map(([id, labels]) => `<button type="button" data-category="${id}" aria-pressed="${(appState.route.params.get("category") || "all") === id}">${t(...labels)}<span>${id === "all" ? resourceCounts.total : resourceCounts.byCategory.get(id) || 0}</span></button>`).join("")}</nav>
  <div class="filter-options-row"><div class="active-filters" id="active-filters" aria-label="${t("已选条件", "Selected filters")}"></div><div class="catalog-facets">
  ${selectFilter(
    "library",
    t("全部组件库", "All libraries"),
    Object.values(libraries).map((x) => [x.id, x.name]),
  )}
  <button type="button" class="button advanced-filters-toggle" data-advanced-filters aria-controls="advanced-filters" aria-expanded="${expanded}">${icon("sliders-horizontal")}${t("更多筛选", "Filters")}</button></div></div>
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
  </form>`;
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
      : Object.fromEntries(appState.route.params);
    const mode =
      appState.route.view === "favorites" ? "explore" : appState.route.view;
    const collectionIds = values.collection
      ? new Set(collectionResources(values.collection).map((r) => r.id))
      : null;
    return searchResources(
      values.q,
      resources.filter((r) => {
        if (collectionIds && !collectionIds.has(r.id)) return false;
        if (
          appState.route.view === "favorites" &&
          !appState.favorites.has(key(r))
        )
          return false;
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
        if (
          values.style &&
          values.style !== "all" &&
          r.styleId !== values.style
        )
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
          (values.source === "original") !== Boolean(resourceSource(r).original)
        )
          return false;
        return true;
      }),
    );
  }

  function resultsSummary(count) {
    return `<div class="market-results-line"><span><strong>${count}</strong> ${t("个设计资源", "design resources")}</span><span><i class="status-dot"></i>${t("真实交互预览 · 提示词与源码", "LIVE PREVIEWS · PROMPTS & SOURCE")}</span></div>`;
  }

  function filterParameters() {
    const params = Object.fromEntries(
      new FormData(document.querySelector("#filters")),
    );
    for (const k in params)
      if (!params[k] || params[k] === "all") delete params[k];
    return params;
  }

  function updateResults(updateURL = false) {
    if (appState.route.view === "discover" && updateURL) {
      location.hash = href("explore", "", filterParameters());
      return;
    }
    if (!document.querySelector("#results")) return;
    stopAllLive();
    const items = filtered();
    document.querySelector("#results").innerHTML =
      `${resultsSummary(items.length)}${items.length ? `${resultGroups(items.slice(0, appState.limit))}${items.length > appState.limit ? `<button class="button load-more" data-more>${t("再看一些", "Explore more")} ${icon("arrow-down")}</button>` : ""}` : `<div class="market-empty">${icon("search")}<h2>${t("换个关键词试试", "Try another search")}</h2><p>${t("也可以清空筛选，看看其他界面。", "Clear the filters to discover more interfaces.")}</p><button class="button" data-reset-filters>${t("清空筛选", "Clear filters")}</button></div>`}`;
    if (updateURL) {
      history.replaceState(
        { ...history.state, limit: appState.limit },
        "",
        href(appState.route.view, "", filterParameters()),
      );
      appState.route = parse();
    }
    document.querySelectorAll("[data-market-mode]").forEach((el) => {
      el.href = href(
        el.dataset.marketMode,
        "",
        Object.fromEntries(appState.route.params),
      );
    });
    updateFilterChips();
    observeCards();
  }

  function restoreFilters() {
    for (const el of document.querySelectorAll(
      "#filters select, #filters input[name=category]",
    ))
      el.value = appState.route.params.get(el.name) || "all";
    updateResults();
    observeCards();
  }
  return { discoveryPage, listing, filtered, updateResults, restoreFilters };
}

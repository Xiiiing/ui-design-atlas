// @ts-check
import { element, maybe, all } from "./atlas/dom.js";
import {
  isComposing,
  beginComposition,
  endComposition,
  createInputScheduler,
} from "./atlas/input.js";
import { createFavorites } from "./atlas/favorites.js";
import { readFavorites } from "./atlas/favorite-data.js";
import { types, key, coverURL } from "./atlas/resource-views.js";
import {
  replaceShellHTML,
  scrollBrowseTo,
  fieldValue,
  setFieldValue,
} from "./shell/controls.tsx";
import { parse, parseHash } from "./atlas/navigation.js";
import {
  findResource,
  resourcePreview,
  resourcePrompt,
  resources,
  discoveryGallery,
  discoveryResources,
  getCase,
} from "./catalog.js";
import { createLiveCards } from "./live-cards.js";
import { embeddedPreviewURL } from "./presentation.js";
import { icon } from "./icons.js";
import { createNavigation } from "./atlas/navigation.js";
import { createClipboard } from "./atlas/clipboard.js";
import { createResourceViews } from "./atlas/resource-views.js";
import { createSourceCode } from "./atlas/source-code.js";
import { createViewer } from "./atlas/viewer.js";
import { createBrowse } from "./atlas/browse.js";
import { createSearch } from "./atlas/search.js";

/** @type {import("./atlas/types").AppState} */
const appState = {
  locale: "zh-CN",
  favorites: new Set(),
  route: parse(),
  selected: null,
  detailResource: null,
  tab: "notes",
  theme: "light",
  width: 0,
  fit: true,
  limit: 24,
  previewLoadTimer: undefined,
  viewerThemeTarget: null,
  browseFiltersExpanded: undefined,
  originBrowse: null,
  currentFiles: {},
  previewValues: new Map(),
  renderedNavigation: undefined,
  previewResizeObserver: null,
};
const main = element("#main");

try {
  appState.locale =
    localStorage.getItem("atlas-language") === "en" ? "en" : "zh-CN";
} catch {}

try {
  appState.favorites = readFavorites(
    localStorage.getItem("design-atlas-favorites"),
  );
} catch {
  appState.favorites = new Set();
}

const shellTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** @type {import("./atlas/types").Translate} */
const t = (zh, en) => (appState.locale === "en" ? en : zh);
/** @type {import("./atlas/types").Localize} */
const l = (v) =>
  v && typeof v === "object" && "zh-CN" in v && "en" in v
    ? v[appState.locale]
    : v;

/** @type {import("./atlas/types").Href} */
const href = (view = "discover", id = "", params = {}) =>
  "#" +
  view +
  (id ? "/" + id : "") +
  "?" +
  new URLSearchParams({ lang: appState.locale, ...params });

window.addEventListener(
  "scroll",
  () => {
    syncNavigation();
    rememberSection(true);
  },
  { passive: true },
);

function render() {
  listInput.cancel();
  stopAllLive();
  clearTimeout(appState.previewLoadTimer);
  appState.previewResizeObserver?.disconnect();
  appState.renderedNavigation = location.href + JSON.stringify(history.state);
  const d = element("#asset-dialog");
  if (d.open) d.close();
  replaceShellHTML(d, "");
  appState.selected = null;
  appState.route = parse();
  const routeLocale = appState.route.params.get("lang");
  const routeTheme = appState.route.params.get("theme");
  if (routeLocale === "zh-CN" || routeLocale === "en")
    appState.locale = routeLocale;
  if (routeTheme === "dark" || routeTheme === "light")
    appState.theme = routeTheme;
  header();
  main.classList.toggle("library-page", !types[appState.route.view]);
  element("#topbar").hidden = false;
  element("#footer").hidden = false;
  document.body.classList.remove("is-viewer", "is-experience");
  if (types[appState.route.view]) {
    const r = findResource(appState.route.id || "", appState.route.view);
    if (r) {
      appState.originBrowse = history.state?.background || null;
      if (routeTheme !== "light" && routeTheme !== "dark")
        appState.theme = shellTheme();
      showViewer(r);
      return;
    }
    replaceShellHTML(
      main,
      `<div class="market-empty">${t("没有找到这个资源。", "Resource not found.")} <a href="${href()}">${t("返回市场", "Back to market")}</a></div>`,
    );
    return;
  }
  if (appState.route.view === "resources") {
    replaceShellHTML(main, sourcePage());
    return;
  }
  if (appState.route.view === "guide") {
    replaceShellHTML(main, guidePage());
    return;
  }
  appState.originBrowse = null;
  appState.limit = history.state?.browse?.limit || history.state?.limit || 24;
  replaceShellHTML(
    main,
    appState.route.view === "discover" ? discoveryPage() : listing(),
  );
  restoreFilters();
  const b = history.state?.browse;
  if (b)
    requestAnimationFrame(() => {
      scrollBrowseTo(b.scroll);
      if (b.focus)
        maybe(
          `[data-resource="${b.focus}"] ${b.focusSelector || "[data-open]"}`,
        )?.focus({ preventScroll: true });
    });
  document.title = t("UI 资源市场", "UI marketplace") + " · UI Design Atlas";
}

const liveCards = createLiveCards({
  resource: (/** @type {HTMLElement} */ card) => {
    const [type, id] = (card.dataset.resource || "").split(":");
    return findResource(id, type);
  },
  url: (/** @type {import("./atlas/types").Resource} */ r) =>
    resourcePreview(r, appState.locale, shellTheme()),
  config: () => ({ locale: appState.locale, theme: shellTheme() }),
  label: (/** @type {import("./atlas/types").Resource} */ r) => l(r.name),
  failure: () => t("体验加载失败", "Experience could not be loaded"),
  loading: () => t("正在加载体验…", "Loading experience…"),
});
const stopAllLive = () => liveCards.stop();
const observeCards = () =>
  liveCards.observe(all('.asset-card[data-experience="inline"]'));

const { rememberSection, syncNavigation, navigationChanged, activatePrimary } =
  createNavigation({ appState, href, render });

const { notify, copy, download } = createClipboard({ t });

const {
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
} = createResourceViews({ appState, t, href, syncNavigation, l, shellTheme });

const { loadCode } = createSourceCode({ appState, t, l, external });

const {
  inspector,
  promptText,
  showViewer,
  previewLoadState,
  beginPreviewLoad,
  openResource,
  closeViewer,
  syncDetailsPanel,
  toggleDetails,
  scalePreview,
  currentPrompt,
  syncPage,
  updateContext,
  sendPreviewTheme,
  acceptPreviewTheme,
  updateThemeURL,
} = createViewer({
  appState,
  labelType,
  t,
  saveButton,
  l,
  tagLinks,
  resourceDetails,
  caseDirectory,
  related,
  loadCode,
  language,
  stopAllLive,
  main,
  shellTheme,
  href,
  render,
});

const { discoveryPage, listing, filtered, updateResults, restoreFilters } =
  createBrowse({ appState, t, card, href, l, observeCards });

const favoriteActions = createFavorites({ appState, t, notify, updateResults });

const { openSearch, searchResults, handleSearchKeys } = createSearch({
  href,
  l,
  labelType,
  t,
});

const listInput = createInputScheduler(() => updateResults(true));
document.addEventListener("compositionstart", (event) => {
  beginComposition(event);
  if (
    event.target instanceof HTMLInputElement &&
    event.target.matches("#filters [name=q]")
  )
    listInput.cancel();
});
document.addEventListener("compositionend", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  endComposition(event);
  if (
    event.target.matches("#filters [name=q]") &&
    appState.route.view !== "discover"
  ) {
    appState.limit = 24;
    listInput.schedule();
  }
  if (event.target.id === "quick-search") searchResults();
});

document.addEventListener("submit", (e) => {
  if (!(e.target instanceof HTMLFormElement)) return;
  if (e.target.id !== "filters") return;
  e.preventDefault();
  if (isComposing({ target: element("#filters [name=q]") })) return;
  listInput.cancel();
  updateResults(true);
});
document.addEventListener("click", async (e) => {
  if (!(e.target instanceof Element)) return;
  if (e.target.closest("a, [data-open], [data-related]")) listInput.flush();
  const primary = e.target.closest("[data-primary-view]");
  if (primary && !(primary instanceof HTMLElement)) return;
  if (primary && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    activatePrimary(primary.dataset.primaryView || "discover");
    return;
  }

  const tagLink = e.target.closest("[data-resource-tag]");
  if (tagLink && !(tagLink instanceof HTMLElement)) return;
  if (tagLink && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    location.hash = tagURL(
      tagLink.dataset.resourceTag || "",
      tagLink.dataset.tagValue || "",
    );
    return;
  }
  const link = e.target.closest("[data-open],[data-related]");
  if (link && !(link instanceof HTMLElement)) return;
  if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    element("#search-dialog").close();
    const [type, id] = (link.dataset.open || link.dataset.related || "").split(
      ":",
    );
    openResource(
      id,
      type,
      false,
      link.hasAttribute("data-details") || link.hasAttribute("data-related"),
    );
    return;
  }
  if (e.target.closest("#search-results a")) element("#search-dialog").close();
  const b = e.target.closest("button");
  if (!b) return;
  if (b.hasAttribute("data-retry-preview"))
    return liveCards.retry(b.closest(".asset-card"));
  if (b.dataset.cardPrompt) {
    const [type, id] = b.dataset.cardPrompt.split(":");
    return copy(resourcePrompt(findResource(id, type), appState.locale));
  }
  if (b.hasAttribute("data-retry-viewer")) {
    beginPreviewLoad();
    element("#case-preview").src = embeddedPreviewURL(
      resourcePreview(appState.selected, appState.locale, appState.theme),
    );
    return;
  }
  if (b.hasAttribute("data-toggle-details")) return toggleDetails();
  if (b.hasAttribute("data-copy-resource-prompt") && appState.selected)
    return copy(promptText(appState.selected));
  if (b.hasAttribute("data-close-viewer")) return closeViewer();
  if (b.dataset.save) return favoriteActions.toggle(b.dataset.save);
  if (b.hasAttribute("data-import-favorites")) {
    const input = element("#import-favorites");
    input.value = "";
    input.click();
    return;
  }
  if (b.dataset.tab) {
    appState.tab = b.dataset.tab;
    const params = new URLSearchParams(appState.route.params);
    if (appState.tab === "code") params.set("tab", "code");
    else params.delete("tab");
    history.replaceState(
      history.state,
      "",
      href(appState.route.view, appState.route.id, Object.fromEntries(params)),
    );
    appState.route = parse();
    inspector();
    scalePreview();
    maybe(`[data-full-tab][data-tab="${appState.tab}"]`)?.focus();
    return;
  }
  if (b.dataset.pagePreview) {
    syncPage(b.dataset.pagePreview);
    if (innerWidth < 1024) toggleDetails(false);
    return;
  }
  if (b.hasAttribute("data-focus-prompt")) {
    toggleDetails(true);
    maybe("#prompt-scope")?.focus();
    maybe("#prompt-scope")?.scrollIntoView({ block: "center" });
    return;
  }
  if (b.dataset.device !== undefined) {
    appState.width = Number(b.dataset.device);
    all("[data-device]").forEach((el) => {
      el.classList.toggle(
        "selected",
        Number(el.dataset.device) === appState.width,
      );
      el.setAttribute(
        "aria-pressed",
        String(Number(el.dataset.device) === appState.width),
      );
    });
    scalePreview();
    return;
  }
  if (b.hasAttribute("data-fit")) {
    appState.fit = !appState.fit;
    b.setAttribute("aria-pressed", String(appState.fit));
    scalePreview();
    return;
  }
  if (b.hasAttribute("data-code-scope") && appState.selected) {
    const updated = await loadCode(appState.selected, b.dataset.codeScope);
    if (updated)
      maybe("#full-code [data-code-scope]")?.focus({ preventScroll: true });
    return;
  }
  if (b.hasAttribute("data-copy-install"))
    return copy(element(".code-integration pre").textContent);
  if (b.hasAttribute("data-copy-prompt")) return copy(currentPrompt());
  if (b.hasAttribute("data-copy-code"))
    return copy(element("#code-text").textContent);
  if (b.hasAttribute("data-download-code"))
    return download(
      element("#code-text").textContent,
      (fieldValue("code-file") || "source.txt").split("/").at(-1) ||
        "source.txt",
    );
  if (b.hasAttribute("data-share")) return copy(location.href);
  if (b.hasAttribute("data-replay")) {
    const f = element("#case-preview");
    f.contentWindow?.postMessage({ type: "atlas:replay" }, location.origin);
    return;
  }
  if (b.hasAttribute("data-preview-theme")) {
    appState.theme = appState.theme === "light" ? "dark" : "light";
    appState.viewerThemeTarget = appState.theme;
    updateThemeURL();
    b.innerHTML = icon(appState.theme === "dark" ? "sun" : "moon");
    element("#case-preview").contentWindow?.postMessage(
      {
        type: "atlas:preview-config",
        locale: appState.locale,
        theme: appState.theme,
      },
      location.origin,
    );
    element("#standalone").href = resourcePreview(
      appState.selected,
      appState.locale,
      appState.theme,
    );
    return;
  }
  if (b.hasAttribute("data-fullscreen")) {
    try {
      const p = element("#preview-panel");
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await p.requestFullscreen();
    } catch {
      notify(t("可使用独立打开查看演示。", "Use the standalone preview."));
    }
    return;
  }
  if (b.dataset.neighbor) {
    const list = appState.originBrowse?.items?.length
      ? appState.originBrowse.items
          .map((k) => {
            const [type, id] = k.split(":");
            return findResource(id, type);
          })
          .filter((r) => r !== undefined)
      : appState.originBrowse
        ? (() => {
            const saved = appState.route;
            appState.route = parseHash(appState.originBrowse.hash);
            const a = filtered();
            appState.route = saved;
            return a;
          })()
        : resources;
    const i = list.findIndex(
      (r) => key(r) === key(appState.detailResource || appState.selected || r),
    );
    const r =
      list[(i + Number(b.dataset.neighbor) + list.length) % list.length];
    if (r) openResource(r.id, r.type, true);
    return;
  }
  if (b.hasAttribute("data-discovery-more")) {
    stopAllLive();
    appState.limit += 24;
    const browse = { ...history.state?.browse, limit: appState.limit };
    history.replaceState(
      {
        ...history.state,
        limit: appState.limit,
        ...(history.state?.browse ? { browse } : {}),
      },
      "",
      location.href,
    );
    element(".library-continuation").innerHTML = discoveryGallery()
      .slice(8, appState.limit)
      .map(card)
      .join("");
    const visible = discoveryGallery().slice(0, appState.limit);
    const cases = discoveryResources("cases").filter(
      (r) => !visible.some((item) => key(item) === key(r)),
    );
    const section = element(".systems-section");
    section.hidden = !cases.length;
    element(".discovery-grid", section).innerHTML = cases.map(card).join("");
    if (appState.limit >= resources.length) b.remove();
    observeCards();
    return;
  }
  if (b.hasAttribute("data-more")) {
    appState.limit += 24;
    updateResults(true);
    return;
  }
  if (b.dataset.category) {
    element("#filters [name=category]").value = b.dataset.category;
    appState.limit = 24;
    updateResults(true);
    return;
  }
  if (b.dataset.removeFilter) {
    const name = b.dataset.removeFilter;
    const field = element(`#filters [name="${name}"]`);
    if (name === "q") field.value = "";
    else if (name === "collection") field.remove();
    else if (name === "category") field.value = "all";
    else setFieldValue("filter-" + name, "all");
    appState.limit = 24;
    updateResults(true);
    return;
  }
  if (b.hasAttribute("data-advanced-filters")) {
    const expanded = b.getAttribute("aria-expanded") !== "true";
    appState.browseFiltersExpanded = expanded;
    b.setAttribute("aria-expanded", String(expanded));
    element("#filters").dataset.expanded = String(expanded);
    return;
  }
  if (b.hasAttribute("data-reset-filters")) {
    const form = element("#filters");
    form.reset();
    queueMicrotask(() => {
      for (const el of all("select.atlas-select-native", form))
        setFieldValue(el.dataset.shellField || "", "all");
      element("[name=q]", form).value = "";
      element("[name=category]", form).value = "all";
      form.querySelector("[name=collection]")?.remove();
      appState.limit = 24;
      updateResults(true);
    });
    return;
  }
  if (b.hasAttribute("data-export-favorites"))
    return download(
      JSON.stringify(
        {
          format: "ui-design-atlas",
          version: 1,
          favorites: [...appState.favorites],
        },
        null,
        2,
      ),
      "design-atlas-favorites.json",
    );
  if (b.hasAttribute("data-search")) return openSearch();
  if (b.hasAttribute("data-close-search"))
    return element("#search-dialog").close();
  if (b.id === "fallback-close") element("#copy-fallback").close();
});
document.addEventListener("input", (e) => {
  if (!(e.target instanceof HTMLInputElement)) return;
  if (e.target.matches("[data-preview-setting]")) {
    if (!appState.selected) return;
    const field = e.target,
      value = Number(field.value);
    if (field.value === "" || !Number.isFinite(value) || !field.checkValidity())
      return;
    maybe("#case-preview")?.contentWindow?.postMessage(
      {
        type: "atlas:preview-settings",
        settings: { [field.dataset.previewSetting || "value"]: value },
      },
      location.origin,
    );
    field.dataset.appliedValue = String(value);
    appState.previewValues.set(appState.selected.id, value);
    const text = maybe(".inline-prompt, .full-prompt");
    if (text) text.textContent = currentPrompt();
    return;
  }

  if (isComposing(e)) return;
  if (
    e.target.matches("#filters [name=q]") &&
    appState.route.view !== "discover"
  ) {
    appState.limit = 24;
    listInput.schedule();
  }
  if (e.target.id === "quick-search") searchResults();
});
document.addEventListener("change", async (e) => {
  if (
    !(e.target instanceof HTMLInputElement) &&
    !(e.target instanceof HTMLSelectElement)
  )
    return;
  if (e.target.matches("[data-locale]")) {
    const triggerId = e.target.dataset.shellField || e.target.id;
    if (e.target.value !== "en" && e.target.value !== "zh-CN") return;
    appState.locale = e.target.value;
    try {
      localStorage.setItem("atlas-language", appState.locale);
    } catch {}
    const p = parse();
    p.params.set("lang", appState.locale);
    history.replaceState(
      history.state,
      "",
      "#" + p.view + (p.id ? "/" + p.id : "") + "?" + p.params,
    );
    render();
    requestAnimationFrame(() =>
      document.getElementById(triggerId)?.focus({ preventScroll: true }),
    );
  }
  if (e.target.closest("#filters") && e.target.matches("select")) {
    listInput.cancel();
    appState.limit = 24;
    updateResults(true);
  }
  if ((e.target.dataset.shellField || e.target.id) === "preview-page")
    syncPage(e.target.value);
  if ((e.target.dataset.shellField || e.target.id) === "code-file")
    element("#code-text").textContent = appState.currentFiles[e.target.value];
  if ((e.target.dataset.shellField || e.target.id) === "prompt-scope")
    element(".full-prompt").textContent = currentPrompt();
  if (
    e.target instanceof HTMLInputElement &&
    e.target.id === "import-favorites"
  ) {
    await favoriteActions.importFile(e.target);
    maybe("[data-import-favorites]")?.focus({ preventScroll: true });
  }
});
window.addEventListener("message", (e) => {
  const f = maybe("#case-preview");
  if (
    !appState.selected ||
    e.origin !== location.origin ||
    e.source !== f?.contentWindow
  )
    return;
  if (
    ["atlas:inline-ready", "atlas:inline-error"].includes(e.data?.type) &&
    e.data.resourceId === appState.selected.id
  ) {
    previewLoadState(e.data.type === "atlas:inline-ready" ? "ready" : "error");
    return;
  }
  if (
    e.data?.type === "atlas:escape" &&
    e.data.resourceId === appState.selected.id
  )
    return closeViewer();
  if (
    e.data?.type === "atlas:resource-state" &&
    e.data.resourceId === appState.selected.id
  ) {
    acceptPreviewTheme(e.data.theme);
    return;
  }
  if (
    e.data?.type !== "atlas:preview-state" ||
    e.data.caseId !== appState.selected.caseId
  )
    return;
  acceptPreviewTheme(e.data.theme);
  if (appState.selected.type === "component") return;
  const c = getCase(appState.selected.caseId);
  previewLoadState("ready");
  const p = c?.pages.find((p) =>
    c.source === "open-source" ? p.path === e.data.path : p.key === e.data.page,
  );
  if (p && p.id !== appState.selected.id) {
    appState.selected = findResource(p.id, "page") || null;
    updateContext();
  }
});

document.addEventListener("keydown", (e) => {
  if (!(e.target instanceof HTMLElement)) return;
  if (isComposing(e)) return;
  handleSearchKeys(e);
  if (
    e.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) &&
    !maybe("dialog[open]")
  ) {
    e.preventDefault();
    maybe("[name=q]")?.focus();
  }
  if (
    e.key === "Escape" &&
    !e.defaultPrevented &&
    !e.target.closest(".atlas-select-content, .atlas-menu-content") &&
    appState.selected &&
    !maybe("#asset-dialog[open]") &&
    !maybe("dialog[open]")
  )
    appState.route.params.get("panel") === "details"
      ? toggleDetails(false)
      : closeViewer();
  if (
    e.target.matches("[role=tab]") &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    e.preventDefault();
    const tabs = [...all("[role=tab]", e.target.parentElement || document)],
      i = tabs.indexOf(e.target),
      n =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? tabs.length - 1
            : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
    tabs[n].click();
    maybe(`[data-full-tab][data-tab="${appState.tab}"]`)?.focus();
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

window.addEventListener("hashchange", navigationChanged);
window.addEventListener("popstate", navigationChanged);
window.addEventListener("resize", () => {
  syncDetailsPanel();
  scalePreview();
});
window.addEventListener("fullscreenchange", scalePreview);
window.addEventListener("storage", favoriteActions.receive);
document.addEventListener(
  "cancel",
  (event) => {
    if (
      event.target instanceof HTMLInputElement &&
      event.target.id === "import-favorites"
    )
      maybe("[data-import-favorites]")?.focus({ preventScroll: true });
  },
  true,
);
appState.previewResizeObserver = new ResizeObserver(scalePreview);
render();

window.addEventListener("atlas:shell-theme", () => {
  liveCards.configure();
  all("img[data-cover]").forEach((img) => {
    img.src = coverURL(img.dataset.cover || "", shellTheme());
  });
  if (!appState.selected) return;
  const nextTheme = shellTheme();
  // Same-color mode changes do not produce an iframe acknowledgement.
  // Do not leave a pending target that would reject the next native choice.
  if (appState.theme !== nextTheme) appState.viewerThemeTarget = nextTheme;
  appState.theme = nextTheme;
  sendPreviewTheme();
  element("[data-preview-theme]").innerHTML = icon(
    appState.theme === "dark" ? "sun" : "moon",
  );
  updateThemeURL(true);
});

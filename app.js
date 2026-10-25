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
import { createFilterActions } from "./atlas/filter-actions.js";
import { reconcileResults } from "./atlas/results.js";
import { loadResourceDetails } from "./atlas/resource-data.js";
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
import { createNavigationActions } from "./atlas/navigation-actions.js";
import { createNavigation } from "./atlas/navigation.js";
import { createClipboard } from "./atlas/clipboard.js";
import { createResourceViews } from "./atlas/resource-views.js";

import { createPreviewActions } from "./atlas/preview-actions.js";
import { createSourceActions } from "./atlas/source-actions.js";
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

/** @type {Promise<ReturnType<typeof import("./atlas/source-code.js").createSourceCode>>|undefined} */
let sourceController;
/** @param {import("./atlas/types").Resource} resource @param {string} [scope] */
async function loadCode(resource, scope) {
  sourceController ||= import("./atlas/source-code.js")
    .then(({ createSourceCode }) =>
      createSourceCode({ appState, t, l, external }),
    )
    .catch((error) => {
      sourceController = undefined;
      throw error;
    });
  return (await sourceController).loadCode(resource, scope);
}

const {
  inspector,
  loadViewerDetails,
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

const handleNavigationClick = createNavigationActions({
  activatePrimary,
  tagURL,
  openResource,
});

const handlePreviewAction = createPreviewActions({
  appState,
  t,
  notify,
  beginPreviewLoad,
  loadViewerDetails,
  toggleDetails,
  scalePreview,
  updateThemeURL,
});
const handleSourceAction = createSourceActions({
  appState,
  loadCode,
  copy,
  download,
});
const favoriteActions = createFavorites({ appState, t, notify, updateResults });

const { openSearch, searchResults, handleSearchKeys } = createSearch({
  href,
  l,
  labelType,
  t,
});

const listInput = createInputScheduler(() => updateResults(true));
const handleFilterAction = createFilterActions({
  appState,
  updateResults,
  cancelInput: () => listInput.cancel(),
});
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
  if (handleNavigationClick(e)) return;
  const b = e.target.closest("button");
  if (!b) return;
  if ((await handlePreviewAction(b)) || (await handleSourceAction(b))) return;
  if (b.hasAttribute("data-retry-preview"))
    return liveCards.retry(b.closest(".asset-card"));
  if (b.dataset.cardPrompt) {
    const [type, id] = b.dataset.cardPrompt.split(":");
    const resource = findResource(id, type);
    if (resource)
      try {
        return copy(
          resourcePrompt(await loadResourceDetails(resource), appState.locale),
        );
      } catch {
        notify(
          t("提示词读取失败，请重试。", "Could not load prompt. Please retry."),
        );
      }
    return;
  }
  if (b.hasAttribute("data-copy-resource-prompt") && appState.selected)
    try {
      return copy(promptText(await loadResourceDetails(appState.selected)));
    } catch {
      notify(
        t("提示词读取失败，请重试。", "Could not load prompt. Please retry."),
      );
      return;
    }
  if (b.hasAttribute("data-close-viewer")) return closeViewer();
  if (b.dataset.save) return favoriteActions.toggle(b.dataset.save);
  if (b.hasAttribute("data-import-favorites")) {
    const input = element("#import-favorites");
    input.value = "";
    input.click();
    return;
  }
  if (b.dataset.tab === "code" || b.dataset.tab === "notes") {
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
  if (b.hasAttribute("data-copy-prompt") && appState.selected) {
    try {
      return copy(
        promptText(
          await loadResourceDetails(appState.selected),
          fieldValue("prompt-scope") === "style"
            ? "style"
            : appState.selected.type,
        ),
      );
    } catch {
      notify(
        t("提示词读取失败，请重试。", "Could not load prompt. Please retry."),
      );
      return;
    }
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
            return filtered(parseHash(appState.originBrowse.hash));
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
    reconcileResults(
      element(".library-continuation"),
      discoveryGallery().slice(8, appState.limit).map(card).join(""),
    );
    const visible = discoveryGallery().slice(0, appState.limit);
    const cases = discoveryResources("cases").filter(
      (r) => !visible.some((item) => key(item) === key(r)),
    );
    const section = element(".systems-section");
    section.hidden = !cases.length;
    reconcileResults(
      element(".discovery-grid", section),
      cases.map(card).join(""),
    );
    if (appState.limit >= resources.length) b.remove();
    observeCards();
    return;
  }
  if (handleFilterAction(b)) return;
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
  if (
    e.target.closest("#filters") &&
    e.target.matches("select, input[type=checkbox]")
  ) {
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

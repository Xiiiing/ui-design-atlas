// @ts-check
import { element, maybe, all } from "./dom.js";
import { browseScroll, scrollBrowseTo } from "../shell/controls.tsx";

/** @type {readonly import('./types').View[]} */
const views = [
  "discover",
  "explore",
  "favorites",
  "motion",
  "components",
  "blocks",
  "pages",
  "cases",
  "resources",
  "guide",
  "guidance",
  "tools",
  "compose",
  "component",
  "block",
  "page",
  "case",
];
/** @param {string} value @returns {value is import('./types').View} */
const isView = (value) => views.some((view) => view === value);
export function parse() {
  return parseHash(location.hash);
}
/** @param {string} hash @returns {import('./types').Route} */
export function parseHash(hash) {
  const [path, query = ""] = hash.replace(/^#/, "").split("?");
  const [candidate = "discover", id] = path.split("/");
  return {
    view: isView(candidate) ? candidate : "discover",
    id,
    params: new URLSearchParams(query),
  };
}

/** @param {string} view */
export const sectionOf = (view) =>
  ["motion", "components", "blocks", "pages", "cases"].includes(view)
    ? "explore"
    : view;

/** @param {Pick<import("./types").BaseDependencies,"appState"|"href"> & {render:()=>void}} dependencies */
export function createNavigation({ appState, href, render }) {
  /** @type {Map<string,import("./types").BrowseState>} */
  const sectionMemory = new Map();

  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let browseSaveTimer;

  let compactNavigation = false;

  function rememberSection(defer = false) {
    if (
      !appState.route ||
      appState.route.id ||
      appState.selected ||
      ![
        "discover",
        "explore",
        "cases",
        "favorites",
        "guidance",
        "tools",
      ].includes(sectionOf(appState.route.view))
    )
      return;
    const browse = {
      ...history.state?.browse,
      hash: location.hash || href(),
      scroll: browseScroll(),
      limit: appState.limit,
    };
    sectionMemory.set(sectionOf(appState.route.view), browse);
    // Avoid writing browser history on every animation frame while scrolling.
    clearTimeout(browseSaveTimer);
    const url = location.href;
    const persist = () => {
      if (location.href !== url) return;
      history.replaceState({ ...history.state, browse }, "", url);
      appState.renderedNavigation = url + JSON.stringify(history.state);
    };
    if (defer) browseSaveTimer = setTimeout(persist, 150);
    else persist();
  }

  function syncNavigation() {
    compactNavigation = scrollY > (compactNavigation ? 48 : 96);
    element("#topbar").classList.toggle("is-compact", compactNavigation);
  }

  function navigationChanged() {
    if (
      appState.renderedNavigation ===
      location.href + JSON.stringify(history.state)
    )
      return;
    element("#search-dialog").close();
    render();
    if (!history.state?.browse) scrollBrowseTo(0);
  }

  /** @param {string} target */
  function activatePrimary(target) {
    if (
      !appState.selected &&
      !appState.route.id &&
      sectionOf(appState.route.view) === target
    )
      return;
    rememberSection();
    const previous = sectionMemory.get(target);
    // Main navigation restores the section, not a previous detail-entry focus.
    const browse = {
      hash: previous?.hash || href(target),
      scroll: previous?.scroll ?? browseScroll(),
      limit: previous?.limit || 24,
    };
    const destination = new URLSearchParams(browse.hash.split("?")[1] || "");
    destination.set("lang", appState.locale);
    history.pushState(
      { browse },
      "",
      browse.hash.split("?")[0] + "?" + destination,
    );
    render();
    scrollBrowseTo(browse.scroll);
    syncNavigation();
    maybe(`[data-primary-view="${target}"]`)?.focus({ preventScroll: true });
  }
  return {
    rememberSection,
    syncNavigation,
    navigationChanged,
    activatePrimary,
  };
}

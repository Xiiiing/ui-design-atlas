import { browseScroll, scrollBrowseTo } from "../shell/controls.tsx";

export function parse() {
  const [path, q = ""] = location.hash.slice(1).split("?");
  const [view = "discover", id] = path.split("/");
  return { view: view || "discover", id, params: new URLSearchParams(q) };
}

export function parseHash(hash) {
  const [p, q = ""] = hash.replace(/^#/, "").split("?");
  return { view: p || "discover", params: new URLSearchParams(q) };
}

export const sectionOf = (view) =>
  ["motion", "components", "blocks", "pages"].includes(view) ? "explore" : view;

export function createNavigation({ appState, href, render }) {
  const sectionMemory = new Map();

  let browseSaveTimer;

  let compactNavigation = false;

  function rememberSection(defer = false) {
    if (
      !appState.route ||
      appState.selected ||
      !["discover", "explore", "cases", "favorites"].includes(
        sectionOf(appState.route.view),
      )
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
    document
      .querySelector("#topbar")
      .classList.toggle("is-compact", compactNavigation);
  }

  function navigationChanged() {
    if (
      appState.renderedNavigation ===
      location.href + JSON.stringify(history.state)
    )
      return;
    document.querySelector("#search-dialog").close();
    render();
    if (!history.state?.browse) scrollBrowseTo(0);
  }

  function activatePrimary(target) {
    if (!appState.selected && sectionOf(appState.route.view) === target) return;
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
    document
      .querySelector(`[data-primary-view="${target}"]`)
      ?.focus({ preventScroll: true });
  }
  return {
    rememberSection,
    syncNavigation,
    navigationChanged,
    activatePrimary,
  };
}

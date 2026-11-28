// @ts-check
import { all } from "./dom.js";
import { key } from "./resource-views.js";
import { findResource } from "../catalog.js";
import { designScope } from "./library-classification.js";
import { parse } from "./navigation.js";
import {
  browseScroll,
  scrollBrowseTo,
  replaceShellHTML,
} from "../shell/controls.tsx";

/** @param {Parameters<typeof import("./viewer").createViewer>[0]} dependencies */
export function createLazyViewer(dependencies) {
  const { appState, href, render, main, t, shellTheme } = dependencies;
  /** @type {ReturnType<typeof import("./viewer").createViewer>|undefined} */
  let viewer;
  /** @type {Promise<ReturnType<typeof import("./viewer").createViewer>>|undefined} */
  let pending;
  let serial = 0;

  function load() {
    pending ||= import("./viewer.js")
      .then(({ createViewer }) => (viewer = createViewer(dependencies)))
      .catch((error) => {
        pending = undefined;
        throw error;
      });
    return pending;
  }

  /** @param {import("./types").Resource} resource */
  async function showViewer(resource) {
    const request = ++serial;
    const url = location.href;
    if (viewer) {
      viewer.showViewer(resource);
      return;
    }
    replaceShellHTML(
      main,
      `<p role="status">${t("正在加载体验…", "Loading experience…")}</p>`,
    );
    try {
      const loaded = await load();
      if (request === serial && location.href === url) {
        if (!appState.route.params.has("theme")) appState.theme = shellTheme();
        loaded.showViewer(resource);
      }
    } catch {
      if (request === serial && location.href === url)
        replaceShellHTML(
          main,
          `<p role="alert">${t("体验工具加载失败，请重新加载页面重试。", "The viewer could not be loaded. Reload the page to retry.")}</p><button class="button" data-reload-viewer>${t("重新加载页面", "Reload page")}</button>`,
        );
    }
  }

  /** @param {string} id @param {string} type */
  function openResource(id, type, replace = false, details = false) {
    const r = findResource(id, type);
    if (!r) return;
    if (!appState.selected) {
      appState.theme = shellTheme();
      appState.originBrowse = {
        hash: location.hash || href(),
        scroll: browseScroll(),
        limit: appState.limit,
        focus: key(r),
        focusSelector: document.activeElement?.closest(".asset-actions")
          ? ".card-menu-trigger"
          : document.activeElement?.closest(".asset-caption")
            ? ".asset-caption [data-open]"
            : "[data-open]",
        items: [...all(".asset-card")].map((el) => el.dataset.resource || ""),
      };
      history.replaceState(
        { ...history.state, browse: appState.originBrowse },
        "",
        location.href,
      );
    }
    const depth = history.state?.resourceDepth || 0;
    const state = {
      background: appState.originBrowse,
      resourceDepth: replace ? Math.max(1, depth) : depth + 1,
    };
    const url = href(r.type, r.id, {
      ...(details ? { panel: "details" } : {}),
    });
    history[replace ? "replaceState" : "pushState"](state, "", url);
    appState.route = parse();
    render();
    scrollBrowseTo(0);
  }

  function closeViewer() {
    if (appState.originBrowse && history.state?.resourceDepth) {
      history.go(-history.state.resourceDepth);
      return;
    }
    location.hash = href(appState.selected && designScope(appState.selected) ? "designs" : "library").slice(1);
  }

  return {
    fullscreen: {
      sync: () => viewer?.fullscreen.sync(),
      active: () => viewer?.fullscreen.active() ?? false,
      reset: () => viewer?.fullscreen.reset(),
    },
    /** @param {HTMLButtonElement} button */
    handlePreviewAction: (button) => viewer?.handlePreviewAction(button),
    /** @param {HTMLButtonElement} button */
    handleSourceAction: (button) => viewer?.handleSourceAction(button),
    showViewer,
    openResource,
    closeViewer,
    inspector: () => viewer?.inspector(),
    /** @param {import("./types").Resource} resource */
    loadViewerDetails: async (resource) => {
      await viewer?.loadViewerDetails(resource);
    },
    /** @param {import("./types").Resource} resource @param {string} [scope] */
    promptText: (resource, scope) => viewer?.promptText(resource, scope) || "",
    /** @param {"loading"|"error"|"ready"} state */
    previewLoadState: (state) => viewer?.previewLoadState(state),
    beginPreviewLoad: () => viewer?.beginPreviewLoad(),
    /** @param {boolean} [focus] */
    syncDetailsPanel: (focus) => viewer?.syncDetailsPanel(focus),
    /** @param {boolean} [open] */
    toggleDetails: (open) => viewer?.toggleDetails(open),
    scalePreview: () => viewer?.scalePreview(),
    currentPrompt: () => viewer?.currentPrompt() || "",
    /** @param {string} id */
    syncPage: (id) => viewer?.syncPage(id),
    updateContext: () => viewer?.updateContext(),
    sendPreviewTheme: () => viewer?.sendPreviewTheme(),
    /** @param {unknown} value */
    acceptPreviewTheme: (value) => viewer?.acceptPreviewTheme(value),
    /** @param {boolean} [follow] */
    updateThemeURL: (follow) => viewer?.updateThemeURL(follow),
  };
}

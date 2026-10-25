// @ts-check
import { element, all } from "./dom.js";
import { embeddedPreviewURL } from "../presentation.js";
import { resourcePreview } from "../catalog.js";
import { icon } from "../icons.js";
/** @param {{appState:import('./types').AppState;t:import('./types').Translate;toggleFullscreen:()=>Promise<void>;toggleFullscreenTools:()=>void;beginPreviewLoad:()=>void;loadViewerDetails:(r:import('./types').Resource)=>Promise<void>;toggleDetails:()=>void;scalePreview:()=>void;updateThemeURL:()=>void}} actions */
export function createPreviewActions({
  appState,
  t,
  toggleFullscreen,
  toggleFullscreenTools,
  beginPreviewLoad,
  loadViewerDetails,
  toggleDetails,
  scalePreview,
  updateThemeURL,
}) {
  /** @param {HTMLButtonElement} b */
  return async function handlePreviewAction(b) {
    if (b.hasAttribute("data-retry-viewer")) {
      beginPreviewLoad();
      element("#case-preview").src = embeddedPreviewURL(
        resourcePreview(appState.selected, appState.locale, appState.theme),
      );
      return true;
    }
    if (b.hasAttribute("data-retry-details") && appState.selected) {
      await loadViewerDetails(appState.selected);
      return true;
    }
    if (b.hasAttribute("data-toggle-details")) {
      toggleDetails();
      return true;
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
      return true;
    }
    if (b.hasAttribute("data-fit")) {
      appState.fit = !appState.fit;
      b.setAttribute("aria-pressed", String(appState.fit));
      b.classList.toggle("selected", appState.fit);
      scalePreview();
      return true;
    }
    if (b.hasAttribute("data-replay")) {
      const f = element("#case-preview");
      f.contentWindow?.postMessage({ type: "atlas:replay" }, location.origin);
      return true;
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
      return true;
    }
    if (b.hasAttribute("data-fullscreen-controls")) {
      toggleFullscreenTools();
      return true;
    }
    if (
      b.hasAttribute("data-fullscreen") ||
      b.hasAttribute("data-exit-fullscreen")
    ) {
      await toggleFullscreen();
      return true;
    }
    return false;
  };
}

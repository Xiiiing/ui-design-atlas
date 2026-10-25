// @ts-check
import { element, maybe } from "./dom.js";
import { fieldValue } from "../shell/controls.tsx";
/** @param {{appState:import('./types').AppState;loadCode:(r:import('./types').Resource,scope?:string)=>Promise<boolean|undefined>;copy:(text:string)=>Promise<unknown>;download:(text:string,name:string)=>void}} actions */
export function createSourceActions({ appState, loadCode, copy, download }) {
  /** @param {HTMLButtonElement} b */
  return async function handleSourceAction(b) {
    if (b.hasAttribute("data-reload-source")) {
      // Browsers cache failed module imports; a new document retries the graph.
      location.reload();
      return true;
    }
    if (b.hasAttribute("data-code-scope") && appState.selected) {
      const updated = await loadCode(appState.selected, b.dataset.codeScope);
      if (updated)
        maybe("#full-code [data-code-scope]")?.focus({ preventScroll: true });
      return true;
    }
    if (b.hasAttribute("data-copy-install")) {
      await copy(element(".code-integration pre").textContent);
      return true;
    }
    if (b.hasAttribute("data-copy-code")) {
      await copy(element("#code-text").textContent);
      return true;
    }
    if (b.hasAttribute("data-download-code")) {
      download(
        element("#code-text").textContent,
        (fieldValue("code-file") || "source.txt").split("/").at(-1) ||
          "source.txt",
      );
      return true;
    }
    if (b.hasAttribute("data-share")) {
      await copy(location.href);
      return true;
    }
    return false;
  };
}

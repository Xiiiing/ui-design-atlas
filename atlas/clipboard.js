// @ts-check
import { element, maybe, all } from "./dom.js";
import { showShellDialog } from "../shell/controls.tsx";

/** @param {{t:import("./types").Translate}} dependencies */
export function createClipboard({ t }) {
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let toastTimer;

  /** @param {string} text */
  function notify(text) {
    const el = element("#toast");
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 2500);
  }

  /** @param {string} text @param {HTMLElement|null} [returnFocus] */
  async function copy(text, returnFocus) {
    try {
      await navigator.clipboard.writeText(text);
      notify(t("已复制，可以带走复用了。", "Copied. Ready to reuse."));
    } catch {
      element("#fallback-text").value = text;
      const dialog = element("#copy-fallback");
      if (returnFocus)
        dialog.addEventListener(
          "close",
          () => {
            if (returnFocus.isConnected)
              returnFocus.focus({ preventScroll: true });
          },
          { once: true },
        );
      showShellDialog(dialog);
      element("#fallback-text").select();
    }
  }

  /** @param {string} text @param {string} name */
  function download(text, name) {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return { notify, copy, download };
}

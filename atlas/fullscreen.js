// @ts-check
import { all, maybe } from "./dom.js";
import { icon } from "../icons.js";

/** @param {{t:import('./types').Translate;scalePreview:()=>void;onChange:()=>void}} dependencies */
export function createFullscreen({ t, scalePreview, onChange }) {
  /** @type {HTMLElement|null} */
  let active = null;
  /** @type {HTMLElement|null} */
  let opener = null;
  /** @type {Document|null} */
  let childDocument = null;
  /** @type {HTMLIFrameElement|null} */
  let childFrame = null;
  let entering = false,
    cancelEntry = false;
  function unbindChild() {
    childDocument?.removeEventListener("keydown", onKeydown);
    childFrame?.removeEventListener("load", bindChild);
    childFrame = null;
    childDocument = null;
  }
  function bindChild() {
    childDocument?.removeEventListener("keydown", onKeydown);
    childDocument = childFrame?.contentDocument || null;
    childDocument?.addEventListener("keydown", onKeydown);
  }
  function focusExit() {
    maybe("[data-exit-fullscreen]", active || document)?.focus();
  }
  function sync() {
    const panel = maybe("#preview-panel");
    const entered =
      !!panel &&
      (document.fullscreenElement === panel ||
        panel.classList.contains("is-immersive"));
    if (panel) panel.dataset.fullscreenActive = String(entered);
    if (entered && !active) {
      active = panel;
      childFrame = maybe("#case-preview");
      childFrame?.addEventListener("load", bindChild);
      bindChild();
      focusExit();
    } else if (!entered && active) {
      unbindChild();
      active.dataset.fullscreenActive = "false";
      active.dataset.controlsOpen = "false";
      maybe("[data-fullscreen-controls]", active)?.setAttribute(
        "aria-expanded",
        "false",
      );
      active = null;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      opener = null;
    }
    all("[data-fullscreen]").forEach((b) => {
      b.setAttribute(
        "aria-label",
        entered
          ? t("退出全屏", "Exit fullscreen")
          : t("全屏预览", "Fullscreen preview"),
      );
      b.setAttribute("aria-pressed", String(entered));
      b.innerHTML = icon(entered ? "minimize" : "maximize");
    });
    onChange();
    requestAnimationFrame(scalePreview);
  }
  async function exit() {
    const panel = active || maybe("#preview-panel");
    if (document.fullscreenElement === panel) {
      try {
        await document.exitFullscreen();
      } catch {
        /* sync retains the actual browser state */
      }
    }
    panel?.classList.remove("is-immersive");
    sync();
  }
  async function toggle() {
    if (entering) {
      cancelEntry = true;
      return;
    }
    if (active) {
      await exit();
      return;
    }
    const panel = maybe("#preview-panel");
    if (!panel) return;
    entering = true;
    cancelEntry = false;
    childFrame = maybe("#case-preview");
    childFrame?.addEventListener("load", bindChild);
    bindChild();
    opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    try {
      try {
        await panel.requestFullscreen();
      } catch {
        if (!cancelEntry && panel.isConnected)
          panel.classList.add("is-immersive");
      }
      sync();
      if (cancelEntry) await exit();
    } finally {
      if (!active) unbindChild();
      entering = false;
      cancelEntry = false;
    }
  }
  function toggleTools() {
    if (!active) return;
    const open = active.dataset.controlsOpen !== "true";
    active.dataset.controlsOpen = String(open);
    maybe("[data-fullscreen-controls]", active)?.setAttribute(
      "aria-expanded",
      String(open),
    );
    (open
      ? maybe("[data-device]", active)
      : maybe("[data-fullscreen-controls]", active)
    )?.focus();
  }
  /** @param {KeyboardEvent} e */
  function onKeydown(e) {
    if (
      (!active && !entering) ||
      e.defaultPrevented ||
      e.isComposing ||
      e.keyCode === 229
    )
      return;
    if (e.key === "Escape") {
      // Let a demo's own dialog consume its first Escape.
      if (
        e.currentTarget === childDocument &&
        [
          ...(childDocument?.querySelectorAll(
            'dialog[open], [role="dialog"]',
          ) || []),
        ].some((el) => el.getClientRects().length)
      )
        return;
      e.preventDefault();
      if (entering) cancelEntry = true;
      if (active) void exit();
      return;
    }
    if (active && e.key === "Tab" && e.currentTarget === document) {
      const controls = [
        ...active.querySelectorAll(
          'button, a[href], input, iframe, [tabindex="0"]',
        ),
      ].filter(
        (el) =>
          el instanceof HTMLElement &&
          el.getClientRects().length &&
          !el.hasAttribute("disabled"),
      );
      const first = /** @type {HTMLElement|undefined} */ (controls[0]);
      const last = /** @type {HTMLElement|undefined} */ (controls.at(-1));
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }
  // A CSS fallback is also keyboard-contained when the native API is unavailable.
  document.addEventListener("focusin", (e) => {
    if (
      active?.isConnected &&
      e.target instanceof Node &&
      !active.contains(e.target)
    )
      focusExit();
  });
  document.addEventListener("keydown", onKeydown);
  return {
    toggle,
    toggleTools,
    sync,
    active: () => !!active || entering,
    reset() {
      if (entering) cancelEntry = true;
      if (active) {
        void exit();
      }
    },
  };
}

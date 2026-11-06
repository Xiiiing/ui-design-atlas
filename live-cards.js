// @ts-check
import { element } from "./atlas/dom.js";
import { inlinePreviewURL } from "./presentation.js";

// Only frames owned by this controller may report readiness. The detail viewer
// has its own channel; card messages never change its resource, locale or theme.
/** @typedef {{frame:HTMLIFrameElement;id:string;timeout:ReturnType<typeof setTimeout>|undefined}} Entry */
/** @param {{resource:(card:HTMLElement)=>import('./atlas/types').Resource|undefined;url:(resource:import('./atlas/types').Resource)=>string;label:(resource:import('./atlas/types').Resource)=>string;start:()=>string;loading:()=>string;failure:()=>string;retry:()=>string;config:()=>{locale:string;theme:string}}} options */
export function createLiveCards({
  resource,
  url,
  label,
  loading,
  failure,
  start,
  retry,
  config,
}) {
  /** @type {Map<HTMLElement,Entry>} */
  const frames = new Map();
  /** @type {Set<HTMLElement>} */
  const visible = new Set();
  /** @type {Set<HTMLElement>} */
  const observed = new Set();

  /** @param {Entry} entry */
  function configure(entry) {
    entry.frame.contentWindow?.postMessage(
      { type: "atlas:preview-config", resourceId: entry.id, ...config() },
      location.origin,
    );
  }
  /** @param {Entry} entry */
  const focused = (entry) => document.activeElement === entry.frame;
  /** @param {HTMLElement} card @param {"idle"|"loading"|"error"|"ready"} state */
  function setState(card, state) {
    const trigger = element("[data-start-preview]", card);
    card.dataset.previewState = state;
    trigger.setAttribute("aria-disabled", String(state === "loading"));
    element("[data-preview-label]", trigger).textContent =
      state === "loading" ? loading() : state === "error" ? retry() : start();
    element("[data-preview-status]", card).textContent =
      state === "error" ? failure() : "";
  }
  /** @param {HTMLElement} card */
  function release(card) {
    const entry = frames.get(card);
    if (!entry) return;
    clearTimeout(entry.timeout);
    entry.frame.remove();
    frames.delete(card);
    card.classList.remove("is-live");
    setState(card, "idle");
  }
  /** @param {HTMLElement} card @param {Entry} entry */
  function fail(card, entry) {
    if (frames.get(card) !== entry) return;
    release(card);
    setState(card, "error");
  }
  /** @param {HTMLElement} card */
  function mount(card) {
    if (frames.has(card)) return;
    const r = resource(card),
      frame = document.createElement("iframe");
    if (!r) return;
    frame.title = label(r);
    frame.src = inlinePreviewURL(url(r));
    frame.allow = "clipboard-write";
    frame.dataset.resource = r.id;
    setState(card, "loading");
    /** @type {Entry} */
    const entry = { frame, id: r.id, timeout: undefined };
    frames.set(card, entry);
    entry.timeout = setTimeout(() => fail(card, entry), 15000);
    frame.addEventListener("error", () => fail(card, entry));
    frame.addEventListener("load", () => {
      if (frames.get(card) !== entry) return;
      try {
        // HTTP errors can emit load instead of error. A real archive has a root.
        if (!frame.contentDocument?.querySelector("#root")) fail(card, entry);
        else configure(entry);
      } catch {
        fail(card, entry);
      }
    });
    element("[data-live]", card).append(frame);
  }
  function reconcile() {
    for (const [card, entry] of frames)
      if (!card.isConnected || (!visible.has(card) && !focused(entry)))
        release(card);
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!(entry.target instanceof HTMLElement)) continue;
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    reconcile();
  });
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return;
    for (const [card, entry] of frames) {
      if (
        event.source !== entry.frame.contentWindow ||
        event.data?.resourceId !== entry.id
      )
        continue;
      if (event.data.type === "atlas:inline-ready") {
        clearTimeout(entry.timeout);
        const moveFocus =
          document.activeElement === element("[data-start-preview]", card);
        setState(card, "ready");
        card.classList.add("is-live");
        if (moveFocus) entry.frame.focus();
        configure(entry);
      } else if (event.data.type === "atlas:inline-error") fail(card, entry);
      break;
    }
  });
  document.addEventListener("focusin", reconcile);
  window.addEventListener("focus", () => setTimeout(reconcile, 0));
  return {
    configure() {
      for (const entry of frames.values()) configure(entry);
    },
    /** @param {Iterable<HTMLElement>} cards */
    observe(cards) {
      const next = new Set(cards);
      for (const card of observed)
        if (!next.has(card)) {
          observer.unobserve(card);
          observed.delete(card);
          visible.delete(card);
          release(card);
        }
      for (const card of next)
        if (!observed.has(card)) {
          observed.add(card);
          observer.observe(card);
        }
      reconcile();
    },
    stop() {
      observer.disconnect();
      observed.clear();
      visible.clear();
      for (const card of frames.keys()) release(card);
    },
    /** @param {Element|null} card */
    activate(card) {
      if (
        !(card instanceof HTMLElement) ||
        !observed.has(card) ||
        frames.has(card)
      )
        return;
      if (frames.size >= 8) {
        const victim = [...frames].find(([, entry]) => !focused(entry));
        if (!victim) return;
        release(victim[0]);
      }
      // The observer may not have reported the card yet if it was just rendered.
      visible.add(card);
      mount(card);
    },
  };
}

// @ts-check
import { element } from "./atlas/dom.js";
import { inlinePreviewURL } from "./presentation.js";

// Only frames owned by this controller may report readiness. The detail viewer
// has its own channel; card messages never change its resource, locale or theme.
/** @typedef {{frame:HTMLIFrameElement;id:string;timeout:ReturnType<typeof setTimeout>|undefined}} Entry */
/** @param {{resource:(card:HTMLElement)=>import('./atlas/types').Resource|undefined;url:(resource:import('./atlas/types').Resource)=>string;label:(resource:import('./atlas/types').Resource)=>string;loading:()=>string;failure:()=>string;config:()=>{locale:string;theme:string}}} options */
export function createLiveCards({
  resource,
  url,
  label,
  loading,
  failure,
  config,
}) {
  /** @type {Map<HTMLElement,Entry>} */
  const frames = new Map();
  /** @type {Set<HTMLElement>} */
  const visible = new Set();
  /** @type {Set<HTMLElement>} */
  const observed = new Set();
  /** @type {HTMLElement|null|undefined} */
  let preferred;
  /** @param {Entry} entry */
  function configure(entry) {
    entry.frame.contentWindow?.postMessage(
      { type: "atlas:preview-config", resourceId: entry.id, ...config() },
      location.origin,
    );
  }
  /** @param {Entry} entry */
  const focused = (entry) => document.activeElement === entry.frame;
  /** @param {HTMLElement} card */
  function release(card) {
    const entry = frames.get(card);
    if (!entry) return;
    clearTimeout(entry.timeout);
    entry.frame.remove();
    frames.delete(card);
    card.classList.remove("is-live");
    card.dataset.previewState = "idle";
  }
  /** @param {HTMLElement} card @param {Entry} entry */
  function fail(card, entry) {
    if (frames.get(card) !== entry) return;
    release(card);
    card.dataset.previewState = "error";
    element(".preview-state span", card).textContent = failure();
    element("[data-retry-preview]", card).hidden = false;
  }
  /** @param {HTMLElement} card */
  function mount(card) {
    if (frames.has(card) || card.dataset.previewState === "error") return;
    const r = resource(card),
      frame = document.createElement("iframe");
    if (!r) return;
    frame.title = label(r);
    frame.src = inlinePreviewURL(url(r));
    frame.allow = "clipboard-write";
    frame.dataset.resource = r.id;
    card.dataset.previewState = "loading";
    element(".preview-state span", card).textContent = loading();
    element("[data-retry-preview]", card).hidden = true;
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
    const wanted = [...visible].filter((card) => card.isConnected);
    wanted.sort((a, b) => Number(b === preferred) - Number(a === preferred));
    for (const card of wanted) {
      if (frames.has(card) || card.dataset.previewState === "error") continue;
      if (frames.size >= 8 && card === preferred) {
        const victim = [...frames].find(
          ([other, entry]) => other !== preferred && !focused(entry),
        );
        if (victim) release(victim[0]);
      }
      if (frames.size >= 8) break;
      mount(card);
    }
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
        card.dataset.previewState = "ready";
        card.classList.add("is-live");
        configure(entry);
      } else if (event.data.type === "atlas:inline-error") fail(card, entry);
      break;
    }
  });
  document.addEventListener("pointerover", (event) => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest('.asset-card[data-experience="inline"]');
    if (card instanceof HTMLElement && card !== preferred) {
      preferred = card;
      reconcile();
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
      preferred = null;
      for (const card of frames.keys()) release(card);
    },
    /** @param {Element|null} card */
    retry(card) {
      if (!(card instanceof HTMLElement)) return;
      release(card);
      card.dataset.previewState = "idle";
      preferred = card;
      visible.add(card);
      reconcile();
    },
  };
}

import { inlinePreviewURL } from "./presentation.js";

// Only frames owned by this controller may report readiness. The detail viewer
// has its own channel; card messages never change its resource, locale or theme.
export function createLiveCards({ resource, url, label, loading, failure }) {
  const frames = new Map(),
    visible = new Set();
  let preferred;
  const focused = (entry) => document.activeElement === entry.frame;
  function release(card) {
    const entry = frames.get(card);
    if (!entry) return;
    clearTimeout(entry.timeout);
    entry.frame.remove();
    frames.delete(card);
    card.classList.remove("is-live");
    card.dataset.previewState = "idle";
  }
  function fail(card, entry) {
    if (frames.get(card) !== entry) return;
    release(card);
    card.dataset.previewState = "error";
    card.querySelector(".preview-state span").textContent = failure();
    card.querySelector("[data-retry-preview]").hidden = false;
  }
  function mount(card) {
    if (frames.has(card) || card.dataset.previewState === "error") return;
    const r = resource(card),
      frame = document.createElement("iframe");
    frame.title = label(r);
    frame.src = inlinePreviewURL(url(r));
    frame.allow = "clipboard-write";
    frame.dataset.resource = r.id;
    card.dataset.previewState = "loading";
    card.querySelector(".preview-state span").textContent = loading();
    card.querySelector("[data-retry-preview]").hidden = true;
    const entry = { frame, id: r.id, timeout: null };
    frames.set(card, entry);
    entry.timeout = setTimeout(() => fail(card, entry), 15000);
    frame.addEventListener("error", () => fail(card, entry));
    frame.addEventListener("load", () => {
      if (frames.get(card) !== entry) return;
      try {
        // HTTP errors can emit load instead of error. A real archive has a root.
        if (!frame.contentDocument?.querySelector("#root")) fail(card, entry);
      } catch {
        fail(card, entry);
      }
    });
    card.querySelector("[data-live]").append(frame);
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
      } else if (event.data.type === "atlas:inline-error") fail(card, entry);
      break;
    }
  });
  document.addEventListener("pointerover", (event) => {
    const card = event.target.closest('.asset-card[data-experience="inline"]');
    if (card && card !== preferred) {
      preferred = card;
      reconcile();
    }
  });
  document.addEventListener("focusin", reconcile);
  window.addEventListener("focus", () => setTimeout(reconcile, 0));
  return {
    observe(cards) {
      observer.disconnect();
      visible.clear();
      for (const card of cards) observer.observe(card);
      for (const [card] of frames) if (!card.isConnected) release(card);
    },
    stop() {
      observer.disconnect();
      visible.clear();
      preferred = null;
      for (const card of frames.keys()) release(card);
    },
    retry(card) {
      release(card);
      card.dataset.previewState = "idle";
      preferred = card;
      visible.add(card);
      reconcile();
    },
  };
}

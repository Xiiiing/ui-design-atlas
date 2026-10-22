import existing from "./base-zh.json";
import additions from "./zh.json";
export const translations: Record<string, string> = {
  ...existing,
  ...additions,
};
export let locale =
  new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh-CN";
export const t = (text: string) =>
  locale === "en" ? text : translations[text] || text;
export const setLocale = (next: string) => {
  locale = next === "en" ? "en" : "zh-CN";
};
// Translate only text/accessible labels; preserve the imported demo's layout and logic.
export function localizeDemo() {
  const originals = new WeakMap<Node, { source: string; last: string }>();
  const attrs = new WeakMap<Element, Map<string, string>>();
  const observer = new MutationObserver(apply);
  function apply() {
    observer.disconnect();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (n.parentElement?.closest("script,style,pre,code")) continue;
      let entry = originals.get(n);
      const raw = n.textContent || "";
      if (!entry || raw !== entry.last) entry = { source: raw, last: raw };
      const trimmed = entry.source.trim();
      const text =
        locale === "en"
          ? entry.source
          : translations[trimmed]
            ? entry.source.replace(trimmed, translations[trimmed])
            : entry.source;
      if (raw !== text) n.textContent = text;
      entry.last = text;
      originals.set(n, entry);
    }
    for (const el of document.querySelectorAll(
      "[placeholder],[aria-label],[title]",
    )) {
      let entry = attrs.get(el);
      if (!entry) {
        entry = new Map();
        attrs.set(el, entry);
      }
      for (const a of ["placeholder", "aria-label", "title"]) {
        if (!el.hasAttribute(a)) continue;
        if (!entry.has(a)) entry.set(a, el.getAttribute(a)!);
        const source = entry.get(a)!;
        el.setAttribute(
          a,
          locale === "en" ? source : translations[source] || source,
        );
      }
    }
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }
  apply();
  return () => observer.disconnect();
}

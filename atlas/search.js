// @ts-check
import { element, maybe, all } from "./dom.js";
import { isComposing } from "./input.js";
import { showShellDialog } from "../shell/controls.tsx";
import { searchContent } from "./content-search.js";
import { guidanceKinds, toolKinds } from "../guidance-catalog.js";
import { icon } from "../icons.js";
import { escapeHTML as esc } from "./html.js";
/** @param {Omit<import('./types').BaseDependencies,'appState'> & {labelType:import('./types').Card}} dependencies */
export function createSearch({ href, l, labelType, t }) {
  function openSearch() {
    const d = element("#search-dialog");
    if (d.open) return;
    showShellDialog(d);
    element("#quick-search").value = "";
    searchResults();
    element("#quick-search").focus();
  }
  function searchResults() {
    const q = element("#quick-search").value.trim();
    const items = searchContent(q).slice(0, 10);
    element("#search-results").innerHTML = items.length
      ? items
          .map((r) => {
            const item = r.item;
            const label =
              "preview" in item
                ? labelType(item)
                : "repo" in item
                  ? t(.../** @type {[string,string]} */ (toolKinds[item.kind]))
                  : t(
                      .../** @type {[string,string]} */ (
                        guidanceKinds[item.kind]
                      ),
                    );
            return `<a href="${href(r.view, r.id)}" ${r.domain === "ui" ? `data-open="${r.key}"` : ""}><span class="search-result-icon">${icon("layers")}</span><span><strong>${esc(l(r.name))}</strong><small>${esc(label)}</small></span>${icon("arrow-up-right")}</a>`;
          })
          .join("")
      : `<p>${t("没有匹配的资源", "No matching resources")}</p>`;
  }
  /** @param {KeyboardEvent} e */
  function handleSearchKeys(e) {
    if (isComposing(e) || !(e.target instanceof HTMLElement)) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.target.id === "quick-search" && e.key === "Enter") {
      e.preventDefault();
      const first = maybe("#search-results a");
      if (first) {
        first.click();
        element("#search-dialog").close();
      }
    }
    if (e.target.id === "quick-search" && e.key === "ArrowDown") {
      e.preventDefault();
      maybe("#search-results a")?.focus();
    }
    if (
      e.target.closest("#search-results a") &&
      ["ArrowDown", "ArrowUp"].includes(e.key)
    ) {
      e.preventDefault();
      const rows = [...all("#search-results a")],
        i = rows.findIndex((r) => r === e.target),
        n = i + (e.key === "ArrowDown" ? 1 : -1);
      if (n < 0) element("#quick-search").focus();
      else rows[Math.min(n, rows.length - 1)]?.focus();
    }
  }
  return { openSearch, searchResults, handleSearchKeys };
}

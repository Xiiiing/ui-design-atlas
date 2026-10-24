import { showShellDialog } from "../shell/controls.tsx";
import { searchResources, libraries } from "../catalog.js";
import { key } from "./resource-views.js";
import { icon } from "../icons.js";
import { escapeHTML as esc } from "../components.js";

export function createSearch({ href, l, labelType, t }) {
  function openSearch() {
    const d = document.querySelector("#search-dialog");
    if (d.open) return;
    showShellDialog(d);
    document.querySelector("#quick-search").value = "";
    searchResults();
    document.querySelector("#quick-search").focus();
  }

  function searchResults() {
    const q = document
      .querySelector("#quick-search")
      .value.toLowerCase()
      .trim();
    const items = searchResources(q).slice(0, 10);
    document.querySelector("#search-results").innerHTML = items.length
      ? items
          .map(
            (r) =>
              `<a href="${href(r.type, r.id)}" data-open="${key(r)}"><span class="search-result-icon">${icon("layers")}</span><span><strong>${esc(l(r.name))}</strong><small>${labelType(r)} · ${r.libraryIds.map((id) => libraries[id].name).join(" / ")}</small></span>${icon("arrow-up-right")}</a>`,
          )
          .join("")
      : `<p>${t("没有匹配的资源", "No matching resources")}</p>`;
  }

  function handleSearchKeys(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.target.id === "quick-search" && e.key === "Enter") {
      e.preventDefault();
      document.querySelector("#search-results a")?.click();
      document.querySelector("#search-dialog").close();
    }
    if (e.target.id === "quick-search" && e.key === "ArrowDown") {
      e.preventDefault();
      document.querySelector("#search-results a")?.focus();
    }
    if (
      e.target.closest("#search-results a") &&
      ["ArrowDown", "ArrowUp"].includes(e.key)
    ) {
      e.preventDefault();
      const rows = [...document.querySelectorAll("#search-results a")],
        i = rows.indexOf(e.target.closest("a")),
        n = i + (e.key === "ArrowDown" ? 1 : -1);
      if (n < 0) document.querySelector("#quick-search").focus();
      else rows[Math.min(n, rows.length - 1)]?.focus();
    }
  }
  return { openSearch, searchResults, handleSearchKeys };
}

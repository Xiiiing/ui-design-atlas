// @ts-check
import { element, all } from "./dom.js";
import { selections } from "./filter-model.js";
import { setFieldValue } from "../shell/controls.tsx";
/** @param {{appState:import('./types').AppState;updateResults:(updateURL?:boolean)=>void;cancelInput:()=>void}} dependencies */
export function createFilterActions({ appState, updateResults, cancelInput }) {
  /** @param {HTMLButtonElement} b */
  return function handleFilterAction(b) {
    if (
      !b.matches(
        "[data-more],[data-category],[data-remove-filter],[data-advanced-filters],[data-reset-filters]",
      )
    )
      return false;
    cancelInput();
    if (b.hasAttribute("data-more")) {
      appState.limit += 24;
      updateResults(true);
      return true;
    }
    if (b.dataset.category) {
      const field = element("#filters [name=category]"),
        selected = selections(field.value),
        value = b.dataset.category;
      field.value =
        value === "all"
          ? "all"
          : (selected.includes(value)
              ? selected.filter((v) => v !== value)
              : [...selected, value]
            ).join(",");
      appState.limit = 24;
      updateResults(true);
      return true;
    }
    if (b.dataset.removeFilter) {
      const name = b.dataset.removeFilter;
      const field = element(`#filters [name="${name}"]`);
      if (name === "q") field.value = "";
      else if (name === "collection" || name === "style" || name === "audience")
        field.remove();
      else if (name === "category")
        field.value = selections(field.value)
          .filter((v) => v !== b.dataset.filterValue)
          .join(",");
      else {
        const input = element(
          `#filters input[name="${name}"][value="${CSS.escape(b.dataset.filterValue || "")}"]`,
        );
        if (input instanceof HTMLInputElement) input.checked = false;
      }
      appState.limit = 24;
      updateResults(true);
      return true;
    }
    if (b.hasAttribute("data-advanced-filters")) {
      const expanded = b.getAttribute("aria-expanded") !== "true";
      appState.browseFiltersExpanded = expanded;
      b.setAttribute("aria-expanded", String(expanded));
      element("#filters").dataset.expanded = String(expanded);
      return true;
    }
    if (b.hasAttribute("data-reset-filters")) {
      const form = element("#filters");
      form.reset();
      queueMicrotask(() => {
        for (const el of all("select.atlas-select-native", form))
          setFieldValue(el.dataset.shellField || "", "all");
        element("[name=q]", form).value = "";
        element("[name=category]", form).value = "all";
        for (const el of form.querySelectorAll("input[type=checkbox]"))
          if (el instanceof HTMLInputElement) el.checked = false;
        for (const el of form.querySelectorAll(
          "[name=collection], [name=style], [name=audience]",
        ))
          el.remove();
        appState.limit = 24;
        updateResults(true);
      });
      return true;
    }
    return false;
  };
}

import {
  favoriteStorageKey,
  importFavorites,
  readFavorites,
} from "./favorite-data.js";

export function createFavorites({ appState, t, notify, updateResults }) {
  function sync() {
    const focused = document.activeElement;
    const cards = [...document.querySelectorAll("#results .asset-card")];
    const index = cards.findIndex((card) => card.contains(focused));
    const removed =
      index >= 0 && !appState.favorites.has(cards[index].dataset.resource);
    const candidates =
      index >= 0
        ? [...cards.slice(index + 1), ...cards.slice(0, index).reverse()].map(
            (card) => card.dataset.resource,
          )
        : [];
    document.querySelectorAll("[data-save]").forEach((button) => {
      const saved = appState.favorites.has(button.dataset.save);
      button.classList.toggle("saved", saved);
      button.setAttribute("aria-pressed", String(saved));
    });
    document.querySelectorAll("[data-favorite-count]").forEach((count) => {
      count.textContent = String(appState.favorites.size);
      count.hidden = !appState.favorites.size;
    });
    if (appState.route.view === "favorites") {
      updateResults();
      if (removed) {
        const target =
          candidates
            .map((key) =>
              document.querySelector(`#results [data-save="${key}"]`),
            )
            .find(Boolean) || document.querySelector(".market-empty h2");
        target?.focus({ preventScroll: true });
      }
    }
  }
  function persist(next) {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify([...next]));
    } catch {
      notify(
        t(
          "收藏保存失败，请导出备份后重试。",
          "Could not save favorites. Export a backup and retry.",
        ),
      );
      return false;
    }
    return true;
  }
  function toggle(key) {
    const next = new Set(appState.favorites);
    next.has(key) ? next.delete(key) : next.add(key);
    if (!persist(next)) return;
    appState.favorites = next;
    sync();
  }
  async function importFile(input) {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    let next;
    try {
      if (file.size > 100000) throw new Error("Backup too large");
      next = importFavorites(await file.text(), appState.favorites);
    } catch {
      notify(
        t("请选择有效的收藏备份文件。", "Choose a valid favorites backup."),
      );
      return;
    }
    if (!persist(next)) return;
    appState.favorites = next;
    sync();
    notify(t("收藏已导入。", "Favorites imported."));
  }
  function receive(event) {
    if (
      event.storageArea !== localStorage ||
      (event.key !== favoriteStorageKey && event.key !== null)
    )
      return;
    appState.favorites = readFavorites(event.newValue);
    sync();
  }
  return { sync, toggle, importFile, receive };
}

import { createBrowserHistory } from "@tanstack/react-router";
// Keep host metadata (?lang=...&component=...) separate from router filters.
// The upstream hash helper concatenates these two query strings on reload.
export function createArchiveHistory() {
  const read = () => {
    const href = location.hash.slice(1) || "/";
    const u = new URL(href, "https://atlas.invalid");
    return {
      href,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      state: history.state ?? { __TSR_index: 0 },
    };
  };
  const routerHistory = createBrowserHistory({
    parseLocation: read,
    createHref: (href) => `${location.pathname}${location.search}#${href}`,
  });
  // Native hash links and same-document URL edits must also update the router.
  const syncHash = () => {
    if (routerHistory.location.href !== read().href)
      window.history.replaceState(
        { ...routerHistory.location.state, ...history.state },
        "",
        location.href,
      );
  };
  window.addEventListener("hashchange", syncHash);
  const destroy = routerHistory.destroy;
  routerHistory.destroy = () => {
    window.removeEventListener("hashchange", syncHash);
    destroy();
  };
  return routerHistory;
}

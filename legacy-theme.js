// Shared by original pages and components; embedded choices are owned by Atlas.
export function installLegacyTheme(identity) {
  const params = new URLSearchParams(location.search);
  const media = matchMedia("(prefers-color-scheme: dark)");
  let followsSystem = !["light", "dark"].includes(params.get("theme"));
  function apply(value) {
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    const url = new URL(location.href);
    if (!followsSystem) url.searchParams.set("theme", value);
    history.replaceState(history.state, "", url);
    for (const link of document.querySelectorAll("a[href]")) {
      const target = new URL(link.getAttribute("href"), location.href);
      if (
        target.origin === location.origin &&
        target.pathname.endsWith("/preview.html")
      ) {
        target.searchParams.set("theme", value);
        link.href = target.href;
      }
    }
    if (parent !== window)
      parent.postMessage(
        {
          type: identity.resourceId
            ? "atlas:resource-state"
            : "atlas:preview-state",
          ...identity,
          theme: value,
          locale: document.documentElement.lang,
        },
        location.origin,
      );
  }
  window.addEventListener("message", (event) => {
    if (
      event.source !== parent ||
      event.origin !== location.origin ||
      event.data?.type !== "atlas:preview-config"
    )
      return;
    if (event.data.resourceId && event.data.resourceId !== identity.resourceId)
      return;
    if (!["light", "dark"].includes(event.data.theme)) return;
    followsSystem = false;
    apply(event.data.theme);
  });
  media.addEventListener("change", () => {
    if (followsSystem) apply(media.matches ? "dark" : "light");
  });
  apply(
    followsSystem ? (media.matches ? "dark" : "light") : params.get("theme"),
  );
}

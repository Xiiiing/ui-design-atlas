import discovery from "./content/discovery.json" with { type: "json" };
// Capability overrides describe demo space, not the upstream component's type.
const canvasComponents = new Set([
  "fluent-dialog",
  "fluent-toast",
  "antd-form",
  "shadcn-admin-metric-cards",
  "shadcn-admin-task-drawer",
  "shadcn-admin-user-dialog",
  "shadcn-admin-settings-form",
  "shadcn-admin-filter-toolbar",
]);
export function experienceMode(resource) {
  if (resource.preview.mode) return resource.preview.mode;
  return resource.type !== "component" ||
    resource.preview.width >= 900 ||
    canvasComponents.has(resource.id) ||
    resource.kind === "dialog" ||
    resource.id.endsWith("-dialog")
    ? "canvas"
    : "inline";
}
// One framing rule for screenshots, live cards and detail previews. The source
// component and its theme stay intact; only the surrounding demo viewport changes.
export function resourcePresentation(resource, context = "card") {
  const wide = resource.type !== "component" || resource.preview.width >= 900;
  const control = !wide && resource.category === "buttons";
  return {
    mode: experienceMode(resource),
    inlineHeight:
      resource.category === "cards" ||
      resource.id === "shadcn-admin-trend-chart"
        ? 440
        : 360,
    layout: wide ? "wide" : "compact",
    width: wide
      ? resource.preview.width
      : control && context === "card"
        ? 320
        : context === "card"
          ? 480
          : 400,
    height: wide
      ? resource.preview.height
      : control && context === "card"
        ? 240
        : context === "card"
          ? 360
          : 400,
    theme:
      discovery.previewThemes[resource.id] ||
      (resource.sourceId === "shadcn-admin" ? "dark" : "light"),
    context,
    stageHeight:
      context === "detail"
        ? wide
          ? 660
          : 560
        : context === "quick"
          ? 520
          : 260,
  };
}

export function thumbnailURL(url) {
  const [path, hash] = url.split("#");
  return (
    path +
    (path.includes("?") ? "&" : "?") +
    "thumb=1" +
    (hash ? "#" + hash : "")
  );
}

export function embeddedPreviewURL(url) {
  const [path, hash] = url.split("#");
  return (
    path +
    (path.includes("?") ? "&" : "?") +
    "embed=1" +
    (hash ? "#" + hash : "")
  );
}

export function inlinePreviewURL(url) {
  const [path, hash] = embeddedPreviewURL(url).split("#");
  return path + "&inline=1" + (hash ? "#" + hash : "");
}

import discovery from "./content/discovery.json" with { type: "json" };
// Capability overrides describe demo space, not the upstream component's type.
const canvasComponents = new Set([
  "folio-card",
  "fluent-dialog",
  "fluent-toast",
  "antd-form",
  "shadcn-admin-metric-cards",
  "shadcn-admin-task-drawer",
  "shadcn-admin-user-dialog",
  "shadcn-admin-settings-form",
  "shadcn-admin-filter-toolbar",
  "shadcn-admin-trend-chart",
]);
export function experienceMode(resource) {
  if (resource.preview.mode) return resource.preview.mode;
  return resource.type !== "component" ||
    resource.preview.width >= 900 ||
    canvasComponents.has(resource.id) ||
    resource.kind === "pricing" ||
    resource.kind === "dialog" ||
    resource.id.endsWith("-dialog")
    ? "canvas"
    : "inline";
}
// One framing rule for screenshots, live cards and detail previews. The source
// component and its theme stay intact; only the surrounding demo viewport changes.
export function resourcePresentation(resource, context = "card") {
  const wide = resource.type !== "component" || resource.preview.width >= 900;
  const mode = experienceMode(resource);
  const canvasCard = context === "card" && mode === "canvas";
  const control = !wide && resource.category === "buttons";
  const tallCard = resource.kind === "pricing" || resource.id === "folio-card";
  const canvasWidth = tallCard
    ? 400
    : resource.id === "shadcn-admin-trend-chart"
      ? 640
      : 960;
  const canvasHeight = tallCard
    ? 440
    : resource.id === "shadcn-admin-trend-chart"
      ? 480
      : 640;
  return {
    mode,
    layout: wide ? "wide" : "compact",
    width: wide
      ? resource.preview.width
      : canvasCard
        ? canvasWidth
        : control && context === "card"
          ? 320
          : context === "card"
            ? 480
            : 400,
    height: wide
      ? resource.preview.height
      : canvasCard
        ? canvasHeight
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

function appendPreviewParameter(url, parameter) {
  const [path, hash] = url.split("#");
  return (
    path +
    (path.includes("?") ? "&" : "?") +
    parameter +
    (hash ? "#" + hash : "")
  );
}

export function thumbnailURL(url) {
  return appendPreviewParameter(url, "thumb=1");
}

export function embeddedPreviewURL(url) {
  return appendPreviewParameter(url, "embed=1");
}

export function inlinePreviewURL(url) {
  return appendPreviewParameter(embeddedPreviewURL(url), "inline=1");
}

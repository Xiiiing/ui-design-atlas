// One framing rule for screenshots, live cards and detail previews. The source
// component and its theme stay intact; only the surrounding demo viewport changes.
export function resourcePresentation(resource, context = "card") {
  const wide = resource.type !== "component" || resource.preview.width >= 900;
  const control = !wide && resource.category === "buttons";
  return {
    layout: wide ? "wide" : "compact",
    width: wide
      ? resource.preview.width
      : control && context === "card"
        ? 320
        : 400,
    height: wide
      ? resource.preview.height
      : control && context === "card"
        ? 240
        : 400,
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

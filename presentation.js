// One framing rule for screenshots, live cards and detail previews. The source
// component and its theme stay intact; only the surrounding demo viewport changes.
export function resourcePresentation(resource) {
  const wide = resource.type !== "component" || resource.preview.width >= 900;
  return {
    layout: wide ? "wide" : "compact",
    width: wide ? resource.preview.width : 400,
    height: wide ? resource.preview.height : 400,
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

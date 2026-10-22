// Nestable locks for native dialogs and Radix popovers, using document scrolling.
const owners = new Set<symbol>();
let restore: (() => void) | undefined;
export function lockPageScroll() {
  if (!owners.size) {
    const root = document.documentElement,
      body = document.body;
    const previous = [
      root.style.overflow,
      root.style.scrollbarGutter,
      body.style.overflow,
      body.style.paddingInlineEnd,
    ];
    const gutter = Math.max(0, innerWidth - root.clientWidth);
    const padding = parseFloat(getComputedStyle(body).paddingInlineEnd) || 0;
    root.style.scrollbarGutter = "auto";
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.paddingInlineEnd = padding + gutter + "px";
    restore = () => {
      root.style.overflow = previous[0];
      root.style.scrollbarGutter = previous[1];
      body.style.overflow = previous[2];
      body.style.paddingInlineEnd = previous[3];
    };
  }
  const owner = Symbol();
  owners.add(owner);
  return () => {
    if (!owners.delete(owner) || owners.size) return;
    restore?.();
    restore = undefined;
  };
}

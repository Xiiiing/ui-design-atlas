// @ts-check
// Reconcile connected containers so unchanged iframe documents are never detached.
/** @param {Element} element */
function identity(element) {
  if (element.hasAttribute("data-resource"))
    return `resource:${element.getAttribute("data-resource")}`;
  if (element.hasAttribute("data-type"))
    return `group:${element.getAttribute("data-type")}`;
  return element.tagName + ":" + element.className;
}
/** @param {HTMLElement} target @param {string} html */
export function reconcileResults(target, html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const resources = new Map(
    [...target.querySelectorAll("[data-resource]")].map((node) => [
      identity(node),
      node,
    ]),
  );
  /** @type {Array<()=>void>} */
  const cleanup = [];
  reconcileChildren(target, template.content, resources, cleanup);
  // Old groups must stay connected until their retained cards have migrated.
  for (const remove of cleanup) remove();
}
/** @param {Element} target @param {ParentNode} source @param {Map<string,Element>} resources @param {Array<()=>void>} cleanup */
function reconcileChildren(target, source, resources, cleanup) {
  const desired = [...source.children];
  const keys = new Set(desired.map(identity));
  for (const child of [...target.children])
    if (!keys.has(identity(child)))
      cleanup.push(() => {
        if (child.parentNode === target) child.remove();
      });
  const existing = new Map(
    [...target.children].map((child) => [identity(child), child]),
  );
  let cursor = target.firstElementChild;
  for (const next of desired) {
    const retained =
      existing.get(identity(next)) ||
      (next.hasAttribute("data-resource")
        ? resources.get(identity(next))
        : undefined);
    const container = next.matches(".resource-group, .comparison-grid");
    const node =
      retained ||
      (container ? /** @type {Element} */ (next.cloneNode(false)) : next);
    if (node !== cursor) {
      if (node.isConnected && typeof target.moveBefore === "function")
        target.moveBefore(node, cursor);
      else target.insertBefore(node, cursor);
    }
    if (retained?.hasAttribute("data-resource")) {
      // Retain the preview document, but keep native new-tab tag links current.
      const links = retained.querySelectorAll("a");
      next.querySelectorAll("a").forEach((link, index) => {
        if (links[index]) links[index].href = link.href;
      });
    }
    if (container) reconcileChildren(node, next, resources, cleanup);
    else if (
      retained &&
      !retained.hasAttribute("data-resource") &&
      retained.innerHTML !== next.innerHTML
    )
      retained.innerHTML = next.innerHTML;
    cursor = node.nextElementSibling;
  }
}

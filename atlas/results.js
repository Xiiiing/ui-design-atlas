// Reconcile connected containers so unchanged iframe documents are never detached.
function identity(element) {
  if (element.hasAttribute("data-resource"))
    return `resource:${element.getAttribute("data-resource")}`;
  if (element.hasAttribute("data-type"))
    return `group:${element.getAttribute("data-type")}`;
  return element.tagName + ":" + element.className;
}
export function reconcileResults(target, html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  reconcileChildren(target, template.content);
}
function reconcileChildren(target, source) {
  const desired = [...source.children];
  const keys = new Set(desired.map(identity));
  for (const child of [...target.children])
    if (!keys.has(identity(child))) child.remove();
  const existing = new Map(
    [...target.children].map((child) => [identity(child), child]),
  );
  let cursor = target.firstElementChild;
  for (const next of desired) {
    const retained = existing.get(identity(next));
    const node = retained || next;
    if (retained && !retained.hasAttribute("data-resource")) {
      if (retained.matches(".resource-group, .comparison-grid"))
        reconcileChildren(retained, next);
      else if (retained.innerHTML !== next.innerHTML)
        retained.innerHTML = next.innerHTML;
    }
    if (node !== cursor) {
      if (node.isConnected && typeof target.moveBefore === "function")
        target.moveBefore(node, cursor);
      else target.insertBefore(node, cursor);
    }
    cursor = node.nextElementSibling;
  }
}

// @ts-check
/** @template {string} S @param {S} selector @param {ParentNode} [root] @returns {import('./types').DOMElement<S> | null} */
export function maybe(selector, root = document) {
  return /** @type {import('./types').DOMElement<S> | null} */ (
    root.querySelector(selector)
  );
}
/** @template {string} S @param {S} selector @param {ParentNode} [root] @returns {import('./types').DOMElement<S>} */
export function element(selector, root = document) {
  const result = maybe(selector, root);
  if (!result) throw new Error(`Missing Atlas element: ${selector}`);
  return result;
}
/** @template {string} S @param {S} selector @param {ParentNode} [root] @returns {NodeListOf<import('./types').DOMElement<S>>} */
export function all(selector, root = document) {
  return /** @type {NodeListOf<import('./types').DOMElement<S>>} */ (
    root.querySelectorAll(selector)
  );
}

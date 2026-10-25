// @ts-check
const composing = new WeakSet();
/** @param {{target:EventTarget|null,isComposing?:boolean,keyCode?:number}} event */
export function isComposing(event) {
  return (
    (event.target !== null && composing.has(event.target)) ||
    event.isComposing === true ||
    event.keyCode === 229
  );
}
/** @param {{target:EventTarget|null,isComposing?:boolean,keyCode?:number}} event */
export function beginComposition(event) {
  event.target && composing.add(event.target);
}
/** @param {{target:EventTarget|null,isComposing?:boolean,keyCode?:number}} event */
export function endComposition(event) {
  event.target && composing.delete(event.target);
}

/** @param {()=>void} commit */
export function createInputScheduler(commit) {
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let timer;
  let pending = false;
  function cancel() {
    clearTimeout(timer);
    pending = false;
  }
  function flush() {
    if (!pending) return;
    cancel();
    commit();
  }
  function schedule() {
    cancel();
    pending = true;
    timer = setTimeout(flush, 150);
  }
  return { schedule, flush, cancel };
}

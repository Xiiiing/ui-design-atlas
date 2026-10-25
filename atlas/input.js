const composing = new WeakSet();
export function isComposing(event) {
  return (
    composing.has(event.target) ||
    event.isComposing === true ||
    event.keyCode === 229
  );
}
export function beginComposition(event) {
  composing.add(event.target);
}
export function endComposition(event) {
  composing.delete(event.target);
}

export function createInputScheduler(commit) {
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

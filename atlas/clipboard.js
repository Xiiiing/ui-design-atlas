import { showShellDialog } from "../shell/controls.tsx";

export function createClipboard({ t }) {
  let toastTimer;

  function notify(text) {
    const el = document.querySelector("#toast");
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 2500);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify(t("已复制，可以带走复用了。", "Copied. Ready to reuse."));
    } catch {
      document.querySelector("#fallback-text").value = text;
      showShellDialog(document.querySelector("#copy-fallback"));
      document.querySelector("#fallback-text").select();
    }
  }

  function download(text, name) {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return { notify, copy, download };
}

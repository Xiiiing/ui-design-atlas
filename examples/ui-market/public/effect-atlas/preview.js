// Atlas demo host. The effect itself remains in the pinned upstream effect.js.
const params = new URLSearchParams(location.search);
const root = document.documentElement;
const stage = document.querySelector("#stage");
const { mount, resource: resourceId } = document.body.dataset;
const title = document.querySelector("#title");
const hint = document.querySelector("#hint");
const english = [title.textContent, hint.textContent];
const originals = new WeakMap();
let locale = params.get("lang") === "zh-CN" ? "zh-CN" : "en";
let theme = params.get("theme") === "dark" ? "dark" : "light";
let effect;

root.toggleAttribute(
  "data-compact",
  params.has("thumb") || params.has("inline"),
);

function send(type, data) {
  if (parent !== window)
    parent.postMessage({ type, resourceId, ...data }, location.origin);
}

function translate(node, chinese, attribute) {
  if (!originals.has(node))
    originals.set(
      node,
      attribute ? node.getAttribute(attribute) : node.textContent,
    );
  const value = locale === "zh-CN" ? chinese : originals.get(node);
  if (attribute) node.setAttribute(attribute, value);
  else if (node.textContent !== value) node.textContent = value;
}

function update() {
  root.lang = locale;
  root.dataset.theme = theme;
  [title, hint].forEach((node, i) => {
    node.textContent = locale === "zh-CN" ? node.dataset.zh : english[i];
  });
  document.title = title.textContent;
  const controls = {
    "[data-crosshair]": "图片揭示区域：拖动蓝点、滚动或使用方向键。",
    ".mm-view": "案例页面",
    ".mm-map": "页面小地图",
  };
  for (const [selector, label] of Object.entries(controls)) {
    const node = stage.querySelector(selector);
    if (node) translate(node, label, "aria-label");
  }
  for (const selector of [".mm-thumb", "[data-preview-art]"]) {
    stage.querySelectorAll(selector).forEach((node, i) => {
      translate(
        node,
        selector === ".mm-thumb" ? `跳到第 ${i + 1} 节` : `项目 ${i + 1}`,
        "aria-label",
      );
    });
  }
  const labels = ["开始使用", "预约演示", "联系销售"];
  stage.querySelectorAll(".pw-word-in").forEach((node, i) => {
    translate(node, labels[i]);
  });
}

function play() {
  try {
    effect?.destroy();
    effect = window[mount](stage);
    update();
    send("atlas:inline-ready");
    send("atlas:resource-state", { locale, theme });
  } catch (error) {
    send("atlas:inline-error");
    throw error;
  }
}

play();
window.addEventListener("message", (event) => {
  if (event.source !== parent || event.origin !== location.origin) return;
  const data = event.data;
  if (
    data?.type === "atlas:preview-config" &&
    (!data.resourceId || data.resourceId === resourceId)
  ) {
    if (["en", "zh-CN"].includes(data.locale)) locale = data.locale;
    if (["light", "dark"].includes(data.theme)) theme = data.theme;
    update();
    send("atlas:resource-state", { locale, theme });
  } else if (data?.type === "atlas:replay") {
    play();
  }
});
if (!params.has("inline")) {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.defaultPrevented) send("atlas:escape");
  });
}

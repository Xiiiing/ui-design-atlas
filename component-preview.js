if (new URLSearchParams(location.search).has("thumb"))
  document.body.inert = true;
import { getComponent } from "./data.js";
import { componentMarkup } from "./components.js";
import { observeLegacy, translateLegacyString as tr } from "./legacy-i18n.js";
const params = new URLSearchParams(location.search),
  lang = params.get("lang") === "en" ? "en" : "zh-CN",
  item = getComponent(params.get("id"));
document.documentElement.lang = lang;
const root = document.getElementById("root");
if (item) {
  document.title = item.name + " · Design Atlas";
  root.innerHTML = componentMarkup(item, !params.has("thumb"));
  observeLegacy(root, lang);
}
function feedback(text) {
  const el = document.getElementById("feedback");
  el.hidden = false;
  el.textContent = tr(text, lang);
}
document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open-dialog]");
  if (open) document.getElementById(open.dataset.openDialog).showModal();
  if (e.target.closest("[data-demo-action]")) {
    e.preventDefault();
    feedback("已触发演示操作，可接入自己的业务逻辑。");
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.matches("[data-demo-form]")) {
    e.preventDefault();
    e.target.querySelector(".s-feedback").textContent = tr(
      "演示订阅成功，未发送真实邮件。",
      lang,
    );
  }
});

if (item && parent !== window)
  parent.postMessage(
    { type: "atlas:inline-ready", resourceId: item.id },
    location.origin,
  );

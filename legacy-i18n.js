import { translations } from "./legacy-translations.js";
const englishUI = {
  Projects: "项目",
  "Workspace settings": "工作区设置",
  "Good things ahead": "新的创造，正在前方",
  "Activity overview": "活动概览",
  "Latest activity": "最近动态",
  "Recent projects": "近期项目",
  "Orbit workspace": "Orbit 工作区",
  Bag: "购物袋",
  "Selected work": "精选项目",
  "SELECTED WORK": "精选项目",
  About: "关于",
  Contact: "联系",
  Services: "服务",
  "WHAT WE DO": "我们的服务",
  "HOW WE WORK": "合作流程",
  "LOCAL DEMO / NO BACKEND": "本地演示 / 无后端",
  WORKSPACE: "工作区",
  "Your next chapter.": "你的下一章节。",
};
const entries = Object.entries(translations).sort(
  (a, b) => b[0].length - a[0].length,
);
export function translateLegacyString(value, language = "zh-CN") {
  let text = String(value);
  if (language === "en") {
    for (const [zh, en] of entries) text = text.split(zh).join(en);
  } else {
    for (const [en, zh] of Object.entries(englishUI).sort(
      (a, b) => b[0].length - a[0].length,
    ))
      text = text.split(en).join(zh);
  }
  return text;
}
export function translateLegacy(root, language = "zh-CN") {
  // Preserve original option values: filtering and stored state use language-independent values.
  root
    .querySelectorAll("option:not([value])")
    .forEach((o) => (o.value = o.textContent));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      ["SCRIPT", "STYLE", "TEXTAREA"].includes(n.parentElement?.tagName)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  while (walker.nextNode()) {
    const n = walker.currentNode;
    const next = translateLegacyString(n.textContent, language);
    if (next !== n.textContent) n.textContent = next;
  }
  root.querySelectorAll("[placeholder],[aria-label],[title]").forEach((el) => {
    for (const attr of ["placeholder", "aria-label", "title"])
      if (el.hasAttribute(attr)) {
        const old = el.getAttribute(attr),
          next = translateLegacyString(old, language);
        if (old !== next) el.setAttribute(attr, next);
      }
  });
}
export function observeLegacy(root, language) {
  translateLegacy(root, language);
  const observer = new MutationObserver(() => {
    observer.disconnect();
    translateLegacy(root, language);
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  return observer;
}

// @ts-check
import { sourceProjects } from "../catalog.js";
import { escapeHTML as esc } from "./html.js";
/** @param {{t:import('./types').BaseDependencies['t'];external:(url:string,label:string)=>string}} deps */
export function createInfoViews({ t, external }) {
  function sourcePage() {
    return `<section class="market-intro"><div><h1>${t("每个界面，都有出处。", "Every interface has a source.")}</h1><p>${t("实现来源、实际组件库与本站整理内容分别标注。", "Implementation sources, libraries and Atlas interpretations are credited separately.")}</p></div></section><div class="source-grid">${Object.values(
      sourceProjects,
    )
      .map(
        (s) =>
          `<section class="source-card"><h2>${esc(s.name)}</h2><p>${esc(s.author)} · ${esc(s.license)}</p>${external(s.repo, "GitHub")}${s.commit ? `<p><code>${s.commit}</code></p>` : ""}${s.licenseFile ? external(s.licenseFile, t("许可证", "License")) : ""}</section>`,
      )
      .join(
        "",
      )}</div><section class="source-card"><h2>${t("图鉴界面设计基线", "Atlas shell design baseline")}</h2><p>${t("21st：资源优先的浏览层级、中性明暗表面、轻量边界与统一字级。固定源码提交 b96d84d，图鉴按静态资源市场需求适配。", "21st: preview-first discovery, neutral light/dark surfaces, quiet borders and a shared type scale. Adapted from pinned source b96d84d for this static resource marketplace.")}</p>${external("./vendor/21st-market/ATTRIBUTION.md", t("来源与适配说明", "Source & adaptations"))}</section><section class="source-card"><h2>${t("展示逻辑参考", "Browsing references")}</h2><p>${external("https://21st.dev/community/components", "21st.dev")} · ${external("https://coss.com/origin/button", "Origin UI")} · ${external("https://blocks.so/tables", "Blocks.so")} · ${external("https://reactbits.dev/", "React Bits")}</p><p>${t("借鉴资源分类与预览交互。本站未再分发 React Bits 组件。", "References for discovery and preview interactions. React Bits components are not redistributed.")}</p>${external("./vendor/shadcn-ui/ATTRIBUTION.md", "shadcn/ui · MIT")} · ${external("./vendor/lucide/LICENSE", "Lucide · ISC")} · ${external("./vendor/inter/LICENSE", "Inter · OFL")} · ${external("./vendor/geist/LICENSE", "Geist · OFL")}</section>`;
  }

  function guidePage() {
    return `<section class="market-intro"><div><h1>${t("从一个 UI，开始你的项目。", "From a UI to your project.")}</h1></div></section><div class="source-card guide-copy"><h2>1. ${t("搜索并体验", "Find and try")}</h2><p>${t("按名称、用途或组件库搜索，选择动效、组件、区块或完整案例。小组件可直接操作；大资源打开宽屏体验，返回后继续原来的浏览位置。", "Search by name, purpose or library. Try compact components in their cards; open larger resources in the wide experience. Return to resume browsing.")}</p><h2>2. ${t("读说明，复制提示词", "Read and copy a prompt")}</h2><p>${t("右侧说明与当前预览同步。复制当前资源提示词，或选择只复用视觉风格，替换成自己的业务需求。", "The notes follow the current preview. Copy its prompt, or the visual style only, and substitute your business requirements.")}</p><h2>3. ${t("带走实际代码", "Take the actual code")}</h2><p>${t("在体验页选择「详情」或「代码」。资源页提供实际入口、实现、依赖与来源说明；完整案例可切换页面继续体验。下载 ZIP 后运行以下命令。", "Choose Details or Code in the experience page for implementation, dependencies and provenance. Switch pages within a complete system. Extract the ZIP and run the commands below.")}</p><pre>npm ci\nnpm run dev\n\n# Build\nnpm run build</pre><h2>4. ${t("收藏并备份", "Save and back up")}</h2><p>${t("收藏保存在当前浏览器，可导出或导入 JSON。原有案例与组件收藏继续有效。", "Favorites stay in this browser and can be exported or imported as JSON. Existing favorites still work.")}</p></div>`;
  }
  return { sourcePage, guidePage };
}

// @ts-check
import { icon } from "../icons.js";
import { escapeHTML as esc } from "./html.js";
import { guidanceForResource } from "../guidance-catalog.js";
import {
  getCase,
  libraries,
  resourceSource,
  resources,
  findResource,
} from "../catalog.js";
import { key } from "./resource-views.js";

/** @param {import("./types").BaseDependencies} dependencies */
export function createResourceDetails({ appState, t, href, l }) {
  /** @param {string} url @param {string} label */
  const external = (url, label) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${icon("arrow-up-right")}</a>`;
  /** @param {import("./types").Resource} r @param {string} promptHTML */
  function resourceDetails(r, promptHTML) {
    const c = r.caseId
      ? getCase(r.caseId)
      : r.type === "case"
        ? getCase(r.id)
        : null;
    const principle = r.principle || c?.principle;
    const rules = r.rules || c?.rules;
    const linked = guidanceForResource(key(r));
    const linkedHTML = linked.length
      ? `<section class="detail-section related-guidance"><h3>${t("相关设计指导", "Related guidance")}</h3>${linked.map((g) => `<a class="text-link" href="${href("guidance", g.id)}">${esc(l(g.name))}${icon("arrow-up-right")}</a>`).join("")}<a class="button" href="${href("compose", "", { reference: key(r) })}">${t("加入提示词组合", "Use in a prompt")}</a></section>`
      : "";
    return `<section class="detail-section"><h3>${t("适用场景", "Use cases")}</h3><p>${esc(l(r.useCases || c?.scene || r.description))}</p></section><section class="detail-section"><h3>${t("设计解读 · 本站整理", "Design notes · Atlas interpretation")}</h3><p>${esc(l(principle) || l(r.description))}</p>${
      rules
        ? `<ul>${l(rules)
            .map((x) => `<li>${esc(x)}</li>`)
            .join("")}</ul>`
        : ""
    }</section>${promptHTML}${provenance(r)}${linkedHTML}`;
  }

  /** @param {import("./types").Resource} r */
  function provenance(r) {
    const s = resourceSource(r);
    return `<details class="detail-section provenance"><summary>${t("来源与组件库", "Source & libraries")}</summary><div class="provenance-content">${r.libraryIds
      .map((id) => {
        const lib = libraries[id];
        return `<div class="library-credit"><strong>${esc(lib.name)}</strong><code>${esc(r.libraryVersions?.[id] || lib.version)}</code>${external(lib.docs, t("官方文档", "Official docs"))}</div>`;
      })
      .join(
        "",
      )}<p><strong>${esc(s.name)}</strong> · ${esc(s.author)}</p><div class="credit-links">${external(r.originalUrl || s.docs || s.repo, t("原始示例", "Original example"))}${external(r.sourceUrl || s.repo, t("源码地址", "Source code"))}${s.licenseFile ? external(s.licenseFile, s.license) : `<span>${esc(s.license)}</span>`}</div>${s.commit ? `<p class="commit-credit">${t("固定源码版本", "Pinned source")} <code>${s.commit}</code></p>` : ""}<p class="curator-label">${s.notice ? esc(l(s.notice)) : s.original ? t("本站原创组合；使用所列组件库，不代表上游官方页面。提示词、样式和业务交互随资源源码交付。", "An original Atlas composition using the listed libraries, not an official upstream page. Prompts, styles and interactions are included with the resource source.") : t("保留上游视觉与实现；本站适配语言、本地数据和预览入口。设计解读与提示词由本站整理。", "Upstream visuals and implementation, adapted for language, local data and previews. Notes and prompts are curated by Atlas.")}</p></div></details>`;
  }

  /** @param {import("./types").Resource} r */
  function related(r) {
    const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId);
    const parts = c
      ? resources.filter(
          (x) =>
            x.type === "component" &&
            x.caseId === c.id &&
            (r.type === "case" ||
              x.pageIds?.includes(r.id) ||
              r.pageIds?.some((p) => x.pageIds?.includes(p))),
        )
      : resources
          .filter(
            (x) =>
              x.id !== r.id &&
              (x.category === r.category || x.sourceId === r.sourceId),
          )
          .slice(0, 6);
    const pages =
      c?.pages
        .map((p) => findResource(p.id, "page"))
        .filter((r) => r !== undefined) || [];
    return `<section class="detail-section" id="related"><h3>${t(c ? "可复用组件" : "相关资源", c ? "Reusable components" : "Related resources")}</h3><div class="related-list">${parts
      .filter((x) => x.id !== r.id)
      .map(
        (x) =>
          `<a href="${href(x.type, x.id)}" data-related="${key(x)}"><span>${esc(l(x.name))}</span>${icon("arrow-up-right")}</a>`,
      )
      .join(
        "",
      )}</div>${c && pages.length ? `<h3>${t("所属系统与页面", "System & pages")}</h3><div class="related-list"><a href="${href("case", c.id)}" data-related="case:${c.id}">${esc(l(c.name))} ${icon("layout-template")}</a>${pages.map((x) => `<a href="${href(x.type, x.id)}" data-related="${key(x)}">${esc(l(x.name))}${icon("arrow-up-right")}</a>`).join("")}</div>` : ""}</section>`;
  }

  function caseDirectory() {
    const detail = appState.detailResource;
    if (detail?.type !== "case" || !detail.pages) return "";
    return `<section class="detail-section case-directory"><h3>${t("案例页面", "System pages")}</h3><div class="case-page-grid">${detail.pages
      .map((p) => {
        const item = findResource(p.id, "page");
        if (!item) return "";
        return `<button data-page-preview="${p.id}" aria-pressed="${p.id === appState.selected?.id}"><img loading="lazy" src="${item.cover}" alt=""><span>${esc(l(p.name))}</span></button>`;
      })
      .join("")}</div></section>`;
  }

  return { resourceDetails, related, caseDirectory };
}

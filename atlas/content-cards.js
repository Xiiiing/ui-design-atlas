// @ts-check
import { guidanceKinds, toolKinds } from "../guidance-catalog.js";
import { escapeHTML as esc } from "./html.js";
import { promptTask, promptTasks } from "./library-classification.js";
import { icon } from "../icons.js";
/** @param {import('./guidance-types').Guidance|import('./guidance-types').Tool} item @param {import('./types').BaseDependencies} deps */
export function contentCard(item, { appState, t, l, href }) {
  const isTool = "technologies" in item,
    key = `${isTool ? "tool" : "guidance"}:${item.id}`;
  const isPromptGallery = !isTool && appState.route.view === "prompts";
  const route = isTool ? "tools" : isPromptGallery ? "prompts" : "guidance";
  const itemURL = href(route, item.id, isPromptGallery ? Object.fromEntries(appState.route.params) : {});
  const labels = isTool ? toolKinds[item.kind] : isPromptGallery ? promptTasks[promptTask(item.id)] : guidanceKinds[item.kind];
  const saved = appState.favorites.has(key);
  const label = t(labels[0], labels[1]);
  return `<article class="asset-card guidance-card" data-resource="${key}"><div class="guidance-card-heading"><span class="guidance-kind">${icon(isTool ? "code-xml" : "layers")}${label}</span><button type="button" class="icon-button asset-save${saved ? " saved" : ""}" data-save="${key}" aria-pressed="${saved}" aria-label="${t("收藏", "Save")} ${esc(l(item.name))}">${icon("bookmark")}</button></div><h2><a href="${itemURL}">${esc(l(item.name))}</a></h2><p>${esc(l(item.description))}</p>${!isTool && item.kind === "design" ? `<div class="guidance-palette" aria-label="${t("参考色板", "Reference palette")}">${item.palette.map((c) => `<span style="--swatch:${c}" title="${c}"></span>`).join("")}</div>` : ""}<div class="guidance-card-footer"><small>${isTool ? item.technologies.map(esc).join(" · ") : t("效果尚未验证", "Outcome unverified")}</small><a class="text-link" href="${itemURL}">${isPromptGallery ? t("阅读提示词", "Read prompt") : t("查看内容", "Read")}${icon("arrow-up-right")}</a></div></article>`;
}

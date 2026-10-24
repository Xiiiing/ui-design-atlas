import { escapeHTML as esc } from "../components.js";
import { icon } from "../icons.js";
import {
  replaceShellHTML,
  browseScroll,
  scrollBrowseTo,
  fieldValue,
  setFieldValue,
} from "../shell/controls.tsx";
import {
  resourcePrompt,
  findResource,
  getCase,
  resourceSource,
  resourcePreview,
} from "../catalog.js";
import { resourcePresentation, embeddedPreviewURL } from "../presentation.js";
import { key } from "./resource-views.js";
import { parse } from "./navigation.js";

export function createViewer({
  appState,
  labelType,
  t,
  saveButton,
  l,
  tagLinks,
  resourceDetails,
  caseDirectory,
  related,
  loadCode,
  language,
  stopAllLive,
  main,
  shellTheme,
  href,
  render,
}) {
  function inspector() {
    if (!appState.selected) return;
    const r = appState.selected;
    const head = `<div class="inspector-head"><div class="detail-eyebrow"><span>${labelType(r)}${r.motion ? " · " + t("动效", "Motion") : ""}</span>${saveButton(r)}</div><h2>${esc(l(r.name))}</h2><p>${esc(l(r.description))}</p></div>`;
    const prompt = `<section class="detail-section"><div class="section-heading"><h3>${t("当前提示词", "Current prompt")}</h3></div><p class="curator-label">${t("本站整理 · 对应当前演示", "Curated by Atlas · Matches this preview")}</p><select data-shell-control id="prompt-scope" aria-label="${t("提示词层级", "Prompt scope")}"><option value="current">${t("当前资源", "Current resource")}</option><option value="style">${t("只复用视觉风格", "Visual style only")}</option></select><pre class="inline-prompt full-prompt prompt-text">${esc(promptText(r))}</pre><button class="button primary" data-copy-prompt>${icon("copy")}${t("复制提示词", "Copy prompt")}</button></section>`;
    replaceShellHTML(
      document.querySelector("#inspector"),
      `${head}<button class="button inspector-close" data-toggle-details>${t("收起说明", "Close details")}</button>${tagLinks(r, true)}<div class="inspector-content">${resourceDetails(r, prompt)}${caseDirectory()}${related(r)}</div>`,
    );
    {
      const code = document.querySelector("#full-code");
      code.hidden = appState.tab !== "code";
      document.querySelector("#preview-panel").hidden = appState.tab === "code";
      document.querySelectorAll("[data-full-tab]").forEach((el) => {
        el.setAttribute(
          "aria-selected",
          String(el.dataset.tab === appState.tab),
        );
        el.tabIndex = el.dataset.tab === appState.tab ? 0 : -1;
      });
      if (appState.tab === "code") void loadCode(r);
      syncDetailsPanel();
    }
  }

  function previewParameters(r) {
    const config =
      r.id === "magicui-border-beam"
        ? ["duration", t("时长（秒）", "Duration (seconds)"), 1, 20, 8]
        : r.id === "magicui-shimmer-button"
          ? ["duration", t("时长（秒）", "Duration (seconds)"), 1, 20, 3]
          : r.id === "magicui-particles"
            ? ["quantity", t("粒子数量", "Particle count"), 10, 250, 100]
            : r.id === "magicui-number-ticker"
              ? ["value", t("目标数值", "Target value"), 0, 99999, 100]
              : null;
    return config;
  }

  function promptText(r, scope = r.type) {
    const text = resourcePrompt(r, appState.locale, scope),
      config = previewParameters(r);
    const input = document.querySelector("[data-preview-setting]");
    return config &&
      appState.selected?.id === r.id &&
      input &&
      Number(input.dataset.appliedValue) !== config[4]
      ? text +
          "\n\n" +
          t(
            "当前预览参数覆盖（以此为准）：",
            "Current preview parameter override (takes precedence): ",
          ) +
          config[0] +
          " = " +
          input.dataset.appliedValue +
          "."
      : text;
  }

  function viewer(r) {
    appState.detailResource = r;
    appState.selected =
      r.type === "case"
        ? findResource(
            r.pages.find((p) => p.key === appState.route.params.get("page"))
              ?.id || r.pages[0].id,
            "page",
          )
        : r;
    const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId),
      chosen = appState.selected;
    const framing = resourcePresentation(chosen, "detail"),
      parameter = previewParameters(chosen);
    if (parameter && appState.previewValues.has(chosen.id))
      parameter[4] = appState.previewValues.get(chosen.id);
    return `<article class="resource-page"><div class="market-viewer full-viewer experience-viewer"><header class="market-viewer-toolbar"><div class="viewer-leading"><button class="icon-button" data-close-viewer aria-label="${t("返回资源市场", "Back to market")}">${icon("arrow-left")}</button><div class="viewer-title"><h1 tabindex="-1">${esc(l(r.type === "case" ? r.name : chosen.name))}</h1><small>${esc(resourceSource(chosen).name)}</small></div>${c && r.type !== "component" ? `<select data-shell-control id="preview-page" aria-label="${t("预览页面", "Preview page")}">${c.pages.map((p) => `<option value="${p.id}" ${p.id === chosen.id ? "selected" : ""}>${esc(l(p.name))}</option>`).join("")}</select>` : ""}</div><div class="viewer-tools"><button class="icon-button" data-share aria-label="${t("复制分享链接", "Copy share link")}">${icon("link")}</button><span data-shell-appearance></span>${language(true)}<button class="icon-button" data-close-viewer aria-label="${t("关闭预览", "Close preview")}">${icon("x")}</button></div></header>
  <div class="experience-actions"><div class="full-resource-tabs" role="tablist" aria-label="${t("资源内容", "Resource content")}"><button data-full-tab data-tab="notes" role="tab" aria-selected="${appState.tab !== "code"}" aria-controls="preview-panel">${t("预览", "Preview")}</button><button data-full-tab data-tab="code" role="tab" aria-selected="${appState.tab === "code"}" aria-controls="full-code">${t("代码", "Code")}</button></div><button class="button" data-toggle-details aria-controls="inspector" aria-expanded="false">${t("详情", "Details")}</button><button class="button" data-copy-resource-prompt>${icon("copy")}${t("复制提示词", "Copy prompt")}</button></div><div class="market-detail-layout"><div class="full-preview-column"><section class="market-preview-panel" id="preview-panel" data-layout="${framing.layout}" style="--stage-height:${framing.stageHeight}px"><div class="preview-toolbar"><span class="preview-label">${t("交互预览", "Live preview")}</span><div class="viewer-devices">${[
    ["0", "monitor", t("自动画布", "Automatic canvas")],
    ["768", "tablet", "768px"],
    ["375", "smartphone", "375px"],
  ]
    .map(
      ([w, i, label]) =>
        `<button class="icon-button ${appState.width === Number(w) ? "selected" : ""}" data-device="${w}" aria-label="${label}" aria-pressed="${appState.width === Number(w)}">${icon(i)}</button>`,
    )
    .join(
      "",
    )}<button class="icon-button" data-fit aria-label="${t("等比适应画布", "Fit canvas proportionally")}" aria-pressed="${appState.fit}">${icon("expand")}</button></div><div class="preview-actions">${chosen.motion ? `<button class="icon-button" data-replay aria-label="${t("重播动效", "Replay animation")}">${icon("rotate-ccw")}</button>` : ""}<button class="icon-button" data-preview-theme aria-label="${t("切换演示主题", "Toggle preview theme")}">${icon(appState.theme === "dark" ? "sun" : "moon")}</button><button class="icon-button" data-fullscreen aria-label="${t("全屏预览", "Fullscreen preview")}">${icon("maximize")}</button><a id="standalone" class="icon-button" href="${esc(resourcePreview(chosen, appState.locale, appState.theme))}" target="_blank" rel="noopener noreferrer" aria-label="${t("独立打开演示", "Open standalone demo")}">${icon("arrow-up-right")}</a></div></div>
  <div class="market-preview-viewport" id="preview-viewport"><div class="viewer-load-state" role="status"><span>${t("正在加载体验…", "Loading experience…")}</span><button class="button" data-retry-viewer hidden>${t("重试", "Retry")}</button></div><div id="preview-canvas"><iframe id="case-preview" src="${esc(embeddedPreviewURL(resourcePreview(chosen, appState.locale, appState.theme)))}" title="${esc(l(chosen.name))}" allow="clipboard-write"></iframe></div></div>
  ${parameter ? `<div class="preview-parameters"><label>${parameter[1]}<input type="number" data-preview-setting="${parameter[0]}" data-applied-value="${parameter[4]}" min="${parameter[2]}" max="${parameter[3]}" value="${parameter[4]}" aria-label="${parameter[1]}"></label><span>${t("上游原有参数", "Original component parameter")}</span></div>` : ""}
  <div class="market-preview-bottom"><div><button class="icon-button" data-neighbor="-1" aria-label="${t("上一个资源", "Previous resource")}">${icon("chevron-left")}</button><button class="icon-button" data-neighbor="1" aria-label="${t("下一个资源", "Next resource")}">${icon("chevron-right")}</button><span>${labelType(chosen)} · ${esc(resourceSource(chosen).license)}</span></div><button class="text-link" data-focus-prompt>${t("查看提示词", "View prompt")}${icon("arrow-up-right")}</button></div></section><div id="full-code" role="tabpanel" hidden></div></div><aside id="inspector" class="market-inspector" aria-label="${t("设计说明", "Design details")}"></aside></div></div></article>`;
  }

  function showViewer(r) {
    stopAllLive();
    appState.tab =
      appState.route.params.get("tab") === "code" ? "code" : "notes";
    appState.width = 0;
    appState.fit = true;
    document.body.classList.add("is-experience");
    document.querySelector("#footer").hidden = true;
    replaceShellHTML(main, viewer(r));
    inspector();
    scalePreview();
    appState.previewResizeObserver.observe(
      document.querySelector("#preview-viewport"),
    );
    const frame = document.querySelector("#case-preview");
    appState.viewerThemeTarget = appState.theme;
    beginPreviewLoad();
    frame.addEventListener("load", () => {
      if (!frame.contentDocument?.querySelector("#root, #preview-root"))
        previewLoadState("error");
    });
    frame.addEventListener("error", () => previewLoadState("error"));
    frame.addEventListener("load", () => {
      sendPreviewTheme();
      const input = document.querySelector("[data-preview-setting]");
      if (input && appState.previewValues.has(appState.selected?.id))
        frame.contentWindow.postMessage(
          {
            type: "atlas:preview-settings",
            settings: {
              [input.dataset.previewSetting]: Number(
                input.dataset.appliedValue,
              ),
            },
          },
          location.origin,
        );
    });
    document.querySelector(".viewer-title h1")?.focus({ preventScroll: true });
    document.title = l(r.name) + " · UI Design Atlas";
  }

  function previewLoadState(state) {
    const status = document.querySelector(".viewer-load-state");
    if (!status) return;
    clearTimeout(appState.previewLoadTimer);
    status.hidden = state === "ready";
    status.querySelector("span").textContent =
      state === "error"
        ? t("体验加载失败", "Experience could not be loaded")
        : t("正在加载体验…", "Loading experience…");
    status.querySelector("button").hidden = state !== "error";
  }

  function beginPreviewLoad() {
    previewLoadState("loading");
    appState.previewLoadTimer = setTimeout(
      () => previewLoadState("error"),
      15000,
    );
  }

  function openResource(id, type, replace = false, details = false) {
    const r = findResource(id, type);
    if (!r) return;
    if (!appState.selected) {
      appState.theme = shellTheme();
      appState.originBrowse = {
        hash: location.hash || href(),
        scroll: browseScroll(),
        limit: appState.limit,
        focus: key(r),
        focusSelector: document.activeElement?.closest(".asset-actions")
          ? ".asset-actions [data-open]"
          : document.activeElement?.closest(".asset-caption")
            ? ".asset-caption [data-open]"
            : "[data-open]",
        items: [...document.querySelectorAll(".asset-card")].map(
          (el) => el.dataset.resource,
        ),
      };
      history.replaceState(
        { ...history.state, browse: appState.originBrowse },
        "",
        location.href,
      );
    }
    const depth = history.state?.resourceDepth || 0;
    const state = {
      background: appState.originBrowse,
      resourceDepth: replace ? Math.max(1, depth) : depth + 1,
    };
    const url = href(r.type, r.id, {
      ...(details ? { panel: "details" } : {}),
    });
    history[replace ? "replaceState" : "pushState"](state, "", url);
    appState.route = parse();
    render();
    scrollBrowseTo(0);
  }

  function closeViewer() {
    if (appState.originBrowse && history.state?.resourceDepth) {
      history.go(-history.state.resourceDepth);
      return;
    }
    location.hash = href("explore").slice(1);
  }

  function syncDetailsPanel(focus = false) {
    const viewer = document.querySelector(".experience-viewer");
    if (!viewer) return;
    const open =
      appState.route.params.get("panel") === "details" &&
      appState.tab !== "code";
    viewer.dataset.detailsOpen = String(open);
    document.querySelector("#inspector").hidden = !open;
    document.querySelector(".full-preview-column").inert =
      open && innerWidth < 1024;
    const toggle = viewer.querySelector(
      ".experience-actions [data-toggle-details]",
    );
    toggle.setAttribute("aria-expanded", String(open));
    if (focus)
      (open ? viewer.querySelector(".inspector-close") : toggle).focus();
    requestAnimationFrame(scalePreview);
  }

  function toggleDetails(
    open = appState.route.params.get("panel") !== "details",
  ) {
    const params = new URLSearchParams(appState.route.params);
    if (open) params.set("panel", "details");
    else params.delete("panel");
    history.replaceState(
      history.state,
      "",
      href(appState.route.view, appState.route.id, Object.fromEntries(params)),
    );
    appState.route = parse();
    syncDetailsPanel(true);
  }

  function scalePreview() {
    const viewport = document.querySelector("#preview-viewport"),
      frame = document.querySelector("#case-preview"),
      canvas = document.querySelector("#preview-canvas");
    if (
      !viewport ||
      !appState.selected ||
      !viewport.clientWidth ||
      !viewport.clientHeight
    )
      return;
    // Keep the authored viewport intact on desktop. On smaller screens, wide
    // resources use a portrait device so their responsive controls remain usable.
    // Base automatic device selection on the window, not the inspector's width.
    const device =
      appState.width ||
      (appState.selected.preview.width >= 900 && innerWidth < 1024
        ? innerWidth < 600
          ? 375
          : 768
        : 0);
    const desired = device || appState.selected.preview.width;
    const h =
      device === 375
        ? 812
        : device === 768
          ? 1024
          : appState.selected.preview.height;
    const scale = appState.fit
      ? Math.min(viewport.clientWidth / desired, viewport.clientHeight / h)
      : 1;
    canvas.style.width = desired * scale + "px";
    canvas.style.height = h * scale + "px";
    frame.style.width = desired + "px";
    frame.style.height = h + "px";
    frame.style.transform = `scale(${scale})`;
  }

  function currentPrompt() {
    return promptText(
      appState.selected,
      fieldValue("prompt-scope") === "style" ? "style" : appState.selected.type,
    );
  }

  function syncPage(id) {
    const p = findResource(id, "page");
    if (!p) return;
    appState.selected = p;
    beginPreviewLoad();
    document.querySelector("#case-preview").src = embeddedPreviewURL(
      resourcePreview(p, appState.locale, appState.theme),
    );
    updateContext();
  }

  function updateContext() {
    if (appState.detailResource.type !== "case")
      appState.detailResource = appState.selected;
    document.querySelector(".viewer-title h1").textContent = l(
      appState.detailResource.name,
    );
    document.querySelector("#case-preview").title = l(appState.selected.name);
    document.title = l(appState.detailResource.name) + " · UI Design Atlas";
    const select = document.querySelector("#preview-page");
    if (select) setFieldValue("preview-page", appState.selected.id);
    document.querySelector("#standalone").href = resourcePreview(
      appState.selected,
      appState.locale,
      appState.theme,
    );
    const url =
      appState.detailResource.type === "case"
        ? href("case", appState.detailResource.id, {
            page: appState.selected.key,
            theme: appState.theme,
            ...(appState.tab === "code" ? { tab: "code" } : {}),
            ...(appState.route.params.get("panel") === "details"
              ? { panel: "details" }
              : {}),
          })
        : href(appState.selected.type, appState.selected.id, {
            theme: appState.theme,
            ...(appState.tab === "code" ? { tab: "code" } : {}),
            ...(appState.route.params.get("panel") === "details"
              ? { panel: "details" }
              : {}),
          });
    history.replaceState(history.state, "", url);
    appState.route = parse();
    inspector();
    document
      .querySelectorAll("[data-page-preview]")
      .forEach((el) =>
        el.setAttribute(
          "aria-pressed",
          String(el.dataset.pagePreview === appState.selected.id),
        ),
      );
    scalePreview();
  }

  function sendPreviewTheme() {
    document.querySelector("#case-preview")?.contentWindow.postMessage(
      {
        type: "atlas:preview-config",
        locale: appState.locale,
        theme: appState.theme,
      },
      location.origin,
    );
  }

  function acceptPreviewTheme(value) {
    if (!["light", "dark"].includes(value)) return;
    if (appState.viewerThemeTarget && value !== appState.viewerThemeTarget) {
      // A lazy case bridge can become ready after iframe load and miss earlier
      // commands. Its validated state message is our opportunity to send the
      // latest pending choice again, without reloading or accepting stale state.
      sendPreviewTheme();
      return;
    }
    appState.viewerThemeTarget = null;
    // An initial acknowledgement must not turn a following theme into a URL override.
    if (appState.theme === value) return;
    appState.theme = value;
    document.querySelector("[data-preview-theme]").innerHTML = icon(
      appState.theme === "dark" ? "sun" : "moon",
    );
    updateThemeURL();
  }

  function updateThemeURL(follow = false) {
    const p = parse();
    if (follow) p.params.delete("theme");
    else p.params.set("theme", appState.theme);
    history.replaceState(
      history.state,
      "",
      "#" + p.view + (p.id ? "/" + p.id : "") + "?" + p.params,
    );
    document.querySelector("#standalone").href = resourcePreview(
      appState.selected,
      appState.locale,
      appState.theme,
    );
  }
  return {
    inspector,
    promptText,
    showViewer,
    previewLoadState,
    beginPreviewLoad,
    openResource,
    closeViewer,
    syncDetailsPanel,
    toggleDetails,
    scalePreview,
    currentPrompt,
    syncPage,
    updateContext,
    sendPreviewTheme,
    acceptPreviewTheme,
    updateThemeURL,
  };
}

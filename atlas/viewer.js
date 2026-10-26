// @ts-check
import { loadResourceDetails } from "./resource-data.js";
import { element, maybe, all } from "./dom.js";
import { escapeHTML as esc } from "./html.js";
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

/** @param {import("./types").BaseDependencies & Pick<ReturnType<typeof import("./resource-views").createResourceViews>, "labelType"|"saveButton"|"tagLinks"|"resourceDetails"|"caseDirectory"|"related"|"language"> & {loadCode:import("./types").LoadCode;stopAllLive:()=>void;main:HTMLElement;shellTheme:()=>import("./types").Theme;render:()=>void}} dependencies */
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
  let detailsSerial = 0;
  /** @param {import("./types").Resource} resource */
  async function loadViewerDetails(resource) {
    const serial = ++detailsSerial;
    try {
      const full = await loadResourceDetails(resource);
      if (
        serial !== detailsSerial ||
        appState.selected?.id !== resource.id ||
        appState.selected?.type !== resource.type
      )
        return;
      appState.selected = full;
      if (appState.tab !== "code") inspector();
    } catch {
      if (
        serial === detailsSerial &&
        appState.selected?.id === resource.id &&
        maybe("#inspector")
      )
        element("#inspector").innerHTML =
          `<p role="alert">${t("详情读取失败", "Could not load details")}</p><button class="button" data-retry-details>${t("重试", "Retry")}</button>`;
    }
  }
  function inspector() {
    if (!appState.selected) return;
    const r = appState.selected;
    const head = `<div class="inspector-head"><div class="detail-eyebrow"><span>${labelType(r)}${r.motion ? " · " + t("动效", "Motion") : ""}</span>${saveButton(r)}<button class="icon-button inspector-close" data-toggle-details aria-label="${t("收起说明", "Close details")}" title="${t("收起说明", "Close details")}">${icon("x")}</button></div><h2>${esc(l(r.name))}</h2><p>${esc(l(r.description))}</p></div>`;
    const prompt = `<section class="detail-section"><div class="section-heading"><h3>${t("当前提示词", "Current prompt")}</h3></div><p class="curator-label">${t("本站整理 · 对应当前演示", "Curated by Atlas · Matches this preview")}</p><select data-shell-control id="prompt-scope" aria-label="${t("提示词层级", "Prompt scope")}"><option value="current">${t("当前资源", "Current resource")}</option><option value="style">${t("只复用视觉风格", "Visual style only")}</option></select><pre class="inline-prompt full-prompt prompt-text">${esc(promptText(r))}</pre><button class="button primary" data-copy-prompt>${icon("copy")}${t("复制提示词", "Copy prompt")}</button></section>`;
    replaceShellHTML(
      element("#inspector"),
      `${head}${tagLinks(r, true)}<div class="inspector-content">${resourceDetails(r, prompt)}${caseDirectory()}${related(r)}</div>`,
    );
    {
      const code = element("#full-code");
      code.hidden = appState.tab !== "code";
      element("#preview-panel").hidden = appState.tab === "code";
      all("[data-full-tab]").forEach((el) => {
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

  /** @param {import("./types").Resource} r @returns {[string,string,number,number,number]|null} */
  function previewParameters(r) {
    /** @type {[string,string,number,number,number]|null} */
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

  /** @param {import("./types").Resource} r @param {string} [scope] */
  function promptText(r, scope = r.type) {
    const text = r.prompt
        ? resourcePrompt(r, appState.locale, scope)
        : t("正在读取详情…", "Loading details…"),
      config = previewParameters(r);
    const input = maybe("[data-preview-setting]");
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

  /** @param {import("./types").Resource} r */
  function viewer(r) {
    if (r.type === "case" && !r.pages?.length)
      throw new Error("Case has no pages");
    appState.detailResource = r;
    appState.selected =
      r.type === "case"
        ? findResource(
            r.pages?.find((p) => p.key === appState.route.params.get("page"))
              ?.id ||
              r.pages?.[0].id ||
              "",
            "page",
          ) || null
        : r;
    const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId),
      chosen = appState.selected;
    if (!chosen) throw new Error("Missing preview resource");
    const framing = resourcePresentation(chosen, "detail"),
      parameter = previewParameters(chosen);
    if (parameter && appState.previewValues.has(chosen.id))
      parameter[4] = appState.previewValues.get(chosen.id) ?? parameter[4];
    return `<article class="resource-page"><div class="market-viewer full-viewer experience-viewer" data-preview-kind="${chosen.type}"><header class="market-viewer-toolbar"><div class="viewer-leading"><button class="icon-button" data-close-viewer aria-label="${t("返回资源市场", "Back to market")}">${icon("arrow-left")}</button><div class="viewer-title"><h1 tabindex="-1">${esc(l(r.type === "case" ? r.name : chosen.name))}</h1><small>${esc(resourceSource(chosen).name)}</small></div>${c && r.type !== "component" ? `<select data-shell-control id="preview-page" aria-label="${t("预览页面", "Preview page")}">${c.pages.map((p) => `<option value="${p.id}" ${p.id === chosen.id ? "selected" : ""}>${esc(l(p.name))}</option>`).join("")}</select>` : ""}</div><div class="viewer-tools"><div class="market-preview-bottom viewer-resource-nav"><div><button class="icon-button" data-neighbor="-1" aria-label="${t("上一个资源", "Previous resource")}">${icon("chevron-left")}</button><button class="icon-button" data-neighbor="1" aria-label="${t("下一个资源", "Next resource")}">${icon("chevron-right")}</button><span class="sr-only">${labelType(chosen)} · ${esc(resourceSource(chosen).license)}</span></div><button class="icon-button" data-focus-prompt aria-label="${t("查看提示词", "View prompt")}" title="${t("查看提示词", "View prompt")}">${icon("code-xml")}</button></div><button class="icon-button" data-share aria-label="${t("复制分享链接", "Copy share link")}">${icon("link")}</button><span data-shell-appearance></span>${language(true)}<button class="icon-button" data-close-viewer aria-label="${t("关闭预览", "Close preview")}">${icon("x")}</button></div></header>
  <div class="experience-actions"><div class="full-resource-tabs" role="tablist" aria-label="${t("资源内容", "Resource content")}"><button data-full-tab data-tab="notes" role="tab" aria-selected="${appState.tab !== "code"}" aria-controls="preview-panel">${t("预览", "Preview")}</button><button data-full-tab data-tab="code" role="tab" aria-selected="${appState.tab === "code"}" aria-controls="full-code">${t("代码", "Code")}</button></div><button class="button" data-toggle-details aria-controls="inspector" aria-expanded="false">${t("详情", "Details")}</button><button class="button" data-copy-resource-prompt>${icon("copy")}${t("复制提示词", "Copy prompt")}</button></div><div class="market-detail-layout"><div class="full-preview-column"><section class="market-preview-panel" id="preview-panel" data-layout="${framing.layout}" style="--stage-height:${framing.stageHeight}px"><div class="fullscreen-hud" role="group" aria-label="${t("全屏控制", "Fullscreen controls")}"><button class="button" data-fullscreen-controls aria-expanded="false" aria-controls="preview-tools">${icon("sliders-horizontal")}${t("控制", "Controls")}</button><button class="button" data-exit-fullscreen>${icon("minimize")}${t("退出全屏", "Exit fullscreen")}</button></div><div class="preview-toolbar" id="preview-tools"><span class="preview-label">${t("交互预览", "Live preview")}</span><div class="viewer-devices">${[
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
    )}<button class="icon-button ${appState.fit ? "selected" : ""}" data-fit aria-label="${t("适应预览区域", "Fit preview area")}" aria-pressed="${appState.fit}">${icon("expand")}</button></div><output id="preview-scale" aria-label="${t("预览缩放", "Preview scale")}">100%</output>${parameter ? `<div class="preview-parameters"><label>${parameter[1]}<input type="number" data-preview-setting="${parameter[0]}" data-applied-value="${parameter[4]}" min="${parameter[2]}" max="${parameter[3]}" value="${parameter[4]}" aria-label="${parameter[1]}"></label></div>` : ""}<div class="preview-actions">${chosen.motion ? `<button class="icon-button" data-replay aria-label="${t("重播动效", "Replay animation")}">${icon("rotate-ccw")}</button>` : ""}<button class="icon-button" data-preview-theme aria-label="${t("切换演示主题", "Toggle preview theme")}">${icon(appState.theme === "dark" ? "sun" : "moon")}</button><button class="icon-button" data-fullscreen aria-label="${t("全屏预览", "Fullscreen preview")}">${icon("maximize")}</button><a id="standalone" class="icon-button" href="${esc(resourcePreview(chosen, appState.locale, appState.theme))}" target="_blank" rel="noopener noreferrer" aria-label="${t("独立打开演示", "Open standalone demo")}">${icon("arrow-up-right")}</a></div></div>
  <div class="market-preview-viewport" id="preview-viewport"><div class="viewer-load-state" role="status"><span>${t("正在加载体验…", "Loading experience…")}</span><button class="button" data-retry-viewer hidden>${t("重试", "Retry")}</button></div><div id="preview-canvas"><iframe id="case-preview" src="${esc(embeddedPreviewURL(resourcePreview(chosen, appState.locale, appState.theme)))}" title="${esc(l(chosen.name))}" allow="clipboard-write"></iframe></div></div>
</section><div id="full-code" role="tabpanel" hidden></div></div><aside id="inspector" class="market-inspector" aria-label="${t("设计说明", "Design details")}"></aside></div></div></article>`;
  }

  /** @param {import("./types").Resource} r */
  function showViewer(r) {
    stopAllLive();
    appState.tab =
      appState.route.params.get("tab") === "code" ? "code" : "notes";
    appState.width = 0;
    appState.fit = true;
    document.body.classList.add("is-experience");
    element("#footer").hidden = true;
    replaceShellHTML(main, viewer(r));
    inspector();
    void loadViewerDetails(appState.selected || r);
    scalePreview();
    appState.previewResizeObserver?.observe(element("#preview-viewport"));
    const frame = element("#case-preview");
    appState.viewerThemeTarget = appState.theme;
    beginPreviewLoad();
    frame.addEventListener("load", () => {
      if (!frame.contentDocument?.querySelector("#root, #preview-root"))
        previewLoadState("error");
    });
    frame.addEventListener("error", () => previewLoadState("error"));
    frame.addEventListener("load", () => {
      sendPreviewTheme();
      const input = maybe("[data-preview-setting]");
      if (input && appState.previewValues.has(appState.selected?.id || ""))
        frame.contentWindow?.postMessage(
          {
            type: "atlas:preview-settings",
            settings: {
              [input.dataset.previewSetting || "value"]: Number(
                input.dataset.appliedValue,
              ),
            },
          },
          location.origin,
        );
    });
    maybe(".viewer-title h1")?.focus({ preventScroll: true });
    document.title = l(r.name) + " · UI Design Atlas";
  }

  /** @param {"ready"|"error"|"loading"} state */
  function previewLoadState(state) {
    const status = maybe(".viewer-load-state");
    if (!status) return;
    clearTimeout(appState.previewLoadTimer);
    status.hidden = state === "ready";
    element("span", status).textContent =
      state === "error"
        ? t("体验加载失败", "Experience could not be loaded")
        : t("正在加载体验…", "Loading experience…");
    element("button", status).hidden = state !== "error";
  }

  function beginPreviewLoad() {
    previewLoadState("loading");
    appState.previewLoadTimer = setTimeout(
      () => previewLoadState("error"),
      15000,
    );
  }

  /** @param {string} id @param {string} type */
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
        items: [...all(".asset-card")].map((el) => el.dataset.resource || ""),
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
    const viewer = maybe(".experience-viewer");
    if (!viewer) return;
    const open =
      appState.route.params.get("panel") === "details" &&
      appState.tab !== "code";
    viewer.dataset.detailsOpen = String(open);
    element("#inspector").hidden = !open;
    element(".full-preview-column").inert =
      open && innerWidth < 1024 && !maybe('[data-fullscreen-active="true"]');
    const toggle = element(".experience-actions [data-toggle-details]", viewer);
    toggle.setAttribute("aria-expanded", String(open));
    if (focus) (open ? element(".inspector-close", viewer) : toggle).focus();
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
    const viewport = maybe("#preview-viewport"),
      frame = maybe("#case-preview"),
      canvas = maybe("#preview-canvas");
    if (
      !viewport ||
      !frame ||
      !canvas ||
      !appState.selected ||
      !viewport.clientWidth ||
      !viewport.clientHeight
    )
      return;
    // Keep the notes below the actual toolbar, including wrapped parameter
    // rows. Measuring the toolbar never depends on whether notes are open.
    const layout = element(".market-detail-layout"),
      toolsHeight = element(".preview-toolbar").offsetHeight + "px";
    if (layout.style.getPropertyValue("--preview-tools-height") !== toolsHeight)
      layout.style.setProperty("--preview-tools-height", toolsHeight);
    const automatic = !appState.width && (innerWidth < 1024 || appState.fit);
    const desired = appState.width || appState.selected.preview.width;
    // Browser zoom produces fractional content boxes. Percentage constraints
    // fit those boxes exactly; writing rounded clientWidth/clientHeight back
    // can alternately add/remove classic scrollbars on every observer callback.
    canvas.style.width = automatic
      ? "100%"
      : appState.fit
        ? `min(100%, ${desired}px)`
        : desired + "px";
    canvas.style.height =
      automatic || appState.width
        ? "100%"
        : appState.selected.preview.height + "px";
    const scale =
      automatic || !appState.fit
        ? 1
        : Math.min(1, parseFloat(getComputedStyle(canvas).width) / desired);
    frame.style.width = automatic ? "100%" : desired + "px";
    frame.style.height = automatic
      ? "100%"
      : appState.width
        ? 100 / scale + "%"
        : appState.selected.preview.height + "px";
    frame.style.transform = `scale(${scale})`;
    element("#preview-scale").textContent = `${Math.round(scale * 100)}%`;
  }

  function currentPrompt() {
    if (!appState.selected) return "";
    return promptText(
      appState.selected,
      fieldValue("prompt-scope") === "style" ? "style" : appState.selected.type,
    );
  }

  /** @param {string} id */
  function syncPage(id) {
    const p = findResource(id, "page");
    if (!p) return;
    appState.selected = p;
    beginPreviewLoad();
    element("#case-preview").src = embeddedPreviewURL(
      resourcePreview(p, appState.locale, appState.theme),
    );
    updateContext();
  }

  function updateContext() {
    if (!appState.selected || !appState.detailResource) return;
    if (appState.detailResource.type !== "case")
      appState.detailResource = appState.selected;
    element(".viewer-title h1").textContent = l(appState.detailResource.name);
    element("#case-preview").title = l(appState.selected.name);
    document.title = l(appState.detailResource.name) + " · UI Design Atlas";
    const select = maybe("#preview-page");
    if (select) setFieldValue("preview-page", appState.selected.id);
    element("#standalone").href = resourcePreview(
      appState.selected,
      appState.locale,
      appState.theme,
    );
    const url =
      appState.detailResource.type === "case"
        ? href("case", appState.detailResource.id, {
            page: appState.selected.key || "",
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
    if (!appState.selected.prompt) void loadViewerDetails(appState.selected);
    all("[data-page-preview]").forEach((el) =>
      el.setAttribute(
        "aria-pressed",
        String(el.dataset.pagePreview === appState.selected?.id),
      ),
    );
    scalePreview();
  }

  function sendPreviewTheme() {
    maybe("#case-preview")?.contentWindow?.postMessage(
      {
        type: "atlas:preview-config",
        locale: appState.locale,
        theme: appState.theme,
      },
      location.origin,
    );
  }

  /** @param {unknown} value */
  function acceptPreviewTheme(value) {
    if (value !== "light" && value !== "dark") return;
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
    element("[data-preview-theme]").innerHTML = icon(
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
    element("#standalone").href = resourcePreview(
      appState.selected,
      appState.locale,
      appState.theme,
    );
  }
  return {
    inspector,
    loadViewerDetails,
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

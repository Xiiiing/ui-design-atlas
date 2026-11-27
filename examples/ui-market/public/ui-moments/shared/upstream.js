/* Atlas integration only. Controls are extracted from the pinned guanmo-ai source. */
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const resourceId = document.body.dataset.resource;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let locale = params.get("lang") === "zh-CN" ? "zh-CN" : "en";
  let paused = false;
  let visible = true;
  let stopped = false;
  let pauseStart = 0;
  let pauseDuration = 0;
  let sequence = 0;
  const frames = new Map();
  const animations = new Set();
  const originals = new WeakMap();
  const translations = {
    "Pause motion": "暂停动效",
    "Resume motion": "继续动效",
    Send: "发送",
    Sent: "已发送",
    Download: "下载",
    "Download started": "下载开始",
    "Download complete": "下载完成",
    "Download canceled": "下载已取消",
    "Downloading, tap to cancel": "下载中，再按一次取消",
    "Swipe to confirm": "滑动确认",
    Confirmed: "已确认",
    Confirm: "确认",
    "Drag to confirm": "拖动确认",
    "Notifications on": "通知已开启",
    "Notifications off": "通知已关闭",
    "Toggle notifications": "切换通知",
    "Enable notifications": "开启通知",
    Play: "播放",
    Pause: "暂停",
    Overview: "概览",
    Activity: "动态",
    Analytics: "分析",
    Revenue: "收入",
    Audience: "受众",
    Growth: "增长",
    Week: "本周",
    Month: "本月",
    Year: "本年",
    Weekly: "每周",
    Monthly: "每月",
    Yearly: "每年",
    Today: "今天",
    "Design the flow": "设计流程",
    "Build the prototype": "制作原型",
    "Ship the details": "完成细节",
    "Design tokens": "设计令牌",
    "Motion study": "动效研究",
    "Final review": "最终评审",
    "Gather requirements": "收集需求",
    "Sketch wireframes": "绘制线框图",
    "Write the handoff": "编写交付说明",
    "Open actions": "展开操作",
    "Close actions": "关闭操作",
    Search: "搜索",
    Home: "首页",
    Share: "分享",
    Save: "收藏",
    Edit: "编辑",
    Delete: "删除",
    "Toggle switch": "切换开关",
    "Toggle ink switch": "切换墨滴开关",
    "Bloom toggle": "花朵开关",
    "Flip coin": "抛硬币",
    Volume: "音量",
    Rating: "评分",
    Progress: "进度",
    "Toggle dominoes": "切换多米诺骨牌",
  };
  function translate(value) {
    if (locale === "en") return value;
    const trimmed = value.trim();
    if (translations[trimmed])
      return value.replace(trimmed, translations[trimmed]);
    return value
      .replace(/^(\d+) percent$/, "$1%")
      .replace(/^Row (\d+), column (\d+)$/, "第 $1 行，第 $2 列")
      .replace(
        /^Flip coin, showing (sun|moon)$/,
        (_, side) => "抛硬币，当前为" + (side === "sun" ? "太阳面" : "月亮面"),
      )
      .replace(/^(\d+) stars?$/, "$1 星");
  }
  function localize() {
    root.lang = locale;
    document.querySelectorAll("[data-en][data-zh]").forEach((node) => {
      const text = locale === "en" ? node.dataset.en : node.dataset.zh;
      if (node.textContent !== text) node.textContent = text;
    });
    const walker = document.createTreeWalker(
      document.querySelector("#root"),
      NodeFilter.SHOW_TEXT,
    );
    for (let node; (node = walker.nextNode()); ) {
      if (node.parentElement.closest("[data-en],script,style")) continue;
      const saved = originals.get(node);
      const value =
        saved?.rendered === node.nodeValue ? saved.original : node.nodeValue;
      const rendered = translate(value);
      originals.set(node, { original: value, rendered });
      if (node.nodeValue !== rendered) node.nodeValue = rendered;
    }
    for (const node of document.querySelectorAll(
      "[aria-label],[aria-valuetext]",
    )) {
      for (const attr of ["aria-label", "aria-valuetext"]) {
        if (!node.hasAttribute(attr)) continue;
        const key = attr === "aria-label" ? "atlasLabel" : "atlasValue";
        const renderedKey = key + "Rendered";
        const value =
          node.dataset[renderedKey] === node.getAttribute(attr)
            ? node.dataset[key]
            : node.getAttribute(attr);
        const rendered = translate(value);
        node.dataset[key] = value;
        node.dataset[renderedKey] = rendered;
        if (node.getAttribute(attr) !== rendered)
          node.setAttribute(attr, rendered);
      }
    }
  }
  function send(type, data = {}) {
    if (parent !== window)
      parent.postMessage({ type, resourceId, ...data }, location.origin);
  }
  const now = () =>
    performance.now() -
    pauseDuration -
    (stopped ? performance.now() - pauseStart : 0);
  function schedule(id, record) {
    record.native = requestAnimationFrame(() => {
      if (stopped) return;
      frames.delete(id);
      record.callback(now());
    });
  }
  function activity() {
    const next = paused || !visible || document.hidden;
    root.dataset.galleryActive = String(!next);
    if (next === stopped) return;
    if (next) {
      pauseStart = performance.now();
      stopped = true;
      frames.forEach((record) => cancelAnimationFrame(record.native));
      for (const animation of document.getAnimations()) {
        if (animation.playState === "running") {
          animation.pause();
          animations.add(animation);
        }
      }
    } else {
      pauseDuration += performance.now() - pauseStart;
      stopped = false;
      for (const [id, record] of frames) schedule(id, record);
      animations.forEach((animation) => {
        if (animation.playState === "paused") animation.play();
      });
      animations.clear();
    }
  }
  window.atlasUI = {
    motion: media,
    performance: { now },
    requestFrame(callback) {
      const id = ++sequence;
      const record = { callback, native: 0 };
      frames.set(id, record);
      if (!stopped) schedule(id, record);
      return id;
    },
    cancelFrame(id) {
      cancelAnimationFrame(frames.get(id)?.native);
      frames.delete(id);
    },
    ready() {
      localize();
      new MutationObserver(localize).observe(document.querySelector("#demo"), {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-label", "aria-valuetext"],
      });
      // Do not turn an aborted swipe beyond the threshold into a keyboard click.
      if (document.body.dataset.upstream === "swipe-confirm") {
        const knob = document.querySelector(".swipe-knob");
        let aborted = false;
        knob.addEventListener(
          "pointerdown",
          () => {
            aborted = false;
          },
          true,
        );
        knob.addEventListener(
          "pointercancel",
          () => {
            aborted = true;
          },
          true,
        );
        knob.addEventListener(
          "click",
          (event) => {
            if (aborted && event.detail !== 0) {
              event.preventDefault();
              event.stopImmediatePropagation();
            }
          },
          true,
        );
      }
      document.querySelector("#pause").addEventListener("click", (event) => {
        paused = !paused;
        event.currentTarget.setAttribute("aria-pressed", String(paused));
        event.currentTarget.textContent = paused
          ? "Resume motion"
          : "Pause motion";
        localize();
        activity();
      });
      document.addEventListener("visibilitychange", activity);
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        activity();
      }).observe(document.querySelector("#demo"));
      activity();
      send("atlas:inline-ready");
    },
  };
  root.toggleAttribute(
    "data-compact",
    params.has("inline") || params.has("thumb"),
  );
  root.dataset.theme = params.get("theme") === "dark" ? "dark" : "light";
  root.lang = locale;
  root.dataset.galleryActive = "true";
  addEventListener("message", (event) => {
    if (event.source !== parent || event.origin !== location.origin) return;
    const data = event.data;
    if (data?.resourceId && data.resourceId !== resourceId) return;
    if (data?.type === "atlas:preview-config") {
      if (["en", "zh-CN"].includes(data.locale)) locale = data.locale;
      if (["light", "dark"].includes(data.theme))
        root.dataset.theme = data.theme;
      localize();
      send("atlas:resource-state", { locale, theme: root.dataset.theme });
    } else if (data?.type === "atlas:replay") location.reload();
  });
  addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !event.defaultPrevented &&
      !params.has("inline")
    )
      send("atlas:escape");
  });
})();

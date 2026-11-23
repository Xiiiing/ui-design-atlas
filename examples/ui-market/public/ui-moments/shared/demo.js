/* Independently implemented from the episode 04 video. No upstream source used. */
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const stage = document.querySelector("#demo");
  const status = document.querySelector("#status");
  const resourceId = document.body.dataset.resource;
  const demo = document.body.dataset.demo;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let locale = params.get("lang") === "zh-CN" ? "zh-CN" : "en";
  let theme = params.get("theme") === "dark" ? "dark" : "light";
  let paused = false;
  let visible = true;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  const ticks = new Set();
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    heart: '<path d="M20 5c-3-3-7-1-8 2C8 0 0 5 4 11l8 10 8-10c2-2 2-4 0-6Z"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-4a8 8 0 0 1 16 0v4"/>',
    plane: '<path d="m3 10 18-7-7 18-3-8-8-3 18-7-10 10"/>',
    bookmark: '<path d="M5 3h14v19l-7-5-7 5Z"/>',
    bell: '<path d="M5 16h14l-2-4V8a5 5 0 0 0-10 0v4ZM10 20h4"/>',
    check: '<path d="m5 12 4 4 10-10"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  };
  const icon = (name) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths[name] +
    "</svg>";
  const text = (zh, en) =>
    '<span data-zh="' +
    zh +
    '" data-en="' +
    en +
    '">' +
    (locale === "zh-CN" ? zh : en) +
    "</span>";
  const label = (node, zh, en) => {
    node.dataset.zh = zh;
    node.dataset.en = en;
    node.textContent = locale === "zh-CN" ? zh : en;
  };
  const announce = (zh, en) => label(status, zh, en);
  const repeat = (count, render) =>
    Array.from({ length: count }, (_, i) => render(i)).join("");
  const svg = (content, viewBox = "0 0 300 120") =>
    '<svg viewBox="' + viewBox + '" aria-hidden="true">' + content + "</svg>";
  const motion = (fn, delay) => setTimeout(fn, reduced.matches ? 30 : delay);
  const button = (html, attributes = "") =>
    '<button type="button" ' + attributes + ">" + html + "</button>";

  function update() {
    root.lang = locale;
    root.dataset.theme = theme;
    document.querySelectorAll("[data-zh][data-en]").forEach((node) => {
      node.textContent = node.dataset[locale === "zh-CN" ? "zh" : "en"];
    });
    document.title = document.querySelector("h1").textContent;
    send("atlas:resource-state", { locale, theme });
  }
  function send(type, data = {}) {
    if (parent !== window)
      parent.postMessage({ type, resourceId, ...data }, location.origin);
  }
  function animate(now) {
    frame = 0;
    if (paused || !visible || document.hidden || !ticks.size) return;
    const delta = last ? Math.min(now - last, 80) : 0;
    last = now;
    elapsed += delta;
    ticks.forEach((tick) => tick(delta, elapsed));
    frame = requestAnimationFrame(animate);
  }
  function activity() {
    const stopped = paused || !visible || document.hidden;
    document.body.classList.toggle("paused", stopped);
    if (stopped) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame && ticks.size) {
      last = 0;
      frame = requestAnimationFrame(animate);
    }
  }
  function toggle(selector, attribute, off, on) {
    const node = stage.querySelector(selector);
    node.addEventListener("click", () => {
      const active = node.getAttribute(attribute) !== "true";
      node.setAttribute(attribute, String(active));
      announce(...(active ? on : off));
    });
    return node;
  }
  function switchDemo(className) {
    stage.innerHTML = button(
      '<span class="knob"></span>',
      'class="switch ' +
        className +
        '" role="switch" aria-checked="false" aria-label="' +
        (locale === "zh-CN" ? "切换开关" : "Toggle switch") +
        '"',
    );
    toggle("button", "aria-checked", ["已关闭", "Off"], ["已开启", "On"]);
  }
  function tabs(names, className, render) {
    stage.innerHTML =
      '<div role="tablist" class="' +
      className +
      '" aria-label="' +
      (locale === "zh-CN" ? "选项" : "Options") +
      '">' +
      (className === "leaf-tabs"
        ? ""
        : '<i class="tab-blob" aria-hidden="true"></i>') +
      names
        .map((name, i) =>
          button(
            name,
            'role="tab" aria-selected="' +
              (i === 0) +
              '" tabindex="' +
              (i === 0 ? 0 : -1) +
              '"',
          ),
        )
        .join("") +
      "</div>";
    const group = stage.firstElementChild;
    const buttons = [...group.querySelectorAll("button")];
    const choose = (index) => {
      buttons.forEach((node, i) => {
        node.setAttribute("aria-selected", String(i === index));
        node.tabIndex = i === index ? 0 : -1;
      });
      const blob = group.querySelector(".tab-blob");
      if (blob)
        blob.style.transform =
          "translateX(" +
          (buttons[index].offsetLeft - buttons[0].offsetLeft) +
          "px)";
      render?.(index);
      announce(
        "已选择第 " + (index + 1) + " 项",
        "Option " + (index + 1) + " selected",
      );
    };
    buttons.forEach((node, i) => {
      node.addEventListener("click", () => choose(i));
      node.addEventListener("keydown", (event) => {
        let index;
        if (event.key === "ArrowRight") index = (i + 1) % names.length;
        else if (event.key === "ArrowLeft")
          index = (i - 1 + names.length) % names.length;
        else if (event.key === "Home") index = 0;
        else if (event.key === "End") index = names.length - 1;
        else return;
        event.preventDefault();
        choose(index);
        buttons[index].focus();
      });
    });
  }
  function rangeDemo(content, zh, en, value = 0, max = 100) {
    stage.innerHTML =
      '<label class="range-control">' +
      content +
      '<span class="sr-only">' +
      text(zh, en) +
      '</span><input type="range" min="0" max="' +
      max +
      '" value="' +
      value +
      '"></label>';
    return stage.querySelector("input");
  }
  const demos = {
    "bars-fade"() {
      stage.innerHTML =
        '<div class="bars" role="img" aria-label="Loading">' +
        repeat(3, (i) => '<i style="--i:' + i + '"></i>') +
        "</div>";
    },
    "bloom-toggle"() {
      stage.innerHTML = button(
        repeat(6, (i) => '<i style="--i:' + i + '"></i>'),
        'class="bloom" aria-pressed="false" aria-label="' +
          (locale === "zh-CN" ? "展开花瓣" : "Open petals") +
          '"',
      );
      toggle(
        "button",
        "aria-pressed",
        ["花瓣已收拢", "Petals closed"],
        ["花瓣已展开", "Petals open"],
      );
    },
    "snap-grid"() {
      stage.innerHTML =
        '<div class="snap-grid"><i class="snap-square"></i>' +
        repeat(9, (i) =>
          button(
            '<span class="sr-only">' +
              text("位置 " + (i + 1), "Position " + (i + 1)) +
              "</span>",
            'aria-pressed="' + (i === 0) + '"',
          ),
        ) +
        "</div>";
      const grid = stage.firstElementChild;
      let dragging = false;
      let moved = false;
      const choose = (index) => {
        grid.querySelector(".snap-square").style.transform =
          "translate(" +
          (index % 3) * 60 +
          "px," +
          Math.floor(index / 3) * 60 +
          "px)";
        grid
          .querySelectorAll("button")
          .forEach((node, i) =>
            node.setAttribute("aria-pressed", String(index === i)),
          );
        announce(
          "吸附到位置 " + (index + 1),
          "Snapped to position " + (index + 1),
        );
      };
      grid.querySelectorAll("button").forEach((node, i) =>
        node.addEventListener("click", () => {
          if (!moved) choose(i);
          moved = false;
        }),
      );
      grid.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        dragging = true;
        moved = false;
        grid.setPointerCapture(event.pointerId);
      });
      grid.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        moved = true;
        const box = grid.getBoundingClientRect();
        const col = Math.max(
          0,
          Math.min(2, Math.floor((event.clientX - box.x - 6) / 60)),
        );
        const row = Math.max(
          0,
          Math.min(2, Math.floor((event.clientY - box.y - 6) / 60)),
        );
        choose(row * 3 + col);
      });
      grid.addEventListener("pointerup", () => {
        dragging = false;
      });
      grid.addEventListener("pointercancel", () => {
        dragging = false;
      });
    },
    "card-fan"() {
      stage.innerHTML = button(
        repeat(5, (i) => '<i class="mini-card" style="--i:' + i + '"></i>'),
        'class="card-fan" aria-pressed="false" aria-label="' +
          (locale === "zh-CN" ? "展开卡组" : "Spread cards") +
          '"',
      );
      toggle(
        "button",
        "aria-pressed",
        ["卡组已收拢", "Cards stacked"],
        ["卡组已展开", "Cards spread"],
      );
    },
    "gooey-tab-bar"() {
      tabs(
        ["home", "search", "heart", "user"].map(
          (name) =>
            icon(name) +
            '<span class="sr-only">' +
            text(
              { home: "首页", search: "搜索", heart: "收藏", user: "账户" }[
                name
              ],
              name,
            ) +
            "</span>",
        ),
        "gooey-tabs",
      );
    },
    "blocks-scale"() {
      stage.innerHTML =
        '<div class="blocks" role="img" aria-label="Loading">' +
        repeat(4, (i) => '<i style="--i:' + i + '"></i>') +
        "</div>";
    },
    "stretch-toggle"() {
      switchDemo("stretch");
    },
    "merge-drops"() {
      stage.innerHTML =
        svg(
          '<defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -8"/><feBlend in="SourceGraphic"/></filter></defs>',
        ) + '<div class="merge"><i></i><i></i></div>';
      stage.querySelector("svg").style.cssText =
        "position:absolute;width:0;height:0";
    },
    "paper-plane"() {
      stage.innerHTML = button(
        '<span class="plane">' +
          icon("plane") +
          '</span><span class="send-label">' +
          text("发送", "Send") +
          "</span>",
        'class="plane-send" data-state="idle"',
      );
      const node = stage.firstElementChild;
      node.addEventListener("click", () => {
        if (node.dataset.state === "sending") return;
        if (node.dataset.state === "sent") {
          node.dataset.state = "idle";
          label(node.querySelector(".send-label span"), "发送", "Send");
          announce("可以再次发送", "Ready to send");
          return;
        }
        node.dataset.state = "sending";
        node.disabled = true;
        announce("发送中", "Sending");
        motion(() => {
          node.dataset.state = "sent";
          node.disabled = false;
          label(
            node.querySelector(".send-label span"),
            "已发送 · 重置",
            "Sent · Reset",
          );
          announce("发送完成", "Message sent");
        }, 1000);
      });
    },
    "detent-dial"() {
      const input = rangeDemo(
        '<span class="dial">' +
          repeat(12, (i) => '<i style="--i:' + i + '"></i>') +
          '<output>0</output><span class="dial-needle"></span></span>',
        "旋钮档位",
        "Dial value",
        0,
        11,
      );
      input.addEventListener("input", () => {
        stage.querySelector("output").value = input.value;
        stage
          .querySelector(".dial")
          .style.setProperty("--angle", Number(input.value) * 30 + "deg");
      });
    },
    "domino-row"() {
      stage.innerHTML =
        '<div class="domino">' +
        repeat(7, (i) =>
          button(
            '<span class="sr-only">' +
              text("推倒多米诺", "Push domino") +
              "</span>",
            'style="--i:' + i + '"',
          ),
        ) +
        "</div>";
      stage.querySelectorAll("button").forEach((node) =>
        node.addEventListener("click", () => {
          const falling = stage.firstElementChild.classList.toggle("falling");
          announce(
            ...(falling
              ? [
                  "多米诺已推倒，再点一次复位",
                  "Dominoes tipped; click to reset",
                ]
              : ["多米诺已复位", "Dominoes reset"]),
          );
        }),
      );
    },
    "pebble-rating"() {
      stage.innerHTML =
        '<div class="pebbles" role="radiogroup" aria-label="' +
        (locale === "zh-CN" ? "评分" : "Rating") +
        '">' +
        repeat(5, (i) =>
          button(
            '<i style="--i:' +
              i +
              '"></i><span class="sr-only">' +
              text(i + 1 + " 分", i + 1 + " stars") +
              "</span>",
            'role="radio" aria-checked="false"',
          ),
        ) +
        "</div>";
      const buttons = [...stage.querySelectorAll("button")];
      const choose = (index) => {
        buttons.forEach((node, i) => {
          node.setAttribute("aria-checked", String(i === index));
          node.toggleAttribute("data-filled", i <= index);
        });
        announce(index + 1 + " / 5 分", index + 1 + " / 5 stars");
      };
      buttons.forEach((node, i) => {
        node.addEventListener("click", () => choose(i));
        node.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const index =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? 4
                : Math.max(
                    0,
                    Math.min(4, i + (event.key === "ArrowRight" ? 1 : -1)),
                  );
          choose(index);
          buttons[index].focus();
        });
      });
    },
    "jelly-pad"() {
      stage.innerHTML = button(
        '<span class="sr-only">' +
          text("按压方块", "Press the pad") +
          "</span>",
        'class="jelly"',
      );
      const node = stage.firstElementChild;
      node.addEventListener("click", () => {
        node.classList.remove("bounce");
        void node.offsetWidth;
        node.classList.add("bounce");
        announce("方块弹跳", "Pad bounced");
      });
    },
    "swipe-confirm"() {
      stage.innerHTML =
        '<div class="swipe"><span class="swipe-label">' +
        text("向右滑动确认", "Slide to confirm") +
        "</span>" +
        button(
          icon("arrow"),
          'aria-label="' +
            (locale === "zh-CN"
              ? "拖动或按回车确认"
              : "Drag or press Enter to confirm") +
            '"',
        ) +
        "</div>";
      const rail = stage.firstElementChild;
      const handle = rail.querySelector("button");
      let start = null;
      let position = 0;
      let confirmed = false;
      let dragged = false;
      const max = () => rail.clientWidth - 58;
      const set = (value) => {
        position = value;
        handle.style.transform = "translateX(" + value + "px)";
      };
      const finish = (value) => {
        confirmed = value;
        set(value ? max() : 0);
        handle.innerHTML = icon(value ? "check" : "arrow");
        label(
          rail.querySelector(".swipe-label span"),
          value ? "已确认" : "向右滑动确认",
          value ? "Confirmed" : "Slide to confirm",
        );
        announce(
          ...(value
            ? ["已确认，点按复位", "Confirmed; click to reset"]
            : ["尚未确认", "Not confirmed"]),
        );
      };
      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || confirmed) return;
        start = event.clientX;
        dragged = false;
        handle.setAttribute("data-dragging", "");
        handle.setPointerCapture(event.pointerId);
      });
      handle.addEventListener("pointermove", (event) => {
        if (start === null) return;
        dragged ||= Math.abs(event.clientX - start) > 4;
        set(Math.max(0, Math.min(max(), event.clientX - start)));
      });
      handle.addEventListener("pointerup", () => {
        if (start === null) return;
        start = null;
        handle.removeAttribute("data-dragging");
        finish(position >= max() * 0.9);
      });
      handle.addEventListener("pointercancel", () => {
        start = null;
        handle.removeAttribute("data-dragging");
        finish(false);
      });
      handle.addEventListener("click", (event) => {
        // Pointer taps do not confirm. Keyboard activation has detail 0.
        if (event.detail === 0) finish(!confirmed);
        else if (confirmed && !dragged) finish(false);
        dragged = false;
      });
      new ResizeObserver(() => {
        if (confirmed) set(max());
      }).observe(rail);
    },
    bookmark() {
      stage.innerHTML = button(
        icon("bookmark"),
        'class="bookmark" aria-pressed="false" aria-label="' +
          (locale === "zh-CN" ? "收藏" : "Bookmark") +
          '"',
      );
      toggle(
        "button",
        "aria-pressed",
        ["已取消收藏", "Bookmark removed"],
        ["已收藏", "Bookmarked"],
      );
    },
    "depth-stack"() {
      stage.innerHTML = button(
        repeat(4, (i) => '<i class="mini-card" style="--i:' + i + '"></i>'),
        'class="depth-stack" aria-pressed="false" aria-label="' +
          (locale === "zh-CN" ? "展开纵深卡堆" : "Expand depth stack") +
          '"',
      );
      toggle(
        "button",
        "aria-pressed",
        ["卡堆已合拢", "Stack collapsed"],
        ["卡堆已展开", "Stack expanded"],
      );
    },
    "menu-morph"() {
      stage.innerHTML =
        button(
          "<span></span><span></span><span></span>",
          'class="menu-morph" aria-expanded="false" aria-controls="morph-menu" aria-label="' +
            (locale === "zh-CN" ? "菜单" : "Menu") +
            '"',
        ) +
        '<div id="morph-menu" hidden>' +
        text("首页 · 项目 · 关于", "Home · Work · About") +
        "</div>";
      const node = toggle(
        "button",
        "aria-expanded",
        ["菜单已关闭", "Menu closed"],
        ["菜单已打开", "Menu open"],
      );
      node.addEventListener("click", () => {
        stage.querySelector("#morph-menu").hidden =
          node.getAttribute("aria-expanded") !== "true";
      });
      node.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          node.getAttribute("aria-expanded") === "true"
        ) {
          event.preventDefault();
          node.click();
        }
      });
    },
    "elastic-string"() {
      stage.innerHTML =
        '<div class="range-control">' +
        svg(
          '<path d="M10 60 Q150 60 290 60"/><circle cx="10" cy="60" r="5"/><circle cx="290" cy="60" r="5"/>',
        ) +
        button(text("拨动弦线", "Pluck the string")) +
        "</div>";
      const line = stage.querySelector("path");
      const pluck = (amount = 65) => {
        if (reduced.matches) return;
        const begin = elapsed;
        const tick = (_, time) => {
          const age = (time - begin) / 1000;
          if (age > 2 || reduced.matches) {
            line.setAttribute("d", "M10 60 Q150 60 290 60");
            ticks.delete(tick);
            return;
          }
          const y = 60 + Math.sin(age * 24) * amount * Math.exp(-age * 3);
          line.setAttribute("d", "M10 60 Q150 " + y + " 290 60");
        };
        ticks.add(tick);
        activity();
      };
      stage.querySelector("button").addEventListener("click", () => {
        pluck();
        announce("弦线已拨动", "String plucked");
      });
      stage.querySelector("svg").addEventListener("pointerdown", (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        pluck((event.clientY - box.y - box.height / 2) * 2);
      });
    },
    "ripple-pad"() {
      stage.innerHTML = button(
        '<span class="sr-only">' +
          text("点按产生涟漪", "Tap for ripples") +
          "</span>",
        'class="ripple-pad"',
      );
      const pad = stage.firstElementChild;
      pad.addEventListener("click", (event) => {
        const box = pad.getBoundingClientRect();
        const x = event.detail ? event.clientX - box.x : box.width / 2;
        const y = event.detail ? event.clientY - box.y : box.height / 2;
        for (let i = 0; i < 4; i++) {
          const ring = document.createElement("i");
          ring.style.cssText =
            "left:" +
            x +
            "px;top:" +
            y +
            "px;animation-delay:" +
            i * 0.14 +
            "s";
          pad.append(ring);
          ring.addEventListener("animationend", () => ring.remove());
        }
        announce("涟漪已展开", "Ripples released");
      });
    },
    "worm-dots"() {
      tabs(
        Array.from(
          { length: 5 },
          (_, i) =>
            '<span class="sr-only">' +
            text("第 " + (i + 1) + " 页", "Page " + (i + 1)) +
            "</span>",
        ),
        "worm",
      );
    },
    "download-ring"() {
      stage.innerHTML =
        button(
          svg(
            '<circle cx="38" cy="38" r="33"/><circle class="progress" cx="38" cy="38" r="33"/>',
            "0 0 76 76",
          ) +
            "<output>" +
            text("下载", "Get") +
            "</output>",
          'class="download" aria-label="' +
            (locale === "zh-CN" ? "开始下载演示" : "Start download demo") +
            '"',
        ) +
        '<span class="sr-only" role="progressbar" aria-label="' +
        (locale === "zh-CN" ? "下载进度" : "Download progress") +
        '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></span>';
      const node = stage.querySelector("button");
      const progress = stage.querySelector('[role="progressbar"]');
      let value = 0;
      let running = false;
      node.addEventListener("click", () => {
        if (running) return;
        value = 0;
        running = true;
        ticks.add(tick);
        activity();
        announce("下载进度演示已开始", "Download progress demo started");
      });
      const tick = (delta) => {
        value = Math.min(100, value + (reduced.matches ? 100 : delta / 28));
        node.style.setProperty("--progress", String(value));
        progress.setAttribute("aria-valuenow", String(Math.round(value)));
        node.querySelector("output").textContent = Math.round(value) + "%";
        if (value === 100) {
          running = false;
          ticks.delete(tick);
          const blob = new Blob(["Atlas UI Moments download demo\n"], {
            type: "text/plain",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "atlas-demo.txt";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          announce(
            "演示文件已生成，可再次点击下载",
            "Demo file generated; click to download again",
          );
        }
      };
    },
    "leaf-tabs"() {
      tabs(["D", "W", "M", "Y"], "leaf-tabs", (index) => {
        stage
          .querySelectorAll(".chart i")
          .forEach((bar, i) =>
            bar.style.setProperty(
              "--v",
              String(15 + ((i * 11 + index * 23) % 65)),
            ),
          );
      });
      const group = stage.firstElementChild;
      group.querySelectorAll("button").forEach((node, i) => {
        const en = ["Daily", "Weekly", "Monthly", "Yearly"][i];
        const zh = ["每日", "每周", "每月", "每年"][i];
        node.setAttribute("aria-label", locale === "zh-CN" ? zh : en);
      });
      const wrapper = document.createElement("div");
      wrapper.className = "leaf-demo";
      group.replaceWith(wrapper);
      wrapper.append(group);
      wrapper.insertAdjacentHTML(
        "beforeend",
        '<div class="chart" aria-hidden="true">' +
          repeat(7, (i) => '<i style="--v:' + (15 + i * 10) + '"></i>') +
          "</div>",
      );
    },
    "bell-toggle"() {
      stage.innerHTML = button(
        icon("bell") + '<span class="badge">3</span>',
        'class="bell" aria-pressed="false" aria-label="' +
          (locale === "zh-CN" ? "通知" : "Notifications") +
          '"',
      );
      toggle(
        "button",
        "aria-pressed",
        ["通知已关闭", "Notifications off"],
        ["通知已开启", "Notifications on"],
      );
    },
    "ink-switch"() {
      switchDemo("ink");
    },
    "rocker-switch"() {
      stage.innerHTML = button(
        '<span class="rocker-inner"><span>I</span><span>O</span></span>',
        'class="rocker" role="switch" aria-checked="false" aria-label="' +
          (locale === "zh-CN" ? "电源开关" : "Power switch") +
          '"',
      );
      toggle(
        "button",
        "aria-checked",
        ["电源已关闭", "Power off"],
        ["电源已开启", "Power on"],
      );
    },
    "scrub-wave"() {
      stage.innerHTML =
        '<div class="scrub">' +
        button(
          "▶",
          'aria-pressed="false" aria-label="' +
            (locale === "zh-CN" ? "播放波形演示" : "Play waveform demo") +
            '"',
        ) +
        '<label class="waveform">' +
        repeat(
          36,
          (i) =>
            '<i style="--v:' +
            (12 + Math.round((Math.sin(i * 0.7) + 1) * 23)) +
            '"></i>',
        ) +
        '<span class="sr-only">' +
        text("波形进度", "Waveform progress") +
        '</span><input type="range" min="0" max="100" value="0"></label></div>';
      const play = stage.querySelector("button");
      const range = stage.querySelector("input");
      const draw = () => {
        stage
          .querySelectorAll(".waveform i")
          .forEach((bar, i) =>
            bar.toggleAttribute("data-played", i <= Number(range.value) * 0.35),
          );
      };
      play.addEventListener("click", () => {
        const on = play.getAttribute("aria-pressed") !== "true";
        play.setAttribute("aria-pressed", String(on));
        play.textContent = on ? "Ⅱ" : "▶";
        if (on && !reduced.matches) ticks.add(tick);
        else ticks.delete(tick);
        activity();
        announce(
          ...(on
            ? ["波形进度演示播放中", "Waveform progress demo playing"]
            : ["演示已暂停", "Demo paused"]),
        );
      });
      let progress = 0;
      range.addEventListener("input", () => {
        progress = Number(range.value);
        draw();
      });
      const tick = (delta) => {
        if (reduced.matches) {
          ticks.delete(tick);
          return;
        }
        progress = (progress + delta / 140) % 100;
        range.value = String(progress);
        draw();
      };
    },
    "squash-play"() {
      stage.innerHTML = button(
        "▶",
        'class="squash" aria-pressed="false" aria-label="' +
          (locale === "zh-CN" ? "播放" : "Play") +
          '"',
      );
      const node = toggle(
        "button",
        "aria-pressed",
        ["已暂停", "Paused"],
        ["播放中", "Playing"],
      );
      node.addEventListener("click", () => {
        node.textContent =
          node.getAttribute("aria-pressed") === "true" ? "Ⅱ" : "▶";
      });
    },
    "rubber-search"() {
      stage.innerHTML =
        '<form class="rubber-search"><input type="search" hidden aria-label="' +
        (locale === "zh-CN" ? "搜索内容" : "Search text") +
        '">' +
        button(
          icon("search"),
          'aria-expanded="false" aria-label="' +
            (locale === "zh-CN" ? "展开搜索" : "Expand search") +
            '"',
        ) +
        "</form>";
      const form = stage.querySelector("form");
      const input = form.querySelector("input");
      const trigger = form.querySelector("button");
      const close = () => {
        form.removeAttribute("data-open");
        input.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      };
      trigger.addEventListener("click", () => {
        if (form.hasAttribute("data-open")) {
          close();
          return;
        }
        form.setAttribute("data-open", "");
        input.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        input.focus();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        announce(
          input.value ? "当前搜索词：" + input.value : "请输入搜索词",
          input.value ? "Search term: " + input.value : "Enter a search term",
        );
      });
    },
    odometer() {
      stage.innerHTML =
        '<div class="stepper">' +
        button(
          "−",
          'data-step="-1" aria-label="' +
            (locale === "zh-CN" ? "减少" : "Decrease") +
            '"',
        ) +
        '<output aria-live="polite">20</output>' +
        button(
          "+",
          'data-step="1" aria-label="' +
            (locale === "zh-CN" ? "增加" : "Increase") +
            '"',
        ) +
        "</div>";
      const output = stage.querySelector("output");
      stage.querySelectorAll("button").forEach((node) =>
        node.addEventListener("click", () => {
          output.value = String(
            Math.max(
              0,
              Math.min(99, Number(output.value) + Number(node.dataset.step)),
            ),
          );
          output.classList.remove("tick");
          void output.offsetWidth;
          output.classList.add("tick");
        }),
      );
    },
    "tide-progress"() {
      const range = rangeDemo(
        '<span class="tide" style="--progress:35"><output>35%</output></span>',
        "进度",
        "Progress",
        35,
      );
      range.addEventListener("input", () => {
        stage
          .querySelector(".tide")
          .style.setProperty("--progress", range.value);
        stage.querySelector("output").value = range.value + "%";
      });
    },
    "eclipse-half"() {
      stage.innerHTML =
        '<div class="eclipse" role="img" aria-label="Loading"></div>';
    },
    "magnet-grid"() {
      stage.innerHTML =
        '<div class="magnet" tabindex="0" role="img" aria-label="' +
        (locale === "zh-CN"
          ? "磁吸点阵：移动指针或使用方向键"
          : "Magnetic grid: move the pointer or use arrow keys") +
        '">' +
        repeat(36, () => "<i></i>") +
        "</div>";
      const grid = stage.firstElementChild;
      const points = [...grid.children];
      const move = (x, y) => {
        points.forEach((point, i) => {
          const px = (i % 6) * (200 / 6) + 16;
          const py = Math.floor(i / 6) * (160 / 6) + 13;
          const distance = Math.hypot(x - px, y - py);
          const weight = Math.max(0, 1 - distance / 105) * 0.7;
          point.style.transform =
            "translate(" +
            (x - px) * weight +
            "px," +
            (y - py) * weight +
            "px) scale(" +
            (1 + weight * 2) +
            ")";
        });
      };
      grid.addEventListener("pointermove", (event) => {
        const box = grid.getBoundingClientRect();
        move(event.clientX - box.x, event.clientY - box.y);
      });
      grid.addEventListener("pointerleave", () =>
        points.forEach((point) => {
          point.style.transform = "";
        }),
      );
      let x = 100,
        y = 80;
      grid.addEventListener("keydown", (event) => {
        if (
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
            event.key,
          )
        )
          return;
        event.preventDefault();
        x = Math.max(
          0,
          Math.min(
            200,
            x +
              (event.key === "ArrowRight"
                ? 20
                : event.key === "ArrowLeft"
                  ? -20
                  : 0),
          ),
        );
        y = Math.max(
          0,
          Math.min(
            160,
            y +
              (event.key === "ArrowDown"
                ? 20
                : event.key === "ArrowUp"
                  ? -20
                  : 0),
          ),
        );
        move(x, y);
      });
    },
    checklist() {
      stage.innerHTML =
        '<div class="checklist">' +
        [
          ["收集需求", "Gather requirements"],
          ["绘制线框图", "Sketch wireframes"],
          ["完成交付", "Write the handoff"],
        ]
          .map(
            ([zh, en]) =>
              '<label><input type="checkbox">' + text(zh, en) + "</label>",
          )
          .join("") +
        "</div>";
      stage.querySelectorAll("input").forEach((input) =>
        input.addEventListener("change", () => {
          const count = stage.querySelectorAll(":checked").length;
          announce(
            "已完成 " + count + " / 3 项",
            count + " / 3 tasks complete",
          );
        }),
      );
    },
    "flip-coin"() {
      stage.innerHTML = button(
        "H",
        'class="coin" aria-label="' +
          (locale === "zh-CN" ? "翻转硬币" : "Flip coin") +
          '"',
      );
      const node = stage.firstElementChild;
      let heads = true;
      node.addEventListener("click", () => {
        if (node.disabled) return;
        node.disabled = true;
        node.classList.add("flipping");
        motion(() => {
          heads = !heads;
          node.textContent = heads ? "H" : "T";
          node.disabled = false;
          node.classList.remove("flipping");
          announce(...(heads ? ["正面", "Heads"] : ["反面", "Tails"]));
        }, 800);
      });
    },
    "radial-menu"() {
      const names = ["home", "heart", "bookmark", "user", "search"];
      stage.innerHTML =
        '<div class="radial">' +
        names
          .map((name, i) => {
            const angle = ((i * 72 - 90) * Math.PI) / 180;
            return button(
              icon(name) +
                '<span class="sr-only">' +
                text(["首页", "喜欢", "收藏", "账户", "搜索"][i], name) +
                "</span>",
              'data-option hidden style="--x:' +
                Math.cos(angle) * 75 +
                ";--y:" +
                Math.sin(angle) * 75 +
                '"',
            );
          })
          .join("") +
        button(
          "+",
          'data-toggle aria-expanded="false" aria-label="' +
            (locale === "zh-CN" ? "展开快捷菜单" : "Open quick menu") +
            '"',
        ) +
        "</div>";
      const group = stage.firstElementChild;
      const trigger = group.querySelector("[data-toggle]");
      const setOpen = (open) => {
        if (open) {
          group.querySelectorAll("[data-option]").forEach((node) => {
            node.hidden = false;
          });
          void group.offsetWidth;
        }
        group.toggleAttribute("data-open", open);
        trigger.setAttribute("aria-expanded", String(open));
        trigger.textContent = open ? "×" : "+";
        group.querySelectorAll("[data-option]").forEach((node) => {
          node.hidden = !open;
        });
      };
      trigger.addEventListener("click", () =>
        setOpen(!group.hasAttribute("data-open")),
      );
      group.querySelectorAll("[data-option]").forEach((node, i) =>
        node.addEventListener("click", () => {
          announce(
            "已选择第 " + (i + 1) + " 项",
            "Option " + (i + 1) + " selected",
          );
          setOpen(false);
          trigger.focus();
        }),
      );
      group.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && group.hasAttribute("data-open")) {
          event.preventDefault();
          setOpen(false);
          trigger.focus();
        }
      });
    },
    "dot-revolve"() {
      stage.innerHTML =
        '<div class="dot-revolve" role="img" aria-label="Loading"></div>';
    },
  };
  try {
    root.toggleAttribute(
      "data-compact",
      params.has("inline") || params.has("thumb"),
    );
    demos[demo]();
    update();
    const pause = document.querySelector("#pause");
    pause.addEventListener("click", () => {
      paused = !paused;
      pause.setAttribute("aria-pressed", String(paused));
      label(
        pause,
        paused ? "继续动效" : "暂停动效",
        paused ? "Resume motion" : "Pause motion",
      );
      activity();
    });
    document.addEventListener("visibilitychange", activity);
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      activity();
    }).observe(stage);
    activity();
    send("atlas:inline-ready");
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
      } else if (data?.type === "atlas:replay") location.reload();
    });
    window.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !params.has("inline")
      )
        send("atlas:escape");
    });
  } catch (error) {
    send("atlas:inline-error");
    throw error;
  }
})();

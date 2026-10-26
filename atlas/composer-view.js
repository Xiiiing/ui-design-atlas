// @ts-check
import { guidance, findGuidance } from "../guidance-catalog.js";
import { resources, findResource } from "../catalog.js";
import { loadGuidanceDetail } from "./guidance-data.js";
import { loadResourceDetails } from "./resource-data.js";
import { readDraft, draftKey, composePrompt } from "./composer-model.js";
import { escapeHTML as esc } from "./html.js";
import { isComposing } from "./input.js";
import { replaceShellHTML } from "../shell/controls.tsx";
/** In-memory fallback also preserves drafts when browser storage is unavailable. */
let memory = "";
/** @param {import('./types').BaseDependencies & {root:HTMLElement;signal:AbortSignal;copy:(text:string)=>Promise<void>;download:(text:string,name:string)=>void;notify:(text:string)=>void}} deps */
export function createComposer({
  appState,
  t,
  l,
  href,
  root,
  signal,
  copy,
  download,
  notify,
}) {
  let stored = "";
  try {
    stored = localStorage.getItem(draftKey) || "";
  } catch {}
  const draft = readDraft(memory || stored);
  let revision = 0,
    serial = 0;
  /** @type {HTMLFormElement|null} */ let form = null;
  const incoming = appState.route.params;
  for (const [param, field, kind] of /** @type {const} */ ([
    ["template", "template", "prompt"],
    ["design", "design", "design"],
  ])) {
    const value = incoming.get(param);
    if (value && findGuidance(value)?.kind === kind) draft[field] = value;
  }
  for (const [param, field, kind] of /** @type {const} */ ([
    ["check", "checks", "checklist"],
    ["skill", "skills", "skill"],
  ])) {
    const value = incoming.get(param);
    if (
      value &&
      findGuidance(value)?.kind === kind &&
      !draft[field].includes(value)
    )
      draft[field].push(value);
  }
  const ref = incoming.get("reference");
  if (ref) {
    const [type, id, ...rest] = ref.split(":");
    if (!rest.length && findResource(id, type)) draft.reference = ref;
  }
  // Selection handoffs are consumed once; private requirements never enter URL.
  if (
    ["template", "design", "check", "skill", "reference"].some((key) =>
      incoming.has(key),
    )
  ) {
    history.replaceState(history.state, "", href("compose"));
    appState.route.params = new URLSearchParams({ lang: appState.locale });
  }
  /** @param {string} name @param {string} label @param {string} value @param {boolean} [textarea] */
  const field = (name, label, value, textarea = false) =>
    `<label class="composer-field">${label}${textarea ? `<textarea name="${name}" rows="5" ${name === "requirements" ? "required" : ""}>${esc(value)}</textarea>` : `<input name="${name}" value="${esc(value)}">`}</label>`;
  /** @param {string} name @param {string} label @param {import('./guidance-types').Guidance[]} items @param {string} selected @param {boolean} [optional] */
  const choice = (name, label, items, selected, optional = false) =>
    `<label class="composer-field">${label}<select name="${name}">${optional ? `<option value="">${t("不选择", "None")}</option>` : ""}${items.map((item) => `<option value="${item.id}" ${item.id === selected ? "selected" : ""}>${esc(l(item.name))}</option>`).join("")}</select></label>`;
  /** @param {'checks'|'skills'} name @param {string} label @param {'checklist'|'skill'} kind */
  const checkboxes = (name, label, kind) =>
    `<fieldset class="composer-options"><legend>${label}</legend>${guidance
      .filter((g) => g.kind === kind)
      .map(
        (g) =>
          `<label><input type="checkbox" name="${name}" value="${g.id}" ${draft[name].includes(g.id) ? "checked" : ""}>${esc(l(g.name))}</label>`,
      )
      .join("")}</fieldset>`;
  function save() {
    memory = JSON.stringify(draft);
    const status = root.querySelector("[data-draft-status]");
    try {
      localStorage.setItem(draftKey, memory);
      if (status)
        status.textContent = t(
          "草稿已保存在当前浏览器",
          "Draft saved in this browser",
        );
    } catch {
      if (status)
        status.textContent = t(
          "草稿未保存到浏览器，仍可编辑、复制和导出。",
          "Draft was not saved to browser storage. Editing, copying and export remain available.",
        );
    }
  }
  function collect() {
    if (!form) return;
    const data = new FormData(form);
    for (const key of /** @type {const} */ ([
      "requirements",
      "audience",
      "technology",
      "direction",
      "template",
      "design",
      "reference",
      "output",
    ]))
      draft[key] = String(data.get(key) || "");
    draft.mode = data.get("mode") === "agent" ? "agent" : "chat";
    draft.checks = data.getAll("checks").map(String);
    draft.skills = data.getAll("skills").map(String);
    revision++;
    save();
    const hasOutput = !!draft.output.trim();
    for (const b of root.querySelectorAll(
      "[data-copy-composed],[data-download-composed]",
    ))
      if (b instanceof HTMLButtonElement) b.disabled = !hasOutput;
    const generate = root.querySelector("[data-generate-prompt]");
    if (generate) {
      const label = hasOutput
        ? t("重新生成（替换当前文本）", "Regenerate (replace current text)")
        : t("生成提示词", "Generate prompt");
      if (generate.textContent !== label) generate.textContent = label;
    }
  }
  let renderedFiles = "";
  function agentFiles() {
    const signature = JSON.stringify([draft.mode, draft.skills]);
    if (signature === renderedFiles) return;
    renderedFiles = signature;
    const area = root.querySelector("[data-agent-files]");
    if (!(area instanceof HTMLElement)) return;
    area.hidden = draft.mode !== "agent" || !draft.skills.length;
    area.innerHTML =
      `<h3>${t("编程助手文件", "Coding assistant files")}</h3><p>${t("解压后明确读取入口文件，并保留配套文档。下载不会安装或执行 Skill。", "Extract and explicitly read the entry, retaining supporting files. Downloading does not install or execute a skill.")}</p>` +
      draft.skills
        .map((id) => {
          const g = findGuidance(id);
          return g?.kind === "skill"
            ? `<div class="composer-skill-files"><strong>${esc(l(g.name))}</strong><button type="button" class="button" data-copy-skill="${id}">${t("复制原始 Skill", "Copy original skill")}</button><a class="button" href="./downloads/guidance/${id}.zip" download>${t("下载完整文件包", "Download bundle")}</a><a class="text-link" href="${href("guidance", id)}">${t("阅读文件与说明", "Read files & instructions")}</a></div>`
            : "";
        })
        .join("");
  }
  async function generate() {
    if (!form || isComposing({ target: document.activeElement })) return;
    collect();
    if (!draft.requirements.trim()) {
      notify(t("请先填写项目需求。", "Enter project requirements first."));
      form.querySelector("textarea")?.focus();
      return;
    }
    const initial = revision,
      current = ++serial,
      version = structuredClone(draft),
      locale = appState.locale;
    const status = root.querySelector("[data-compose-status]"),
      button = root.querySelector("[data-generate-prompt]");
    if (status) status.textContent = t("正在组合内容…", "Combining content…");
    if (button instanceof HTMLButtonElement) button.disabled = true;
    try {
      const ids = [
        ...new Set(
          [
            version.template,
            version.design,
            ...version.checks,
            ...version.skills,
          ].filter(Boolean),
        ),
      ];
      /** @type {Record<string,import('./guidance-types').GuidanceDetail>} */ const details =
        {};
      await Promise.all(
        ids.map(async (id) => {
          details[id] = await loadGuidanceDetail(id);
        }),
      );
      const [type, id] = version.reference.split(":");
      const r = version.reference ? findResource(id, type) : undefined;
      const reference = r ? await loadResourceDetails(r) : undefined;
      if (signal.aborted || current !== serial) return;
      if (initial !== revision) {
        if (status)
          status.textContent = t(
            "内容已变化，请重新生成；现有文本已保留。",
            "Inputs changed. Generate again; the existing text was retained.",
          );
        return;
      }
      draft.output = composePrompt(version, locale, details, reference);
      const output = form.elements.namedItem("output");
      if (output instanceof HTMLTextAreaElement) output.value = draft.output;
      collect();
      if (status)
        status.textContent = t(
          "已生成。可以直接编辑下方文本；生成效果尚未验证。",
          "Generated. Edit the text below as needed. Generation outcomes are unverified.",
        );
    } catch {
      if (!signal.aborted && current === serial && status)
        status.textContent = t(
          "读取内容失败，点击生成可重试。现有文本已保留。",
          "Content could not be loaded. Generate again to retry. Existing text was retained.",
        );
    } finally {
      if (
        !signal.aborted &&
        current === serial &&
        button instanceof HTMLButtonElement
      )
        button.disabled = false;
    }
  }
  async function mount() {
    replaceShellHTML(
      root,
      `<section class="guidance-intro"><div><span class="guidance-eyebrow">ATLAS / COMPOSE</span><h1>${t("把参考变成清晰的项目要求", "Turn references into a clear project brief")}</h1><p>${t("选择方法和参考，生成后继续编辑，再带到你使用的 AI 工具。", "Choose methods and references, edit the assembled brief, then take it to your AI tool.")}</p></div><a class="text-link" href="${href("guidance")}">${t("浏览设计指导", "Browse guidance")} ↗</a></section><form id="prompt-composer" class="composer-layout"><section class="composer-inputs">${field("requirements", t("项目需求（必填）", "Project requirements (required)"), draft.requirements, true)}<div class="composer-field-pair">${field("audience", t("目标用户", "Audience"), draft.audience)}${field("technology", t("技术约束", "Technology constraints"), draft.technology)}</div>${field("direction", t("视觉方向", "Visual direction"), draft.direction)}${choice(
        "template",
        t("基础模板", "Base template"),
        guidance.filter((g) => g.kind === "prompt"),
        draft.template,
      )}${choice(
        "design",
        t("设计规范（最多一份）", "Design specification (one maximum)"),
        guidance.filter((g) => g.kind === "design"),
        draft.design,
        true,
      )}<label class="composer-field">${t("界面参考（最多一个）", "Interface reference (one maximum)")}<select name="reference"><option value="">${t("不选择", "None")}</option>${resources.map((r) => `<option value="${r.type}:${r.id}" ${draft.reference === r.type + ":" + r.id ? "selected" : ""}>${esc(l(r.name))} · ${r.type}</option>`).join("")}</select></label><p class="composer-hint">${t("选择规范时，以规范决定视觉；界面只提供结构与交互参考。", "With a specification selected, it determines visuals; the interface informs structure and interaction.")}</p>${checkboxes("checks", t("交付检查", "Delivery checks"), "checklist")}${checkboxes("skills", t("相关方法与 Skills", "Methods & skills"), "skill")}<label class="composer-field">${t("使用环境", "Usage environment")}<select name="mode"><option value="chat" ${draft.mode === "chat" ? "selected" : ""}>${t("普通对话", "Ordinary chat")}</option><option value="agent" ${draft.mode === "agent" ? "selected" : ""}>${t("编程助手", "Coding assistant")}</option></select></label><button type="submit" class="button primary" data-generate-prompt>${draft.output ? t("重新生成（替换当前文本）", "Regenerate (replace current text)") : t("生成提示词", "Generate prompt")}</button><p data-draft-status role="status"></p></section><section class="composer-output"><div class="composer-output-heading"><h2>${t("完整提示词", "Complete prompt")}</h2><div class="button-row"><button class="button" type="button" data-copy-composed ${draft.output ? "" : "disabled"}>${t("复制", "Copy")}</button><button class="button" type="button" data-download-composed ${draft.output ? "" : "disabled"}>${t("导出 Markdown", "Export Markdown")}</button></div></div><p class="composer-hint">${t("输入和选项变化不会覆盖下方文本；仅点击重新生成时替换。", "Changing inputs or options does not replace the text below. Only Regenerate replaces it.")}</p><textarea name="output" aria-label="${t("完整提示词", "Complete prompt")}" spellcheck="false">${esc(draft.output)}</textarea><p data-compose-status role="status"></p><div data-agent-files></div></section></form>`,
    );
    form = root.querySelector("#prompt-composer");
    save();
    agentFiles();
    root.addEventListener(
      "input",
      (e) => {
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        )
          return;
        if (!e.target.closest("#prompt-composer")) return;
        collect();
        if (e.target.name !== "output" && draft.output) {
          const status = root.querySelector("[data-compose-status]");
          if (status)
            status.textContent = t(
              "输入已更新，现有文本已保留；需要时点击重新生成。",
              "Inputs updated. Existing text retained; regenerate when ready.",
            );
        }
      },
      { signal },
    );
    root.addEventListener(
      "change",
      (e) => {
        if (
          e.target instanceof HTMLElement &&
          e.target.closest("#prompt-composer")
        ) {
          collect();
          agentFiles();
        }
      },
      { signal },
    );
    root.addEventListener(
      "submit",
      (e) => {
        if (e.target === form) {
          e.preventDefault();
          void generate();
        }
      },
      { signal },
    );
    root.addEventListener(
      "keydown",
      (e) => {
        if (isComposing(e) && e.key === "Enter") e.preventDefault();
      },
      { signal },
    );
    root.addEventListener(
      "click",
      async (e) => {
        if (!(e.target instanceof Element)) return;
        if (e.target.closest("[data-copy-composed]")) return copy(draft.output);
        if (e.target.closest("[data-download-composed]"))
          return download(draft.output, "atlas-prompt.md");
        const b = e.target.closest("[data-copy-skill]");
        if (b instanceof HTMLElement && b.dataset.copySkill) {
          try {
            const d = await loadGuidanceDetail(b.dataset.copySkill);
            if (!signal.aborted && d.entry) await copy(d.files[d.entry]);
          } catch {
            if (!signal.aborted)
              notify(
                t("读取失败，请重试。", "Could not load the file. Retry."),
              );
          }
        }
      },
      { signal },
    );
  }
  return {
    mount,
    dispose: () => {
      serial++;
      if (form) collect();
    },
  };
}

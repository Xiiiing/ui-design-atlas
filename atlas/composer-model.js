// @ts-check
import { findGuidance } from "../guidance-catalog.js";
import { findResource } from "../catalog.js";
export const draftKey = "atlas-prompt-draft-v1";
/** @returns {import('./guidance-types').ComposerDraft} */
export const emptyDraft = () => ({
  version: 1,
  requirements: "",
  audience: "",
  technology: "",
  direction: "",
  template: "marketing-website",
  design: "",
  reference: "",
  checks: [],
  skills: [],
  mode: "chat",
  output: "",
});
/** @param {string|null} text */
export function readDraft(text) {
  const d = emptyDraft();
  try {
    const value = JSON.parse(text || "null");
    if (!value || value.version !== 1) return d;
    for (const key of /** @type {const} */ ([
      "requirements",
      "audience",
      "technology",
      "direction",
      "output",
    ]))
      if (typeof value[key] === "string") d[key] = value[key];
    if (findGuidance(value.template)?.kind === "prompt")
      d.template = value.template;
    if (findGuidance(value.design)?.kind === "design") d.design = value.design;
    if (typeof value.reference === "string") {
      const [type, id, ...extra] = value.reference.split(":");
      if (!extra.length && findResource(id, type))
        d.reference = value.reference;
    }
    for (const key of /** @type {const} */ (["checks", "skills"]))
      if (Array.isArray(value[key]))
        d[key] = [
          ...new Set(
            /** @type {string[]} */ (
              value[key].filter(
                (/** @type {unknown} */ id) =>
                  typeof id === "string" &&
                  findGuidance(id)?.kind ===
                    (key === "checks" ? "checklist" : "skill"),
              )
            ),
          ),
        ];
    d.mode = value.mode === "agent" ? "agent" : "chat";
  } catch {}
  return d;
}
/** @param {string} text @param {Record<string,string>} values */
export function fillTemplate(text, values) {
  return text.replace(
    /\{\{(requirements|audience|technology|direction)\}\}/g,
    (_match, key) => values[key] || "",
  );
}
/** @param {import('./guidance-types').ComposerDraft} draft @param {import('./types').Locale} locale @param {Record<string,import('./guidance-types').GuidanceDetail>} details @param {import('./types').Resource|undefined} reference */
export function composePrompt(draft, locale, details, reference) {
  if (!draft.requirements.trim()) throw Error("requirements");
  const en = locale === "en",
    t = (/** @type {string} */ zh, /** @type {string} */ english) =>
      en ? english : zh;
  /** @type {string[]} */ const sections = [];
  const fields = [
    draft.requirements.trim(),
    draft.audience.trim() &&
      t("目标用户：", "Audience: ") + draft.audience.trim(),
    draft.technology.trim() &&
      t("技术约束：", "Technology: ") + draft.technology.trim(),
    draft.direction.trim() &&
      t("视觉方向：", "Visual direction: ") + draft.direction.trim(),
  ].filter(Boolean);
  sections.push(
    "## " +
      t("需求与约束", "Requirements & constraints") +
      "\n" +
      fields.join("\n") +
      "\n\n" +
      t(
        "用户明确约束优先于以下参考。未指定技术时沿用项目既有技术。",
        "Explicit user constraints take precedence over the references below. Keep the existing technology unless specified.",
      ),
  );
  const design = findGuidance(draft.design);
  if (design) {
    const d = details[design.id];
    if (!d) throw Error("Missing design");
    sections.push(
      "## " +
        t("设计规范", "Design specification") +
        "\n" +
        design.name[locale] +
        "\n" +
        d.task[locale] +
        (design.kind === "design"
          ? "\n" +
            t("参考色板：", "Reference palette: ") +
            design.palette.join(", ") +
            "\n" +
            design.typography[locale]
          : "") +
        "\n" +
        t(
          "第三方设计分析，非品牌官方规范。",
          "Third-party design analysis, not an official brand specification.",
        ),
    );
  }
  if (draft.reference) {
    if (!reference?.stylePrompt) throw Error("Missing reference");
    const text = design
      ? t(
          "以该界面的信息组织、布局关系和交互作为参考；色彩与字体服从上面的设计规范。",
          "Use this interface for information organization, layout relationships and interaction; color and typography follow the specification above.",
        ) +
        "\n" +
        reference.description[locale]
      : reference.stylePrompt[locale];
    sections.push(
      "## " +
        t("界面参考", "Interface reference") +
        "\n" +
        reference.name[locale] +
        "\n" +
        text +
        "\n" +
        t("图鉴资源：", "Atlas resource: ") +
        draft.reference,
    );
  }
  const task = details[draft.template];
  if (!task) throw Error("Missing template");
  sections.push(
    "## " + t("任务要求", "Task requirements") + "\n" + task.task[locale],
  );
  for (const id of draft.skills) {
    const g = findGuidance(id),
      d = details[id];
    if (!g || g.kind !== "skill" || !d?.source) throw Error("Missing skill");
    sections.push(
      "### " +
        g.name[locale] +
        "\n" +
        d.task[locale] +
        "\n" +
        `https://github.com/${d.source.repo}/tree/${d.source.commit}` +
        (draft.mode === "agent"
          ? "\n" +
            t(
              `编程助手：解压 ${id}.zip，明确读取 ${id}/${d.entry}，保留同目录配套文件；结合项目约束使用。`,
              `Coding assistant: extract ${id}.zip, explicitly read ${id}/${d.entry} and keep supporting files beside it. Apply it within the project constraints.`,
            )
          : "\n" +
            t(
              "以上为本站整理的任务要点，不代表此对话已安装或执行 Skill。",
              "These are Atlas task notes; the skill is not installed or executed by this chat.",
            )),
    );
  }
  const checks = draft.checks.flatMap((id) => {
    const d = details[id];
    if (!d?.checks) throw Error("Missing checklist");
    return d.checks[locale];
  });
  sections.push(
    "## " +
      t("交付自检", "Delivery checks") +
      "\n" +
      [
        ...new Set([
          ...checks,
          t(
            "报告实际完成的检查、主要修复和未验证项；不能仅凭自评宣称达到获奖级品质。",
            "Report actual checks, key fixes and unverified work; self-assessment alone does not establish award-level quality.",
          ),
        ]),
      ]
        .map((x) => "- " + x)
        .join("\n"),
  );
  return sections.join("\n\n");
}

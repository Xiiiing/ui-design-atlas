// @ts-check

/** @type {Record<string, [string, string]>} */
export const componentPurposes = {
  input: ["输入操作", "Input"],
  navigation: ["导航布局", "Navigation"],
  content: ["内容展示", "Content"],
  feedback: ["状态反馈", "Feedback"],
  effects: ["视觉效果", "Effects"],
};

/** @type {Record<string, [string, string]>} */
export const designScopes = {
  page: ["页面", "Pages"],
  case: ["完整案例", "Systems"],
};

const fullPageBlocks = new Set([
  "shadcn-login-01",
  "shadcn-signup-01",
  "shadcn-dashboard-01",
]);

/** @param {import("./types").Resource} resource */
export function designScope(resource) {
  if (resource.type === "case") return "case";
  if (resource.type === "page" || fullPageBlocks.has(resource.id))
    return "page";
  return "";
}

/** @type {Record<string, string>} */
const purposesByCategory = {
  buttons: "input",
  forms: "input",
  search: "input",
  auth: "input",
  files: "input",
  settings: "input",
  navigation: "navigation",
  layout: "navigation",
  cards: "content",
  data: "content",
  commerce: "content",
  portfolio: "content",
  feedback: "feedback",
  loading: "feedback",
  backgrounds: "effects",
  text: "effects",
};

/** Where a demo's original category describes its sample rather than its purpose. */
const purposeExceptions = {
  "magicui-bento-grid": "content",
  "magicui-border-beam": "effects",
  "magicui-magic-card": "effects",
  "magicui-shine-border": "effects",
  "effect-atlas-crosshair-image-reveal": "effects",
  "effect-atlas-shared-element-transition": "effects",
  "fluent-dialog": "input",
  "shadcn-admin-task-drawer": "input",
  "shadcn-admin-user-dialog": "input",
  "folio-dialog": "input",
  "orbit-dialog": "input",
  "forma-dialog": "input",
  "bloom-dialog": "input",
  "bencho-context-meter": "feedback",
  "ui-moments-tide-progress": "feedback",
  "ui-moments-scrub-wave": "input",
  "ui-moments-domino-row": "effects",
  "ui-moments-jelly-pad": "effects",
  "ui-moments-flip-coin": "effects",
  "ui-moments-depth-stack": "effects",
  "ui-moments-card-fan": "effects",
  "ui-moments-elastic-string": "effects",
  "ui-moments-ripple-pad": "effects",
};

/** @param {import("./types").Resource} resource */
export function componentPurpose(resource) {
  if (designScope(resource)) return "";
  return (
    /** @type {Record<string, string>} */ (purposeExceptions)[resource.id] ||
    purposesByCategory[resource.category]
  );
}

/** @type {Record<string, [string, string]>} */
export const promptTasks = {
  generate: ["生成界面", "Generate"],
  improve: ["优化界面", "Improve"],
  reuse: ["风格复用", "Reuse a style"],
};

/** @param {string} id */
export function promptTask(id) {
  if (id === "visual-quality") return "improve";
  if (id === "interface-reuse") return "reuse";
  return "generate";
}

/** @param {string} view */
export const isGallery = (view) => view === "library" || view === "designs";

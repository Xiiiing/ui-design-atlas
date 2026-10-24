import { createSearchIndex, rankSearch } from "./search.js";
import discoveryContent from "./content/discovery.json" with { type: "json" };
import {
  marketResources,
  marketSources,
  marketLibraries,
} from "./market-catalog.js";
import {
  styles as originals,
  kinds as originalKinds,
  components as originalComponents,
} from "./data.js";
export const localized = (zh, en) => ({ "zh-CN": zh, en });
const bi = localized;
export const upstream = {
  name: "Shadcn Admin",
  author: "Sat Naing",
  repo: "https://github.com/satnaing/shadcn-admin",
  commit: "e16c87f213a5ba5e45964e9b67c792105ec74d26",
  license: "MIT",
  licenseFile: "./examples/shadcn-admin/LICENSE",
};
const legacyEnglish = {
  folio: {
    subtitle: "Editorial portfolio",
    description:
      "A portfolio for independent designers, researchers and makers. Warm paper, serif headlines and an asymmetric grid give both the work and its story room to breathe.",
    principle:
      "Use editorial typography to express an individual voice. Serif headlines, quiet rules, numbered projects and generous space establish a reading rhythm.",
    style: "Editorial",
    scene: "Portfolio",
    rules: [
      "Maximum content width 1120px; 12 columns on desktop and one column on mobile.",
      "Headlines 64–88px, body 16px at 1.7 line height; mobile headlines 40px.",
      "4px corners, fine dividers, solid dark primary actions and text links.",
      "Preserve image aspect ratios and use subtle hover feedback; respect reduced motion.",
    ],
    pages: [
      [
        "Home",
        "Navigation, introduction, featured projects, services, contact and footer.",
      ],
      [
        "Project detail",
        "Project context, problem, process, outcomes and next-project navigation.",
      ],
      [
        "About & contact",
        "Biography, working methods, services and a contact form with validation.",
      ],
    ],
  },
  orbit: {
    subtitle: "Dark SaaS workspace",
    description:
      "A project workspace for development teams. Layered dark surfaces, precise spacing and a restrained blue-violet accent organize metrics, projects, status and settings.",
    principle:
      "Prioritize scanning and information hierarchy. Separate dark surfaces by luminance and reserve the accent for selected states and primary actions.",
    style: "Dark technology",
    scene: "SaaS / Administration",
    rules: [
      "208px desktop sidebar and 1280px maximum content width; collapsible mobile navigation.",
      "Page titles 28–36px, values 32px, body 14–16px; use tabular numerals.",
      "12px card corners and 1px borders; increase surface brightness on hover.",
      "Use text alongside status colors; tables scroll horizontally on small screens.",
    ],
    pages: [
      [
        "Dashboard",
        "Sidebar, metrics, activity chart, recent projects and activity feed.",
      ],
      [
        "Projects",
        "Status filters, project list, creation form and local feedback.",
      ],
      [
        "Workspace settings",
        "Workspace details, notification preferences and save feedback.",
      ],
    ],
  },
  forma: {
    subtitle: "Swiss-style creative studio",
    description:
      "A brand website for a small creative studio. Black-and-white grids, oversized typography and a vivid lime accent create a direct visual identity.",
    principle:
      "Let typography and grid alignment carry the expression. Clear columns, contrasting type sizes, numbering and rules create visual order.",
    style: "Swiss minimalism",
    scene: "Studio / Brand",
    rules: [
      "Use 12 columns and 1px section rules; 20px mobile side padding.",
      "Bold sans-serif headlines with tight tracking; readable body line lengths.",
      "Square corners; reserve lime for primary actions and highlighted work.",
      "160ms color or position transitions; retain link underlines and visible focus.",
    ],
    pages: [
      [
        "Studio home",
        "Brand statement, featured work, services, process and footer.",
      ],
      [
        "Project archive",
        "Project directory, category filters, deliverables and artwork.",
      ],
      [
        "Project inquiry",
        "Project type, budget, requirements and local submission feedback.",
      ],
    ],
  },
  bloom: {
    subtitle: "Natural lifestyle store",
    description:
      "A small store for homeware, craft and lifestyle brands. Cream, forest green and soft corners create a calm path from browsing to product detail and shopping bag.",
    principle:
      "Translate material qualities into visual rhythm. Muted colors and gentle space support clearly placed names, prices, specifications and purchase actions.",
    style: "Soft natural",
    scene: "Commerce / Lifestyle",
    rules: [
      "Three desktop product columns, one or two on mobile; content width 1160px.",
      "Serif headlines and 16px body; keep prices and purchase actions aligned.",
      "18px card corners, pill buttons and forest-green primary actions.",
      "Original CSS product illustrations; cart and checkout are local demonstrations.",
    ],
    pages: [
      [
        "Store home",
        "Brand introduction, category filters, products, philosophy and footer.",
      ],
      [
        "Product detail",
        "Product illustration, price, specifications, quantity and shopping-bag action.",
      ],
      [
        "Shopping bag",
        "Quantity changes, removal, totals and demonstration checkout.",
      ],
    ],
  },
};
export const archivedCase = {
  id: "shadcn-admin",
  name: bi("Shadcn Admin · 团队管理后台", "Shadcn Admin · Team administration"),
  subtitle: bi(
    "开源 B 端系统归档",
    "Archived open-source administration system",
  ),
  description: bi(
    "收录 Sat Naing 的 Shadcn Admin：在这里直接体验工作台、任务、用户与设置，并带走对应页面、组件和提示词。",
    "Explore Sat Naing’s Shadcn Admin here: dashboard, tasks, users and settings, with reusable pages, components and prompts.",
  ),
  principle: bi(
    "归档解读：通过中性的明暗表面、细边框和稳定的侧栏建立秩序。让表格、筛选和表单承担主要任务，用有限的强调色突出操作与状态。",
    "Archive interpretation: neutral light and dark surfaces, fine borders and a stable sidebar establish order. Tables, filters and forms carry the work, with restrained accents for actions and status.",
  ),
  style: bi("中性极简", "Neutral minimal"),
  scene: bi("B 端 / 团队管理", "B2B / Team administration"),
  audience: "b2b",
  source: "open-source",
  tags: bi(
    ["B 端", "表格", "任务", "用户", "浅色", "深色", "React"],
    ["B2B", "Tables", "Tasks", "Users", "Light", "Dark", "React"],
  ),
  tokens: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.129 0.042 264.695)",
    primary: "oklch(0.208 0.042 265.755)",
    border: "oklch(0.929 0.013 255.508)",
    radius: "0.625rem",
    font: "Inter / Manrope / system sans-serif",
    spacing: "4 / 8 / 16 / 24 / 32px",
  },
  rules: bi(
    [
      "沿用上游 CSS 主题变量；明暗主题通过语义色切换，不给每个页面另设配色。",
      "桌面侧栏宽 16rem，图标模式宽 3rem；顶部工具栏高 4rem。内容内边距横向 16px、纵向 24px，表格使用 14px 字号和明确列对齐。",
      "数据卡片采用细边框、约 10px 基础圆角和克制的阴影。",
      "保留排序、筛选、分页、抽屉和表单校验；窄屏折叠侧栏并允许表格横向滚动。",
    ],
    [
      "Use the upstream semantic CSS variables for both light and dark themes.",
      "Use a 16rem desktop sidebar (3rem in icon mode), a 4rem header, content padding of 16px horizontally and 24px vertically, and compact 14px table text with aligned columns.",
      "Use fine card borders, a base radius near 10px and restrained shadows.",
      "Keep sorting, filters, pagination, drawers and validation; collapse the sidebar and allow table scrolling on narrow screens.",
    ],
  ),
};
const pageDefinitions = [
  [
    "dashboard",
    "工作台",
    "Dashboard",
    "指标卡、收入趋势、近期交易与分析标签页。",
    "Metrics, revenue chart, recent sales and analytics tabs.",
    "/",
    "src/features/dashboard/index.tsx",
  ],
  [
    "tasks",
    "任务管理",
    "Tasks",
    "带搜索、筛选、排序与分页的任务表格，以及新增、编辑和删除流程。",
    "Task table with search, filters, sorting, pagination and create, edit and delete flows.",
    "/tasks",
    "src/features/tasks/index.tsx",
  ],
  [
    "users",
    "用户管理",
    "Users",
    "用户列表、状态与角色筛选，新增、编辑和确认删除。",
    "User list, role and status filters, creation, editing and confirmed deletion.",
    "/users",
    "src/features/users/index.tsx",
  ],
  [
    "profile",
    "个人资料",
    "Profile",
    "带即时校验的用户名、邮箱、个人简介与链接表单。",
    "Validated username, email, biography and website fields.",
    "/settings",
    "src/features/settings/profile/profile-form.tsx",
  ],
  [
    "appearance",
    "外观设置",
    "Appearance",
    "明暗主题、字体选择与本地保存。",
    "Light and dark themes, font selection and local persistence.",
    "/settings/appearance",
    "src/features/settings/appearance/appearance-form.tsx",
  ],
  [
    "notifications",
    "通知设置",
    "Notifications",
    "消息范围、邮件通知和移动端偏好设置。",
    "Message scope, email notifications and mobile preferences.",
    "/settings/notifications",
    "src/features/settings/notifications/notifications-form.tsx",
  ],
];
archivedCase.pages = pageDefinitions.map(
  ([key, zh, en, desc, eng, path, file]) => ({
    id: `shadcn-admin-${key}`,
    key,
    caseId: "shadcn-admin",
    name: bi(zh, en),
    description: bi(desc, eng),
    path,
    files: [file],
  }),
);
export const cases = [
  archivedCase,
  ...originals.map((s) => {
    const e = legacyEnglish[s.id];
    return {
      ...s,
      name: bi(s.name, s.name),
      subtitle: bi(s.subtitle, e.subtitle),
      description: bi(s.description, e.description),
      principle: bi(s.principle, e.principle),
      style: bi(s.style, e.style),
      scene: bi(s.scene, e.scene),
      rules: bi(s.rules, e.rules),
      tags: bi(s.tags, [e.style, e.scene]),
      tokens: {
        ...s.tokens,
        font:
          s.id === "folio"
            ? "Georgia / Noto Serif SC / Songti"
            : s.id === "bloom"
              ? "Georgia headings / system sans-serif body"
              : s.id === "forma"
                ? "Arial / Helvetica / system sans-serif"
                : "Inter / Segoe UI / system sans-serif",
      },
      source: "original",
      audience: s.id === "orbit" ? "b2b" : "b2c",
      pages: s.pages.map((p, i) => ({
        id: `${s.id}-${p.id}`,
        key: p.id,
        caseId: s.id,
        name: bi(p.name, e.pages[i][0]),
        description: bi(p.detail, e.pages[i][1]),
        files: ["preview.js", "preview.css", "legacy-theme.js"],
      })),
    };
  }),
];
const curated = [
  [
    "sidebar",
    "侧栏导航",
    "Sidebar navigation",
    "可折叠的分组导航、当前页状态和用户菜单。",
    "Collapsible grouped navigation, active states and a user menu.",
    "dashboard",
    "src/components/layout/app-sidebar.tsx",
    "navigation",
  ],
  [
    "metric-cards",
    "指标卡",
    "Metric cards",
    "四列指标与同比信息；窄屏自动减少列数。",
    "Four metric cards with comparison text and responsive columns.",
    "dashboard",
    "src/features/dashboard/components/metric-cards.tsx",
    "stats",
  ],
  [
    "trend-chart",
    "收入趋势图",
    "Revenue chart",
    "使用原版 Recharts 柱状图、坐标轴和主题色。",
    "Original Recharts bars, axes and semantic theme colors.",
    "dashboard",
    "src/features/dashboard/components/overview.tsx",
    "chart",
  ],
  [
    "task-table",
    "任务表格",
    "Task table",
    "排序、列显示、选择、分页与行操作的完整组合。",
    "Sorting, column visibility, selection, pagination and row actions.",
    "tasks",
    "src/features/tasks/components/tasks-table.tsx",
    "table",
  ],
  [
    "filter-toolbar",
    "筛选工具栏",
    "Filter toolbar",
    "文本搜索、状态与优先级筛选，以及清空条件。",
    "Text search, status and priority filters, and reset.",
    "tasks",
    "src/components/data-table/toolbar.tsx",
    "filter",
  ],
  [
    "task-drawer",
    "任务编辑抽屉",
    "Task editor drawer",
    "从右侧展开的任务表单，包含字段校验和保存反馈。",
    "Right-side task form with validation and save feedback.",
    "tasks",
    "src/features/tasks/components/tasks-mutate-drawer.tsx",
    "dialog",
  ],
  [
    "user-dialog",
    "用户编辑对话框",
    "User editor dialog",
    "用户信息、角色与输入校验，保存后更新本地列表。",
    "User details, roles and validation; saves update the local list.",
    "users",
    "src/features/users/components/users-action-dialog.tsx",
    "dialog",
  ],
  [
    "settings-form",
    "设置表单",
    "Settings form",
    "标签、帮助文本、错误信息与可保存的资料字段。",
    "Labels, help text, errors and persistent profile fields.",
    "profile",
    "src/features/settings/profile/profile-form.tsx",
    "form",
  ],
];
export const components = [
  ...curated.map(([key, zh, en, desc, eng, page, file, kind]) => ({
    id: `shadcn-admin-${key}`,
    key,
    caseId: "shadcn-admin",
    pageIds: [`shadcn-admin-${page}`],
    name: bi(zh, en),
    description: bi(desc, eng),
    files: [file],
    kind,
  })),
  ...originalComponents.map((c) => {
    const s = cases.find((s) => s.id === c.styleId),
      kind = originalKinds.find((k) => k.id === c.kindId);
    const names = {
      button: "Button",
      card: "Card",
      navigation: "Navigation",
      form: "Form",
      pricing: "Pricing card",
      stats: "Metrics",
      table: "Table",
      dialog: "Dialog",
    };
    return {
      ...c,
      key: c.kindId,
      caseId: c.styleId,
      pageIds: s.pages.map((p) => p.id),
      name: bi(c.name, `${s.name.en} ${names[c.kindId]}`),
      description: bi(
        c.description,
        `${names[c.kindId]} in the ${s.subtitle.en.toLowerCase()} design. Reuse its typography, colors and spacing.`,
      ),
      kind: c.kindId,
      files: ["components.js", "components.css"],
    };
  }),
];
export const pages = cases.flatMap((c) => c.pages);
function indexById(items) {
  const index = new Map();
  // Match Array.find: duplicate IDs keep their first object, not their last.
  for (const item of items) if (!index.has(item.id)) index.set(item.id, item);
  return index;
}
const casesById = indexById(cases);
const pagesById = indexById(pages);
const componentsById = indexById(components);
export const getCase = (id) => casesById.get(id);
export const getPage = (id) => pagesById.get(id);
export const getComponent = (id) => componentsById.get(id);
export function promptFor(c, item, scope, locale) {
  const en = locale === "en",
    v = (x) => (typeof x === "object" ? x[locale] : x);
  const base = en
    ? `Apply the visual language of ${v(c.name)} to my project.\n\nDesign interpretation: ${v(c.principle)}\n\nDesign tokens:\n${Object.entries(
        c.tokens,
      )
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}\n\nRules:\n${v(c.rules)
        .map((r, i) => `${i + 1}. ${r}`)
        .join("\n")}`
    : `请将「${v(c.name)}」的视觉语言应用到我的项目。\n\n设计解读：${v(c.principle)}\n\n设计变量：\n${Object.entries(
        c.tokens,
      )
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}\n\n设计规则：\n${v(c.rules)
        .map((r, i) => `${i + 1}. ${r}`)
        .join("\n")}`;
  if (scope === "style")
    return (
      base +
      (en
        ? "\n\nKeep my existing business content and information architecture."
        : "\n\n保留我的业务内容和信息架构，仅应用以上视觉规则。")
    );
  const target =
    scope === "system"
      ? c.pages.map((p) => `${v(p.name)}: ${v(p.description)}`).join("\n")
      : `${v(item.name)}: ${v(item.description)}`;
  return (
    base +
    `\n\n${en ? "Build the following" : "请实现以下内容"}:\n${target}\n\n` +
    (en
      ? "Provide the complete layout, responsive behavior, keyboard focus, empty states, validation and success feedback. Use sample data for local demonstrations. Preserve the supplied implementation structure and include its required dependencies. Replace brand, text and business entities with my project context."
      : "提供完整布局、响应式行为、键盘焦点、空状态、校验和成功反馈。本地演示使用示例数据。保留所提供的源码结构，并包含其运行所需依赖。请将品牌、文案和业务对象替换为我的项目上下文。")
  );
}
export function previewURL(c, item, locale = "zh-CN", theme = "light") {
  if (c.source === "open-source") {
    const page = item?.pageIds
      ? getPage(item.pageIds[0])
      : item?.caseId
        ? item
        : c.pages[0];
    return `./examples/shadcn-admin/index.html?lang=${locale}&theme=${theme}${item?.pageIds ? "&component=" + item.key : ""}#${page.path}`;
  }
  return `./preview.html?style=${c.id}&page=${item?.key && !item?.pageIds ? item.key : "home"}&lang=${locale}&theme=${theme}`;
}

// A resource's provenance and its implementation libraries are separate concepts.
// Legacy objects and IDs remain exported above for existing links and downloads.
export const sourceProjects = {
  original: {
    id: "original",
    name: "UI Design Atlas",
    author: "UI Design Atlas",
    repo: "https://github.com/Xiiiing/ui-design-atlas",
    license: "Atlas original",
    original: true,
  },
  "shadcn-admin": {
    id: "shadcn-admin",
    ...upstream,
    docs: "https://shadcn-admin.netlify.app/",
  },
  ...marketSources,
};
export const libraries = {
  native: {
    id: "native",
    name: "HTML / CSS / JavaScript",
    version: "Web standards",
    docs: "https://developer.mozilla.org/en-US/docs/Web",
    aliases: ["原生", "CSS", "HTML"],
  },
  shadcn: {
    id: "shadcn",
    name: "shadcn/ui",
    version: "e16c87f · Radix 1.3.1",
    docs: "https://ui.shadcn.com/",
    aliases: ["shadcn", "Radix"],
  },
  recharts: {
    id: "recharts",
    name: "Recharts",
    version: "3.10.1",
    docs: "https://recharts.github.io/",
    aliases: ["图表", "chart"],
  },
  ...marketLibraries,
};
const categoryFor = (kind) =>
  ({
    button: "buttons",
    navigation: "navigation",
    form: "forms",
    dialog: "feedback",
    filter: "forms",
    table: "data",
    stats: "data",
    chart: "data",
    card: "cards",
    pricing: "cards",
  })[kind] || "cards";
export const resources = [
  ...marketResources,
  ...[...components, ...pages, ...cases].map((item) => {
    const type = item.pages ? "case" : item.pageIds ? "component" : "page";
    const c = type === "case" ? item : getCase(item.caseId);
    return {
      ...item,
      type,
      sourceId: c.source === "original" ? "original" : "shadcn-admin",
      libraryIds:
        c.source === "original"
          ? ["native"]
          : item.key === "trend-chart"
            ? ["shadcn", "recharts"]
            : ["shadcn"],
      category: type === "component" ? categoryFor(item.kind) : "layout",
      interactions:
        type !== "component"
          ? []
          : item.kind === "form" || item.kind === "filter"
            ? ["input", "click"]
            : item.kind === "stats"
              ? []
              : item.kind === "chart"
                ? ["hover"]
                : ["click"],
      motion: false,
      styleId: c.id,
      style: c.style,
      audience: c.audience,
      tags: item.tags || bi([c.style["zh-CN"]], [c.style.en]),
      cover: `./assets/previews/${type}-${item.id}.png`,
      preview: {
        width:
          type === "component"
            ? item.kind === "table" || item.kind === "navigation"
              ? 1100
              : 640
            : 1280,
        height: type === "component" ? 480 : 800,
      },
    };
  }),
];
const resourcesById = indexById(resources);
const resourcesByType = new Map();
// The catalog is static after initialization; these are global navigation counts.
export const resourceCounts = {
  total: resources.length,
  motion: 0,
  byType: new Map(),
  byCategory: new Map(),
};
for (const r of resources) {
  if (!resourcesByType.has(r.type)) resourcesByType.set(r.type, new Map());
  const index = resourcesByType.get(r.type);
  if (!index.has(r.id)) index.set(r.id, r);
  resourceCounts.byType.set(
    r.type,
    (resourceCounts.byType.get(r.type) || 0) + 1,
  );
  resourceCounts.byCategory.set(
    r.category,
    (resourceCounts.byCategory.get(r.category) || 0) + 1,
  );
  if (r.motion) resourceCounts.motion++;
}
export const findResource = (id, type) =>
  type ? resourcesByType.get(type)?.get(id) : resourcesById.get(id);
export const resourceSource = (r) => sourceProjects[r.sourceId];
export function resourcePreview(r, lang = "zh-CN", theme = "light") {
  if (r.preview.url)
    return `${r.preview.url}${r.preview.url.includes("?") ? "&" : "?"}lang=${lang}&theme=${theme}`;
  const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId);
  if (r.type === "component" && c.source === "original")
    return `./component-preview.html?id=${r.id}&lang=${lang}&theme=${theme}`;
  return previewURL(c, r.type === "case" ? c.pages[0] : r, lang, theme);
}
export function resourcePrompt(r, lang = "zh-CN", scope = r.type) {
  if (r.prompt) return scope === "style" ? r.stylePrompt[lang] : r.prompt[lang];
  const c = r.type === "case" ? getCase(r.id) : getCase(r.caseId);
  return promptFor(
    c,
    r.type === "case" ? c.pages[0] : r,
    scope === "case" ? "system" : scope,
    lang,
  );
}
const searchIndex = createSearchIndex(resources, (r) => ({
  names: r.name,
  aliases: [
    r.aliases,
    r.tags,
    r.libraryIds.flatMap((id) => [libraries[id]?.name, libraries[id]?.aliases]),
  ],
  description: r.description,
  context: [r.category, r.interactions, r.style, resourceSource(r)?.name],
}));
export const resourceSearch = (r) => searchIndex.get(r).text;
export const searchResources = (query, items = resources) =>
  rankSearch(items, query, searchIndex);

// Editorial discovery modules reference existing resources; no duplicate records.
export const discovery = discoveryContent;
export function collectionResources(id) {
  const collection = discovery.collections.find((item) => item.id === id);
  if (!collection) return [];
  if (collection.resources)
    return collection.resources.map((id) => findResource(id));
  return resources.filter(
    (r) =>
      (!collection.motion || r.motion) &&
      collection.categories.includes(r.category),
  );
}
export const discoveryResources = (section) =>
  discovery[section].map((id) => findResource(id));

export function discoveryGallery() {
  const ordered = [
    ...discovery.featured,
    ...discovery.gallery,
    ...resources.map((r) => r.id),
  ];
  return [...new Set(ordered)].map((id) => findResource(id));
}

// Generated from content/market-*.json by scripts/generate-market-catalog.mjs.
export const marketResources = [
  {
    id: "magicui-border-beam",
    key: "border-beam",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "cards",
    interactions: ["auto"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "流光边框",
      en: "Border Beam",
    },
    description: {
      "zh-CN": "沿容器边缘循环移动的渐变光束，让登录卡片或重点区域更醒目。",
      en: "A gradient beam travels around a card border to highlight its content.",
    },
    tags: {
      "zh-CN": ["流光边框", "动效", "交互"],
      en: ["Border Beam", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。沿容器边缘循环移动的渐变光束，让登录卡片或重点区域更醒目。",
      en: "Use motion to communicate focus, state and hierarchy. A gradient beam travels around a card border to highlight its content.",
    },
    rules: {
      "zh-CN": [
        "约 350px 宽的登录卡片、细边框与 100px 光束；以 8 秒循环沿边缘运动。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A roughly 350px login card, thin border and 100px beam, travelling around the border in an 8-second loop.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/border-beam.tsx",
      "src/vendor/magicui/border-beam.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/border-beam",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/border-beam.tsx",
    cover: "./assets/previews/component-magicui-border-beam.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-border-beam",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「流光边框」，以本站提供的 Magic UI 实际源码为基础。\n\n约 350px 宽的登录卡片、细边框与 100px 光束；以 8 秒循环沿边缘运动。\n\n用途：沿容器边缘循环移动的渐变光束，让登录卡片或重点区域更醒目。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Border Beam in my project using the supplied actual Magic UI source.\n\nA roughly 350px login card, thin border and 100px beam, travelling around the border in an 8-second loop.\n\nPurpose: A gradient beam travels around a card border to highlight its content.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：约 350px 宽的登录卡片、细边框与 100px 光束；以 8 秒循环沿边缘运动。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A roughly 350px login card, thin border and 100px beam, travelling around the border in an 8-second loop. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "antd-table",
    key: "table",
    type: "component",
    sourceId: "antd",
    libraryIds: ["antd"],
    category: "data",
    interactions: ["click"],
    motion: false,
    styleId: "enterprise-antd",
    style: {
      "zh-CN": "企业应用 · Ant Design",
      en: "Enterprise · Ant Design",
    },
    audience: "b2b",
    name: {
      "zh-CN": "筛选排序表格",
      en: "Filterable Table",
    },
    description: {
      "zh-CN": "表头筛选、列排序、分页及带状态的示例数据。",
      en: "Column filters, sorting, pagination and local sample records.",
    },
    tags: {
      "zh-CN": ["筛选排序表格", "业务组件", "企业应用"],
      en: ["Filterable Table", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。表头筛选、列排序、分页及带状态的示例数据。",
      en: "Archive interpretation: use the library’s established conventions for consistency. Column filters, sorting, pagination and local sample records.",
    },
    rules: {
      "zh-CN": [
        "保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/antd/table.tsx"],
    supportFiles: [
      "src/archive/ant-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://ant.design/components/table/#components-table-demo-head",
    sourceUrl:
      "https://github.com/ant-design/ant-design/blob/f8f5595ab5e891fff6a2a06c5b3b98af643d008e/components/table/demo/head.tsx",
    cover: "./assets/previews/component-antd-table.png",
    preview: {
      width: 960,
      height: 480,
      url: "./examples/ui-market/index.html?item=antd-table",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Ant Design 6.6.7 官方示例源码复用「筛选排序表格」。\n\n目标行为：表头筛选、列排序、分页及带状态的示例数据。\n\n保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Ant Design 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Filterable Table from the supplied official Ant Design 6.6.7 example.\n\nBehavior: Column filters, sorting, pagination and local sample records.\n\nPreserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Ant Design dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Ant Design 的企业界面规范用于现有业务：保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Ant Design visual conventions to my existing content: Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "magicui-ripple-button",
    key: "ripple-button",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "buttons",
    interactions: ["click"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "点击涟漪按钮",
      en: "Ripple Button",
    },
    description: {
      "zh-CN": "点击位置生成向外扩散的圆形涟漪，反馈清晰且不打断操作。",
      en: "A circular ripple expands from the click position without interrupting the action.",
    },
    tags: {
      "zh-CN": ["点击涟漪按钮", "动效", "交互"],
      en: ["Ripple Button", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。点击位置生成向外扩散的圆形涟漪，反馈清晰且不打断操作。",
      en: "Use motion to communicate focus, state and hierarchy. A circular ripple expands from the click position without interrupting the action.",
    },
    rules: {
      "zh-CN": [
        "浅色细边框按钮、浅蓝色（#ADD8E6）半透明涟漪；从指针落点扩散，600ms 后移除。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A light bordered button with a translucent light-blue (#ADD8E6) ripple expanding from the pointer position and removed after 600ms.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/ripple-button.tsx",
      "src/vendor/magicui/ripple-button.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/ripple-button",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/ripple-button.tsx",
    cover: "./assets/previews/component-magicui-ripple-button.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-ripple-button",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「点击涟漪按钮」，以本站提供的 Magic UI 实际源码为基础。\n\n浅色细边框按钮、浅蓝色（#ADD8E6）半透明涟漪；从指针落点扩散，600ms 后移除。\n\n用途：点击位置生成向外扩散的圆形涟漪，反馈清晰且不打断操作。\n实现使用 React、TypeScript、Tailwind CSS。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Ripple Button in my project using the supplied actual Magic UI source.\n\nA light bordered button with a translucent light-blue (#ADD8E6) ripple expanding from the pointer position and removed after 600ms.\n\nPurpose: A circular ripple expands from the click position without interrupting the action.\nUse React, TypeScript and Tailwind CSS. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：浅色细边框按钮、浅蓝色（#ADD8E6）半透明涟漪；从指针落点扩散，600ms 后移除。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A light bordered button with a translucent light-blue (#ADD8E6) ripple expanding from the pointer position and removed after 600ms. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "fluent-dialog",
    key: "dialog",
    type: "component",
    sourceId: "fluent",
    libraryIds: ["fluent"],
    category: "feedback",
    interactions: ["click"],
    motion: false,
    styleId: "enterprise-fluent",
    style: {
      "zh-CN": "企业应用 · Fluent UI",
      en: "Enterprise · Fluent UI",
    },
    audience: "b2b",
    name: {
      "zh-CN": "标准确认对话框",
      en: "Confirmation Dialog",
    },
    description: {
      "zh-CN": "包含标题、说明与操作区的原版对话框，支持焦点管理和键盘关闭。",
      en: "An original dialog with title, description and actions, focus management and keyboard dismissal.",
    },
    tags: {
      "zh-CN": ["标准确认对话框", "业务组件", "企业应用"],
      en: ["Confirmation Dialog", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。包含标题、说明与操作区的原版对话框，支持焦点管理和键盘关闭。",
      en: "Archive interpretation: use the library’s established conventions for consistency. An original dialog with title, description and actions, focus management and keyboard dismissal.",
    },
    rules: {
      "zh-CN": [
        "保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/fluent/dialog.tsx"],
    supportFiles: [
      "src/archive/fluent-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://react.fluentui.dev/?path=/docs/components-dialog--docs",
    sourceUrl:
      "https://github.com/microsoft/fluentui/blob/036f9a210cd8d72924c33dd9ff0fbb16d6aae885/packages/react-components/react-dialog/stories/src/Dialog/DialogDefault.stories.tsx",
    cover: "./assets/previews/component-fluent-dialog.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=fluent-dialog",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Fluent UI 9.74.10 官方示例源码复用「标准确认对话框」。\n\n目标行为：包含标题、说明与操作区的原版对话框，支持焦点管理和键盘关闭。\n\n保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Fluent UI 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Confirmation Dialog from the supplied official Fluent UI 9.74.10 example.\n\nBehavior: An original dialog with title, description and actions, focus management and keyboard dismissal.\n\nPreserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Fluent UI dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Fluent UI 的企业界面规范用于现有业务：保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Fluent UI visual conventions to my existing content: Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "magicui-bento-grid",
    key: "bento-grid",
    type: "block",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "layout",
    interactions: ["auto", "hover"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "功能便当网格",
      en: "Bento Grid",
    },
    description: {
      "zh-CN": "大小错落的功能卡片，组合文件滚动、通知、连接动画与日历。",
      en: "An asymmetric feature grid combines file marquees, notifications, animated connections and a calendar.",
    },
    tags: {
      "zh-CN": ["功能便当网格", "动效", "交互"],
      en: ["Bento Grid", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。大小错落的功能卡片，组合文件滚动、通知、连接动画与日历。",
      en: "Use motion to communicate focus, state and hierarchy. An asymmetric feature grid combines file marquees, notifications, animated connections and a calendar.",
    },
    rules: {
      "zh-CN": [
        "桌面三列不等宽功能卡片，移动端单列；卡片底部显示标题、说明和操作，背景使用原版通知、连接光束、文件列表及日历。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A three-column asymmetric desktop grid collapsing to one column; titles, descriptions and actions sit above the original notifications, beams, file lists and calendar.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/bento-grid.tsx",
      "src/vendor/magicui/bento-grid.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/bento-grid",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/bento-grid.tsx",
    cover: "./assets/previews/block-magicui-bento-grid.png",
    preview: {
      width: 1280,
      height: 900,
      url: "./examples/ui-market/index.html?item=magicui-bento-grid",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「功能便当网格」，以本站提供的 Magic UI 实际源码为基础。\n\n桌面三列不等宽功能卡片，移动端单列；卡片底部显示标题、说明和操作，背景使用原版通知、连接光束、文件列表及日历。\n\n用途：大小错落的功能卡片，组合文件滚动、通知、连接动画与日历。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Bento Grid in my project using the supplied actual Magic UI source.\n\nA three-column asymmetric desktop grid collapsing to one column; titles, descriptions and actions sit above the original notifications, beams, file lists and calendar.\n\nPurpose: An asymmetric feature grid combines file marquees, notifications, animated connections and a calendar.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：桌面三列不等宽功能卡片，移动端单列；卡片底部显示标题、说明和操作，背景使用原版通知、连接光束、文件列表及日历。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A three-column asymmetric desktop grid collapsing to one column; titles, descriptions and actions sit above the original notifications, beams, file lists and calendar. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "magicui-particles",
    key: "particles",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "backgrounds",
    interactions: ["auto", "hover"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "交互粒子背景",
      en: "Particles",
    },
    description: {
      "zh-CN": "细小粒子缓慢移动，受鼠标位置影响，文字位于前景。",
      en: "Small particles drift in the background and respond to the pointer behind foreground text.",
    },
    tags: {
      "zh-CN": ["交互粒子背景", "动效", "交互"],
      en: ["Particles", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。细小粒子缓慢移动，受鼠标位置影响，文字位于前景。",
      en: "Use motion to communicate focus, state and hierarchy. Small particles drift in the background and respond to the pointer behind foreground text.",
    },
    rules: {
      "zh-CN": [
        "500px 高的有边框背景区域，100 个粒子、ease=80；明暗主题切换粒子颜色，前景大标题保持清晰。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A 500px high bordered surface with 100 particles and ease=80; theme-aware particle colours behind a clear large heading.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/particles.tsx",
      "src/vendor/magicui/particles.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/particles",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/particles.tsx",
    cover: "./assets/previews/component-magicui-particles.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-particles",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「交互粒子背景」，以本站提供的 Magic UI 实际源码为基础。\n\n500px 高的有边框背景区域，100 个粒子、ease=80；明暗主题切换粒子颜色，前景大标题保持清晰。\n\n用途：细小粒子缓慢移动，受鼠标位置影响，文字位于前景。\n实现使用 React、TypeScript、Tailwind CSS。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Particles in my project using the supplied actual Magic UI source.\n\nA 500px high bordered surface with 100 particles and ease=80; theme-aware particle colours behind a clear large heading.\n\nPurpose: Small particles drift in the background and respond to the pointer behind foreground text.\nUse React, TypeScript and Tailwind CSS. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：500px 高的有边框背景区域，100 个粒子、ease=80；明暗主题切换粒子颜色，前景大标题保持清晰。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A 500px high bordered surface with 100 particles and ease=80; theme-aware particle colours behind a clear large heading. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "fluent-toolbar",
    key: "toolbar",
    type: "component",
    sourceId: "fluent",
    libraryIds: ["fluent"],
    category: "navigation",
    interactions: ["click"],
    motion: false,
    styleId: "enterprise-fluent",
    style: {
      "zh-CN": "企业应用 · Fluent UI",
      en: "Enterprise · Fluent UI",
    },
    audience: "b2b",
    name: {
      "zh-CN": "自动溢出工具栏",
      en: "Overflow Toolbar",
    },
    description: {
      "zh-CN": "工具按组收纳，缩窄容器后多余操作进入更多菜单。",
      en: "Grouped tools move into an overflow menu as the resizable container narrows.",
    },
    tags: {
      "zh-CN": ["自动溢出工具栏", "业务组件", "企业应用"],
      en: ["Overflow Toolbar", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。工具按组收纳，缩窄容器后多余操作进入更多菜单。",
      en: "Archive interpretation: use the library’s established conventions for consistency. Grouped tools move into an overflow menu as the resizable container narrows.",
    },
    rules: {
      "zh-CN": [
        "保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/fluent/toolbar.tsx"],
    supportFiles: [
      "src/archive/fluent-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://react.fluentui.dev/?path=/docs/components-toolbar--docs",
    sourceUrl:
      "https://github.com/microsoft/fluentui/blob/036f9a210cd8d72924c33dd9ff0fbb16d6aae885/packages/react-components/react-toolbar/stories/src/Toolbar/ToolbarOverflow.stories.tsx",
    cover: "./assets/previews/component-fluent-toolbar.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=fluent-toolbar",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Fluent UI 9.74.10 官方示例源码复用「自动溢出工具栏」。\n\n目标行为：工具按组收纳，缩窄容器后多余操作进入更多菜单。\n\n保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Fluent UI 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Overflow Toolbar from the supplied official Fluent UI 9.74.10 example.\n\nBehavior: Grouped tools move into an overflow menu as the resizable container narrows.\n\nPreserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Fluent UI dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Fluent UI 的企业界面规范用于现有业务：保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Fluent UI visual conventions to my existing content: Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "magicui-shimmer-button",
    key: "shimmer-button",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "buttons",
    interactions: ["auto", "hover", "click"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "微光按钮",
      en: "Shimmer Button",
    },
    description: {
      "zh-CN": "圆角深色按钮，边缘微光循环流动，悬停和按下有轻微反馈。",
      en: "A rounded dark button with a travelling shimmer and subtle hover and press feedback.",
    },
    tags: {
      "zh-CN": ["微光按钮", "动效", "交互"],
      en: ["Shimmer Button", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。圆角深色按钮，边缘微光循环流动，悬停和按下有轻微反馈。",
      en: "Use motion to communicate focus, state and hierarchy. A rounded dark button with a travelling shimmer and subtle hover and press feedback.",
    },
    rules: {
      "zh-CN": [
        "黑色胶囊按钮、白色文字，使用白色微光与 3 秒循环，按下时轻微下移。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A black pill button with white text, white shimmer on a 3-second loop and a small downward press.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/shimmer-button.tsx",
      "src/vendor/magicui/shimmer-button.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/shimmer-button",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/shimmer-button.tsx",
    cover: "./assets/previews/component-magicui-shimmer-button.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-shimmer-button",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「微光按钮」，以本站提供的 Magic UI 实际源码为基础。\n\n黑色胶囊按钮、白色文字，使用白色微光与 3 秒循环，按下时轻微下移。\n\n用途：圆角深色按钮，边缘微光循环流动，悬停和按下有轻微反馈。\n实现使用 React、TypeScript、Tailwind CSS。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Shimmer Button in my project using the supplied actual Magic UI source.\n\nA black pill button with white text, white shimmer on a 3-second loop and a small downward press.\n\nPurpose: A rounded dark button with a travelling shimmer and subtle hover and press feedback.\nUse React, TypeScript and Tailwind CSS. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：黑色胶囊按钮、白色文字，使用白色微光与 3 秒循环，按下时轻微下移。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A black pill button with white text, white shimmer on a 3-second loop and a small downward press. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "antd-search",
    key: "search",
    type: "block",
    sourceId: "antd",
    libraryIds: ["antd"],
    category: "forms",
    interactions: ["click", "input"],
    motion: false,
    styleId: "enterprise-antd",
    style: {
      "zh-CN": "企业应用 · Ant Design",
      en: "Enterprise · Ant Design",
    },
    audience: "b2b",
    name: {
      "zh-CN": "高级搜索区块",
      en: "Advanced Search",
    },
    description: {
      "zh-CN": "可展开筛选字段、清空条件和提交反馈的业务搜索区域。",
      en: "A business search area with expandable fields, reset and local submission feedback.",
    },
    tags: {
      "zh-CN": ["高级搜索区块", "业务组件", "企业应用"],
      en: ["Advanced Search", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。可展开筛选字段、清空条件和提交反馈的业务搜索区域。",
      en: "Archive interpretation: use the library’s established conventions for consistency. A business search area with expandable fields, reset and local submission feedback.",
    },
    rules: {
      "zh-CN": [
        "保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/antd/search.tsx"],
    supportFiles: [
      "src/archive/ant-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://ant.design/components/form/#components-form-demo-advanced-search",
    sourceUrl:
      "https://github.com/ant-design/ant-design/blob/f8f5595ab5e891fff6a2a06c5b3b98af643d008e/components/form/demo/advanced-search.tsx",
    cover: "./assets/previews/block-antd-search.png",
    preview: {
      width: 960,
      height: 600,
      url: "./examples/ui-market/index.html?item=antd-search",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Ant Design 6.6.7 官方示例源码复用「高级搜索区块」。\n\n目标行为：可展开筛选字段、清空条件和提交反馈的业务搜索区域。\n\n保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Ant Design 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Advanced Search from the supplied official Ant Design 6.6.7 example.\n\nBehavior: A business search area with expandable fields, reset and local submission feedback.\n\nPreserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Ant Design dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Ant Design 的企业界面规范用于现有业务：保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Ant Design visual conventions to my existing content: Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "magicui-text-animate",
    key: "text-animate",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "text",
    interactions: ["scroll"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "逐字模糊上移",
      en: "Text Animate",
    },
    description: {
      "zh-CN": "文字逐字从模糊和下方偏移进入，适合短标题。",
      en: "Characters enter from blur and a lower offset, suitable for concise headings.",
    },
    tags: {
      "zh-CN": ["逐字模糊上移", "动效", "交互"],
      en: ["Text Animate", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。文字逐字从模糊和下方偏移进入，适合短标题。",
      en: "Use motion to communicate focus, state and hierarchy. Characters enter from blur and a lower offset, suitable for concise headings.",
    },
    rules: {
      "zh-CN": [
        "使用上游 blurInUp 动画，按字符逐个出现，只在进入视口时播放一次；保持文字布局与可读性。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "Use the upstream blurInUp animation by character, playing once when in view while preserving text layout and readability.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/text-animate.tsx",
      "src/vendor/magicui/text-animate.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/text-animate",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/text-animate.tsx",
    cover: "./assets/previews/component-magicui-text-animate.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-text-animate",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「逐字模糊上移」，以本站提供的 Magic UI 实际源码为基础。\n\n使用上游 blurInUp 动画，按字符逐个出现，只在进入视口时播放一次；保持文字布局与可读性。\n\n用途：文字逐字从模糊和下方偏移进入，适合短标题。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Text Animate in my project using the supplied actual Magic UI source.\n\nUse the upstream blurInUp animation by character, playing once when in view while preserving text layout and readability.\n\nPurpose: Characters enter from blur and a lower offset, suitable for concise headings.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：使用上游 blurInUp 动画，按字符逐个出现，只在进入视口时播放一次；保持文字布局与可读性。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: Use the upstream blurInUp animation by character, playing once when in view while preserving text layout and readability. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "shadcn-login-01",
    key: "login-01",
    type: "block",
    sourceId: "shadcn-ui",
    libraryIds: ["shadcn"],
    libraryVersions: {
      shadcn: "25af02b · Radix 1.8.1",
    },
    category: "forms",
    interactions: ["click", "input"],
    motion: false,
    styleId: "neutral-blocks",
    style: {
      "zh-CN": "中性极简区块",
      en: "Neutral minimal blocks",
    },
    audience: "b2c",
    name: {
      "zh-CN": "简洁登录区块",
      en: "Login 01",
    },
    description: {
      "zh-CN": "居中卡片、邮箱与密码输入、辅助链接和双层操作。",
      en: "A centred card with email/password inputs, supporting links and two action styles.",
    },
    tags: {
      "zh-CN": ["简洁登录区块", "页面区块", "shadcn"],
      en: ["Login 01", "page block", "shadcn"],
    },
    useCases: {
      "zh-CN": "登录注册、SaaS 应用、数据产品和后台页面搭建。",
      en: "Authentication screens, SaaS applications, data products and administration layouts.",
    },
    principle: {
      "zh-CN":
        "归档解读：用稳定的布局和清晰的交互层级，建立可以替换业务内容的页面基础。居中卡片、邮箱与密码输入、辅助链接和双层操作。",
      en: "Archive interpretation: stable layouts and clear interaction hierarchy provide a reusable foundation for business content. A centred card with email/password inputs, supporting links and two action styles.",
    },
    rules: {
      "zh-CN": [
        "沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。",
        "本地表单演示，不连接认证服务；侧栏中的占位导航保留在本地预览。",
      ],
      en: [
        "Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.",
        "Forms are local demos without authentication services. Placeholder navigation stays inside the local preview.",
      ],
    },
    files: ["src/blocks/login-01/page.tsx"],
    supportFiles: [
      "src/blocks/login-01/components/login-form.tsx",
      "src/styles/theme.css",
      "src/archive/block-adapter.ts",
    ],
    originalUrl: "https://ui.shadcn.com/blocks/authentication",
    sourceUrl:
      "https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/blocks/login-01/page.tsx",
    cover: "./assets/previews/block-shadcn-login-01.png",
    preview: {
      width: 640,
      height: 800,
      url: "./examples/ui-market/index.html?item=shadcn-login-01",
    },
    prompt: {
      "zh-CN":
        "请使用本站提供的 shadcn/ui login-01 原版源码复用「简洁登录区块」。\n\n目标界面：居中卡片、邮箱与密码输入、辅助链接和双层操作。\n\n沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。\n使用 React、TypeScript、Tailwind CSS 和实际 Radix 组件，保留源码中的 Provider、图标、字段与布局关系。提供中文与英文、响应式布局、键盘操作和可见焦点；业务使用固定本地演示数据，不发起第三方认证。表单包含必填、邮箱及确认密码校验，不保存密码。",
      en: "Reuse Login 01 from the supplied original shadcn/ui login-01 source.\n\nInterface: A centred card with email/password inputs, supporting links and two action styles.\n\nPreserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.\nUse React, TypeScript, Tailwind CSS and actual Radix components. Keep providers, icons, fields and layout relationships. Include Chinese/English, responsive behavior, keyboard access and visible focus; use local fixtures and no third-party authentication. Validate required fields, email and matching passwords without persisting passwords.",
    },
    stylePrompt: {
      "zh-CN":
        "将中性极简布局用于我的业务：沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。通过标题、帮助文本和主次按钮建立清晰层级。",
      en: "Apply neutral minimalism to my content: Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.Use titles, help text and primary/secondary actions to express hierarchy.",
    },
  },
  {
    id: "magicui-magic-card",
    key: "magic-card",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "cards",
    interactions: ["hover"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "聚光悬停卡片",
      en: "Magic Card",
    },
    description: {
      "zh-CN": "柔和光晕跟随鼠标，卡片内容保持清晰，支持明暗主题。",
      en: "A soft spotlight follows the pointer while the card content remains readable in both themes.",
    },
    tags: {
      "zh-CN": ["聚光悬停卡片", "动效", "交互"],
      en: ["Magic Card", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。柔和光晕跟随鼠标，卡片内容保持清晰，支持明暗主题。",
      en: "Use motion to communicate focus, state and hierarchy. A soft spotlight follows the pointer while the card content remains readable in both themes.",
    },
    rules: {
      "zh-CN": [
        "约 350px 登录卡片、细边框与中性色；通过指针位置驱动径向渐变光晕，保留表单、按钮及可见焦点。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A roughly 350px login card with fine borders and neutral surfaces; pointer position drives a radial glow around its form and actions.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/magic-card.tsx",
      "src/vendor/magicui/magic-card.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/magic-card",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/magic-card.tsx",
    cover: "./assets/previews/component-magicui-magic-card.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-magic-card",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「聚光悬停卡片」，以本站提供的 Magic UI 实际源码为基础。\n\n约 350px 登录卡片、细边框与中性色；通过指针位置驱动径向渐变光晕，保留表单、按钮及可见焦点。\n\n用途：柔和光晕跟随鼠标，卡片内容保持清晰，支持明暗主题。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Magic Card in my project using the supplied actual Magic UI source.\n\nA roughly 350px login card with fine borders and neutral surfaces; pointer position drives a radial glow around its form and actions.\n\nPurpose: A soft spotlight follows the pointer while the card content remains readable in both themes.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：约 350px 登录卡片、细边框与中性色；通过指针位置驱动径向渐变光晕，保留表单、按钮及可见焦点。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A roughly 350px login card with fine borders and neutral surfaces; pointer position drives a radial glow around its form and actions. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "magicui-number-ticker",
    key: "number-ticker",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "data",
    interactions: ["scroll"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "数字滚动",
      en: "Number Ticker",
    },
    description: {
      "zh-CN": "指标进入视口后由零平滑增长到目标值，保留数字对齐。",
      en: "A metric counts smoothly from zero when it enters the viewport, using tabular numerals.",
    },
    tags: {
      "zh-CN": ["数字滚动", "动效", "交互"],
      en: ["Number Ticker", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。指标进入视口后由零平滑增长到目标值，保留数字对齐。",
      en: "Use motion to communicate focus, state and hierarchy. A metric counts smoothly from zero when it enters the viewport, using tabular numerals.",
    },
    rules: {
      "zh-CN": [
        "96px 紧凑大数字、等宽数字字形，从 0 增长到 100；使用阻尼 60、刚度 100 的弹簧动画。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A 96px compact metric with tabular numerals, counting from 0 to 100 with spring damping 60 and stiffness 100.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/number-ticker.tsx",
      "src/vendor/magicui/number-ticker.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/number-ticker",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/number-ticker.tsx",
    cover: "./assets/previews/component-magicui-number-ticker.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-number-ticker",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「数字滚动」，以本站提供的 Magic UI 实际源码为基础。\n\n96px 紧凑大数字、等宽数字字形，从 0 增长到 100；使用阻尼 60、刚度 100 的弹簧动画。\n\n用途：指标进入视口后由零平滑增长到目标值，保留数字对齐。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Number Ticker in my project using the supplied actual Magic UI source.\n\nA 96px compact metric with tabular numerals, counting from 0 to 100 with spring damping 60 and stiffness 100.\n\nPurpose: A metric counts smoothly from zero when it enters the viewport, using tabular numerals.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：96px 紧凑大数字、等宽数字字形，从 0 增长到 100；使用阻尼 60、刚度 100 的弹簧动画。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A 96px compact metric with tabular numerals, counting from 0 to 100 with spring damping 60 and stiffness 100. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "fluent-data-grid",
    key: "data-grid",
    type: "component",
    sourceId: "fluent",
    libraryIds: ["fluent"],
    category: "data",
    interactions: ["click"],
    motion: false,
    styleId: "enterprise-fluent",
    style: {
      "zh-CN": "企业应用 · Fluent UI",
      en: "Enterprise · Fluent UI",
    },
    audience: "b2b",
    name: {
      "zh-CN": "文件排序表格",
      en: "Sortable DataGrid",
    },
    description: {
      "zh-CN": "文件图标、作者状态、更新时间和可排序列，保留 Fluent 原版视觉。",
      en: "File icons, author presence, timestamps and sortable columns with original Fluent visuals.",
    },
    tags: {
      "zh-CN": ["文件排序表格", "业务组件", "企业应用"],
      en: ["Sortable DataGrid", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。文件图标、作者状态、更新时间和可排序列，保留 Fluent 原版视觉。",
      en: "Archive interpretation: use the library’s established conventions for consistency. File icons, author presence, timestamps and sortable columns with original Fluent visuals.",
    },
    rules: {
      "zh-CN": [
        "保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/fluent/data-grid.tsx"],
    supportFiles: [
      "src/archive/fluent-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://react.fluentui.dev/?path=/docs/components-datagrid--docs",
    sourceUrl:
      "https://github.com/microsoft/fluentui/blob/036f9a210cd8d72924c33dd9ff0fbb16d6aae885/packages/react-components/react-table/stories/src/DataGrid/Sort.stories.tsx",
    cover: "./assets/previews/component-fluent-data-grid.png",
    preview: {
      width: 960,
      height: 480,
      url: "./examples/ui-market/index.html?item=fluent-data-grid",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Fluent UI 9.74.10 官方示例源码复用「文件排序表格」。\n\n目标行为：文件图标、作者状态、更新时间和可排序列，保留 Fluent 原版视觉。\n\n保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Fluent UI 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Sortable DataGrid from the supplied official Fluent UI 9.74.10 example.\n\nBehavior: File icons, author presence, timestamps and sortable columns with original Fluent visuals.\n\nPreserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Fluent UI dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Fluent UI 的企业界面规范用于现有业务：保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Fluent UI visual conventions to my existing content: Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "shadcn-sidebar-07",
    key: "sidebar-07",
    type: "block",
    sourceId: "shadcn-ui",
    libraryIds: ["shadcn"],
    libraryVersions: {
      shadcn: "25af02b · Radix 1.8.1",
    },
    category: "navigation",
    interactions: ["click"],
    motion: false,
    styleId: "neutral-blocks",
    style: {
      "zh-CN": "中性极简区块",
      en: "Neutral minimal blocks",
    },
    audience: "b2b",
    name: {
      "zh-CN": "可折叠侧栏布局",
      en: "Sidebar 07",
    },
    description: {
      "zh-CN": "分组导航、团队切换、用户菜单与骨架内容区域的应用布局。",
      en: "An application shell with grouped navigation, team switching, user menu and skeleton content.",
    },
    tags: {
      "zh-CN": ["可折叠侧栏布局", "页面区块", "shadcn"],
      en: ["Sidebar 07", "page block", "shadcn"],
    },
    useCases: {
      "zh-CN": "登录注册、SaaS 应用、数据产品和后台页面搭建。",
      en: "Authentication screens, SaaS applications, data products and administration layouts.",
    },
    principle: {
      "zh-CN":
        "归档解读：用稳定的布局和清晰的交互层级，建立可以替换业务内容的页面基础。分组导航、团队切换、用户菜单与骨架内容区域的应用布局。",
      en: "Archive interpretation: stable layouts and clear interaction hierarchy provide a reusable foundation for business content. An application shell with grouped navigation, team switching, user menu and skeleton content.",
    },
    rules: {
      "zh-CN": [
        "沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。",
        "本地表单演示，不连接认证服务；侧栏中的占位导航保留在本地预览。",
      ],
      en: [
        "Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.",
        "Forms are local demos without authentication services. Placeholder navigation stays inside the local preview.",
      ],
    },
    files: ["src/blocks/sidebar-07/page.tsx"],
    supportFiles: [
      "src/blocks/sidebar-07/components/app-sidebar.tsx",
      "src/styles/theme.css",
      "src/archive/block-adapter.ts",
    ],
    originalUrl: "https://ui.shadcn.com/blocks/sidebar",
    sourceUrl:
      "https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/blocks/sidebar-07/page.tsx",
    cover: "./assets/previews/block-shadcn-sidebar-07.png",
    preview: {
      width: 1280,
      height: 800,
      url: "./examples/ui-market/index.html?item=shadcn-sidebar-07",
    },
    prompt: {
      "zh-CN":
        "请使用本站提供的 shadcn/ui sidebar-07 原版源码复用「可折叠侧栏布局」。\n\n目标界面：分组导航、团队切换、用户菜单与骨架内容区域的应用布局。\n\n沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。\n使用 React、TypeScript、Tailwind CSS 和实际 Radix 组件，保留源码中的 Provider、图标、字段与布局关系。提供中文与英文、响应式布局、键盘操作和可见焦点；业务使用固定本地演示数据，不发起第三方认证。说明占位导航与真实交互的边界；可用的表格、图表和侧栏操作保留原有实现。",
      en: "Reuse Sidebar 07 from the supplied original shadcn/ui sidebar-07 source.\n\nInterface: An application shell with grouped navigation, team switching, user menu and skeleton content.\n\nPreserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.\nUse React, TypeScript, Tailwind CSS and actual Radix components. Keep providers, icons, fields and layout relationships. Include Chinese/English, responsive behavior, keyboard access and visible focus; use local fixtures and no third-party authentication. Explain placeholder navigation; retain working table, chart and sidebar interactions.",
    },
    stylePrompt: {
      "zh-CN":
        "将中性极简布局用于我的业务：沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。通过标题、帮助文本和主次按钮建立清晰层级。",
      en: "Apply neutral minimalism to my content: Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.Use titles, help text and primary/secondary actions to express hierarchy.",
    },
  },
  {
    id: "magicui-marquee",
    key: "marquee",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "cards",
    interactions: ["auto", "hover"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "无限滚动评价",
      en: "Marquee",
    },
    description: {
      "zh-CN": "两排评价卡片反向无缝滚动，悬停暂停，左右渐隐。",
      en: "Two rows of review cards scroll seamlessly in opposite directions and pause on hover.",
    },
    tags: {
      "zh-CN": ["无限滚动评价", "动效", "交互"],
      en: ["Marquee", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。两排评价卡片反向无缝滚动，悬停暂停，左右渐隐。",
      en: "Use motion to communicate focus, state and hierarchy. Two rows of review cards scroll seamlessly in opposite directions and pause on hover.",
    },
    rules: {
      "zh-CN": [
        "两排 256px 宽的细边框评价卡片，以约 20 秒循环反向滚动；两端遮罩渐隐，悬停暂停。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "Two rows of 256px review cards scroll in opposite directions on approximately 20-second loops, with fading edge masks and pause on hover.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: ["src/demos/magicui/marquee.tsx", "src/vendor/magicui/marquee.tsx"],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/marquee",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/marquee.tsx",
    cover: "./assets/previews/component-magicui-marquee.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-marquee",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「无限滚动评价」，以本站提供的 Magic UI 实际源码为基础。\n\n两排 256px 宽的细边框评价卡片，以约 20 秒循环反向滚动；两端遮罩渐隐，悬停暂停。\n\n用途：两排评价卡片反向无缝滚动，悬停暂停，左右渐隐。\n实现使用 React、TypeScript、Tailwind CSS。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Marquee in my project using the supplied actual Magic UI source.\n\nTwo rows of 256px review cards scroll in opposite directions on approximately 20-second loops, with fading edge masks and pause on hover.\n\nPurpose: Two rows of review cards scroll seamlessly in opposite directions and pause on hover.\nUse React, TypeScript and Tailwind CSS. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：两排 256px 宽的细边框评价卡片，以约 20 秒循环反向滚动；两端遮罩渐隐，悬停暂停。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: Two rows of 256px review cards scroll in opposite directions on approximately 20-second loops, with fading edge masks and pause on hover. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "antd-form",
    key: "form",
    type: "component",
    sourceId: "antd",
    libraryIds: ["antd"],
    category: "forms",
    interactions: ["click", "input"],
    motion: false,
    styleId: "enterprise-antd",
    style: {
      "zh-CN": "企业应用 · Ant Design",
      en: "Enterprise · Ant Design",
    },
    audience: "b2b",
    name: {
      "zh-CN": "校验登录表单",
      en: "Validated Form",
    },
    description: {
      "zh-CN": "带必填校验、密码输入和提交反馈的原版表单。",
      en: "An original form with required validation, password input and local submission feedback.",
    },
    tags: {
      "zh-CN": ["校验登录表单", "业务组件", "企业应用"],
      en: ["Validated Form", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。带必填校验、密码输入和提交反馈的原版表单。",
      en: "Archive interpretation: use the library’s established conventions for consistency. An original form with required validation, password input and local submission feedback.",
    },
    rules: {
      "zh-CN": [
        "保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/antd/form.tsx"],
    supportFiles: [
      "src/archive/ant-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://ant.design/components/form/#components-form-demo-basic",
    sourceUrl:
      "https://github.com/ant-design/ant-design/blob/f8f5595ab5e891fff6a2a06c5b3b98af643d008e/components/form/demo/basic.tsx",
    cover: "./assets/previews/component-antd-form.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=antd-form",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Ant Design 6.6.7 官方示例源码复用「校验登录表单」。\n\n目标行为：带必填校验、密码输入和提交反馈的原版表单。\n\n保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Ant Design 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Validated Form from the supplied official Ant Design 6.6.7 example.\n\nBehavior: An original form with required validation, password input and local submission feedback.\n\nPreserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Ant Design dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Ant Design 的企业界面规范用于现有业务：保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Ant Design visual conventions to my existing content: Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "shadcn-signup-01",
    key: "signup-01",
    type: "block",
    sourceId: "shadcn-ui",
    libraryIds: ["shadcn"],
    libraryVersions: {
      shadcn: "25af02b · Radix 1.8.1",
    },
    category: "forms",
    interactions: ["click", "input"],
    motion: false,
    styleId: "neutral-blocks",
    style: {
      "zh-CN": "中性极简区块",
      en: "Neutral minimal blocks",
    },
    audience: "b2c",
    name: {
      "zh-CN": "账户注册区块",
      en: "Signup 01",
    },
    description: {
      "zh-CN": "姓名、邮箱、密码与确认密码组成的完整原版注册布局。",
      en: "The complete original signup layout with name, email, password and confirmation.",
    },
    tags: {
      "zh-CN": ["账户注册区块", "页面区块", "shadcn"],
      en: ["Signup 01", "page block", "shadcn"],
    },
    useCases: {
      "zh-CN": "登录注册、SaaS 应用、数据产品和后台页面搭建。",
      en: "Authentication screens, SaaS applications, data products and administration layouts.",
    },
    principle: {
      "zh-CN":
        "归档解读：用稳定的布局和清晰的交互层级，建立可以替换业务内容的页面基础。姓名、邮箱、密码与确认密码组成的完整原版注册布局。",
      en: "Archive interpretation: stable layouts and clear interaction hierarchy provide a reusable foundation for business content. The complete original signup layout with name, email, password and confirmation.",
    },
    rules: {
      "zh-CN": [
        "沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。",
        "本地表单演示，不连接认证服务；侧栏中的占位导航保留在本地预览。",
      ],
      en: [
        "Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.",
        "Forms are local demos without authentication services. Placeholder navigation stays inside the local preview.",
      ],
    },
    files: ["src/blocks/signup-01/page.tsx"],
    supportFiles: [
      "src/blocks/signup-01/components/signup-form.tsx",
      "src/styles/theme.css",
      "src/archive/block-adapter.ts",
    ],
    originalUrl: "https://ui.shadcn.com/blocks/authentication",
    sourceUrl:
      "https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/blocks/signup-01/page.tsx",
    cover: "./assets/previews/block-shadcn-signup-01.png",
    preview: {
      width: 640,
      height: 800,
      url: "./examples/ui-market/index.html?item=shadcn-signup-01",
    },
    prompt: {
      "zh-CN":
        "请使用本站提供的 shadcn/ui signup-01 原版源码复用「账户注册区块」。\n\n目标界面：姓名、邮箱、密码与确认密码组成的完整原版注册布局。\n\n沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。\n使用 React、TypeScript、Tailwind CSS 和实际 Radix 组件，保留源码中的 Provider、图标、字段与布局关系。提供中文与英文、响应式布局、键盘操作和可见焦点；业务使用固定本地演示数据，不发起第三方认证。表单包含必填、邮箱及确认密码校验，不保存密码。",
      en: "Reuse Signup 01 from the supplied original shadcn/ui signup-01 source.\n\nInterface: The complete original signup layout with name, email, password and confirmation.\n\nPreserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.\nUse React, TypeScript, Tailwind CSS and actual Radix components. Keep providers, icons, fields and layout relationships. Include Chinese/English, responsive behavior, keyboard access and visible focus; use local fixtures and no third-party authentication. Validate required fields, email and matching passwords without persisting passwords.",
    },
    stylePrompt: {
      "zh-CN":
        "将中性极简布局用于我的业务：沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。通过标题、帮助文本和主次按钮建立清晰层级。",
      en: "Apply neutral minimalism to my content: Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.Use titles, help text and primary/secondary actions to express hierarchy.",
    },
  },
  {
    id: "magicui-animated-list",
    key: "animated-list",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "feedback",
    interactions: ["auto", "hover"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "动态通知列表",
      en: "Animated List",
    },
    description: {
      "zh-CN": "消息逐条进入列表，结合布局动画与轻微的悬停缩放。",
      en: "Notifications enter one at a time with layout animation and a subtle hover scale.",
    },
    tags: {
      "zh-CN": ["动态通知列表", "动效", "交互"],
      en: ["Animated List", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。消息逐条进入列表，结合布局动画与轻微的悬停缩放。",
      en: "Use motion to communicate focus, state and hierarchy. Notifications enter one at a time with layout animation and a subtle hover scale.",
    },
    rules: {
      "zh-CN": [
        "通知卡片约 400px 宽，16px 圆角、彩色图标与名称、时间、描述分层；新消息依次加入并平滑重新布局。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "Approximately 400px notification cards with 16px corners, coloured icons, names, times and descriptions; new messages enter sequentially with layout transitions.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/animated-list.tsx",
      "src/vendor/magicui/animated-list.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/animated-list",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/animated-list.tsx",
    cover: "./assets/previews/component-magicui-animated-list.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-animated-list",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「动态通知列表」，以本站提供的 Magic UI 实际源码为基础。\n\n通知卡片约 400px 宽，16px 圆角、彩色图标与名称、时间、描述分层；新消息依次加入并平滑重新布局。\n\n用途：消息逐条进入列表，结合布局动画与轻微的悬停缩放。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Animated List in my project using the supplied actual Magic UI source.\n\nApproximately 400px notification cards with 16px corners, coloured icons, names, times and descriptions; new messages enter sequentially with layout transitions.\n\nPurpose: Notifications enter one at a time with layout animation and a subtle hover scale.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：通知卡片约 400px 宽，16px 圆角、彩色图标与名称、时间、描述分层；新消息依次加入并平滑重新布局。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: Approximately 400px notification cards with 16px corners, coloured icons, names, times and descriptions; new messages enter sequentially with layout transitions. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "fluent-toast",
    key: "toast",
    type: "component",
    sourceId: "fluent",
    libraryIds: ["fluent"],
    category: "feedback",
    interactions: ["click"],
    motion: false,
    styleId: "enterprise-fluent",
    style: {
      "zh-CN": "企业应用 · Fluent UI",
      en: "Enterprise · Fluent UI",
    },
    audience: "b2b",
    name: {
      "zh-CN": "多状态通知",
      en: "Toast Intents",
    },
    description: {
      "zh-CN": "切换成功、信息、警告、错误及自定义图标，体验原版 Toast。",
      en: "Switch success, info, warning, error and custom media in original Toast notifications.",
    },
    tags: {
      "zh-CN": ["多状态通知", "业务组件", "企业应用"],
      en: ["Toast Intents", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。切换成功、信息、警告、错误及自定义图标，体验原版 Toast。",
      en: "Archive interpretation: use the library’s established conventions for consistency. Switch success, info, warning, error and custom media in original Toast notifications.",
    },
    rules: {
      "zh-CN": [
        "保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/fluent/toast.tsx"],
    supportFiles: [
      "src/archive/fluent-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://react.fluentui.dev/?path=/docs/components-toast--docs",
    sourceUrl:
      "https://github.com/microsoft/fluentui/blob/036f9a210cd8d72924c33dd9ff0fbb16d6aae885/packages/react-components/react-toast/stories/src/Toast/Intent.stories.tsx",
    cover: "./assets/previews/component-fluent-toast.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=fluent-toast",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Fluent UI 9.74.10 官方示例源码复用「多状态通知」。\n\n目标行为：切换成功、信息、警告、错误及自定义图标，体验原版 Toast。\n\n保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Fluent UI 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Toast Intents from the supplied official Fluent UI 9.74.10 example.\n\nBehavior: Switch success, info, warning, error and custom media in original Toast notifications.\n\nPreserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Fluent UI dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Fluent UI 的企业界面规范用于现有业务：保留 Fluent UI 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Fluent UI visual conventions to my existing content: Preserve Fluent UI official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "magicui-dock",
    key: "dock",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "navigation",
    interactions: ["hover"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "放大导航栏",
      en: "Dock",
    },
    description: {
      "zh-CN": "图标随鼠标靠近而放大，相邻图标平滑过渡，并显示工具提示。",
      en: "Navigation icons magnify near the pointer with smooth neighbouring transitions and tooltips.",
    },
    tags: {
      "zh-CN": ["放大导航栏", "动效", "交互"],
      en: ["Dock", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。图标随鼠标靠近而放大，相邻图标平滑过渡，并显示工具提示。",
      en: "Use motion to communicate focus, state and hierarchy. Navigation icons magnify near the pointer with smooth neighbouring transitions and tooltips.",
    },
    rules: {
      "zh-CN": [
        "水平圆角图标栏、细边框与半透明背景；根据距离通过弹簧动画放大图标，配合工具提示和键盘焦点。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "A horizontal rounded icon dock with a fine border and translucent surface; distance-based spring magnification, tooltips and keyboard focus.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: ["src/demos/magicui/dock.tsx", "src/vendor/magicui/dock.tsx"],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/dock",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/dock.tsx",
    cover: "./assets/previews/component-magicui-dock.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-dock",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「放大导航栏」，以本站提供的 Magic UI 实际源码为基础。\n\n水平圆角图标栏、细边框与半透明背景；根据距离通过弹簧动画放大图标，配合工具提示和键盘焦点。\n\n用途：图标随鼠标靠近而放大，相邻图标平滑过渡，并显示工具提示。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Dock in my project using the supplied actual Magic UI source.\n\nA horizontal rounded icon dock with a fine border and translucent surface; distance-based spring magnification, tooltips and keyboard focus.\n\nPurpose: Navigation icons magnify near the pointer with smooth neighbouring transitions and tooltips.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：水平圆角图标栏、细边框与半透明背景；根据距离通过弹簧动画放大图标，配合工具提示和键盘焦点。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: A horizontal rounded icon dock with a fine border and translucent surface; distance-based spring magnification, tooltips and keyboard focus. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "antd-modal-form",
    key: "modal-form",
    type: "block",
    sourceId: "antd",
    libraryIds: ["antd"],
    category: "forms",
    interactions: ["click", "input"],
    motion: false,
    styleId: "enterprise-antd",
    style: {
      "zh-CN": "企业应用 · Ant Design",
      en: "Enterprise · Ant Design",
    },
    audience: "b2b",
    name: {
      "zh-CN": "弹窗创建表单",
      en: "Modal Creation Form",
    },
    description: {
      "zh-CN": "在原版 Modal 中填写集合信息，校验后展示本地提交结果。",
      en: "Enter collection details in the original Modal, validate and display the local result.",
    },
    tags: {
      "zh-CN": ["弹窗创建表单", "业务组件", "企业应用"],
      en: ["Modal Creation Form", "business", "enterprise"],
    },
    useCases: {
      "zh-CN": "企业管理、协作工具与需要清晰信息层级的业务界面。",
      en: "Administration, collaboration tools and information-dense business interfaces.",
    },
    principle: {
      "zh-CN":
        "归档解读：以组件库既有规范保证一致性。在原版 Modal 中填写集合信息，校验后展示本地提交结果。",
      en: "Archive interpretation: use the library’s established conventions for consistency. Enter collection details in the original Modal, validate and display the local result.",
    },
    rules: {
      "zh-CN": [
        "保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。",
        "保留键盘焦点、状态文本、输入校验和原版弹层行为。",
      ],
      en: [
        "Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.",
        "Keep keyboard focus, state text, input validation and original portal behavior.",
      ],
    },
    files: ["src/demos/antd/modal-form.tsx"],
    supportFiles: [
      "src/archive/ant-provider.tsx",
      "src/archive/i18n.ts",
      "src/archive/zh.json",
    ],
    originalUrl:
      "https://ant.design/components/form/#components-form-demo-form-in-modal",
    sourceUrl:
      "https://github.com/ant-design/ant-design/blob/f8f5595ab5e891fff6a2a06c5b3b98af643d008e/components/form/demo/form-in-modal.tsx",
    cover: "./assets/previews/block-antd-modal-form.png",
    preview: {
      width: 960,
      height: 600,
      url: "./examples/ui-market/index.html?item=antd-modal-form",
    },
    prompt: {
      "zh-CN":
        "请基于本站提供的 Ant Design 6.6.7 官方示例源码复用「弹窗创建表单」。\n\n目标行为：在原版 Modal 中填写集合信息，校验后展示本地提交结果。\n\n保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。\n使用 React、TypeScript 及真实 Ant Design 依赖，保留必要 Provider、主题与组件结构。提供本地示例数据、中文与英文界面、键盘焦点和可读的状态反馈。表单数据不发送到外部，密码不持久化。范围限于当前组件或区块。",
      en: "Reuse Modal Creation Form from the supplied official Ant Design 6.6.7 example.\n\nBehavior: Enter collection details in the original Modal, validate and display the local result.\n\nPreserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens.\nUse React, TypeScript and the actual Ant Design dependency, preserving its provider, theme and component structure. Include local fixtures, Chinese/English, keyboard focus and readable feedback. Send no form data externally and never persist passwords. Keep the scope to this component or block.",
    },
    stylePrompt: {
      "zh-CN":
        "将 Ant Design 的企业界面规范用于现有业务：保留 Ant Design 官方组件、语义色、排版、间距和交互；仅替换业务数据。桌面按原版结构展示，窄屏表单换行、表格横向滚动。 强调标签、状态和操作的层级，保持信息密度与可读性。",
      en: "Apply Ant Design visual conventions to my existing content: Preserve Ant Design official components, semantic colours, typography, spacing and interactions; replace business data only. Keep the original desktop structure, wrap forms and scroll wide tables on narrow screens. Clarify labels, states and actions while retaining readable density.",
    },
  },
  {
    id: "magicui-blur-fade",
    key: "blur-fade",
    type: "component",
    sourceId: "magicui",
    libraryIds: ["magicui"],
    category: "text",
    interactions: ["scroll"],
    motion: true,
    styleId: "motion-neutral",
    style: {
      "zh-CN": "中性动效",
      en: "Neutral motion",
    },
    audience: "b2c",
    name: {
      "zh-CN": "模糊渐入",
      en: "Blur Fade",
    },
    description: {
      "zh-CN": "标题与副标题依次从模糊、偏移和透明状态进入。",
      en: "A heading and subheading enter sequentially from blur, offset and transparency.",
    },
    tags: {
      "zh-CN": ["模糊渐入", "动效", "交互"],
      en: ["Blur Fade", "motion", "interactive"],
    },
    useCases: {
      "zh-CN": "适合品牌网站、产品介绍、个人作品集与需要明确交互反馈的界面。",
      en: "Brand sites, product pages, portfolios and interfaces requiring clear feedback.",
    },
    principle: {
      "zh-CN":
        "让运动表达焦点、状态和内容层级。标题与副标题依次从模糊、偏移和透明状态进入。",
      en: "Use motion to communicate focus, state and hierarchy. A heading and subheading enter sequentially from blur, offset and transparency.",
    },
    rules: {
      "zh-CN": [
        "标题与副标题上下排列，从 6px 模糊及 6px 偏移渐入；时长 0.4 秒、easeOut，分别延迟约 0.25 和 0.5 秒。",
        "沿用上游组件、布局和主题变量；窄屏保持内容可读。",
        "尊重减少动态效果偏好，保留键盘操作和可见焦点。",
      ],
      en: [
        "Stacked heading and subheading enter from 6px blur and offset over 0.4 seconds with easeOut, delayed approximately 0.25 and 0.5 seconds.",
        "Preserve upstream components, layout and theme variables, maintaining readability on narrow screens.",
        "Respect reduced motion and retain keyboard access and visible focus.",
      ],
    },
    files: [
      "src/demos/magicui/blur-fade.tsx",
      "src/vendor/magicui/blur-fade.tsx",
    ],
    supportFiles: [
      "src/styles/magic-animations.css",
      "src/archive/settings.tsx",
      "src/lib/utils.ts",
    ],
    originalUrl: "https://magicui.design/docs/components/blur-fade",
    sourceUrl:
      "https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/blur-fade.tsx",
    cover: "./assets/previews/component-magicui-blur-fade.png",
    preview: {
      width: 640,
      height: 480,
      url: "./examples/ui-market/index.html?item=magicui-blur-fade",
    },
    prompt: {
      "zh-CN":
        "请在我的项目中复用「模糊渐入」，以本站提供的 Magic UI 实际源码为基础。\n\n标题与副标题上下排列，从 6px 模糊及 6px 偏移渐入；时长 0.4 秒、easeOut，分别延迟约 0.25 和 0.5 秒。\n\n用途：标题与副标题依次从模糊、偏移和透明状态进入。\n实现使用 React、TypeScript、Tailwind CSS 和 Motion。保留上游组件实现及必要样式、依赖和上下文，仅替换业务文案。提供响应式布局、键盘焦点及减少动态效果支持。不要把该效果扩写为一个完整后台系统。",
      en: "Reuse Blur Fade in my project using the supplied actual Magic UI source.\n\nStacked heading and subheading enter from 6px blur and offset over 0.4 seconds with easeOut, delayed approximately 0.25 and 0.5 seconds.\n\nPurpose: A heading and subheading enter sequentially from blur, offset and transparency.\nUse React, TypeScript and Tailwind CSS with Motion. Keep the upstream implementation, necessary styles, dependencies and context; replace business copy. Include responsive layout, keyboard focus and reduced-motion support. Keep the requested resource scope.",
    },
    stylePrompt: {
      "zh-CN":
        "将以下视觉与运动规则用于我的业务，保留现有信息架构：标题与副标题上下排列，从 6px 模糊及 6px 偏移渐入；时长 0.4 秒、easeOut，分别延迟约 0.25 和 0.5 秒。 使用中性明暗表面、细边框、清晰文字和原版交互反馈。",
      en: "Apply these visual and motion rules to my content, preserving its structure: Stacked heading and subheading enter from 6px blur and offset over 0.4 seconds with easeOut, delayed approximately 0.25 and 0.5 seconds. Use neutral surfaces, fine borders, readable text and the original feedback.",
    },
  },
  {
    id: "shadcn-dashboard-01",
    key: "dashboard-01",
    type: "block",
    sourceId: "shadcn-ui",
    libraryIds: ["shadcn"],
    libraryVersions: {
      shadcn: "25af02b · Radix 1.8.1",
    },
    category: "layout",
    interactions: ["click"],
    motion: false,
    styleId: "neutral-blocks",
    style: {
      "zh-CN": "中性极简区块",
      en: "Neutral minimal blocks",
    },
    audience: "b2b",
    name: {
      "zh-CN": "数据看板区块",
      en: "Dashboard 01",
    },
    description: {
      "zh-CN": "侧栏、指标卡、时间范围趋势图和可操作数据表组成的原版看板。",
      en: "An original dashboard with sidebar, metrics, time-range chart and interactive data table.",
    },
    tags: {
      "zh-CN": ["数据看板区块", "页面区块", "shadcn"],
      en: ["Dashboard 01", "page block", "shadcn"],
    },
    useCases: {
      "zh-CN": "登录注册、SaaS 应用、数据产品和后台页面搭建。",
      en: "Authentication screens, SaaS applications, data products and administration layouts.",
    },
    principle: {
      "zh-CN":
        "归档解读：用稳定的布局和清晰的交互层级，建立可以替换业务内容的页面基础。侧栏、指标卡、时间范围趋势图和可操作数据表组成的原版看板。",
      en: "Archive interpretation: stable layouts and clear interaction hierarchy provide a reusable foundation for business content. An original dashboard with sidebar, metrics, time-range chart and interactive data table.",
    },
    rules: {
      "zh-CN": [
        "沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。",
        "本地表单演示，不连接认证服务；侧栏中的占位导航保留在本地预览。",
      ],
      en: [
        "Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.",
        "Forms are local demos without authentication services. Placeholder navigation stays inside the local preview.",
      ],
    },
    files: ["src/blocks/dashboard-01/page.tsx"],
    supportFiles: [
      "src/blocks/dashboard-01/components/app-sidebar.tsx",
      "src/styles/theme.css",
      "src/archive/block-adapter.ts",
    ],
    originalUrl: "https://ui.shadcn.com/blocks/dashboard",
    sourceUrl:
      "https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/blocks/dashboard-01/page.tsx",
    cover: "./assets/previews/block-shadcn-dashboard-01.png",
    preview: {
      width: 1280,
      height: 800,
      url: "./examples/ui-market/index.html?item=shadcn-dashboard-01",
    },
    prompt: {
      "zh-CN":
        "请使用本站提供的 shadcn/ui dashboard-01 原版源码复用「数据看板区块」。\n\n目标界面：侧栏、指标卡、时间范围趋势图和可操作数据表组成的原版看板。\n\n沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。\n使用 React、TypeScript、Tailwind CSS 和实际 Radix 组件，保留源码中的 Provider、图标、字段与布局关系。提供中文与英文、响应式布局、键盘操作和可见焦点；业务使用固定本地演示数据，不发起第三方认证。说明占位导航与真实交互的边界；可用的表格、图表和侧栏操作保留原有实现。",
      en: "Reuse Dashboard 01 from the supplied original shadcn/ui dashboard-01 source.\n\nInterface: An original dashboard with sidebar, metrics, time-range chart and interactive data table.\n\nPreserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.\nUse React, TypeScript, Tailwind CSS and actual Radix components. Keep providers, icons, fields and layout relationships. Include Chinese/English, responsive behavior, keyboard access and visible focus; use local fixtures and no third-party authentication. Explain placeholder navigation; retain working table, chart and sidebar interactions.",
    },
    stylePrompt: {
      "zh-CN":
        "将中性极简布局用于我的业务：沿用 shadcn/ui 原版组件、圆角、边框、语义色和留白。登录与注册居中展示；应用布局保留桌面侧栏和窄屏抽屉。通过标题、帮助文本和主次按钮建立清晰层级。",
      en: "Apply neutral minimalism to my content: Preserve original shadcn/ui components, corners, borders, semantic colours and spacing. Centre auth forms; retain desktop sidebars and narrow-screen sheets in application layouts.Use titles, help text and primary/secondary actions to express hierarchy.",
    },
  },
];
export const marketSources = {
  magicui: {
    id: "magicui",
    name: "Magic UI",
    author: "Magic UI contributors",
    repo: "https://github.com/magicuidesign/magicui",
    docs: "https://magicui.design/",
    commit: "efe76fc5755eca1142dd4f74c1d6f0ace2887e3c",
    license: "MIT",
    licenseFile: "./examples/ui-market/licenses/magicui-LICENSE.md",
  },
  antd: {
    id: "antd",
    name: "Ant Design",
    author: "Ant Group and Ant Design contributors",
    repo: "https://github.com/ant-design/ant-design",
    docs: "https://ant.design/",
    commit: "f8f5595ab5e891fff6a2a06c5b3b98af643d008e",
    license: "MIT",
    licenseFile: "./examples/ui-market/licenses/antd-LICENSE",
  },
  fluent: {
    id: "fluent",
    name: "Fluent UI React v9",
    author: "Microsoft and Fluent UI contributors",
    repo: "https://github.com/microsoft/fluentui",
    docs: "https://react.fluentui.dev/",
    commit: "036f9a210cd8d72924c33dd9ff0fbb16d6aae885",
    license: "MIT",
    licenseFile: "./examples/ui-market/licenses/fluentui-LICENSE",
  },
  "shadcn-ui": {
    id: "shadcn-ui",
    name: "shadcn/ui Blocks",
    author: "shadcn and contributors",
    repo: "https://github.com/shadcn-ui/ui",
    docs: "https://ui.shadcn.com/blocks",
    commit: "25af02b1b467fcd53b63e0c6d6d324c57c16ef18",
    license: "MIT",
    licenseFile: "./examples/ui-market/licenses/shadcn-ui-LICENSE.md",
  },
};
export const marketLibraries = {
  magicui: {
    id: "magicui",
    name: "Magic UI",
    version: "efe76fc · Motion 12.43.0",
    docs: "https://magicui.design/",
    aliases: ["MagicUI", "动效", "motion"],
  },
  antd: {
    id: "antd",
    name: "Ant Design",
    version: "6.6.7",
    docs: "https://ant.design/",
    aliases: ["Ant Design", "antd", "蚂蚁", "阿里", "Ant Group"],
  },
  fluent: {
    id: "fluent",
    name: "Fluent UI React v9",
    version: "9.74.10",
    docs: "https://react.fluentui.dev/",
    aliases: ["Fluent", "Fluent UI", "Microsoft", "微软"],
  },
};

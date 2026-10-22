// 所有案例均为本站原创的虚构演示项目。资源链接表示可选实现参考，本站预览使用原生 HTML/CSS。
export const resources = [
  { id: 'shadcn', name: 'shadcn/ui', mark: 's/', label: '组件与组合参考', url: 'https://ui.shadcn.com/docs/components', description: '查阅按钮、卡片、表格、表单等组件的结构，作为 React 项目中组合界面的参考。', use: '选中视觉风格后，再按需采用和定制组件。' },
  { id: 'radix', name: 'Radix Primitives', mark: 'R', label: '交互与无障碍参考', url: 'https://www.radix-ui.com/primitives/docs/overview/introduction', description: '无样式的交互基础组件，提供对话框、菜单等组件的键盘导航、焦点管理和 ARIA 行为。', use: '适合需要自定义外观的 React 弹窗、菜单和选择器。' },
  { id: 'daisy', name: 'daisyUI', mark: '✿', label: '主题与样式参考', url: 'https://daisyui.com/components/', description: '查看基于 Tailwind CSS 的组件样式及主题，比较导航、卡片、按钮等常用模块的组织方式。', use: '适合需要快速搭建统一主题的 Tailwind CSS 项目。' },
];

export const styles = [
  {
    id: 'folio', name: 'Morrow', subtitle: '编辑式个人作品集', style: '编辑感', english: 'EDITORIAL PORTFOLIO',
    summary: '像翻开一本独立杂志，让作品和文字一起被看见。',
    description: '为独立设计师、研究者与创作者设计的个人作品集。用温暖纸色、衬线标题和不对称网格建立阅读节奏，让项目背景与过程和最终作品一起呈现。',
    scene: '个人作品集', tags: ['编辑感', '暖色', '作品集'], palette: ['#f3efe6', '#272822', '#78836b', '#d5bca6'],
    tokens: { background: '#f3efe6', surface: '#fffdf8', text: '#272822', accent: '#78836b', border: '#ded9ce', radius: '4px', font: 'Georgia / Noto Serif SC / 宋体', spacing: '8 / 16 / 24 / 48 / 80px' },
    principle: '以编辑排版表达个人气质。标题使用衬线字体，正文采用清楚的无衬线字体；用细分割线、连续编号和大留白组织项目，避免装饰抢过作品本身。',
    rules: ['内容区最大宽度 1120px，桌面采用 12 列网格，手机改为单列。', '大标题 64–88px，正文 16px、行高 1.7；移动端标题缩为 40px。', '以细线区分内容，圆角 4px；主按钮使用深色实底，辅助动作用文字链接。', '图片区域采用明确比例；hover 只增加下划线或轻微位移，尊重减少动态效果设置。'],
    pages: [{ id: 'home', name: '首页', detail: '导航、介绍首屏、精选作品、服务、联系与页脚。' }, { id: 'work', name: '作品详情', detail: '项目背景、问题、设计过程、成果展示与下一项目入口。' }, { id: 'about', name: '关于与联系', detail: '个人介绍、工作方法、服务范围和可验证的联系表单。' }],
    brief: '为独立创作者制作个人作品集。先在首屏说明身份和工作方向，再展示 3 个精选项目、服务与联系入口。作品详情应包含背景、任务、过程与结果。关于页包含简介、工作方法和联系表单。',
    modules: ['导航与身份', '介绍首屏', '精选作品', '工作方法', '联系表单', '页脚'], libraries: ['shadcn', 'radix'],
    notes: '作品名称、项目描述与联系信息均为演示内容。正式使用时替换为自己的作品，并取得图片授权。',
  },
  {
    id: 'orbit', name: 'Orbit', subtitle: '深色 SaaS 项目工作台', style: '深色科技', english: 'SAAS WORKSPACE',
    summary: '把复杂任务放进清晰的秩序，让重要信息自然浮现。',
    description: '面向开发团队的项目工作台。用分层深色背景、精确间距和有限的蓝紫强调色，组织概览指标、项目列表、任务状态与设置。',
    scene: 'SaaS / 后台', tags: ['深色科技', '深色', 'SaaS'], palette: ['#13151c', '#20232e', '#b0a2ff', '#a6dbca'],
    tokens: { background: '#13151c', surface: '#1c1f29', text: '#f0f0f5', accent: '#b0a2ff', border: '#353946', radius: '12px', font: 'Inter / Segoe UI / 系统无衬线', spacing: '4 / 8 / 12 / 20 / 32px' },
    principle: '以信息可扫描性为优先。深色基底通过亮度区分层级，主动作与选中状态使用蓝紫强调色；数据用表格和清楚的标签呈现，避免用大面积发光影响阅读。',
    rules: ['桌面侧栏 208px，主内容最大宽度 1280px；手机使用折叠导航。', '页面标题 28–36px，数据值 32px，正文 14–16px；数字使用等宽排列。', '卡片使用 1px 边框与 12px 圆角，交互态提升背景亮度。', '状态同时提供文字与颜色。表格在手机上允许横向滚动，焦点环始终可见。'],
    pages: [{ id: 'home', name: '工作台概览', detail: '侧栏、概览指标、活动图、近期项目、活动记录。' }, { id: 'work', name: '项目管理', detail: '状态筛选、项目列表、项目创建表单与反馈。' }, { id: 'about', name: '工作区设置', detail: '基本信息、通知偏好、保存与结果提示。' }],
    brief: '为开发团队设计项目管理 SaaS 工作台。概览展示演示指标、活动趋势、近期项目与动态；项目页支持状态筛选与本地添加项目；设置页包含工作区名称和通知偏好，并提供保存反馈。',
    modules: ['工作区导航', '数据概览', '活动图', '项目表格', '创建项目', '偏好设置'], libraries: ['shadcn', 'radix'],
    notes: '指标和活动图为演示数据。项目与设置交互仅保存在当前浏览器，不连接真实团队服务。',
  },
  {
    id: 'forma', name: 'Forma', subtitle: '瑞士风格创意工作室', style: '瑞士极简', english: 'CREATIVE STUDIO',
    summary: '用字体、网格和一个鲜明的颜色，说清楚设计的立场。',
    description: '面向小型设计工作室的品牌网站。黑白网格、超大字级、荧光黄绿与直接的动词一起构成清楚的视觉识别，适合展示品牌、数字产品与视觉设计服务。',
    scene: '工作室 / 品牌', tags: ['瑞士极简', '高对比', '工作室'], palette: ['#f3f3ef', '#191b18', '#d2ed4e', '#c4c6be'],
    tokens: { background: '#f3f3ef', surface: '#ffffff', text: '#191b18', accent: '#d2ed4e', border: '#c4c6be', radius: '0px', font: 'Arial / Helvetica / 系统无衬线', spacing: '8 / 16 / 32 / 64 / 96px' },
    principle: '让字体和网格承担视觉表达。所有元素对齐明确的列线，使用高对比字号和极少的颜色，通过编号、规则线和几何构图建立秩序。',
    rules: ['桌面 12 列，区块之间使用 1px 规则线；手机保持左右 20px 边距。', '大标题采用粗体无衬线，字距略紧；正文限制为 60–70 个字符宽。', '组件默认直角，强调色只用于主要行动、标记和重点作品。', '动效采用 160ms 的颜色或位移变化，链接保留下划线和明确焦点态。'],
    pages: [{ id: 'home', name: '工作室首页', detail: '品牌宣言、精选项目、服务能力、合作流程与页脚。' }, { id: 'work', name: '项目档案', detail: '项目目录、分类筛选、交付范围与作品构图。' }, { id: 'about', name: '合作咨询', detail: '项目类型、预算范围、需求说明和本地提交反馈。' }],
    brief: '为独立创意工作室制作品牌网站。首页包含品牌宣言、精选项目、三类服务与四步合作流程；项目页支持类型筛选；合作页使用简洁表单收集项目方向、预算和需求说明，并明确演示提交状态。',
    modules: ['品牌导航', '宣言首屏', '项目网格', '服务清单', '合作流程', '咨询表单'], libraries: ['radix', 'shadcn'],
    notes: '项目名称及服务内容为原创演示文案，表单不会发送给真实工作室。',
  },
  {
    id: 'bloom', name: 'Bloom', subtitle: '自然系生活方式商店', style: '自然柔和', english: 'LIFESTYLE STORE',
    summary: '温柔的色彩、舒展的留白，让日常的物件慢慢被喜欢。',
    description: '为家居、手作和生活方式品牌设计的小型商店。奶油白与森林绿构成安静的基础，柔和圆角承托商品。列表、商品详情和购物袋形成完整浏览路径。',
    scene: '电商 / 生活方式', tags: ['自然柔和', '暖色', '电商'], palette: ['#f7f5ed', '#305744', '#e8bd9e', '#e4e9dc'],
    tokens: { background: '#f7f5ed', surface: '#fffef9', text: '#244536', accent: '#305744', border: '#dce1d5', radius: '18px', font: 'Georgia 标题 / 系统无衬线正文', spacing: '8 / 16 / 24 / 40 / 72px' },
    principle: '把商品的触感转译为视觉节奏。低饱和色、大圆角和自然留白让页面柔和；商品名称、价格、规格和行动按钮保持清楚，装饰不阻碍购物路径。',
    rules: ['桌面商品网格 3 列，手机 1–2 列；主要内容宽度 1160px。', '标题使用柔和衬线体，正文 16px；价格与购买按钮保持稳定的位置。', '卡片圆角 18px，按钮圆角 999px；森林绿用于可点击的主动作。', '商品图使用本地 CSS 几何插画作为演示，实际商品应补齐照片、库存、物流和退换政策。'],
    pages: [{ id: 'home', name: '商品首页', detail: '导航、品牌首屏、分类筛选、商品网格、品牌理念与页脚。' }, { id: 'work', name: '商品详情', detail: '商品插画、价格、规格、数量、加入购物袋与材质说明。' }, { id: 'about', name: '购物袋', detail: '本地商品数量调整、删除、金额合计及演示结算反馈。' }],
    brief: '制作自然系生活方式商店。首页包含品牌首屏、分类与商品列表；商品页展示插画、名称、价格、规格、数量和材质信息；购物袋支持数量增减、移除与金额计算。标明所有商品、价格与结算为演示。',
    modules: ['商店导航', '品牌首屏', '商品卡片', '分类筛选', '商品详情', '购物袋'], libraries: ['daisy', 'radix'],
    notes: '商品、价格与商品插画均为演示。购物袋保存在浏览器中，结算不产生订单或支付。',
  },
];

export const kinds = [
  { id: 'button', name: '按钮', english: 'BUTTON', icon: 'pointer', subtitle: '主次行动与交互状态', context: '首屏行动、表单提交、工具栏操作', requirement: '提供主按钮、次按钮与禁用态；hover 提升对比或轻微位移，active 提供按压反馈，focus-visible 使用 2px 焦点环；使用原生 button，提交期间显示加载状态并防止重复提交。' },
  { id: 'card', name: '卡片', english: 'CARD', icon: 'square', subtitle: '内容与项目的容器', context: '项目列表、商品展示、内容推荐', requirement: '卡片包含视觉区域、类别、标题、简短说明与明确行动；标题最多两行，保持相邻卡片对齐；可点击卡片使用可聚焦的链接，避免嵌套交互元素。手机改为单列并保持合理内边距。' },
  { id: 'navigation', name: '导航', english: 'NAVIGATION', icon: 'menu', subtitle: '清楚的页面方向', context: '网站顶部导航、工作台导航', requirement: '导航包含品牌、三个主要入口与一个主操作，当前页使用 aria-current；桌面横向排列，窄屏通过 details/summary 展开，支持键盘访问与明显焦点态，不隐藏关键入口。' },
  { id: 'form', name: '表单', english: 'FORM', icon: 'form', subtitle: '标签、输入与校验', context: '注册、联系、项目创建、设置', requirement: '使用可见 label 与关联的输入 id；邮箱字段使用 type=email，必填字段标注 required；提供帮助文本和与字段关联的错误反馈，提交成功后使用 aria-live 展示结果。占位符不能替代标签。' },
  { id: 'pricing', name: '方案卡', english: 'PLAN CARD', icon: 'layers', subtitle: '服务与方案选择', context: '服务报价、SaaS 套餐、会员', requirement: '展示方案名、价格及计费单位、适合对象、三个功能与明确的选择动作；推荐方案提供文字标识；不预选付费订阅，不使用虚构折扣。手机垂直排列，所有演示价格清楚标注。' },
  { id: 'stats', name: '数据概览', english: 'STATISTICS', icon: 'chart', subtitle: '信息重点与趋势', context: '工作台概览、研究指标、项目进度', requirement: '显示指标名、数据值、单位与对比时间范围；趋势同时使用符号和文字，避免仅用颜色传达好坏；数字使用 tabular-nums，标明演示数据；手机保持两列或单列。' },
  { id: 'table', name: '表格', english: 'DATA TABLE', icon: 'table', subtitle: '结构化信息与状态', context: '项目管理、订单列表、资源目录', requirement: '使用语义化 table、thead、tbody 和带 scope 的列标题；包含名称、状态、日期；状态用文本标签表达；窄屏放入可横向滚动的容器，并保留可读字号。演示条目不得伪装为真实业务数据。' },
  { id: 'dialog', name: '对话框', english: 'DIALOG', icon: 'square', subtitle: '聚焦一次明确操作', context: '确认操作、保存设计、创建项目', requirement: '使用原生 dialog，通过 showModal 打开；关联标题和说明，支持 Esc、关闭按钮，关闭后恢复触发元素焦点；打开时背景不可交互。清楚区分取消和确认，不把危险操作设为默认焦点。' },
];

export const components = styles.flatMap(style => kinds.map(kind => ({
  id: `${style.id}-${kind.id}`, styleId: style.id, kindId: kind.id,
  name: `${style.name} ${kind.name}`, description: `${style.subtitle}中的${kind.name}设计。${kind.subtitle}，沿用${style.style}的字体、色彩与空间规则。`,
})));

export const getStyle = id => styles.find(style => style.id === id);
export const getKind = id => kinds.find(kind => kind.id === id);
export const getComponent = id => components.find(component => component.id === id);
export function globalPrompt(style) {
  return `你是一位资深 UI 设计师。请为我的项目采用「${style.name} · ${style.style}」设计方向。\n\n设计理念：${style.principle}\n\n设计变量：\n${Object.entries(style.tokens).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\n排版与交互规则：\n${style.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}\n\n使用语义化 HTML，支持键盘操作、清楚的焦点态与 prefers-reduced-motion。为 375px 手机、768px 平板与 1440px 桌面设计。所有案例数据须标明为演示；不要虚构真实客户、业绩和评价。请根据实际项目替换品牌和内容，并说明必要的交互状态。`;
}
export function modulePrompt(component, includeGlobal = false) {
  const style = getStyle(component.styleId), kind = getKind(component.kindId);
  const local = `模块：${component.name}\n使用场景：${kind.context}\n\n设计目标：${component.description}\n\n实施要求：${kind.requirement}\n\n外观必须遵守 ${style.name} 的设计变量：背景 ${style.tokens.background}，表面 ${style.tokens.surface}，文字 ${style.tokens.text}，强调色 ${style.tokens.accent}，边框 ${style.tokens.border}，圆角 ${style.tokens.radius}。\n\n请输出可复用的组件实现，包含必要的样式、响应式布局、交互与状态说明。独立生成时，请一并采用整体设计理念。`;
  return includeGlobal ? `${globalPrompt(style)}\n\n--- 模块要求 ---\n\n${local}` : local;
}
export function casePrompt(style) {
  return `${globalPrompt(style)}\n\n--- 项目任务 ---\n项目名称：${style.name}\n项目类型：${style.subtitle}\n${style.brief}\n\n页面清单：\n${style.pages.map(page => `- ${page.name}：${page.detail}`).join('\n')}\n\n模块组成：${style.modules.join('、')}。\n\n请先给出信息架构与设计变量，再实现页面与响应式行为。导航、筛选、表单与状态反馈应可用。数据来源与后端能力须如实说明；没有后端时标明本地演示。\n\n案例使用说明：${style.notes}`;
}

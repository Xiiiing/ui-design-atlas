# 资源文案与演示一致性核对

本轮对当前 97 项逐项核对目录文案和本地交付实现。按共享实现审阅 32 个原创组件的 8 种结构及 4 种主题，分别核对 12 个原创页面、4 个原创案例、15 个 Shadcn Admin 资源，以及 34 个 UI Market 资源。此记录证明源码核对范围；浏览器验证的实际范围与结果另列于下方，不能将源码核对视作 97 项逐项视觉验收。

## 维护规则

- 图鉴介绍、用途、设计解读、规则与两种提示词只在 content/resources.json 维护。data.js 服务原创演示本身，不作为图鉴文案来源。
- 当前资源提示词写清范围、实际结构/字段/参数与本地操作边界；组件不混入整站网格、页面清单和通用空态/提交要求。完整案例描述实际页面集合。
- 风格提示词只迁移视觉关系，不附加业务流程；使用基础配色时注明其他主题以交付 CSS 为准。
- 只有已核实的尺寸/默认值才写数值。修改相应源码后重新核对，不能靠字段非空或包含名称来证明语义正确。
- 双语含义一致；明确内存状态、localStorage、占位链接、未连接的认证、邮件和支付。保留来源与许可，不把本站适配后的行为一概归为上游原版。

## 已修正的差异

Ant Design 表格没有状态列，四条数据只有一页；login-01 没有确认密码；Morrow 首屏为 58px/70px/46px/44px 的实际断点，正文基准为 14px。Morrow 两个首页作品进入同一详情，详情末尾进入联系页。Bloom 有三件演示商品，手机两列。Orbit 手机隐藏侧栏并保留顶部导航，不提供抽屠菜单。Fluent 文件表格最后一列是不可排序的最近操作。UI Market 的业务搜索结果区为占位；文档建议不打开文档；演示收藏不连接图鉴收藏；重新设置保留名称；暂停关键词时回到首词。

旧搜索词 folio 通过已有 aliases 字段显式保留在 12 个 Morrow 资源上。搜索与分享链接不再依赖介绍中的 portfolio 子串；新增单元测试在替换介绍后继续验证别名可用。

## 逐项源码核对清单

下表的 UI Market `src/` 路径相对于 `examples/ui-market/`。

|资源键|主要核对实现|核对结果|
|---|---|---|
|component:magicui-border-beam|src/demos/magicui/border-beam.tsx、src/vendor/magicui/border-beam.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:antd-table|src/demos/antd/table.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-ripple-button|src/demos/magicui/ripple-button.tsx、src/vendor/magicui/ripple-button.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:fluent-dialog|src/demos/fluent/dialog.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:magicui-bento-grid|src/demos/magicui/bento-grid.tsx、src/vendor/magicui/bento-grid.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-particles|src/demos/magicui/particles.tsx、src/vendor/magicui/particles.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:fluent-toolbar|src/demos/fluent/toolbar.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-shimmer-button|src/demos/magicui/shimmer-button.tsx、src/vendor/magicui/shimmer-button.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:antd-search|src/demos/antd/search.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-text-animate|src/demos/magicui/text-animate.tsx、src/vendor/magicui/text-animate.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:shadcn-login-01|src/blocks/login-01/page.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-magic-card|src/demos/magicui/magic-card.tsx、src/vendor/magicui/magic-card.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-number-ticker|src/demos/magicui/number-ticker.tsx、src/vendor/magicui/number-ticker.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:fluent-data-grid|src/demos/fluent/data-grid.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:shadcn-sidebar-07|src/blocks/sidebar-07/page.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-marquee|src/demos/magicui/marquee.tsx、src/vendor/magicui/marquee.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:antd-form|src/demos/antd/form.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:shadcn-signup-01|src/blocks/signup-01/page.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-animated-list|src/demos/magicui/animated-list.tsx、src/vendor/magicui/animated-list.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:fluent-toast|src/demos/fluent/toast.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-dock|src/demos/magicui/dock.tsx、src/vendor/magicui/dock.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:antd-modal-form|src/demos/antd/modal-form.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-blur-fade|src/demos/magicui/blur-fade.tsx、src/vendor/magicui/blur-fade.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|block:shadcn-dashboard-01|src/blocks/dashboard-01/page.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:atlas-upload|src/demos/atlas/upload.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:atlas-steps|src/demos/atlas/steps.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:atlas-search|src/demos/atlas/search.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:atlas-feedback|src/demos/atlas/feedback.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:atlas-file-workspace|src/demos/atlas/file-workspace.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:atlas-onboarding-page|src/demos/atlas/onboarding-page.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:atlas-product-page|src/demos/atlas/product-page.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-word-rotate|src/demos/magicui/word-rotate.tsx、src/vendor/magicui/word-rotate.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-shine-border|src/demos/magicui/shine-border.tsx、src/vendor/magicui/shine-border.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:magicui-meteors|src/demos/magicui/meteors.tsx、src/vendor/magicui/meteors.tsx|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-sidebar|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-metric-cards|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-trend-chart|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-task-table|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-filter-toolbar|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-task-drawer|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-user-dialog|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:shadcn-admin-settings-form|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-button|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-card|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-navigation|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-form|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-pricing|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-stats|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-table|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:folio-dialog|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-button|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-card|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-navigation|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-form|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-pricing|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-stats|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-table|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:orbit-dialog|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-button|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-card|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-navigation|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-form|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-pricing|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-stats|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-table|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:forma-dialog|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-button|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-card|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-navigation|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-form|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-pricing|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-stats|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-table|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|component:bloom-dialog|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:shadcn-admin-dashboard|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:shadcn-admin-tasks|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:shadcn-admin-users|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:shadcn-admin-profile|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:shadcn-admin-appearance|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:shadcn-admin-notifications|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:folio-home|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:folio-work|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:folio-about|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:orbit-home|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:orbit-work|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:orbit-about|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:forma-home|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:forma-work|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:forma-about|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:bloom-home|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:bloom-work|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|page:bloom-about|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|case:shadcn-admin|examples/shadcn-admin/src/archive/、features/、components/layout/；store.ts 与实际表单 schema|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|case:folio|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|case:orbit|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|case:forma|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|
|case:bloom|components.js（32组件）；preview.js、preview.css（12页面/4案例）；components.css（四种主题）|已校准双语介绍、用途、规则和两种提示词；保留演示实现|

## 本地验收证据

对应实现提交 `abbea30`（2026-10-25）；后续文档提交不改变测试源码。生产构建与 `test:built` 分开执行，复用本次已知构建；Playwright 配置禁止复用未知服务器。

- `npm run check`：目录、交付、严格类型检查及 12 项单元测试通过。新增别名测试替换描述后，仍能找到全部 12 个 Morrow 资源，并保持旧表单筛选链接的结果。
- `npm run build`：主站、两个示例、详情、源码清单与下载包生成成功；主文档启动脚本 gzip 总量为 186,828 字节，低于 190,000 字节预算。
- `npm run test:built`：126 项全部通过，Chromium 116 项，Firefox/WebKit 各 5 项；0 跳过、0 不稳定重试。各浏览器实际执行；本地 WebKit 使用预先补齐的临时运行库，跳过的是系统依赖探测。
- `npm run test:dev`：1 项隔离副本的开发服务综合测试通过。
- 新增文案验收：97 份生产详情接口与规范目录逐字段核对；92 个非案例资源逐项打开双语详情并复制当前提示词，5 个完整案例通过列表复制案例提示词。7 个实现来源均实际切换并复制双语风格提示词。这里只验证展示和复制链路，语义准确性另由上述源码核对支撑。
- 实际演示回归：Ant Design 三列表格及四条记录、年龄排序；登录页仅一个密码字段并可本地提交；四种原创按钮的三个状态、42px 最小高度与点击反馈。
- Morrow 独立页面实测：1440/1280/768/375px 宽度下，首屏标题依次为 70/58/46/44px，正文基准 14px，与提示词一致。
- 人工查看截图：1440×1000 英文深色、375×900 中文浅色的长提示词均可阅读；主文档与说明栏均无横向溢出。截图仅用于本地验收，不把这两个场景声称为 97 项逐项视觉验收。

此次只修改目录文案、显式旧名称别名、相关测试和维护文档。资源 ID、路由、收藏键、分类、来源许可、依赖与预览实现保留；未升级依赖。

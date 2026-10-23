# UI Design Atlas · UI 资源市场

[线上体验 / Live site](https://xiiiing.github.io/ui-design-atlas/)

找到一个动效、组件、页面区块或完整系统，直接体验，再带走对应说明、设计解读、提示词和实际代码。
Find a UI effect, component, block or system; try it and take its notes, prompts and actual code.

## 浏览与复用 / Browse and reuse

- 首页按资源展示；支持动效、组件、区块、页面和完整案例，以及用途、组件库、风格和交互筛选。
- 紧凑组件在卡片中直接体验；卡片外提供提示词复制、用途/交互/风格标签、详情和收藏。大资源打开独立宽屏体验页，默认收起说明；返回恢复筛选、加载数量、滚动位置和入口焦点。
- 预览以列宽为正方形单元：紧凑资源 `1×1`，宽资源 `2×1`（含列间距），手机统一一列。卡片保留一行介绍，标签与带无障碍名称的操作图标共用底栏；完整说明与标签可在详情查看。无法完整放入手机单元的定价卡、趋势图和较高卡片使用静态概览入口。
- 宽屏体验默认按实际可用宽度原生排版，切换平板或手机后才使用固定设备宽度。适应宽度、全屏、源码及演示内部滚动继续保留。
- 搜索支持中英文和组件库别名，例如“流光边框”“微软”“Fluent”“antd”；列表与快速搜索按名称精确匹配、名称包含、别名/标签及描述排序，同等相关度保持原顺序。
- 独立资源无需所属系统。原有案例、页面、组件 ID 和收藏备份保持兼容。
- 可见小组件按需加载，同时最多保留八个实时 iframe；焦点所在演示不会因离屏被回收。大资源使用实际本地演示生成的静态封面。
- 默认中文，支持整体英文、分享、收藏导入导出、尺寸和主题切换。

The marketplace ranks bilingual search by exact name, name match, aliases/tags and description, with stable ties. It provides library/category/style/interaction filters, interactive cards, wide experience pages and preserved browsing context, source code and prompts. Existing links and favorites remain compatible. Covers are captured from real demos; at most eight live component previews run at once, preserving focused demos.

## 图鉴界面 / Atlas interface

图鉴外层以固定版本 21st 源码为设计基线，使用开放式资源画廊：轻量吸顶导航、可清除筛选标签、紧凑组件与宽页面分尺寸陈列。详情提供真实预览、360px 说明栏、提示词、源码和原有动效参数。
The shell adapts a pinned 21st design reference into an open resource gallery, with document scrolling, removable filters, compact/wide previews and a 360px detail inspector. Archived interfaces retain their own styles and themes.

Gallery previews use a square column-sized unit, with wide resources spanning two columns at the same height. Captions, a one-line description, filter tags and accessible icon actions sit outside the preview. Tall demos open from static overviews. The experience viewer uses its available width at native scale by default; explicit tablet/phone selections retain fixed device widths.

模块化布局验收：[记录](docs/ui/modular-layout/verification.json)、[卡片调整前](docs/ui/modular-layout/before-cards-1440.png)/[调整后](docs/ui/modular-layout/after-cards-1440.png)、[宽屏调整前](docs/ui/modular-layout/before-viewer-2560.png)/[调整后](docs/ui/modular-layout/after-viewer-2560.png)。构建后在 4173 端口提供 `/ui-design-atlas/`，运行 `node scripts/capture-modular-layout.mjs` 可重新生成四种宽度的当前截图和尺寸记录。

查看 [设计映射与浏览器验收 / Design mapping and verification](docs/ui/resource-market.md) 和 [固定源码与许可 / Pinned source and attribution](vendor/21st-market/ATTRIBUTION.md)。此前映序设计资料保留为历史记录，不参与外层运行样式。

## 收录内容 / Included sources

| 来源 / Source                                                        | 本站演示 / Included demos                                       | 固定提交 / Pinned commit                   |
| -------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| [Magic UI](https://github.com/magicuidesign/magicui)                 | 12 个动效与组件 / effects and components                        | `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c` |
| [Ant Design](https://github.com/ant-design/ant-design)               | 表格、校验表单、高级搜索、弹窗创建 / 4 official examples        | `f8f5595ab5e891fff6a2a06c5b3b98af643d008e` |
| [Fluent UI](https://github.com/microsoft/fluentui)                   | DataGrid、Toolbar、Dialog、Toast / 4 official stories           | `036f9a210cd8d72924c33dd9ff0fbb16d6aae885` |
| [shadcn/ui](https://github.com/shadcn-ui/ui)                         | login-01、signup-01、sidebar-07、dashboard-01                   | `25af02b1b467fcd53b63e0c6d6d324c57c16ef18` |
| [Shadcn Admin · Sat Naing](https://github.com/satnaing/shadcn-admin) | 六页完整后台与八项组件 / 6 system pages and 8 shared components | `e16c87f213a5ba5e45964e9b67c792105ec74d26` |

另保留本站原创 Morrow、Orbit、Forma、Bloom。数量从注册表动态计算。
Original Atlas cases Morrow, Orbit, Forma and Bloom are preserved. Counts come from the registry.

完整后台支持本地任务/用户 CRUD、筛选、排序、分页和设置保存与重置。新增官方区块保留原版布局；认证表单仅在本地反馈，不创建账户或保存密码；骨架页面和占位导航在说明中标明。
The complete administration example supports local CRUD and settings persistence/reset. New blocks preserve upstream layouts. Auth forms are local demos with no accounts or stored passwords. Skeleton content and placeholder navigation are identified as such.

## 发现与复用 / Discover and reuse

默认首页 `#discover` 以连续资源墙优先展示 24 项精选与推荐，可继续加载；用途分类紧邻预览，主题合集和完整案例随后展示。`#explore` 用于同类比较和搜索。小组件直接体验和复制提示词；宽资源打开体验页。名称和“查看详情”通过 `panel=details` 展开说明，`tab=code` 仍可直接打开源码。案例可在工具栏切换页面，也可在说明栏查看页面目录。
The discovery homepage curates existing resources. Explore compares like resources. Compact cards are directly interactive; larger resources open a wide experience page. `panel=details` expands notes, and `tab=code` opens source. Systems retain page selection and directories.

首页内容在 `content/discovery.json` 维护，引用现有资源 ID，不重复注册。`catalog.js` 提供主题查询；检查脚本验证双语、引用及去重。
Editorial content references existing resource IDs in `content/discovery.json`. Registry queries and checks validate bilingual fields, references and uniqueness.

## 本地开发 / Local development

Node.js >= 24.12.0

```sh
npm ci
npm run setup:examples
npm run check
npm run build
npm run preview
```

按输出地址打开。模拟 Pages 子路径：
To serve the Pages project subpath:

```sh
node scripts/serve.mjs --dist --base=/ui-design-atlas/
```

新增资源的名称、说明、来源和库信息维护在 `content/market-*.json`，运行 `node scripts/generate-market-catalog.mjs` 生成浏览器注册表和演示名称。
Independent metadata is maintained in `content/market-*.json`. Generate the browser registry and preview names with the command above.

源码位于两个独立项目：`examples/shadcn-admin/` 和 `examples/ui-market/`。每个项目都有锁文件，可单独安装与构建。构建产物生成按资源加载的源码清单和资源文件 ZIP（入口、递归本地依赖、支持文件、样式、静态头像、许可证与双语接入说明）。源码页默认仅展示当前资源，提供锁定版本的安装命令；“查看完整项目源码”按需加载整项目清单。资源文件包用于接入现有应用，涉及后台路由或 Provider 时需沿用或适配调用上下文；要直接运行演示，下载完整项目 ZIP。两套依赖彼此隔离。
The two example projects have independent lockfiles and builds. The build creates resource-scoped manifests and source-file ZIPs with local dependency closures, styles, assets, licenses and bilingual integration notes. Full project source loads only on request. Resource files integrate into an existing app; preserve or adapt router/provider context where required. Full project ZIPs remain the runnable option.

## 验证 / Validation

```sh
npx playwright install chromium
npm test
```

更新真实预览封面（需先安装浏览器）：
Regenerate local covers from real previews:

```sh
npm run capture:previews
npm run build
```

仅捕获部分资源时，在完成 `node scripts/build.mjs --capture-previews` 后运行 `node scripts/capture-previews.mjs <ID substring>`。普通构建严格检查所有封面和源码入口存在。
For a subset, build with `--capture-previews`, then pass an ID substring to the capture script. Regular builds verify all covers and code entries.

资源级源码与搜索排序的实现边界、体积及浏览器证据见 [验收记录](docs/ui/resource-reuse.md)。
Resource delivery, search ranking and verification evidence: [verification notes](docs/ui/resource-reuse.md).

## 来源与许可 / Attribution

所有开源收录均保留作者、仓库、固定提交和 MIT 许可证。实际使用的组件库及锁定版本显示在详情中，原始示例和文档可从详情打开。`examples/ui-market/upstream/` 保留原文，`sources.lock.json` 记录来源和原文校验值。
Source authors, repositories, pinned commits and MIT licenses are retained. Actual library versions and original documentation/example links are shown per resource. Original files and checksums are retained alongside adapted runtime sources.

设计理念标为本站解读，提示词标为本站整理。浏览方式参考 21st.dev、Uiverse 和 React Bits；不再分发 React Bits 组件。图标使用 Lucide（ISC）。图鉴外层使用本地 Geist 与中文系统字体回退，演示使用 Inter 和 Geist（OFL）。
Design interpretations and prompts are curated by Atlas. Discovery patterns reference 21st.dev, Uiverse and React Bits; React Bits components are not redistributed. Icons: Lucide (ISC). The shell bundles Geist locally with Chinese system font fallbacks; previews use Inter and Geist (OFL).

## GitHub Pages

推送 `main` 后，Actions 使用锁定依赖验证、构建两套演示、生成源码下载包、执行浏览器验收，并发布同一份 `dist/`。所有运行所需脚本、样式、字体和资源均同源发布。
On push to `main`, Actions installs locked dependencies, validates and builds both demos and downloads, runs browser acceptance tests, and deploys `dist/` with all runtime assets on the same origin.

`21st-submissions/` 不参与本次构建、提交或发布。
`21st-submissions/` is excluded from this work and the deployed output.

本轮体验模式、加载预算、截图和录屏验收见 [资源体验优化](docs/ui/resource-experience.md)。

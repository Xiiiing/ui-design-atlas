# UI Design Atlas · UI 资源市场

[线上体验 / Live site](https://xiiiing.github.io/ui-design-atlas/)

找到一个动效、组件、页面区块或完整系统，直接体验，再带走对应说明、设计解读、提示词和实际代码。
Find a UI effect, component, block or system; try it and take its notes, prompts and actual code.

## 浏览与复用 / Browse and reuse

- 首页按资源展示；支持动效、组件、区块、页面和完整案例，以及用途、组件库、风格和交互筛选。
- 点击卡片打开大弹层：左侧真实交互，右侧名称、介绍、设计解读、提示词、源码与依赖；关闭后恢复筛选和位置。
- 搜索支持中英文和组件库别名，例如“流光边框”“微软”“Fluent”“antd”。
- 独立资源无需所属系统。原有案例、页面、组件 ID 和收藏备份保持兼容。
- 首页只按需加载最多两个实时预览。封面由实际本地演示生成。
- 默认中文，支持整体英文、分享、收藏导入导出、尺寸和主题切换。

The marketplace provides bilingual search, library/category/style/interaction filters, quick-view dialogs, preserved browsing context, source code and prompts. Existing links and favorites remain compatible. Covers are captured from real demos; at most two live thumbnail previews run at once.

## 图鉴界面 / Atlas interface

图鉴外层采用映序 UI 的固定设计基线与实际共享组件：中性明暗表面、黑白主操作、系统字级、44px 交互目标、统一选择器与连续选中标记。保留资源市场的预览墙和快速浏览流程。
The Atlas shell uses the pinned Yingxu UI tokens and real shared controls, with neutral light/dark surfaces, monochrome actions, 44px targets and continuous selection markers. The resource marketplace and immersive previews are retained.

查看 [设计映射、源码与验收证据 / Design mapping and verification](docs/ui/yingxu-shell.md) 和 [来源说明 / Attribution](vendor/yingxu-ui/ATTRIBUTION.md)。

## 收录内容 / Included sources

| 来源 / Source | 本站演示 / Included demos | 固定提交 / Pinned commit |
| --- | --- | --- |
| [Magic UI](https://github.com/magicuidesign/magicui) | 12 个动效与组件 / effects and components | `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c` |
| [Ant Design](https://github.com/ant-design/ant-design) | 表格、校验表单、高级搜索、弹窗创建 / 4 official examples | `f8f5595ab5e891fff6a2a06c5b3b98af643d008e` |
| [Fluent UI](https://github.com/microsoft/fluentui) | DataGrid、Toolbar、Dialog、Toast / 4 official stories | `036f9a210cd8d72924c33dd9ff0fbb16d6aae885` |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | login-01、signup-01、sidebar-07、dashboard-01 | `25af02b1b467fcd53b63e0c6d6d324c57c16ef18` |
| [Shadcn Admin · Sat Naing](https://github.com/satnaing/shadcn-admin) | 六页完整后台与八项组件 / 6 system pages and 8 shared components | `e16c87f213a5ba5e45964e9b67c792105ec74d26` |

另保留本站原创 Morrow、Orbit、Forma、Bloom。数量从注册表动态计算。
Original Atlas cases Morrow, Orbit, Forma and Bloom are preserved. Counts come from the registry.

完整后台支持本地任务/用户 CRUD、筛选、排序、分页和设置保存与重置。新增官方区块保留原版布局；认证表单仅在本地反馈，不创建账户或保存密码；骨架页面和占位导航在说明中标明。
The complete administration example supports local CRUD and settings persistence/reset. New blocks preserve upstream layouts. Auth forms are local demos with no accounts or stored passwords. Skeleton content and placeholder navigation are identified as such.

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

源码位于两个独立项目：`examples/shadcn-admin/` 和 `examples/ui-market/`。每个项目都有锁文件，可单独安装与构建。构建产物生成对应源码清单和 ZIP 下载包。两套依赖彼此隔离。
The two example projects have independent lockfiles and builds. The site build creates their source manifests and runnable ZIPs, with dependency licenses.

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

## 来源与许可 / Attribution

所有开源收录均保留作者、仓库、固定提交和 MIT 许可证。实际使用的组件库及锁定版本显示在详情中，原始示例和文档可从详情打开。`examples/ui-market/upstream/` 保留原文，`sources.lock.json` 记录来源和原文校验值。
Source authors, repositories, pinned commits and MIT licenses are retained. Actual library versions and original documentation/example links are shown per resource. Original files and checksums are retained alongside adapted runtime sources.

设计理念标为本站解读，提示词标为本站整理。浏览方式参考 21st.dev、Uiverse 和 React Bits；不再分发 React Bits 组件。图标使用 Lucide（ISC）。图鉴外层使用系统字体，演示使用 Inter 和 Geist（OFL）。
Design interpretations and prompts are curated by Atlas. Discovery patterns reference 21st.dev, Uiverse and React Bits; React Bits components are not redistributed. Icons: Lucide (ISC). The shell uses system fonts; previews use Inter and Geist (OFL).

## GitHub Pages

推送 `main` 后，Actions 使用锁定依赖验证、构建两套演示、生成源码下载包、执行浏览器验收，并发布同一份 `dist/`。所有运行所需脚本、样式、字体和资源均同源发布。
On push to `main`, Actions installs locked dependencies, validates and builds both demos and downloads, runs browser acceptance tests, and deploys `dist/` with all runtime assets on the same origin.

`21st-submissions/` 不参与本次构建、提交或发布。
`21st-submissions/` is excluded from this work and the deployed output.

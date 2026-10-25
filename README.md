<p align="center">
  <a href="https://xiiiing.github.io/ui-design-atlas/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="logo-reverse.svg">
      <img src="logo.svg" alt="UI Design Atlas 折角标识" width="176" height="176">
    </picture>
  </a>
</p>

<h1 align="center">UI Design Atlas</h1>

<p align="center">找到喜欢的界面，体验交互，再读懂它的设计与代码。</p>

<p align="center">
  <strong>在线图鉴：</strong><a href="https://xiiiing.github.io/ui-design-atlas/">xiiiing.github.io/ui-design-atlas/</a>
</p>

<p align="center">
  <a href="https://xiiiing.github.io/ui-design-atlas/">打开图鉴</a> · <a href="https://xiiiing.github.io/ui-design-atlas/#explore?lang=zh-CN">探索资源</a> · <a href="https://xiiiing.github.io/ui-design-atlas/#cases?lang=zh-CN">完整案例</a>
</p>

---

## 关于这本图鉴

这是我整理界面设计与前端实践的个人空间。从一个按钮的反馈、一段动效，到页面区块和完整后台，把值得观察的设计放在一起，方便体验、比较和回看。

每份资源尽量同时呈现实际效果、设计解读、提示词和对应代码，让喜欢的界面有迹可循。

## 看什么

| 内容       | 关注什么                                               |
| ---------- | ------------------------------------------------------ |
| 动效       | 进入、悬停、滚动与反馈，观察节奏如何影响体验。         |
| 组件       | 按钮、表单、导航、卡片与数据展示，比较不同状态和交互。 |
| 页面与区块 | 登录、侧栏、仪表盘等界面，观察布局、层级和信息组织。   |
| 完整案例   | 在多页系统中连续浏览，理解组件如何组成完整体验。       |

## 亲手体验，再看细节

紧凑组件可以在卡片内直接操作；较大的页面与系统进入宽屏体验页查看。切换桌面、平板或手机尺寸，观察同一界面在不同空间下的表现。

通过分类、组件库、风格和交互标签筛选，也可以用中文或英文搜索。打开详情后，继续查看说明、设计解读、提示词、源码与依赖信息。

喜欢的资源可以收藏或分享，收藏支持导入与导出。图鉴提供中英文和明暗模式；支持主题切换的演示会跟随站点外观，固定配色的示例保留自己的风格。

## 收录与整理

这里汇集开源界面资源与本站原创案例，保留资源的作者、原始链接和来源说明。

| 来源                                                     | 图鉴中的内容                     |
| -------------------------------------------------------- | -------------------------------- |
| [Magic UI](https://github.com/magicuidesign/magicui)     | 动效与交互组件。                 |
| [Ant Design](https://github.com/ant-design/ant-design)   | 表格、表单、搜索与弹窗示例。     |
| [Fluent UI](https://github.com/microsoft/fluentui)       | 数据表格、工具栏、对话框与通知。 |
| [shadcn/ui](https://github.com/shadcn-ui/ui)             | 登录、注册、侧栏与仪表盘区块。   |
| [Shadcn Admin](https://github.com/satnaing/shadcn-admin) | 多页后台与共享组件。             |

设计解读是本站的观察，提示词是本站的整理；它们与原作者的说明分别标注。演示中的表单和数据操作用于体验交互，不代表真实业务服务。

## 本地开发

使用 Node.js 24.12 或更新版本，执行 `npm ci`、`npm run setup:examples`，然后运行 `npm run dev`，打开 `http://127.0.0.1:4173/ui-design-atlas/`。主站和两个示例支持自动更新。

完整验证使用 `npm run verify`；首次运行浏览器测试前执行 `npx playwright install chromium`。具体命令、热更新边界及架构见 [开发说明](docs/architecture.md)。

## 来源与许可

开源资源保留各自的版权与许可，具体版本和原始出处可在资源详情中查看。更多说明见 [组件与区块来源](examples/ui-market/ATTRIBUTION.md)、[后台案例来源](examples/shadcn-admin/ATTRIBUTION.md)和 [图鉴界面参考](vendor/21st-market/ATTRIBUTION.md)。

图标使用 Lucide，遵循 ISC 许可；本地字体的许可说明随对应资源保留。

---

<p align="center">
  <a href="https://xiiiing.github.io/">个人主页</a> · <a href="https://xiiiing.github.io/wiki/">学习笔记</a> · <a href="https://xiiiing.github.io/ui-design-atlas/">UI 图鉴</a>
</p>

### 目录与下载维护

`content/resources.json` 是图鉴资源元数据的唯一来源，`sources.json`、`libraries.json` 和 `taxonomy.json` 定义来源、组件库及分面词汇。修改资源时保留 `id` 和 `type`（收藏使用 `type:id`）；用途、风格、技术及交互使用对应枚举数组。演示自身的数据仍由各示例维护。不要再手工生成或同步目录 JS、示例名称索引。

构建与开发服务共用目录校验和交付规则：主站只加载摘要，完整提示词和规则由 `details/` 按资源加载；示例名称索引、源码清单及 ZIP 从当前目录生成。无效枚举、重复标识、缺失引用会报错。派生文件只进入 `dist` 或开发临时目录。

原创组件可下载独立 HTML；原创页面和案例可下载完整静态 ZIP，解压后在包目录运行普通静态服务器（例如 `python3 -m http.server 8000`），打开 `index.html`。React 资源包用于集成，完整项目包按包内 README 安装和运行。所有包沿用原来源、署名和许可。交付文件仅来自指定项目文件和源码/静态资源目录；环境文件、日志、缓存、编辑器备份及越界符号链接不允许进入交付。

筛选中同一分面的多个选项按“或”组合，不同分面按“且”组合。用途、组件库、交互、视觉风格、技术和来源可多选；URL 用逗号保存多个值。选项计数包含关键词、收藏/合集和其他分面，排除该分面自身条件。原有 `#components` 等类型路由、`#motion`、`category`、`style`（原风格体系）、`source`（原创/开源）与 `audience` 链接继续有效；新的视觉分面使用 `visual`，来源项目使用 `project`。搜索期间按全局相关性排序，空关键词按类型浏览。

新增或删除交付源文件时同步更新 `content/delivery-files.json` 的项目文件白名单；普通内容修改不需要更新清单。清单缺失文件或越界路径会报错，未列出的本地源码文件也不会被打包。案例的 `pages` 只保留页面 ID 引用，名称与描述从对应页面条目解析，避免第二份元数据。

验收浏览器安装使用 `npx playwright install --with-deps chromium firefox webkit`。`npm run verify` 执行严格检查、单元测试、一次生产构建、Chromium 全量流程、Firefox/WebKit 核心流程和隔离开发热更新测试；`npm test` 先构建，只有明确复用已知构建时才使用 `npm run test:built`。验收服务器由 Playwright 启动，不复用已有服务器。浏览器报告及截图保存在 `playwright-report/`，尺寸与请求证据随测试报告附加；CI 保存为 `atlas-acceptance` 产物。

构建时按 esbuild 静态依赖图汇总主文档启动脚本的 gzip 体积，超过 190,000 字节会失败。动态源码模块与 iframe 请求分别记录，结果见 `dist/script-budget.json`。主站样式按基础、浏览、预览、导航和响应式区域组织于 `atlas/styles/`；上游归档样式继续独立保存。

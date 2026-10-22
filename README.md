# UI Design Atlas · UI 设计图鉴

**直接体验界面，在旁边读懂设计，带走提示词和可运行代码。**

[在线浏览](https://xiiiing.github.io/ui-design-atlas/) · [来源项目](https://github.com/satnaing/shadcn-admin)

收录真实开源 UI 与本站原创示例。案例、页面与组件详情使用并排预览和设计说明，支持中文／English、分层提示词、源码查看、收藏与下载。全部演示在本站运行。

浏览层按 [shadcn/ui 官方 Blocks](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/components/block-viewer.tsx) 的结构适配：水平导航、大幅视觉画廊、原生尺寸预览，以及可收起的说明面板。支持上一个／下一个设计切换与 `⌘K` / `Ctrl+K` 快速查找。原始参考源码和 MIT 许可保存在 `vendor/shadcn-ui/`，Lucide 图标与 Inter 字体也保留对应许可。

## 当前内容

- **Shadcn Admin**：固定上游版本 `e16c87f213a5ba5e45964e9b67c792105ec74d26`，沿用 Sat Naing 的 React 组件与布局。收录工作台、任务、用户、个人资料、外观和通知六个页面，以及八项同源组件。
- **Morrow / Orbit / Forma / Bloom**：四套本站原创案例继续保留，共十二个页面、三十二个组件，原有链接与收藏 ID 有效。
- 合计 **5 套案例、18 个页面、40 个组件**。界面数量从注册表计算。

任务与用户支持搜索、筛选、编辑、新增、确认删除及本地保存；表格保留排序与分页。设置支持校验、保存与重置。所有数据均为演示，不接入真实账户、邮件或业务服务。

## 本地运行

需要 Node.js **24.12+**。

```sh
npm ci
npm run setup:examples
npm run dev
```

打开 `http://127.0.0.1:4173/`。开发命令先构建演示与下载包，再启动静态服务器；修改源码后重启该命令以重新构建。

```sh
npm run check
npm run build
npm run preview
```

GitHub Pages 项目子路径验证：

```sh
node scripts/serve.mjs --dist --base=/ui-design-atlas/
# http://127.0.0.1:4173/ui-design-atlas/
```

## 复用路径

1. 从完整案例或页面目录找到界面，切换页面、尺寸、主题和预览比例。
2. 在右侧查看名称、介绍、设计理念和具体规则；演示内部导航同步当前页面说明。
3. 按需复制视觉风格、系统、当前页面或组件提示词。提示词可分别复制，案例说明可导出 Markdown。
4. 打开代码标签查看实际源码与依赖上下文，复制或下载当前文件；开源案例可下载完整 ZIP。
5. ZIP 解压后执行 `npm ci && npm run dev`，即可作为独立项目运行。保留许可证与所需共享组件、样式、字典和 Provider。

语言默认中文，用户选择保存在浏览器；分享链接包含语言与当前页面。收藏保存在原 `design-atlas-favorites` 键，支持原格式 JSON 导入导出。Shadcn Admin 数据使用独立 `atlas:shadcn-admin:v1:` 命名空间；重置不影响原有案例。密码仅用于表单校验，不持久保存。

## 项目结构

- `catalog.js`：双语案例、页面、组件注册表，来源、关联、预览与提示词规则。
- `app.js` / `styles.css`：图鉴目录、并排详情、搜索、收藏、预览状态和代码读取。
- `data.js` / `components.js` / `preview.js`：原有原创案例与组件；`legacy-i18n.js` 和字典提供原界面双语显示。
- `examples/shadcn-admin/`：可独立构建的 React 源码、固定依赖、来源声明及 MIT 许可。
- `scripts/build.mjs`：验证、类型检查、React 构建、源码清单、依赖许可和 ZIP 打包。
- `tests/`：真实浏览器验收，包括 GitHub Pages 子路径、交互、双语、尺寸与主题。

本地 `21st-submissions/` 不参与主站构建、下载包或发布。

## 浏览器验证

```sh
npx playwright install chromium
npm run build
npm test
```

测试在 `/ui-design-atlas/` 子路径运行，覆盖从案例到页面到组件、提示词复制、实际源码、旧收藏兼容、任务和用户数据操作、设置保存／重置、中英文、明暗主题和三种视口。外部请求被拦截时，首套系统仍须完整加载。

## GitHub Pages 发布

沿用 `.github/workflows/deploy.yml`：推送 `main` 或手动触发后，安装两个锁定的依赖集，验证、构建并部署 `dist/`。仓库 Settings → Pages 的 Source 应为 **GitHub Actions**。

主站及子项目使用 hash 路由，资源路径相对当前目录；页面刷新不依赖服务器重写。运行所需字体、脚本和样式随站点发布。

## 来源与许可

Shadcn Admin 由 **Sat Naing** 开发，采用 MIT 许可。本仓库保留原始版权和许可全文。详见 [来源与适配说明](./examples/shadcn-admin/ATTRIBUTION.md) 和 [LICENSE](./examples/shadcn-admin/LICENSE)。

本站增加双语、本地数据、独立组件预览及静态归档适配，保留上游视觉与组件结构。设计理念为本站解读，提示词为本站整理。发布和下载包附带构建所用依赖的许可声明，包括本地字体。

四套原有案例为本站原创的虚构前端演示。示例品牌、人物、商品、价格和指标不代表真实业务。

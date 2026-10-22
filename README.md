# UI Design Atlas · UI 设计图鉴

**为下一个项目，找到合适的设计方向。**

[在线浏览](https://xiiiing.github.io/ui-design-atlas/) · [Xiiiing 的主页](https://xiiiing.github.io/)

一个可以直接浏览、体验与复用的个人 UI 设计资产库。把完整案例、通用组件、设计理念、设计变量、分层提示词与官方资源链接放在同一条使用路径上。

## 首版内容

| 案例 | 设计方向 | 完整演示页面 |
| --- | --- | --- |
| Morrow | 温暖纸色、衬线字、编辑排版 | 作品集首页、作品详情、关于与联系 |
| Orbit | 分层深色、蓝紫强调、数据密度 | 工作台概览、项目管理、工作区设置 |
| Forma | 瑞士网格、粗体大字、荧光黄绿 | 工作室首页、项目档案、合作咨询 |
| Bloom | 奶油白、森林绿、自然圆角 | 商品首页、商品详情、购物袋 |

每套包含按钮、卡片、导航、表单、方案卡、数据概览、表格与对话框，共 **32 个组件**。所有组件都可以查看预览、设计说明、关联案例、设计变量与提示词，并下载包含样式的独立 HTML 示例。

四套项目均为本站原创的虚构演示案例。项目、商品、价格、团队与统计指标不代表真实业务；商品图与视觉构图由本地 CSS 绘制。

## 实际可用的功能

- 完整案例与通用组件两个入口，支持名称搜索、风格、场景与组件类型筛选。
- 案例可切换三个页面，并在桌面、平板和手机宽度中预览。
- 整体设计理念、完整项目、页面与单组件四种复制入口；单组件可连同全局规则一起复制。
- 导出包含提示词、设计变量与资源链接的 Markdown 设计方案。
- 收藏案例和组件；通过 JSON 导入、导出备份。
- 原生可交互组件，包括表单校验、对话框、按钮状态。
- Orbit 项目搜索、状态筛选、本地项目创建与设置保存。
- Forma 项目分类、Morrow/Forma 联系表单校验与演示反馈。
- Bloom 分类、商品详情、数量选择、购物袋增减、移除与金额计算。

收藏、项目、设置与购物袋使用 `localStorage`，只保存在当前浏览器。联系与订阅表单不发送数据，结算不创建订单或支付。自动复制被浏览器拒绝时提供可手动复制的文本窗口。

## 本地运行

需要 Node.js 22 或更新版本。没有第三方运行依赖，无需 `npm install`。

```sh
node scripts/serve.mjs
```

打开 `http://127.0.0.1:4173/`。ES Modules 需要通过 HTTP 访问，请不要直接双击 HTML 文件。

```sh
node scripts/check.mjs
node scripts/build.mjs
node scripts/serve.mjs --dist
```

也可以使用 `npm run dev`、`npm run check`、`npm run build`。

## 发布到 GitHub Pages

仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。推送 `main` 后，工作流自动验证内容、打包 `dist/` 并部署。

所有资源均使用相对路径，详情通过 URL hash 路由，适用于项目子路径，刷新案例与组件详情不会产生服务器路由 404。

## 持续添加自己的设计

- `data.js`：案例元数据、风格变量、页面结构、资源与提示词。
- `components.js` / `components.css`：原生组件示例与可下载 HTML。
- `preview.js` / `preview.css`：完整案例页面与本地演示交互。
- `app.js` / `styles.css`：图鉴布局、筛选、详情、复制、收藏与导出。
- `scripts/check.mjs`：内容完整性、关联关系、资源存在性与语法检查；增加案例后同步调整数量断言与界面计数。

增加内容时，为条目提供唯一 ID、明确使用场景与完整提示词。引用第三方设计时注明原始来源与授权；不要将参考链接表述为本站实际安装的依赖。

## 参考资源

[shadcn/ui](https://ui.shadcn.com/docs/components) 提供组件结构参考；[Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) 提供无样式交互及无障碍行为参考；[daisyUI](https://daisyui.com/components/) 提供 Tailwind CSS 组件与主题参考。本站演示采用原生 HTML、CSS 与 JavaScript，未捆绑上述组件库代码。

# 图鉴资源市场：设计依据与验收

## 设计来源

外层主要参考 [21st 资源市场](https://21st.dev/community/components)，源码固定为
[`b96d84dcf748d5e56f2f72f2bab9a4f7f33574cf`](https://github.com/serafimcloud/21st/tree/b96d84dcf748d5e56f2f72f2bab9a4f7f33574cf)。
[原始参考与 MIT 许可](../../vendor/21st-market/ATTRIBUTION.md)随项目保留并校验 SHA-256。
公开源码版本早于目前官网；本次是基于固定源码的业务适配，不声称与当前官网像素一致。

| 参考部分 | 图鉴中的应用 |
| --- | --- |
| 21st globals.css 的 background、foreground、muted、border、input、ring、primary | 同一套中性明暗表面、文字、边框、焦点与操作色，无额外品牌调色板 |
| Tailwind 配置中的 Geist、默认字级与间距、8px 圆角 | 本地 Geist 5.3.0（OFL）、中文系统字体回退，12/14/16/24/32px 字级、4px 间距步进 |
| 21st 卡片和横向分类示例 | 预览优先，卡片下方只放名称和组件库，分类与已选筛选条件明确分开 |
| [Origin UI 按钮页](https://coss.com/origin/button) | 小组件采用紧凑的真实取景，避免按钮被缩进整张页面截图 |
| [Blocks.so 表格页](https://blocks.so/tables) | 表格、区块和完整页面使用宽预览，并提供设备宽度与原尺寸操作 |
| [React Bits 动效页](https://reactbits.dev/text-animations/split-text) | 重播和原有参数紧邻舞台；不收录或再分发该站组件 |

映序的历史设计资料及许可证保留，但运行中的图鉴不再导入其样式或专用控件。
收录演示仍隔离在同源 iframe 中，保留自身组件库与主题。

## 展示与复用规则

- 文档滚动，轻量吸顶导航；1440px 最大内容宽度，首屏直接提供搜索、分类和资源。
- 1440px 为四列基础网格，宽资源跨两列；768px 两列，375px 一列。保持 DOM 与阅读顺序，不进行瀑布流重排。
- `presentation.js` 统一封面、悬停与详情的规格。普通组件封面为 400×400；区块、页面、案例及原画布宽度至少 900px 的组件使用宽规格。
- 桌面说明栏固定 360px，1024px 以下上下排列。手机紧凑预览保留足够高度，让完整登录卡片及操作按钮可见。
- 所有筛选条件都有可单独清除的标签。折叠更多筛选只隐藏表单，不改变值；URL、刷新、弹层返回保留浏览上下文。
- 原有 ID、87 项统一资源、hash 链接、收藏格式、双语、主题、源码和项目下载保持兼容。首批 24 项，最多两个悬停演示，离屏卸载。

## 嵌入适配

`embed=1` 隐藏 UI Market 独立演示的适配工具条，避免与图鉴操作重复。独立打开不携带此参数，继续提供原有工具条。
仅将原本已有的时长、粒子数量和目标数值放到舞台旁边。父页面发送同源
`atlas:preview-settings` 消息，`settings` 仅包含 `duration`、`quantity` 或 `value`；演示校验来源与数值范围后更新现有组件 props。
调参后的提示词追加明确的当前参数覆盖，复制内容与实际预览一致；重播保留参数。

页面默认按照注册表中的原始桌面宽度渲染，再缩放至预览容器；旁栏不会触发演示移动断点。
设备切换、原尺寸、全屏、内部页面导航、嵌套对话框、焦点和关闭返回均沿用同一流程。

## 验证与复现

```sh
npm run check
npm run build
npm test
# 构建产物须先以 Pages 子路径启动
node scripts/serve.mjs --dist --base=/ui-design-atlas/
# 另一个终端生成真实截图和录屏
node scripts/capture-market.mjs
```

本次本地验证：

- 内容、来源校验、两套演示 TypeScript 检查及完整静态构建通过。
- 27 项 Playwright 测试通过；包括原有后台操作、收藏备份、旧链接、组合筛选与清除、滚动及焦点恢复、动效真实参数与重播、360px 说明栏、桌面画布和全屏。
- 1440／768／375px × 中英文 × 明暗共 12 组浏览器检查；36 张首页、组件详情和完整页面截图，无页面横向溢出、页面异常或 HTTP 错误。
- 同时验证收藏、完整案例、来源及指南页面；拦截所有外部运行请求后仍可用。
- UI Market ZIP 解压至独立临时目录，`npm ci`、`npm run build`、Vite preview 启动和浏览器交互通过；确认真实微光按钮参数改变后运行样式随之变化，且无需外部运行资源。

[验证记录与源码哈希](./resource-market/verification.json) · [真实浏览与复用录屏](./resource-market/browse-and-reuse.webm)

### 页面截图

![桌面资源市场](./resource-market/home-1440-light-zh-CN.png)

![桌面系统页面详情](./resource-market/page-1440-dark-en.png)

[手机首页](./resource-market/home-375-light-zh-CN.png) · [手机组件详情](./resource-market/component-375-light-zh-CN.png) · [平板英文深色首页](./resource-market/home-768-dark-en.png)

此前效果可见[历史截图](./yingxu-shell/market-1440-light.png)。本轮仅提交 PR，不自动合并或发布。

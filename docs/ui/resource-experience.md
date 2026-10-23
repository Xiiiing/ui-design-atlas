# 资源体验与展示优化

关联 [Issue #13](https://github.com/Xiiiing/ui-design-atlas/issues/13)。前置 [PR #11](https://github.com/Xiiiing/ui-design-atlas/pull/11) 的布局稳定性修复已合入 `main`；资源体验优化单独提交 PR，不自动合并或部署。

## 体验规则

- `presentation.js` 集中定义 `inline` / `canvas`，资源可用 `preview.mode` 覆盖。按钮、短表单、紧凑卡片可在列表真实操作；弹窗、抽屉、长表单、宽表格、统计卡组、区块、页面和案例进入宽屏体验。
- 桌面三列，宽卡片跨两列；平板两列，手机一列。CSS Grid 按原 DOM 顺序流排，不使用 dense 或瀑布流。
- 名称、两行说明、最多三个结构化标签、复制、详情和收藏均位于预览外。卡片标签优先用途、主要交互和风格，详情保留完整标签；原搜索别名不变。
- 标签链接保留已有筛选，支持分享、组合、清除和浏览器历史。复制使用所点资源和当前语言；剪贴板不可用时进入已有备用复制框。
- 大资源默认隐藏说明；名称和详情入口使用 `panel=details`，原地址与 `tab=code` 兼容。说明、关联资源、案例页面目录和来源仍可访问。手机/平板默认选择 375/768px 设备画布，再适应可用宽度，避免把桌面全页缩成微小截图。工具栏保留提示词、源码、设备宽度、适应宽度、主题、全屏、独立打开。
- iframe 高度由实际可用视口及缩放计算，ResizeObserver 同步画布尺寸。外层不承担第二套纵向内容滚动，长页、表格和侧栏保留原生滚动。手机说明覆盖预览时将其设为 inert，收起后恢复按钮焦点。
- 返回恢复原筛选、已加载数量、滚动和具体入口焦点；同一次资源浏览中的前后资源切换不会丢失列表上下文。

## 加载与隔离

可见 inline 资源由 IntersectionObserver 加载，最多同时保留八个 iframe。优先当前操作及可见资源，焦点所在的 iframe 离屏仍保留；失焦后可回收，再进入重新加载。重载会重置尚未持久化的演示输入。

加载、15 秒超时、失败和重试留在固定画布内。消息核对同源、发送窗口和资源 ID；列表事件不更新资源页。UI Market 的主题存储按资源和卡片/体验页隔离，避免多张卡片串色。沿用源演示主题、样式和减少动态效果设置。

canvas 封面按真实演示重拍。复杂小组件使用 960×640 概览画布，不将长列表缩字塞进卡片；封面保持完整比例。页面使用原生宽画布首屏。捕获脚本仅在截图时去掉滚动条绘制和归档工具栏，不改变在线演示的滚动行为。

## 验收证据

- `npm run check`：内容/来源/锁定源码校验、外壳及两个示例项目类型检查、5 项单元测试。
- `npm run build`：外壳、两个独立示例项目、资源源码清单和 ZIP。仅有既有的大 chunk 提示。
- `npm test`：63 项全部通过的完整 Playwright 回归，包含原筛选栏与首卡位置稳定性检查、新的 inline/wide 体验检查、真实表单及复杂组件流程。
- 新增检查：卡片真实点击/输入/键盘、触屏 iframe 内起滑、复制中英文内容及备用框几何稳定性、焦点保护与回收、消息身份校验、失败重试、组合标签、宽屏滚动到底、设备宽度、原链接/源码和返回焦点。
- 四种宽度 × 两种语言 × 明暗主题：见 [测量记录](resource-experience/verification.json)。录屏和截图由本地真实浏览器操作产生，没有合成演示内容。
- 已整合 `main` 的布局修复与标识更新（`9a3327b`），组合版本 `677d453` 重新通过上述检查、构建及全部 63 项测试，并重新捕获截图与录屏。

## 前后对照

旧版截图来自单独构建的 PR #11 HEAD `eb7678eefa20b11a11cb6bb7aabf1d3ae10a05cc`；新截图对应本轮本地构建，`verification.json` 记录生成时间与外壳构建产物 SHA-256。

| 场景 | 修改前 | 修改后 |
| --- | --- | --- |
| 桌面资源列表 | [1440px](resource-experience/before-discover-1440.png) | [1440px](resource-experience/discover-1440-dark-zh-CN.png) |
| 手机资源列表 | [375px](resource-experience/before-discover-375.png) | [375px](resource-experience/discover-375-dark-zh-CN.png) |
| 桌面资源页 | [1440px](resource-experience/before-viewer-1440.png) | [1440px](resource-experience/viewer-1440-dark-zh-CN.png) |
| 手机资源页 | [375px](resource-experience/before-viewer-375.png) | [375px](resource-experience/viewer-375-dark-zh-CN.png) |

[桌面真实操作录屏](resource-experience/desktop-interaction.webm)：卡片点击、复制、标签筛选、详情/代码、返回恢复、Fluent 弹窗、设备宽度、全屏、说明栏。

[触屏真实操作录屏](resource-experience/touch-interaction.webm)：短表单输入与提交、详情展开/收起、返回及焦点恢复。

重现截图和录屏：构建当前版本并在 4173 端口提供 `/ui-design-atlas/`，运行 `node scripts/capture-experience.mjs`。要同时生成旧版，先把上述基线提交独立构建到临时目录，再通过 `ATLAS_BASELINE_DIR` 指定该目录；脚本在 4190 启动并关闭基线服务，不修改当前 checkout。封面用 `node scripts/capture-previews.mjs --canvas` 生成。

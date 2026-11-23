# @0xclayo 的 UI 仓库清单

[原帖](https://x.com/0xclayo/status/2124487017446654447)列出 15 个 GitHub 仓库。图鉴的[资源导航](https://xiiiing.github.io/ui-design-atlas/#tools?lang=zh-CN&q=0xclayo)保留了每个仓库的入口，[UI 组件库精选](https://xiiiing.github.io/ui-design-atlas/#explore?lang=zh-CN&collection=clayo-ui-references)可直接体验其中的界面。

| 项目 | 图鉴收录 |
| --- | --- |
| Anthropic Skills | frontend-design 的上游入口 |
| shadcn/ui | 已有侧栏区块，也可按组件库浏览登录和仪表盘 |
| Radix Primitives | 文件操作菜单，可键盘切换置顶和显示方式 |
| cmdk | 工作区命令面板，可搜索并用方向键和回车选择 |
| Impeccable | 设计审查和润色 Skill 的上游入口 |
| Magic UI | 已有流光边框、闪光按钮和跑马灯 |
| Sonner | 堆叠通知，支持悬停展开和手动关闭 |
| Tailwind CSS | 框架文档和仓库入口 |
| Storybook | 组件开发、文档和测试工具入口 |
| Vaul | 底部排序抽屉，可应用选项或拖动关闭 |
| Tabler Icons | 图标浏览器，可中英文检索和调整线宽 |
| Tremor | 可按周、月切换的交付进度指标卡 |
| Recharts | 已有收入柱状图 |
| Mantine | 列表密度选择器，可直接比较三种行距 |
| daisyUI | 主题切换卡片，同一组控件可对照四个主题 |

新增演示由图鉴编排，直接使用相应上游组件或样式。详情页列出固定版本、上游链接、双语设计说明、提示词和源码下载。Tremor 的 ProgressBar 和 `cx` 按提交归档，原始文件、校验值与 Apache-2.0 许可随源码交付。其余新增演示通过项目锁文件使用对应的 MIT 依赖，示例数据和交互状态留在浏览器中。

本地构建完成后，执行 `node scripts/capture-previews.mjs --ui-references` 可重新生成这些演示的明暗封面。

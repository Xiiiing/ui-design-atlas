# Shadcn Admin · Atlas edition

An independently runnable, bilingual archive of Sat Naing's Shadcn Admin. See [ATTRIBUTION.md](./ATTRIBUTION.md) and [LICENSE](./LICENSE) for the pinned source and adaptation details.

一个可独立运行的中英双语 B 端界面归档。原始来源、固定版本及本站修改见 ATTRIBUTION.md，原版 MIT 许可见 LICENSE。

Requires Node.js 24.12+ / 需要 Node.js 24.12 或更新版本。

```sh
npm ci
npm run dev
```

Open the local Vite address. Default language is Chinese; add `?lang=en` before the hash to use English. Example: `http://127.0.0.1:5173/?lang=en#/tasks`. Use the standalone demo toolbar to change language or reset data.

默认中文；URL 的 hash 前加 `?lang=en` 切换英文。独立演示顶部可切换语言和重置数据。

```sh
npm run typecheck
npm run build
npm run preview
```

`dist/` contains static files with relative assets and hash routing, suitable for GitHub Pages at a project subpath. No server, account or API key is needed.

构建结果为 dist/，资源使用相对路径，页面使用 hash 路由，支持 GitHub Pages 项目子路径。不需要后端、账户或 API 密钥。

Pages / 页面: `/`, `/tasks`, `/users`, `/settings`, `/settings/appearance`, `/settings/notifications`.

To preview a reusable component, add `?component=task-table&lang=en#/tasks`. Supported component values: `sidebar`, `metric-cards`, `trend-chart`, `task-table`, `filter-toolbar`, `task-drawer`, `user-dialog`, `settings-form`. Table/filter previews use the `/tasks` route; the settings form uses `/settings`; the user dialog uses `/users`.

Preview components import the same modules as the system pages. Keep the `@/` alias, required providers, shared `src/components/ui`, `src/styles`, `src/archive` translations/store, and package dependencies when copying code. The Code tab in Atlas lists every supplied source/configuration file.

独立组件预览与系统页面共用源码。复制代码时请一并保留 @/ 别名、所需 Provider、共享 UI、主题样式、字典和依赖。完整目录可直接作为新项目起点。

Tasks, users and settings persist only in the current browser. Dataset reset does not affect other Atlas cases. Passwords are never persisted. Business integrations must be implemented by the consuming project.

任务、用户和设置只保存在当前浏览器，重置不影响其他案例。密码不会持久保存。真实业务接口由使用方项目接入。

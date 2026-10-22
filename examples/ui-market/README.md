# Atlas UI Market · 可运行的 UI 资源 / Runnable UI resources

在本站体验独立组件、动效与页面区块，并阅读对应说明、提示词和真实源码。
Browse isolated components, motion and blocks with their notes, prompts and actual source.

## Run / 运行

Node.js >= 24.12.0

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Open `index.html?item=magicui-border-beam&lang=zh-CN&theme=light` through the development server. Use `lang=en` for English. Each resource is loaded independently; see `src/registry.ts`. Parameters exposed by the preview use the upstream component's real props. Demo operations are local, with no authentication or external services.

通过开发服务器打开 `index.html?item=magicui-border-beam&lang=zh-CN&theme=light`。使用 `lang=en` 切换英文。每个条目独立加载，入口见 `src/registry.ts`。预览参数对应组件真实属性。操作均为本地演示，不接入认证或远程服务。

## Source / 来源

See `ATTRIBUTION.md`, `sources.lock.json`, `upstream/`, and `licenses/`. `src/demos/` contains the actual adapted demos used at runtime. `src/vendor/` contains the actual component implementations. Original copies are retained in `upstream/`. Styles, dependencies and providers are part of the implementation; copy them along with a component. All fonts and runtime assets are local.

来源、固定提交和许可证见以上文件。实际演示代码位于 `src/demos/`，组件实现位于 `src/vendor/`，未适配原文保留在 `upstream/`。复用时应同时带走样式、依赖与必要 Provider。所有字体和运行资源均在本地。

Design interpretations and prompts on Atlas are curated by Atlas and are not statements from the original authors. DOM text localization preserves upstream layouts and behavior. Local avatars replace remote demo avatars. Replay, parameter controls, relative asset paths and preview messaging are Atlas adaptations.

本站设计解读和提示词不代表原作者原文。文本翻译保留上游布局与行为，本地头像替换远程演示头像。重播、参数控制、相对资源路径和预览状态通信属于本站适配。

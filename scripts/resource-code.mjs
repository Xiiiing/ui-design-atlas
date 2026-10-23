import path from "node:path";
import ts from "typescript";

const extensions = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  "/index.ts",
  "/index.tsx",
  "/index.js",
];
export function localFile(from, specifier, files) {
  const base = specifier.startsWith("@/")
    ? `src/${specifier.slice(2)}`
    : specifier.startsWith(".")
      ? path.posix.normalize(
          path.posix.join(path.posix.dirname(from), specifier),
        )
      : null;
  if (base === null) return null;
  const found = extensions
    .map((ext) => base + ext)
    .find((file) => Object.hasOwn(files, file));
  if (!found)
    throw new Error(`Missing local dependency: ${from} -> ${specifier}`);
  return found;
}
export function imports(file, content) {
  if (/\.[cm]?[jt]sx?$/.test(file))
    return ts
      .preProcessFile(content, true, true)
      .importedFiles.map((item) => item.fileName);
  if (file.endsWith(".css"))
    return [
      ...content.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g),
    ].map((match) => match[1]);
  return [];
}

export function resourceCode(resource, allFiles, project) {
  const entryFiles = resource.files?.length ? resource.files : ["src/main.tsx"];
  const styleFiles = ["src/styles/index.css"];
  const contextFiles =
    project === "shadcn-admin"
      ? [
          "src/context/theme-provider.tsx",
          "src/context/font-provider.tsx",
          "src/context/direction-provider.tsx",
        ]
      : [];
  const configuration = [
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
  ].filter((file) => file in allFiles);
  const legal = [
    "LICENSE",
    "ATTRIBUTION.md",
    ...Object.keys(allFiles).filter((file) => file.startsWith("licenses/")),
  ].filter((file) => file in allFiles);
  const files = {};
  const packages = new Set([
    "react",
    "react-dom",
    ...(project === "ui-market"
      ? ["@fontsource/geist"]
      : ["@fontsource/inter", "@fontsource/manrope"]),
  ]);
  const visit = (file) => {
    if (Object.hasOwn(files, file)) return;
    if (!Object.hasOwn(allFiles, file))
      throw new Error(`Missing resource file: ${resource.id} -> ${file}`);
    files[file] = allFiles[file];
    for (const specifier of imports(file, files[file])) {
      const dependency = localFile(file, specifier, allFiles);
      if (dependency) visit(dependency);
      else if (!specifier.startsWith("node:"))
        packages.add(
          specifier.startsWith("@")
            ? specifier.split("/").slice(0, 2).join("/")
            : specifier.split("/")[0],
        );
    }
    // Local public assets in the archived demos are literal SVG paths, not imports.
    for (const [, asset] of files[file].matchAll(
      /["'](?:\.\/|\/)(avatars\/[^"']+\.svg)["']/g,
    ))
      visit(`public/${asset}`);
  };
  [
    ...entryFiles,
    ...(resource.supportFiles || []),
    ...styleFiles,
    ...contextFiles,
    ...configuration,
    ...legal,
  ].forEach(visit);
  const pkg = JSON.parse(allFiles["package.json"]);
  const lock = JSON.parse(allFiles["package-lock.json"]);
  const dependencies = {},
    devDependencies = {};
  for (const name of [...packages].sort()) {
    const target =
      name in (pkg.dependencies || {}) ? dependencies : devDependencies;
    if (
      !(name in (pkg.dependencies || {})) &&
      !(name in (pkg.devDependencies || {}))
    )
      throw new Error(`Undeclared dependency: ${resource.id} -> ${name}`);
    const version = lock.packages?.[`node_modules/${name}`]?.version;
    if (!version) throw new Error(`Missing locked dependency: ${name}`);
    target[name] = version;
  }
  for (const name of [
    "typescript",
    "@types/react",
    "@types/react-dom",
    "@types/node",
  ]) {
    if (pkg.devDependencies?.[name])
      devDependencies[name] = lock.packages[`node_modules/${name}`].version;
  }
  const command = (deps, dev = false) =>
    `npm install${dev ? " -D" : ""} ${Object.entries(deps)
      .map(([name, version]) => `${name}@${version}`)
      .join(" ")}`;
  const install = [
    command(dependencies),
    ...(Object.keys(devDependencies).length
      ? [command(devDependencies, true)]
      : []),
  ].join("\n");
  const instructions = {
    "zh-CN": [
      "将文件按下列相对路径放入现有 React / TypeScript 项目；@/ 对应 src/。入口文件包含演示用法或组件实现，查看其 props 和导出后接入。",
      "引入 src/styles/index.css，合并 Tailwind 4 主题变量；参考 vite.config.ts 配置 @tailwindcss/vite。样式包含全局规则，请按项目需要合并。public/ 中的文件放到应用静态目录。",
      project === "shadcn-admin"
        ? "后台组件可能依赖 TanStack Router 的既有路由、QueryClient、主题与业务 Provider，以及调用方传入的数据。请沿用完整项目的 src/main.tsx 和对应页面上下文，或将这些依赖适配到你的应用；此文件集不是独立可运行项目。"
        : "保留入口及支持文件中的 Provider。Ant Design / Fluent UI 使用主题 Provider；Magic UI 的默认参数来自 PreviewSettings。若需要与演示一致的语言、主题和本地反馈，参考完整项目 src/main.tsx 的宿主初始化。",
      "下面命令使用归档锁文件中的版本；package.json 与配置文件保留完整项目原文供参考。要直接运行原演示，请下载完整项目 ZIP，执行 npm ci、npm run dev；构建执行 npm run build。",
    ],
    en: [
      "Copy files into an existing React / TypeScript project at the relative paths below; @/ maps to src/. The entry contains demo usage or the component implementation: inspect its exports and props before integration.",
      "Import src/styles/index.css and merge the Tailwind 4 theme variables; use vite.config.ts as the @tailwindcss/vite reference. Merge global styles deliberately. Put public/ assets in your application’s static directory.",
      project === "shadcn-admin"
        ? "Admin components may require existing TanStack Router routes, QueryClient, theme/business providers and caller-supplied data. Preserve the full project’s src/main.tsx and page context or adapt these dependencies to your app. This file set is not a standalone runnable project."
        : "Keep the providers in the entry and supporting files. Ant Design / Fluent UI use theme providers; Magic UI defaults come from PreviewSettings. For identical language, theme and local feedback, consult the host initialization in the full project’s src/main.tsx.",
      "Commands use versions from the archive lockfile. package.json and configuration retain the full project originals as references. To run the original demo, download the full project ZIP and use npm ci, npm run dev; build with npm run build.",
    ],
  };
  const reuse = `# ${resource.name["zh-CN"]} / ${resource.name.en}\n\n${instructions["zh-CN"].join("\n\n")}\n\n${instructions.en.join("\n\n")}\n\n## Install\n\n\`\`\`sh\n${install}\n\`\`\`\n\n## Entry\n\n${entryFiles.map((file) => `- ${file}`).join("\n")}\n\n## Files\n\n${Object.keys(
    files,
  )
    .map((file) => `- ${file}`)
    .join("\n")}\n`;
  files["ATLAS-REUSE.md"] = reuse;
  return {
    resourceId: resource.id,
    project,
    entryFiles,
    styleFiles,
    contextFiles,
    dependencies,
    devDependencies,
    install,
    instructions,
    files,
  };
}

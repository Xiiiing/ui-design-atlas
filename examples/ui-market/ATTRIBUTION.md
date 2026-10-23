# Upstream sources and adaptations

- **Magic UI contributors**, MIT: https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c
  - Actual components: `apps/www/registry/magicui/`; actual demos: `apps/www/registry/example/`.
  - The Blur Fade preview uses the upstream `blur-fade-text-demo.tsx`. Bento Grid uses `bento-demo.tsx` and its upstream dependencies.
  - `upstream/magicui/` preserves originals, including the full theme stylesheet. Runtime copies adapt imports, Next.js-only links, local avatars and existing component props for preview controls.
- **Sat Naing and shadcn/ui contributors**, MIT: https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26
  - Shared Radix primitives, utilities, mobile hook and theme variables are copied from the existing archived example. Its copyright and license are retained under `licenses/`.
- **Atlas preview adapters**: bilingual display, local preview data, source navigation, replay, limited parameter controls, same-origin messaging and static deployment. These adaptations do not claim authorship of upstream designs.

Each imported project is pinned in `sources.lock.json`. Dependency notices are included in the built download as `THIRD_PARTY_NOTICES.md`.

- **Ant Group and Ant Design contributors**, MIT: https://github.com/ant-design/ant-design/tree/f8f5595ab5e891fff6a2a06c5b3b98af643d008e
  - Official table filtering/sorting and form basic, advanced-search and form-in-modal demos are retained in `upstream/antd/` and adapted in `src/demos/antd/`.
  - Adaptations: bilingual display, visible local-only submit feedback, readable local select values, responsive search columns, and keyboard-accessible expand control. No credentials are stored or logged.
- **Microsoft and Fluent UI contributors**, MIT: https://github.com/microsoft/fluentui/tree/036f9a210cd8d72924c33dd9ff0fbb16d6aae885
  - Original DataGrid Sort, Toolbar OverflowItems, Dialog Default and Toast Intent stories are retained in `upstream/fluent/`.
  - Adapters remove the Storybook dependency, supply FluentProvider and the original light/dark themes, and provide bilingual labels. Dialog confirmation dismisses the dialog and displays local feedback.

- **shadcn and contributors**, MIT: https://github.com/shadcn-ui/ui/tree/25af02b1b467fcd53b63e0c6d6d324c57c16ef18
  - Public `login-01`, `signup-01`, `sidebar-07` and `dashboard-01` blocks, with their original UI dependencies, are retained in `upstream/shadcn/` and used in `src/blocks/`.
  - Adaptations: path aliases, local avatar, Chinese text/date labels, explicit local-only form submission, signup password confirmation/minimum length, and a separate sidebar cookie namespace. Source layout, icons and styles are retained.
  - `sidebar-07` deliberately contains the upstream skeleton content. Dashboard's additional tabs and placeholder links are layout examples, rather than connected business pages; the complete archived Shadcn Admin remains available separately.
  - The dashboard uses the upstream TanStack Table v9 API and Recharts 3.8.0, isolated from the existing Shadcn Admin project's dependencies.

Original Magic UI neutral colour tokens and animation definitions are preserved in `src/styles/source-themes.css` and `magic-animations.css`. The shadcn blocks use their own original scoped colour/chart tokens from `apps/v4/app/globals.css`. Geist is bundled locally (OFL). Thumbnail previews are inert so upstream dialogs never take keyboard focus away from the marketplace; full previews retain normal interaction.

Embedded previews use `embed=1` to omit the standalone adapter toolbar. Atlas exposes only the existing duration, quantity and target-value props beside the preview, using same-origin `atlas:preview-settings` messages. Component source styles and providers are unchanged.

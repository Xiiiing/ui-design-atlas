# Upstream sources and adaptations

- **Magic UI contributors**, MIT: https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c
  - Actual components: `apps/www/registry/magicui/`; actual demos: `apps/www/registry/example/`.
  - The Blur Fade preview uses the upstream `blur-fade-text-demo.tsx`. Bento Grid uses `bento-demo.tsx` and its upstream dependencies.
  - `upstream/magicui/` preserves originals, including the full theme stylesheet. Runtime copies adapt imports, Next.js-only links, local avatars and existing component props for preview controls.
- **Sat Naing and shadcn/ui contributors**, MIT: https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26
  - Shared Radix primitives, utilities, mobile hook and theme variables are copied from the existing archived example. Its copyright and license are retained under `licenses/`.
- **Atlas preview adapters**: bilingual display, local preview data, source navigation, replay, limited parameter controls, same-origin messaging and static deployment. These adaptations do not claim authorship of upstream designs.

Each imported project is pinned in `sources.lock.json`. Dependency notices are included in the built download as `THIRD_PARTY_NOTICES.md`.

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

Embedded previews use `embed=1` to omit the standalone adapter toolbar. Atlas exposes only the existing duration, quantity and target-value props beside the preview, using same-origin `atlas:preview-settings` messages. Component source styles are unchanged; the existing theme provider uses a resource-specific storage key to isolate simultaneous cards from one another and from the viewer.

Interactive cards use `embed=1&inline=1` with real pointer, input and keyboard handling. The archive viewport adapts padding and decorative particle height to phone cards; source typography and interaction are retained. The bridge reports readiness/errors with resource identity; MotionConfig and existing reduced-motion styles respect user preferences. Static `thumb=1` capture remains inert.

## Additional Atlas compositions and Magic UI resources

Atlas file selection, step flow, document search, recoverable feedback, file workspace,
onboarding and product/pricing pages are original compositions of the existing pinned
Ant Design dependency. They are not official Ant Design example pages. Their own
source is licensed under `licenses/atlas-compositions-LICENSE`; Ant Design retains
its original license and attribution. Inputs and files stay local to the browser.

Word Rotate, Shine Border and Meteors use the existing Magic UI commit
`efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`. Unmodified originals and hashes are in
`upstream/magicui/components` and `sources.lock.json`. Atlas supplies bilingual demo
wrappers, pause controls, reduced-motion handling and the required animation CSS.

The Bento Grid demo's notification backdrop uses Motion-managed 75%/90% scaling,
so its AnimatedList layout projections share the same scale coordinates. This
removes the insertion jump caused by a CSS-scaled ancestor; source notification
items, timing, card hover behavior and the other backgrounds are retained.

## Expressive UI intake

The following public MIT sources supply real local previews. Exact originals,
commit IDs and SHA-256 hashes are retained in `upstream/` and `sources.lock.json`;
licenses are retained in `licenses/` and the delivered source bundles.

- **BoardUI / Mertcan Dundar Esmergul**, `ec5c5eb3e29c2441be63b9422cd54f411ef23466`:
  `components/application/agent-thinking/agent-thinking.tsx` and the relevant rules
  from `styles/globals.css`. Atlas removes the documentation-only localization
  wrapper, maps typography and color tokens, and supplies variant/pause controls.
  The public MIT repository is used; BoardUI Pro is not imported.
- **Bencho / Lorenzo Cabra**, `27ac3159201fa48eb16ef65faa5d8078963a9a61`:
  Slide Confirm and Context Meter from `blocks/`, with their styles, README files,
  original token definitions and third-party notice. Atlas uses `motion/react`
  instead of `framer-motion`, supplies translated labels and scoped theme tokens,
  makes the dot field responsive, and adds keyboard confirmation and reduced-motion
  spatial behavior. No Bencho trademarks, photographs, sounds or Pro-only blocks
  are included. See https://github.com/cabralorenzo/bencho.
- **Libraries.dev / Jakub Antalik and Alexandr Brinza**,
  `9a42e88847dab0ac145733f15cf90535e9cb59ab`: the MIT Thinking Orbs package
  (`packages/thinking-orbs`, version 0.3.2). The runtime source remains unchanged;
  Atlas adds a nine-state selector, translated status labels and a pause button.
  This is the public Canvas engine, without Studio Pro or models. See
  https://github.com/Jakubantalik/Libraries.dev.
- **Watermelon Platform Contributors**,
  `b0171095227a67c40e627271a1e0ae67cdc2ed21`: Frequency Selector original source,
  demo and registry description. Atlas adds translation props, keyboard-accessible
  trigger/confirmation, selection semantics, Escape cancellation and focus return.
  Upstream credits **nitishkmrk** (https://x.com/nitishkmrk) for visual inspiration;
  this credit is retained rather than attributing the design solely to Atlas.
  See https://github.com/WatermelonCorp/watermelon-platform.
- **beUI / Saurabh Chauhan**, `090f6e3b5aebbb61a0bd2aaeb9fdae253cf51838`:
  free `components/motion/expandable-tabs.tsx` and `lib/ease.ts`. Atlas changes
  local imports, adds tab keyboard/ARIA relationships and Escape focus handling,
  and provides three localized panels whose rows return local selection feedback.
  This is an MIT alternative from **beUI free**, not a beUI Pro component. See
  https://github.com/starc007/ui-components.

HeroUI Pro and beUI Pro were evaluated visually but their proprietary source was
not imported or reconstructed. The selection and exclusions are documented in
`../../docs/content/ui-intake.md` in the repository.

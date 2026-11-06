# UI design intake

The six requested sites were evaluated for specific interface patterns that are
missing from the Atlas. Intake means a working local demo with its source, design
notes, prompts and provenance. Directory links are supplementary.

| Requested source | Design examined | Decision |
| --- | --- | --- |
| [BoardUI](https://www.boardui.com/components/agent-thinking) | Four small thinking indicators; dot wave/spin, stars and infinity trail, shimmering label and elapsed time. | Import Agent Thinking from the public MIT repository. Adds a restrained application waiting state distinct from decorative background effects. |
| [Bencho](https://bencho.dev/blocks/slide-confirm) | Handle-to-confirmation morph; [context meter](https://bencho.dev/blocks/context-meter) with category focus and reversible compaction. | Import both from the public MIT repository. Adds deliberate drag confirmation and a quantitative field/bar with stateful transitions. |
| [HeroUI Pro](https://heroui.pro/) | Product showcase: compact music-player/queue, assistant composer, shopping selection and their nested rounded surfaces. | Keep as an evaluated reference. [Terms §8–9](https://heroui.pro/terms) do not permit redistributing Pro components/source or creating a competing library. No Pro source or assets imported. A licensed product purchase alone does not authorize publishing these in Atlas. |
| [beUI Pro](https://pro.beui.dev/components) | Compact agent-plan, context-window, tool-approval and diff-review panels; continuous motion between related states. | Pro source remains private. Use the independently available [beUI free Expandable Tabs](https://beui.dev/components/blocks/expandable-tabs), explicitly attributed as free MIT source. It demonstrates expanding labels and content-sized panels without claiming Pro integration. |
| [Libraries.dev](https://libraries.dev/orbs) | Nine particle/strand thinking states, with a stable pill and label. | Import the MIT Thinking Orbs package, not another border beam already represented in Atlas. Preserve theme, pause, offscreen and reduced-motion behavior. Studio Pro and model assets are excluded. |
| [Watermelon UI](https://ui.watermelon.sh/animated-components/frequency-selector) | Summary pill that becomes a recurrence-period bar and contextual day/month grid. | Import Frequency Selector from the MIT platform repository, preserving upstream visual inspiration credit to nitishkmrk. Add keyboard trigger, draft cancellation, focus return and localization. |

## Resulting resources

- `component:boardui-agent-thinking`
- `component:bencho-slide-confirm`
- `component:bencho-context-meter`
- `component:libraries-thinking-orb`
- `component:watermelon-frequency-selector`
- `component:beui-expandable-tabs`

These resources join the actual searchable/filterable component library and the
“Make state changes feel continuous” collection. Each has an interactive preview,
light/dark cover, bilingual description, design analysis, behavioral prompt,
style-only prompt and downloadable dependency closure. Selection and demonstration
state remain in the current preview's memory. No real model, scheduling, billing
or release service is implied.

## Maintenance

Exact originals and licenses are listed in
[the source lock](../../examples/ui-market/sources.lock.json) and
[attribution](../../examples/ui-market/ATTRIBUTION.md). Runtime adaptations are kept
separate under `examples/ui-market/src/vendor/`; the unchanged Thinking Orbs engine
is copied there to provide readable source without an extra package dependency.
New files are explicitly included in `content/delivery-files.json`.

When changing these previews, check the full source and design notes against the
actual behavior. In particular, compaction must be reversible, recurrence edits
must remain uncommitted until confirmation, and tab changes must keep keyboard
focus and content visible. A successful build does not replace those interactions.

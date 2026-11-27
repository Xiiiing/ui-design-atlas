# UI Moments episode 04

Reference: [观默's 6 × 6 video](https://x.com/guanmo_ai/status/2124714808779972850/video/1).
The ui-moments-04 collection contains only 23 official implementations. The 13
Atlas video-reference controls, their records, previews, code and covers are removed.
The retained official resource IDs and collection URL stay stable.

## Official source

On 2026-11-28 the author's [ui-moments repository](https://github.com/guanmo-ai/ui-moments)
became accessible. The imported snapshot is commit
cd49fd207d9333d3c442ffdbf39a9b3b055d358f, under the author's MIT license.
No Atlas-designed controls are included in this collection. Atlas code only
connects the official examples to the host preview environment.

| Atlas slug | Official entry (gallery/originals/) |
| --- | --- |
| bloom-toggle, merge-drops, jelly-pad, ripple-pad, magnet-grid | visual.html, same fragment |
| snap-grid, domino-row, swipe-confirm, elastic-string, rocker-switch, scrub-wave, radial-menu | gestures.html, same fragment |
| paper-plane, download-ring, bell-toggle | actions.html, same fragment |
| detent-dial, leaf-tabs, ink-switch, tide-progress | index.html, same fragment |
| odometer | index.html#odometer-stepper |
| pebble-rating | inputs.html#pebble-rating |
| checklist | inputs.html#stroke-checklist |
| flip-coin | color.html#flip-coin |

Only controls with a verified implementation in this pinned revision are collected.
This migration does not import the upstream project's unrelated library galleries.

## Source, generation and reuse

Unmodified pages and their required assets live in
examples/ui-market/public/ui-moments/upstream/. The existing
examples/ui-market/sources.lock.json records their SHA-256 values and revision.
Regenerate the single-control entries with:

```sh
node scripts/sync-ui-moments.mjs
node scripts/sync-ui-moments.mjs --check
```

The generator preserves each original control's markup, stylesheet and behavior
block while removing the multi-control page shell. Atlas adds preview framing,
language/theme configuration and pause/visibility scheduling. A documented fix
prevents Swipe Confirm from committing on a cancelled drag beyond the threshold.

Source inspection and ZIP download include the actual entry, Atlas adapter,
original source page, required font/assets and both MIT and OFL notices. Binary
font bytes are encoded separately in the source manifest and written losslessly
to the ZIP; they are not treated as UTF-8 text. Extract the package preserving
relative paths and open the entry named in ATLAS-REUSE.md. No npm install is needed.

## Behavior changes

Paper Plane now follows the official automatic reset. Download Ring shows
simulated progress with cancellation; it no longer generates the Atlas text file.
Scrub Wave demonstrates playback and scrubbing without audio. Leaf Tabs uses
example data. Flip Coin randomly chooses the sun or moon face. There is no backend.
Descriptions and prompts reference the official implementations. Search by
UI Moments / uimoments / 观默, open the collection or filter by UI Moments.

The existing lazy viewer and 190,000-byte startup budget remain in effect.

# UI Moments episode 04

The reference is [观默's 6 × 6 microinteraction video](https://x.com/guanmo_ai/status/2124714808779972850/video/1).
All 36 on-screen examples have their own resource record, bilingual design notes
and prompts, a local preview, light/dark covers and a static source ZIP.

The implementation code is written for Atlas by observing the video.
It preserves the monochrome forms and interaction ideas while adding keyboard
controls, responsive framing, explicit completion states and reduced motion.
The video itself, its thumbnail, and upstream code or assets are not packaged.

The footer links to guanmo-ai/ui-moments. On 2026-11-23 the GitHub API, Git clone,
raw source and GitHub Pages entry returned 404. A search-index copy of a README
and license was visible, but actual files and their source version could not be
verified. Atlas therefore makes no claim to import that repository's code or pin
its commit. Code provenance is original under ui-moments-atlas, with the video
as the design reference. The implementation has its own MIT license and
[attribution](../../examples/ui-market/public/ui-moments/ATTRIBUTION.md).

## Included patterns

| Video row | Resource slugs |
| --- | --- |
| 1 | bars-fade, bloom-toggle, snap-grid, card-fan, gooey-tab-bar, blocks-scale |
| 2 | stretch-toggle, merge-drops, paper-plane, detent-dial, domino-row, pebble-rating |
| 3 | jelly-pad, swipe-confirm, bookmark, depth-stack, menu-morph, elastic-string |
| 4 | ripple-pad, worm-dots, download-ring, leaf-tabs, bell-toggle, ink-switch |
| 5 | rocker-switch, scrub-wave, squash-play, rubber-search, odometer, tide-progress |
| 6 | eclipse-half, magnet-grid, checklist, flip-coin, radial-menu, dot-revolve |

Resource IDs use the ui-moments- prefix. Open the ui-moments-04 collection,
select UI Moments · Atlas as the source project, or search by English or Chinese
names. Purpose facets cover buttons, forms, navigation, loading, feedback,
backgrounds, cards, layouts, search and data.

## Behavior and reuse

Swipe Confirm requires a drag of at least 90% of the track. Short or cancelled
drags return to the start. Enter or Space provides keyboard confirmation.
Paper Plane retains a sent state until explicitly reset, and Checklist keeps
each task independently editable.

Download Ring simulates progress, then generates an actual local text file.
Scrub Wave demonstrates progress and scrubbing without an audio track.
Leaf Tabs uses example data. Flip Coin alternates faces, so it is a motion
demonstration rather than a random-result tool. No external service is used.

Each ZIP contains its entry HTML and the shared readable JavaScript and CSS,
plus attribution and the implementation's license. The shared script provides
all 36 implementations and mounts only the one named by the entry HTML.
Extract the package while preserving relative paths, then open the HTML file
named in ATLAS-REUSE.md.

## Loading

Adding 36 catalog records exceeded the existing 190,000-byte startup-script
budget. The viewer and its reading/provenance UI now load when a resource is
opened. Navigation still records the origin, focus and scroll synchronously.
A delayed viewer import is checked against the current URL and request before
rendering, and failed imports expose a page-reload retry.

The startup saved-content registry contains identities only. Related guidance
is resolved from the existing full guidance catalog after opening a resource.
Production JavaScript uses UTF-8 literals. The existing budget remains in place.

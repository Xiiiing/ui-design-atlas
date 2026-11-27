# UI Moments episode 04 — source and adaptations

Visual reference: 观默 / guanmo_ai
https://x.com/guanmo_ai/status/2124714808779972850/video/1

## Official implementations (23 resources)

Repository: https://github.com/guanmo-ai/ui-moments
Pinned commit: cd49fd207d9333d3c442ffdbf39a9b3b055d358f
Copyright (c) 2026 guanmo-ai. MIT; retain licenses/ui-moments-LICENSE.
The bundled Geist font retains licenses/ui-moments-Geist-OFL (SIL OFL 1.1).

The unmodified six original HTML pages, required assets and original license
are stored in upstream/. Their SHA-256 values are in the project's
sources.lock.json. scripts/sync-ui-moments.mjs extracts one control per entry.
The extracted markup, styles and interaction blocks are the author's code.
Atlas adds framing and its theme, locale, pause and ready-message protocol in
shared/upstream.js and upstream.css (Atlas additions retain the MIT notice in
licenses/ui-moments-adapter-LICENSE). The Swipe Confirm extraction also prevents
a pointercancel beyond the threshold from confirming the action.

Official slugs: bloom-toggle, snap-grid, merge-drops, paper-plane, detent-dial,
domino-row, pebble-rating, jelly-pad, swipe-confirm, elastic-string, ripple-pad,
download-ring, leaf-tabs, bell-toggle, ink-switch, rocker-switch, scrub-wave,
odometer (odometer-stepper upstream), tide-progress, magnet-grid, checklist
(stroke-checklist upstream), flip-coin and radial-menu.

Paper Plane resets automatically. Download Ring is simulated and does not
download a file; it can be cancelled. Scrub Wave has no audio track. Flip Coin
uses the author's random sun/moon result. No external service is connected.

Only controls with an implementation in this pinned upstream revision are
collected. Atlas video-reference controls and their shared/demo.js and demo.css
implementations have been removed. The remaining Atlas code is preview
integration, not a separate control design.

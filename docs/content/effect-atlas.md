# Effect Atlas motion selection

These four local demos are part of the Atlas component and motion library.
Filter by **Effect Atlas**, or open **Effect Atlas motion selection**.

| Effect | What the demo lets you do | Useful design detail |
| --- | --- | --- |
| Pixel Wipe Button | Hover, focus, or tap a control. | Pixel tiles sweep in the same direction on entry and exit. |
| Crosshair Image Reveal | Drag the blue point, scroll the image, or use arrow keys. | The guide lines and clipping edge expose the same reveal progress. |
| Shared Element Transition | Open a tile and activate it again to collapse it. | The same artwork moves between sizes with corner correction. |
| Scroll Minimap | Scroll the sample, drag the map, or choose a section. | The outline reflects the visible part of the actual demo document. |

The selection covers four different interaction mechanisms. It excludes the
rest of the upstream catalogue, including effects that repeat patterns already
present here and the optional three.js and font examples.

## Source and reuse

The original JavaScript and CSS come from
[Effect Atlas at `c0f2b5a`](https://github.com/effect-atlas/effect-atlas/tree/c0f2b5a148a2803d40ca1bc3c1f44e4db7f95b84).
They remain byte-for-byte as pinned in
[the source lock](../../examples/ui-market/sources.lock.json). Atlas adds an
isolated preview host, Chinese and English titles, instructions and control
labels, and light and dark preview framing. The minimap preserves the English
sample editorial content; the light artwork and controls retain their original
colors in dark mode. All effects honor the browser's reduced-motion preference.

The [Effect Atlas License 1.0](../../examples/ui-market/licenses/effect-atlas-LICENSE)
permits sharing with the copyright intact. It is not an open-source license
and prohibits standalone sales and mirroring the site or a substantial part
of the upstream repository. The Atlas library labels the items **Source
available**. Keep the included license and copyright when reusing the demos.

To run a download, extract the ZIP and open
`public/effect-atlas/<effect>/index.html` directly. The included sibling
preview files and effect scripts are sufficient; no installation or network
access is needed. Add `?lang=zh-CN&theme=dark` for the Chinese dark preview.

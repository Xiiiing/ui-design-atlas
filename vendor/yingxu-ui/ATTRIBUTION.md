# Yingxu UI — Atlas shell baseline

Atlas reuses the design tokens and actual shared React components from the user-supplied Yingxu UI reference, prepared on 2026-10-19 from [Xiiiing/ai-studio](https://github.com/Xiiiing/ai-studio).

- UI baseline: `f775817076202ee9a415a069a2c141fba3257b43`
- Integrated source: `b3cc662ce5cfe7947d6e5cec84ae54719f5d1062`
- Source PRs: 86, 87
- Origin metadata: [provenance.json](./provenance.json)
- Original shared components and styles: `reference/react/`, `reference/css/`
- Runtime dependency notices: [THIRD_PARTY_LICENSES.txt](./THIRD_PARTY_LICENSES.txt)

The reference files are retained unchanged; `sources.lock.json` records their SHA-256 values. `shell/controls.tsx` is the Atlas integration layer. It adapts the real Select, Menu, SelectionGroup and ScrollLock components to the existing catalog renderer and native forms. React selection roots are retained across view updates so Motion preserves its current movement.

The baseline contributes neutral light/dark tokens, the slate focus color, black/white action hierarchy, a 32/20/16/14/12px type scale, 44px interactive targets, 16px panels and 11px controls. Atlas keeps its resource wall and immersive preview flow. It does not copy the reference application's production workflow, business data or brand assets.

The shell uses independently locked dependencies in the root lockfile. Archived resource examples retain their own builds, dependencies, styles, providers and licenses.

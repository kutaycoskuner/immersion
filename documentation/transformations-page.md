# Transformations page

The transformations page (`/transformations`): an animation described with matrices, in the style of imge's matrix calculator. First transformation: **translation** of a cube.

## Layout

```text
 ┌ i. matrix · translation ───────────────────┐ ┌ iii. viewport ───────────────┐
 │ T [1 0 0 tx] · p [px] = p′ [ ]             │ │                              │
 │   [0 1 0 ty]     [py]      [ ]             │ │      ┌──┐ - - ->┌──┐         │
 │   [0 0 1 tz]     [pz]      [ ]             │ │      └──┘       └──┘         │
 │   [0 0 0  1]     [ 1]      [1]             │ │   start (outline)   moved    │
 │ - - - - - - - - - - - - - - - - - - - - - -│ │                              │
 │ M(t) [...] · p [...] = p′(t) [...]         │ │                              │
 │ [0 · before] ────■──────── [1 · after]     │ │                     gizmo ◎  │
 └────────────────────────────────────────────┘ │                              │
 ┌ ii. description ───────────────────────────┐ │                              │
 │ Begin / Step 1 ... 4         (scrolls)     │ │                              │
 └────────────────────────────────────────────┘ └──────────────────────────────┘
```

- framed areas as on the vectors page, see [page layout](page-layout.md); the gap between left and right can be dragged

## i. matrix

- **T · p = p′** (editable): type t_x, t_y, t_z into T's last column (axis colours) and the point p's x, y, z; w = 1 stays fixed; p′ is the full move (t = 1)
    - values from -8 to 8, so the move stays inside the grid
    - a half-typed value ("", "-") waits instead of jumping to 0
- **M(t) · p = p′(t)** (read-only): the same at the stage t; every number follows the bar
- **the bar**: drag t from 0 (before) to 1 (after) in steps of 0.01; **0 · before** and **1 · after** jump to the ends
- each equation stays on one line: when the area is narrow the row shrinks instead of scrolling (`fitWidth`, see [page layout](page-layout.md))

## ii. description

Four steps with the live values: the point in homogeneous coordinates (w = 1), the translation matrix (general and with the numbers), the stage matrix $M(t)$, the point moved ($p' = M(t)\,p$), then things to try (directions with w = 0 don't move, half way at t = 0.5).

## iii. viewport

- the cube (2 units, centred at the origin) is moved by **exactly the matrix the page shows**: M(t) is copied into the cube's matrix (`matrixAutoUpdate = false`), not into its position
- once it has moved: the starting cube as a faint outline, the point p at both ends and a dashed line for its path
- camera: see [viewport gizmo](viewport-gizmo.md), including the orthographic switch

## How the stage works

`translation(offset, t)` in `src/lib/transformMath.ts` builds M(t), which moves t of the way: t = 0 is the identity, t = 1 the full translation. The bar only sets t (`STAGE`); panel, description and scene all compute from it.

## Files

| File | What it does |
| --- | --- |
| `src/routes/(app)/transformations/+page.svelte` | the page: the three areas |
| `src/lib/components/TranslationPanel.svelte` | the matrix panel: both equations and the bar |
| `src/lib/components/MatrixGrid.svelte` | a matrix in square brackets as HTML, cells can be inputs |
| `src/lib/components/TranslationDescription.svelte` | the live formulas of the description |
| `src/lib/transformDescriptions.ts` | the description texts (data) |
| `src/lib/components/TransformScene.svelte` | the viewport: cube, outline, point path |
| `src/lib/transformMath.ts` | 4x4 matrices: identity, translation(offset, t), apply (tested in `transformMath.spec.ts`, also against three.js) |
| `src/lib/stores/transform.ts` | the translation, the point, the stage t, limits and colours |

## Next transformations

A rotation or scale follows the same pattern: a matrix function with the stage t in `transformMath.ts` (with tests), its cells for `MatrixGrid`, a description data file and component, and the scene copies the matrix into the cube.

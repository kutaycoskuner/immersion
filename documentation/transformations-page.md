# Transformations page

The transformations page (`/transformations`): an animation described with matrices, in the style of imge's matrix calculator. A cube is transformed by a matrix you type in: **translation**, **scaling** or **rotation** (Euler angles; quaternions later).

## Links

Each transformation has its own address, to send or bookmark:

| Link                                                                                                  | Shows                                       |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [/transformations/translation](https://kutaycoskuner.github.io/immersion/transformations/translation) | translation (also plain `/transformations`) |
| [/transformations/scaling](https://kutaycoskuner.github.io/immersion/transformations/scaling)         | scaling                                     |
| [/transformations/rotation](https://kutaycoskuner.github.io/immersion/transformations/rotation)       | rotation                                    |

The switch buttons are these links. It is one route with an optional part (`transformations/[[kind]]`), so switching keeps the page and its viewport; each address is prerendered as its own page for the static site, and an unknown name gives the 404 page.

## Layout

```text
 ┌ i. matrix · rotation ──────────────────────┐ ┌ iii. viewport ───────────────┐
 │ [T · translation] [S · scaling] [R · rot.] │ │                              │
 │ - - - - - - - - - - - - - - - - - - - - - -│ │         ╭ - - -╮             │
 │ θ [θx θy θz] °   about x, then y, then z   │ │      ┌──┐      ┌──┐          │
 │ R [....] · p [px] = p′ [ ]                 │ │      └──┘      └──┘          │
 │ - - - - - - - - - - - - - - - - - - - - - -│ │   start       rotated        │
 │ M(t) [...] · p [...] = p′(t) [...]         │ │   (outline)   (arc path)     │
 │ [0 · before] ────■──────── [1 · after]     │ │                     gizmo ◎  │
 └────────────────────────────────────────────┘ │                              │
 ┌ ii. description · rotation ────────────────┐ │                              │
 │ Begin / Step 1 ... 5         (scrolls)     │ │                              │
 └────────────────────────────────────────────┘ └──────────────────────────────┘
```

- **the switch** is the first row inside the matrix frame, so the viewport keeps the full height
- framed areas as on the vectors page, see [page layout](page-layout.md); the gap between left and right can be dragged
- every transformation keeps its own typed values, so switching back and forth loses nothing; the point p and the stage t are shared

## i. matrix

- **the bar** comes first, right under the switch, so it is seen without scrolling: drag t from 0 (before) to 1 (after) in steps of 0.01; **0 · before** and **1 · after** jump to the ends; every transformation starts at t = 0 (also after switching)
- **first row, editable**: the full transformation times the point, p′ is the result (t = 1)
  - **translation T**: type t_x, t_y, t_z into the last column (-8 to 8)
  - **scaling S**: type s_x, s_y, s_z on the diagonal (-4 to 4; 1 = no change, 0 flattens, negative mirrors)
  - **rotation R**: the angles are typed into their own row above, θ = [θ_x θ_y θ_z] in degrees (-180 to 180), applied about x, then y, then z; R itself is read-only (its cells are cos and sin of the angles); starts at 90° about z
  - the point p's x, y, z (-8 to 8); w = 1 stays fixed
  - the typed cells are in the axis colours; a half-typed value ("", "-") waits instead of jumping to 0
- **M(t) · p = p′(t)** (read-only): the same at the stage t; every number follows the bar
- each equation stays on one line: when the area is narrow the row shrinks instead of scrolling (`fitWidth`, see [page layout](page-layout.md))

## ii. description

Steps with the live values, per transformation:

- **translation**: the point in homogeneous coordinates (w = 1), the translation matrix, the stage matrix $M(t)$ (the last column grows with t), the point moved ($p' = M(t)\,p$), things to try (directions with w = 0 don't move)
- **scaling**: the point, the scaling matrix (factors on the diagonal, scaling about the origin), the stage matrix (each factor goes $1 + t\,(s - 1)$), the point scaled, things to try (factor 1, 0, negative; directions scale too)
- **rotation**: the point, the three axis rotations $R_x, R_y, R_z$ with cos and sin, their product $R = R_z R_y R_x$ (x first, matrices act right to left, the order matters), the stage $R(t)$ with t times every angle (the point moves on an arc), the rotated point and its unchanged distance to the origin, things to try

## iii. viewport

- the cube (2 units, centred at the origin) is transformed by **exactly the matrix the page shows**: M(t) is copied into the cube's matrix (`matrixAutoUpdate = false`), not into its position, scale or rotation
- once M(t) is not the identity: the starting cube as a faint outline; when the point moves, p at both ends and a dashed path through every stage from 0 to t (a line for translation and scaling, an arc for rotation)
- camera: see [viewport gizmo](viewport-gizmo.md), including the orthographic switch

## How the stage works

The matrix functions in `src/lib/transformMath.ts` take the stage t and go from the identity (t = 0) to the full transformation (t = 1):

- `translation(offset, t)`: the last column is t times the offset
- `scaling(factors, t)`: each diagonal value goes from 1 to its factor
- `rotation(degrees, t)`: every Euler angle is t times its value, $R(t) = R_z(t\theta_z)\,R_y(t\theta_y)\,R_x(t\theta_x)$; the entries are cos / sin, so they don't change in step with t (no quaternions or slerp yet)

The bar only sets t (`STAGE`); panel, description and scene all compute from it.

## Files

| File                                                                                                          | What it does                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/(app)/transformations/[[kind]]/+page.svelte`                                                      | the page: `TransformView.svelte` (the switch, the three areas, which description), shared with the [spaces page](spaces-page.md)                  |
| `src/routes/(app)/transformations/[[kind]]/+page.ts`                                                          | the transformation from the address, the list of addresses to prerender                                                                           |
| `src/lib/transformKinds.ts`                                                                                   | the transformations as data: name, symbol, values store, matrix, editable cells (or separate inputs for rotation), limits                         |
| `src/lib/components/TransformPanel.svelte`                                                                    | the matrix panel for the chosen transformation: the angle row (rotation), both equations and the bar                                              |
| `src/lib/components/MatrixGrid.svelte`                                                                        | a matrix in square brackets as HTML, cells can be inputs                                                                                          |
| `src/lib/components/TranslationDescription.svelte`, `ScalingDescription.svelte`, `RotationDescription.svelte` | the live formulas of each description                                                                                                             |
| `src/lib/transformDescriptions.ts`                                                                            | the description texts (data)                                                                                                                      |
| `src/lib/components/TransformScene.svelte`                                                                    | the viewport: cube, outline, point path                                                                                                           |
| `src/lib/transformMath.ts`                                                                                    | 4x4 matrices: identity, translation, scaling, axis rotation, rotation, multiply, apply (tested in `transformMath.spec.ts`, also against three.js) |
| `src/lib/stores/transform.ts`                                                                                 | the chosen transformation, its values, the point, the stage t, limits and colours                                                                 |

Tests: `transformMath.spec.ts` (the matrices, against three.js; rotation against `Euler` order `ZYX`), `transformDescriptions.spec.ts` (all three descriptions rendered at t = 0, 0.37 and 1 without KaTeX errors).

## Adding a transformation

1. its matrix function with the stage t in `transformMath.ts`, with tests (also against three.js)
2. its entry in `transformKinds.ts`: `ready: true`, its values store (in `stores/transform.ts`), the matrix function, which cells are typed into (or `separateInputs` when the typed values are not matrix cells, as for rotation), limits
3. its description texts in `transformDescriptions.ts` and a description component with the live formulas; pick it in the page
4. panel, switch, scene and its link (`/transformations/<id>`) need no change: they work from the entry

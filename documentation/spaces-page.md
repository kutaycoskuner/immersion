# Spaces page

The spaces page (`/spaces/<kind>`): the steps between coordinate spaces, with the same layout and controls as the [transformations page](transformations-page.md) (matrix panel with values to type, stage bar from 0 to 1, description, viewport), shared through `TransformView.svelte`. An upper switch chooses the category, from which space to which:

| Category | Kinds | Links |
| --- | --- | --- |
| **3D → 3D** | local → world | [/spaces/local-to-world](https://kutaycoskuner.github.io/immersion/spaces/local-to-world) (also plain `/spaces`) |
| **3D → 2D** | the projections: orthographic, perspective | [/spaces/orthographic](https://kutaycoskuner.github.io/immersion/spaces/orthographic), [/spaces/perspective](https://kutaycoskuner.github.io/immersion/spaces/perspective) |
| **2D → 2D** | later (e.g. the viewport: to pixels) | |

The graphics chain these steps come from:

```text
local --model--> world --view--> camera --projection--> 2D --viewport--> pixels
  3D -> 3D          3D -> 3D            3D -> 2D               2D -> 2D
  (can be undone)                       (cannot be undone)
```

## 3D → 3D: local → world

- **local space**: the object as modelled, around its own origin; the cube's corners are always (±1, ±1, ±1) there
- **world space**: the space the scene shares (the grid, the faint world axes)
- the **model matrix** M = T · R · S places the object: type its **position**, **rotation** (degrees, about x, then y, then z) and **scale** in three rows; M is read right to left: scale, then turn, then move
- the point p is typed in local coordinates; p_world = M · p_local
- the viewport shows the cube's own axes riding on it (they move, turn and stretch with M) and the world axes at the origin
- the description explains the spaces, the three parts, why the order matters, M's columns as the object's axes in world space, the stage, and the way back with M⁻¹ (none when a scale is 0)
- the stage t: every part goes t of the way (position t of its offset, angles t of their value, scale from 1)

## 3D → 2D: the projections

Both descriptions start with **"A projection is a transformation too"**: a 4×4 matrix like the others, but it throws a direction away, so many points land on one spot and it cannot be undone.

- **orthographic**: the identity with its z row zeros, `diag(1, 1, 0, 1)`; the cube flattens towards the screen (the plane z = 0) into a square; two points differing only in depth land on one spot
- **perspective**: the z row zeros and the bottom row `0 0 -1/d 1`, so the result has `w = 1 - z/d`; the **divide by w** gives `(x, y) * d / (d - z)` (the panel shows the result with its w and, after `÷ w →`, the divided point); type the eye distance d (2 to 12); the eye is the white dot with a faint ray through the point to the screen; while the bar moves the point travels along that ray
- the viewport shows the screen z = 0 as a faint square; the cube is drawn with the projection matrix as its own, the divide by w happening in the GPU's perspective divide

## Files

| File | What it does |
| --- | --- |
| `src/routes/(app)/spaces/[[kind]]/+page.svelte`, `+page.ts` | the page (TransformView with the categories), the kind from the address |
| `src/lib/transformKinds.ts` | `SPACE_CATEGORIES`, the entries `local-to-world` (`inputRows`), `orthographic`, `perspective` (`inputs` d, `divide`); `kindsOf`, `loadKind`, `kindEntries` |
| `src/lib/transformMath.ts` | `modelMatrix` (T R S, stage t), `orthographic`, `perspective`, `applyPoint` (apply, then divide by w) |
| `src/lib/stores/transform.ts` | `MODEL_POSITION`, `MODEL_ROTATION`, `MODEL_SCALE` and `PLACEMENT` (them together), `PERSPECTIVE` |
| `src/lib/components/InputRowGrid.svelte` | one typed row with its own store (position, rotation, scale) |
| `src/lib/components/LocalToWorldDescription.svelte`, `OrthographicDescription.svelte`, `PerspectiveDescription.svelte` | the live formulas |
| `src/lib/spaceDescriptions.ts`, `src/lib/projectionDescriptions.ts` | the description texts (data) |
| `src/lib/components/TransformView.svelte` | the page body shared with the transformations page (category row when given) |
| `src/lib/components/TransformScene.svelte` | the viewport; local and world axes for 3D → 3D, the screen and the eye for 3D → 2D |

Tests: `transformMath.spec.ts` (model matrix: identity at 0, scale then turn then move, matches three.js `Matrix4.compose`, can be undone; orthographic flattens and loses depth; perspective lands on the eye's ray and stays on it), `transformDescriptions.spec.ts` (every description renders without KaTeX errors at t = 0, 0.37, 1; local → world also with a scale of 0).

## Next

- 3D → 3D: world → camera (the view matrix)
- 2D → 2D: the viewport transform (to pixels)

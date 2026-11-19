# Vectors page

The home page (`/`): two vectors in a 3d scene and a step by step description of their dot product or cross product, with the live values.

## Layout

```text
 ┌ i. description · dot product ─┐ ┌ ii. viewport ──────────────────────────┐
 │ Begin: base vectors           │ │                        ┌ Controls ────┐│
 │ - - - - - - - - - - - - - - - │ │                        │ Vec 1 X/Y/Z  ││
 │ Step 1 ...                    │ │      v1   v2           │ Vec 2 X/Y/Z  ││
 │ - - - - - - - - - - - - - - - │ │       \  /             │ Scalar|Vector││
 │ Step 2 ...        (scrolls)   │ │        \/              └──────────────┘│
 │                               │ │                               gizmo ◎  │
 └───────────────────────────────┘ └────────────────────────────────────────┘
```

- two framed areas, see [page layout](page-layout.md): the description (scrolls on its own) and the viewport; drag the gap between them to resize
- the **Controls** pane (Tweakpane, top right of the viewport): the sliders set the two vectors (-1 to 1 per axis), shared by both tabs; the tabs choose the product
    - *Scalar Product*: dot product, toggle **Projection**
    - *Vector Product*: cross product, toggle **Parallelogram**
- the description follows the chosen tab; its title says which product it shows

## Dot product (Scalar Product tab)

- **description**: base vectors, normalization ($\hat v = \vec v / |\vec v|$), the dot product written out with the normalized components, what it represents (projection of v1 onto v2, the cosine of the angle), things to try
- **viewport**: the angle arc with its value in degrees, the scalar projection of v1 onto v2 (purple arrow, label *Scalar Projection*) and a faint line from v1's tip to it

## Cross product (Vector Product tab)

- **description**: base vectors, the component formula (each component leaves its own axis out), the values, the length $|v_1|\,|v_2|\sin\theta$ = the parallelogram's area, the right-hand rule, things to try (parallel, perpendicular, swapped order)
- **viewport**: v1 × v2 as an orange arrow (label *Cross Product*) and the shaded parallelogram v1 and v2 span, with dashed far edges
- the vectors are not normalized here: their lengths are part of the result

## Viewport

- each input vector: a line with a cone tip in the vector's own colour (x, y, z read as r, g, b), a dashed line down to the ground and its coordinates at the tip
- the scene background is the page background; the grid takes the theme's text colour
- a model loaded in the settings overlay (Esc) is shown here too, with the camera on it
- camera: see [viewport gizmo](viewport-gizmo.md); W A S D move the camera (not while typing in the pane)

## Files

| File | What it does |
| --- | --- |
| `src/routes/(app)/+page.svelte` | the page: the two areas, which description to show |
| `src/lib/components/ThreeScene.svelte` | the scene, the Controls pane, drawing vectors / angle / projection / cross product |
| `src/lib/components/DotProduct.svelte`, `CrossProduct.svelte` | the live formulas of each product |
| `src/lib/vectorDescriptions.ts` | the description texts (data, inline `$...$` math) |
| `src/lib/vectorMath.ts` | length, normalize, dot, cross, angle (tested in `vectorMath.spec.ts`) |
| `src/lib/vectorTex.ts` | TeX helpers: KaTeX rendering, text with inline math, coloured column vectors |
| `src/lib/config/config-vector_colors.ts` | the colours shared by formulas and scene |
| `src/lib/stores/vectors.ts` | the two vectors and the chosen product |

## Changing the texts

Edit `src/lib/vectorDescriptions.ts`: each section has a title and blocks, `{ text }` with inline math between `$` signs or `{ formula: 'name' }` for a live formula the product's component computes. `pnpm test:unit --run` checks that every text renders in KaTeX (`vectorDescriptions.spec.ts`).

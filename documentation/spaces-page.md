# Spaces page

The spaces page (`/spaces/<kind>`): the steps between coordinate spaces, with the same layout and controls as the [transformations page](transformations-page.md) (matrix panel with values to type, stage bar from 0 to 1, description, viewport), shared through `TransformView.svelte`. An upper switch chooses the category, from which space to which:

| Category    | Kinds                                                    | Links                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3D → 3D** | local → world, world → camera, camera → clip, clip → NDC | [/spaces/local-to-world](https://kutaycoskuner.github.io/immersion/spaces/local-to-world) (also plain `/spaces`), [/spaces/world-to-camera](https://kutaycoskuner.github.io/immersion/spaces/world-to-camera), [/spaces/clip-space](https://kutaycoskuner.github.io/immersion/spaces/clip-space), [/spaces/ndc](https://kutaycoskuner.github.io/immersion/spaces/ndc) |
| **3D → 2D** | the projections onto z = 0: orthographic, perspective    | [/spaces/orthographic](https://kutaycoskuner.github.io/immersion/spaces/orthographic), [/spaces/perspective](https://kutaycoskuner.github.io/immersion/spaces/perspective)                                                                                                                                                                                            |
| **2D → 2D** | later (e.g. the viewport: to pixels)                     |                                                                                                                                                                                                                                                                                                                                                                       |

The graphics chain these steps come from:

```text
local --model--> world --view--> camera --projection--> clip --÷w--> NDC --viewport--> pixels
  3D -> 3D          3D -> 3D            3D -> 2D               2D -> 2D
  (can be undone)                       (cannot be undone)
```

## 3D → 3D: local → world

- **local space**: the object as modelled, around its own origin; the cube's corners are always (±1, ±1, ±1) there
- **world space**: the space the scene shares (the grid, the faint world axes)
- the **model matrix** M = T · R · S places the object: type its **position**, **rotation** (degrees, about x, then y, then z) and **scale** in three rows; M is read right to left: scale, then turn, then move
- the point p is typed in local coordinates; p_world = M · p_local
- the viewport shows the cube's own axes riding on it (they move, turn and stretch with M) and the world axes at the origin; where the cube and its axes started stays as grey ghost lines
- the ground is the xz plane (y = 0): the cube is 2 high in local space, so with position y = scale y it stands on the ground once placed (t = 1); the starting values (position (3, 1, -1), rotation y 45°, scale (1, 1, 1)) do that; both boxes start unscaled, so the world keeps their modelled size (scale can still be typed)
- a **second object**, an orange box with its own local axes, stands in the same world by its own fixed model matrix (`COMPANION_PLACEMENT`, not typed): one world, every object with its own local space; shown only for 3D → 3D
- the description explains the spaces (also the second object and the ground), the three parts, why the order matters, M's columns as the object's axes in world space, the stage, and the way back with M⁻¹ (none when a scale is 0)
- the stage t: every part goes t of the way (position t of its offset, angles t of their value, scale from 1)

## 3D → 3D: world → camera

- the **camera** is one more object in the world, drawn as a white wire frame (a frustum opening down its own -z, a small triangle for its up) with its own axes: x right, y up, z backwards; a faint line runs from it to its target
- type its **eye** (where it stands) and **target** (what it looks at) in two rows; its up is the world's y. The starting camera stands at (-6, 3, 4), looking at (0, 1, 0), so the viewport sees it side on
- **lookAt**: forward f = (target - eye) normalised, right r = f × up (normalised), up u = r × f; the camera's z axis is -f (right-handed: it looks down -z). Looking straight up or down (f × up = 0) the world's -z stands in for up
- the camera's placement is M_camera = T(eye) · R with R's columns r, u, -f; the **view matrix** is its inverse, V = Rᵀ · T(-eye): move the eye to the origin, then turn the camera onto x, y, z; its rows are the camera's axes
- world → camera is 3D → 3D like local → world: nothing is flattened and V⁻¹ = M_camera brings it back; the projection comes after it
- the point p is typed in world coordinates; p_camera = V · p_world; the eye lands on the origin, the target on -z
- the viewport draws the whole world through V(t): the blue box with V(t) · M (its placement from local → world), the orange box, the world axes and the camera, each with V(t) times its own placement. At t = 1 the camera stands at the origin looking down -z, and the viewport's grid stands for camera space. Where everything started stays as grey ghosts: both boxes with their axes, the world axes and the camera's frame and axes; dashed paths show the eye travelling to the origin and, fainter, the world's origin moving away
- the stage t: V(t) = R(t)ᵀ · T(-t · eye), the world moves t of the way and turns t of the angle (a quaternion slerp from no turn)
- the description also shows the model-view matrix V · M for a corner of the blue box: the pipeline so far

## 3D → 2D: the projections

Both descriptions start with **"A projection is a transformation too"**: a 4×4 matrix like the others, but it throws a direction away, so many points land on one spot and it cannot be undone.

- **orthographic**: the identity with its z row zeros, `diag(1, 1, 0, 1)`; the cube flattens towards the screen (the plane z = 0) into a rectangle; two points differing only in depth land on one spot
- **perspective**: the z row zeros and the bottom row `0 0 -1/d 1`, so the result has `w = 1 - z/d`; the **divide by w** gives `(x, y) * d / (d - z)` (the panel shows the result with its w and, after `÷ w →`, the divided point); type the eye distance d (2 to 12); the eye is the white dot with a faint ray through the point to the screen; while the bar moves the point travels along that ray
- the cube is turned 45° about y before it is projected (`PROJECTION_PLACEMENT`), so two of its faces show and the flattening is apparent; the point p stays where it is typed
- the viewport shows the screen z = 0 as a faint square; the cube is drawn with the projection matrix as its own, the divide by w happening in the GPU's perspective divide

## 3D → 3D: camera → clip and clip → NDC

Two entries after world → camera, both 3D → 3D: nothing is flattened, depth is kept; 2D comes later (the screen reads only x and y). Both continue the pipeline from **camera space**, as world → camera left it (eye at the origin, looking down -z), with a perspective camera, and **share** its frustum and point (one store each), so values typed in one carry over.

Common to both:

- the point p is typed in camera space (`CAMERA_POINT`, starting at (1, 0.5, -6), in front of the eye); the other kinds' point is local or world
- the camera's **frustum**: type **fov** in degrees, **near** and **far** (`CLIP_FRUSTUM`; each with its own range, shown without the axis colours: they are not x, y, z), starting at 60°, 1, 12; the aspect is 1 for now (`SCREEN_ASPECT`); far is kept at least 0.1 behind near
- `P` as three.js' `PerspectiveCamera.projectionMatrix` (OpenGL convention, `clipPerspective`): k = 1 / tan(fov / 2) on x and y, the z row putting near on -w and far on +w, the bottom row `0 0 -1 0`, so **w = -z**, the depth in front of the eye
- the viewport: the camera drawn as what fov, near and far make it -- its frustum: a see-through pyramid from the eye at the origin (with the camera's axes; faint lines to the near corners) through the near face (brighter: the screen) to far, labelled eye, near (screen), far; the parts of the boxes inside the frustum bright, outside grey (clipping planes from the frustum as drawn, tested on the point divided by w: `divideClipping`)
- two more boxes the camera cannot show (`CLIP_HIDDEN`): **beyond far** (green, its depth follows far) and **behind the eye** (purple), labelled and grey

**camera → clip** (`clip-space`): the matrix and the clip test.

- clip space is 4D (x, y, z, w) and has no shape to draw: the **viewport stays still** in camera space; there is nothing to animate, so this step has **no bar** and no stage row (`noStage`), the panel shows only P · p
- **clip test**: a clip-space point is inside the frustum when -w ≤ x, y, z ≤ w; the description writes it out per axis with a tick or a cross (`clipTest`, `$lib/clipTex`), or says "behind the eye" when w ≤ 0 -- the test comes before any divide

**clip → NDC** (`ndc`): the divide by w.

- every clip-space point divided by its own w: the frustum becomes the cube -1..1; the panel shows the clip point with its w and, after `÷ w →`, the NDC point; the description shows the frustum's corners landing on the cube's and how unevenly depth spreads between near and far
- **squeeze, then mirror**: in camera space in front is -z, in NDC a bigger z is farther (NDC is left-handed), so P = F · S: S squeezes keeping in front at -z (near → +1, far → -1, `clipSqueeze`), F = diag(1, 1, -1, 1) mirrors z (`zMirror`), a sign convention. The kind has its own `stage`: the bar shows **only the squeeze**, M(t) = I + t (S - I), divided by w by the GPU -- w stays positive in front of the eye, near and far never cross; at t = 1 the panel's second row shows S, the first row P, differing only in the sign of z
- while the bar moves the camera's axes and the pyramid's tip fade out (its eye goes to infinity); grey ghosts keep the frustum and the boxes in camera space; the box behind the eye disappears once its w turns negative (a GPU clips it), its ghost stays
- a **camera view** in the bottom-left corner: the scene in camera space seen through a three.js camera with the same fov, near and far -- what this camera's picture is; the hidden boxes never appear in it

## Files

| File                                                                                                                                                                                                              | What it does                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/(app)/spaces/[[kind]]/+page.svelte`, `+page.ts`                                                                                                                                                       | the page (TransformView with the categories), the kind from the address                                                                                                                                                                                                                                                           |
| `src/lib/transformKinds.ts`                                                                                                                                                                                       | `SPACE_CATEGORIES`, the entries `local-to-world` and `world-to-camera` (`inputRows`), `orthographic`, `perspective` (`inputs` d, `divide`), `clip-space` and `ndc` (`inputs` fov, near, far with their own ranges, `point` `CAMERA_POINT`; `ndc` with `stage` and `divide`); `kindsOf`, `loadKind`, `kindEntries`, `pointStoreOf` |
| `src/lib/transformMath.ts`                                                                                                                                                                                        | `modelMatrix` (T R S, stage t), `cameraBasis` (lookAt), `cameraMatrix`, `viewMatrix` (stage t), `orthographic`, `perspective` (onto z = 0), `clipPerspective` (camera → clip, stage t), `clipSqueeze`, `zMirror`, `frustumHalfSizes`, `clipTest`, `SCREEN_ASPECT`, `applyPoint` (apply, then divide by w)                         |
| `src/lib/stores/transform.ts`                                                                                                                                                                                     | `MODEL_POSITION`, `MODEL_ROTATION`, `MODEL_SCALE` and `PLACEMENT` (them together), `COMPANION_PLACEMENT` / `COMPANION_COLOR` (the second object), `CAMERA_EYE`, `CAMERA_TARGET` and `LOOK`, `CAMERA_COLOR`, `PERSPECTIVE`, `CLIP_FRUSTUM`, `CAMERA_POINT`, `CLIP_HIDDEN`                                                          |
| `src/lib/components/InputRowGrid.svelte`                                                                                                                                                                          | one typed row with its own store (position, rotation, scale; eye, target)                                                                                                                                                                                                                                                         |
| `src/lib/components/LocalToWorldDescription.svelte`, `WorldToCameraDescription.svelte`, `OrthographicDescription.svelte`, `PerspectiveDescription.svelte`, `ClipSpaceDescription.svelte`, `NdcDescription.svelte` | the live formulas                                                                                                                                                                                                                                                                                                                 |
| `src/lib/spaceDescriptions.ts`, `src/lib/projectionDescriptions.ts`, `src/lib/clipSpaceDescriptions.ts`, `src/lib/clipTex.ts` (the clip test and matrices as LaTeX)                                               | the description texts (data)                                                                                                                                                                                                                                                                                                      |
| `src/lib/components/TransformView.svelte`                                                                                                                                                                         | the page body shared with the transformations page (category row when given)                                                                                                                                                                                                                                                      |
| `src/lib/components/TransformScene.svelte`                                                                                                                                                                        | the viewport; local and world axes and the second object for 3D → 3D, the camera and the world drawn through V(t) for world → camera, the screen z = 0 and the eye for the projections, the frustum, inside / outside, the hidden boxes for camera → clip (still) and clip → NDC (the squeeze, the corner camera view)            |
| `src/lib/three/clipSpaceView.ts`, `src/lib/three/textSprite.ts`                                                                                                                                                   | the frustum steps' parts (corners, frame, see-through faces, labels, inside planes, the divided clipping, the corner camera); text labels in the scene                                                                                                                                                                            |

Tests: `transformMath.spec.ts` (model matrix: identity at 0, scale then turn then move, matches three.js `Matrix4.compose`, can be undone; orthographic flattens and loses depth; perspective lands on the eye's ray and stays on it; camera → clip matches three.js' `PerspectiveCamera`, identity at 0 (camera → clip's numbers and the squeeze), near to -1 and far to +1, the frustum's corners onto the cube's, the clip test inside / aside / behind / beyond far, w positive at every stage, P = F S, the bar's squeeze without near and far crossing; view matrix: matches the inverse of three.js `Matrix4.lookAt`, eye to the origin and target onto -z, undone by the camera's placement, identity at 0, unit right-angled axes looking straight down), `transformDescriptions.spec.ts` (every description renders without KaTeX errors at t = 0, 0.37, 1; local → world also with a scale of 0, camera → clip and clip → NDC also with a point behind the eye), `stores/transform.spec.ts` (with the starting values both boxes stand exactly on the ground at t = 1).

## Next

- 2D → 2D: the viewport transform (to pixels)

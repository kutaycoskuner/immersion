# Viewport gizmo

The project's own viewport gizmo (Blender style), in the bottom-right corner of every 3d scene. It replaced the `three-viewport-gizmo` library and is taken from the gizmo of Bauteilerstellung-2.0, adapted to three.js axes (Y up, front = +Z) and English texts.

## Use

- the axes X / Y / Z (red / green / blue) turn with the camera; the negative axes are hollow and show their label on hover or when they point at you
- **click an axis**: turn to the view from that side; click it again for the opposite side
- **drag the gizmo**: orbit (a drag across it turns half a revolution)
- buttons under the gizmo: **perspective / orthographic** (where the scene offers it), **hand**, **R / L**, **reset view** -- see below for hand and R / L
- **reset view** button (frame icon): back to the camera the scene started with
- **perspective / orthographic** button (dot grid icon: foreshortened dots = perspective, even 3 × 3 grid = orthographic), on the vectors and transformations pages
- view changes are eased (350 ms); dragging the scene cancels a running turn

## Hand gizmo and handedness

- **hand** button (open hand icon): the gizmo shows a small hand instead of the abstract axes -- its thumb, index and middle finger point along the world's x, y and z as the camera sees them, in the axis colours (thumb red, index green, middle blue), the other two fingers curled in; hold your own hand the same way and you know where the axes point. Dragging still orbits; clicking an axis needs the axes back
- **R / L** button: which hand the axes follow
    - **R**, right-handed: three.js, OpenGL, Blender -- thumb x × index y = middle z
    - **L**, left-handed: Unity, Direct3D -- x and y stay, +z is the other way; the Z bubble swaps sides (clicking it views from that side) and the hand becomes a left hand, the mirror image
    - the scene itself stays right-handed; L only changes how the axes are named and shown
- both choices are shared by every scene's gizmo and stay as set from page to page
- the hand model (`hand.ts`): a simple low-poly hand, overall shape only -- flat colours (grey, the three axis fingers in the axis colours) with one dark outline around the whole hand, a palm narrowing towards a short wrist, index up, thumb to the side, middle finger forward, ring and little finger folded as an L onto the palm; `fingerAxisLines()` draws an axis line along each open finger (for checking the model)
- the view keys (1 front, 3 right ...) still use the right-handed sides

## Keys

Blender's numpad layout; the digits of both keyboard rows work. Ignored while typing in an input.

| Key | View |
| --- | --- |
| 1 | front |
| 3 | right |
| 7 | top |
| 9 | opposite side of the current view |
| 5 | orthographic / perspective (where offered) |
| . or Home | reset view |

## Adding it to a scene

The gizmo only draws and reports; a `ViewController` moves the camera.

```ts
// in onMount, after the camera's start position is set (it becomes the reset view)
const views = new ViewController(camera, controls, { ortho: true });
view = views; // component state, so the markup shows <ViewGizmo controller={view} />

// every frame
views.update();
controls.update();
renderer.render(scene, views.camera); // views.camera: needed when ortho is offered

// on resize
views.resize(width, height);

// on unmount
views.dispose();
```

- place `{#if view}<ViewGizmo controller={view} />{/if}` inside a positioned box around the canvas (the gizmo sits in its bottom-right corner)
- `views.keysEnabled = false` ignores the view keys, e.g. while a page wants its keys for something else
- `ortho: true` only when the scene renders with `views.camera` (the pixel shader scene renders through camera layers and render targets, so it has no switch)

## Files

| File | What it does |
| --- | --- |
| `src/lib/viewGizmo/views.ts` | the math: axis handles, keys, orbit angles, projection of the handles, eased turns (tested in `views.spec.ts`) |
| `src/lib/viewGizmo/viewController.ts` | moves a scene's camera: views, orbit, opposite, reset, perspective / orthographic |
| `src/lib/components/ViewGizmo.svelte` | the SVG gizmo and its buttons |
| `src/lib/icons/icon-perspective.svelte`, `icon-orthographic.svelte`, `icon-fit.svelte` | the button icons |
| `src/lib/viewGizmo/hand.ts` | the simple hand (right / left), fingers along the axes (tested in `hand.spec.ts`) |
| `src/lib/components/HandGizmo.svelte` | the small hand the gizmo shows in place of the axes |
| `src/lib/viewGizmo/gizmoSettings.ts` | the shared choices: hand on / off, right / left-handed |

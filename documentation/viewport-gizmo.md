# Viewport gizmo

The project's own viewport gizmo (Blender style), in the bottom-right corner of every 3d scene. It replaced the `three-viewport-gizmo` library and is taken from the gizmo of Bauteilerstellung-2.0, adapted to three.js axes (Y up, front = +Z) and English texts.

## Use

- the axes X / Y / Z (red / green / blue) turn with the camera; the negative axes are hollow and show their label on hover or when they point at you
- **click an axis**: turn to the view from that side; click it again for the opposite side
- **drag the gizmo**: orbit (a drag across it turns half a revolution)
- **reset view** button (frame icon): back to the camera the scene started with
- **perspective / orthographic** button (dot grid icon: foreshortened dots = perspective, even 3 × 3 grid = orthographic), on the vectors and transformations pages
- view changes are eased (350 ms); dragging the scene cancels a running turn

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

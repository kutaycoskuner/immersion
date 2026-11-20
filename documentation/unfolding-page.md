# Unfolding cube page

The unfolding cube page (`/unfolding`): a cube that unfolds into its flat net. It is the reference for the coming **origami** page, which starts from a flat sheet with fold lines and fold styles (mountain / valley).

## Layout

```text
 vectors  transformations  unfolding cube  ...                  (navigation)
                             ┌──┐
                           ┌─┴──┴─┐
                           │ cube │
 [T]                       └──────┘
 [▦]
 [✚]                                                            gizmo ◎
 (bottom-left bar)
```

- one viewport over the whole window, no frame and no instructions column: the toolbar buttons explain themselves (each names itself on hover)
- the top navigation and the bottom-left bar float over the viewport; the toolbar sits at the bottom left, just above the bottom-left bar, where imge has its control bar

## Use

- **idle**: after 4 s without input the closed cube turns slowly by itself; any mouse movement, click, wheel or key stops it (the unfolded net never turns)
- **camera**: drag to orbit, wheel to zoom, right drag to pan, the [viewport gizmo](viewport-gizmo.md) and its keys
- **click the cube** (a click, not a drag): it unfolds into its net; click again to fold it back (0.8 s, eased)
- **toolbar** at the bottom left, where and how imge has its control bar (all on at the start):
    - **T**: each face's name on it
    - **squares**: a Blender-style random colour per face (stable per face); off is Blender's plain grey
    - **net**: unfold / fold, the same as a click

## How it folds

- the bottom stays on the ground; every other face turns about a **hinge**, an edge it shares with the face it folds against
    - front, back, left, right: on the four edges of the bottom
    - top: on the upper edge of the back, so the net is a cross
- every hinge opens by 90°; `setFold(net, p)` puts each hinge at p of its open angle (0 = closed cube, 1 = flat net)
- the faces are data (`FACES` in `src/lib/origami/cubeNet.ts`): parent face, hinge position and axis, open angle, the face square; an origami sheet will use the same hinge tree

## Files

| File | What it does |
| --- | --- |
| `src/routes/(app)/unfolding/+page.svelte` | the page: the full-window viewport and the toolbar's tools (data list) |
| `src/lib/components/UnfoldingScene.svelte` | the viewport: idle spin after 4 s (closed cube only), click to unfold, labels and colours |
| `src/lib/origami/cubeNet.ts` | the cube as hinged faces, `buildCubeNet`, `setFold`, Blender-style `randomColor` (tested in `cubeNet.spec.ts`) |
| `src/lib/components/ToolBar.svelte` | a vertical bar of icon toggles (imge style), reusable |
| `src/lib/icons/icon-text.svelte`, `icon-colors.svelte`, `icon-unfold.svelte` | the toolbar icons |

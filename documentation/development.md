# Development

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | development server at `http://localhost:5173/immersion/` |
| `pnpm check` | type check (svelte-check) |
| `pnpm test:unit --run` | unit tests (vitest), `src/**/*.spec.ts` |
| `pnpm build` | static site into `build/` |
| `pnpm preview` | serve `build/` locally |

## Paths and deployment

- `svelte.config.js` sets the base path: `/immersion` in development, `''` in production with relative paths, so the built site works from any folder
- the live site ([kutaycoskuner.github.io/immersion](https://kutaycoskuner.github.io/immersion/)) is the built output, published from the `manual-deploy` branch's `docs/` folder; that is why the project's own documentation lives in `documentation/`, not `docs/`
- `vite.config.ts` keeps the dev server from watching the symlinked folders (`.linked_projects/`, `_documentation/`), which kept every request waiting on OneDrive

## Version and last update

The bottom-left bar shows `v<version> · last update <build date>`. The version is `package.json`'s `version`, the date is the day of the build (`vite.config.ts` defines `__APP_VERSION__` and `__BUILD_DATE__`). For a release: bump `package.json` and the README's version badge.

## Pages and scenes

- pages are in `src/routes/(app)/`; their layout (`+layout.svelte`) adds the top navigation (`BasicNavigation.svelte`), the bottom-left bar (`IconButtons.svelte`) and the settings overlay (Esc, `SettingsOverlay.svelte`)
- a new page also needs its link in `BasicNavigation.svelte`
- each 3d scene is a component that builds everything in `onMount` and frees it in the returned cleanup: animation loop (`cancelAnimationFrame`), listeners (named handlers, so they can be removed), store subscriptions, controls, gizmo, geometries and materials, renderer. Without this every visit to a page adds another render loop
- scenes in framed areas (vectors, transformations) size themselves to their area with a `ResizeObserver`, not to the window
- `src/lib/three/sceneHelpers.ts`: the fading ground grid with its axes, theme colours (scene background = page background), freeing a group's resources
- camera: [viewport gizmo](viewport-gizmo.md)

## Shared state

Svelte stores in `src/lib/stores/` (`vectors.ts`, `transform.ts`) hold what a page's parts share (inputs, chosen product, stage), so leaving a page and coming back keeps them. A model loaded in the settings overlay is `src/store/model_store.ts`.

## Code style

Every code file starts with the metadata header (author, AI contributors, last update, disclaimer) and a short description of what it is, what it needs and who uses it.

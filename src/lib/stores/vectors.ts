// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// State of the vector page: the two input vectors (set by the Tweakpane sliders in
// ThreeScene.svelte) and which product is shown (the pane's tab), read by the scene and by
// the math overlay on src/routes/(app)/+page.svelte.
import { writable } from 'svelte/store';
import type { Vec3 } from '$lib/vectorMath';

export type Product = 'dot' | 'cross';

export const STOREVECTOR1 = writable<Vec3>({ x: 1, y: 1, z: 0 });
export const STOREVECTOR2 = writable<Vec3>({ x: 1, y: 0, z: 0 });

// order matches the pane's tabs: page 0 = dot (scalar) product, page 1 = cross (vector) product
export const PRODUCTS: Product[] = ['dot', 'cross'];
export const ACTIVE_PRODUCT = writable<Product>('dot');

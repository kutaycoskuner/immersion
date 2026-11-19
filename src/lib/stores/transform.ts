// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// State of the transformations page: the translation and the point typed into the matrix
// panel (TranslationPanel.svelte) and the animation stage t (0 = before, 1 = after), read by
// the description and the scene (TransformScene.svelte). Kept in stores so leaving and coming
// back to the page keeps them.
import { writable } from 'svelte/store';
import type { Vec3 } from '$lib/vectorMath';

export const TRANSLATION = writable<Vec3>({ x: 3, y: 1, z: -2 });

// 0 = before the move, 1 = after it, anything between while the bar is dragged
export const STAGE = writable<number>(1);
export const STAGES = [
	{ t: 0, label: 'before' },
	{ t: 1, label: 'after' }
];

// the point the page follows, typed into the matrix panel; starts on a corner of the cube
export const POINT = writable<Vec3>({ x: 1, y: 1, z: 1 });
export const POINT_COLOR = '#ffb347'; // in the formulas and the viewport

// limit of every typed value: the move stays inside the 10-unit grid (the cube is 2 wide)
export const VALUE_LIMIT = 8;

/** The point in homogeneous coordinates (w = 1: a point, which a translation moves). */
export function homogeneous(p: Vec3): [number, number, number, number] {
	return [p.x, p.y, p.z, 1];
}
export const CUBE_SIZE = 2; // edge length; centred at the origin, so its corners are at +-1

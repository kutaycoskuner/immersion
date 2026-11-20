// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// State of the transformations page: which transformation is shown (the switch at the top),
// the values typed into the matrix panel (TransformPanel.svelte) -- translation offset,
// scale factors, the point -- and the animation stage t (0 = before, 1 = after), read by the
// description and the scene (TransformScene.svelte). Kept in stores so leaving and coming
// back to the page, or switching the transformation, keeps them. What each transformation
// is (matrix, editable cells, texts) is in $lib/transformKinds.
import { writable } from 'svelte/store';
import type { Vec3 } from '$lib/vectorMath';

export type KindId = 'translation' | 'scaling' | 'rotation';
export const KIND = writable<KindId>('translation');

export const TRANSLATION = writable<Vec3>({ x: 3, y: 1, z: -2 });
export const SCALE = writable<Vec3>({ x: 2, y: 1, z: 0.5 });
// rotation: Euler angles in degrees, applied about x, then y, then z (no quaternions yet);
// starts as the simple case, 90 degrees about z, which turns the x axis onto the y axis
export const ROTATION = writable<Vec3>({ x: 0, y: 0, z: 90 });

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

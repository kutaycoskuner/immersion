// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// 4x4 homogeneous transformation matrices for the transformations page (matrix panel,
// description and TransformScene.svelte), as plain numbers so the page shows exactly what
// the scene applies. Row-major: m[row][col], the translation in the last column, as written
// on paper (three.js' Matrix4.set takes the same order).
// The animation stage t runs from 0 (before) to 1 (after): M(t) moves t of the way, so the
// two-stage view now and a 0..1 slider later use the same function.
import type { Vec3 } from '$lib/vectorMath';

export type Mat4 = number[][]; // 4 rows of 4
export type Vec4 = [number, number, number, number];

export function identity(): Mat4 {
	return [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	];
}

/** Translation by `offset`, t of the way (t = 0: identity, t = 1: the full move). */
export function translation(offset: Vec3, t = 1): Mat4 {
	const m = identity();
	// + 0 turns -0 (a negative offset at t = 0) into 0, so it never shows as "-0"
	m[0][3] = offset.x * t + 0;
	m[1][3] = offset.y * t + 0;
	m[2][3] = offset.z * t + 0;
	return m;
}

/** m · p for a point in homogeneous coordinates (w = 1 for points). */
export function apply(m: Mat4, p: Vec4): Vec4 {
	return m.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2] + row[3] * p[3]) as Vec4;
}

/** The 16 numbers row by row, the order three.js' Matrix4.set expects. */
export function flat(m: Mat4): number[] {
	return m.flat();
}

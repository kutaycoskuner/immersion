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
// The animation stage t runs from 0 (before) to 1 (after): M(t) goes t of the way from the
// identity to the full transformation (translation, scaling), so the 0..1 bar sets only t.
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

/** Scaling by `factors` about the origin, t of the way: each diagonal value goes from 1
 *  (t = 0, identity) to its factor (t = 1). */
export function scaling(factors: Vec3, t = 1): Mat4 {
	const m = identity();
	m[0][0] = 1 + (factors.x - 1) * t + 0; // + 0: no "-0"
	m[1][1] = 1 + (factors.y - 1) * t + 0;
	m[2][2] = 1 + (factors.z - 1) * t + 0;
	return m;
}

/** a · b (4x4). */
export function multiply(a: Mat4, b: Mat4): Mat4 {
	return a.map((row) => [0, 1, 2, 3].map((c) => row.reduce((sum, v, k) => sum + v * b[k][c], 0)));
}

/** Rotation about one axis by `degrees` (right-handed: counter-clockwise looking from + at
 *  the origin). */
export function axisRotation(axis: 'x' | 'y' | 'z', degrees: number): Mat4 {
	const a = (degrees * Math.PI) / 180;
	const c = Math.cos(a);
	const s = Math.sin(a);
	const m = identity();
	const [i, j] = axis === 'x' ? [1, 2] : axis === 'y' ? [2, 0] : [0, 1];
	m[i][i] = c;
	m[i][j] = -s;
	m[j][i] = s;
	m[j][j] = c;
	return m;
}

/** Rotation by the angles (degrees) about x, then y, then z: R = Rz · Ry · Rx; at the
 *  stage t every angle is t of its value, so a point moves along an arc. */
export function rotation(degrees: Vec3, t = 1): Mat4 {
	const m = multiply(
		axisRotation('z', degrees.z * t),
		multiply(axisRotation('y', degrees.y * t), axisRotation('x', degrees.x * t))
	);
	// rounding: cos(90°) is 6e-17, not 0; clean it so the page shows 0 (and never "-0")
	return m.map((row) => row.map((v) => (Math.abs(v) < 1e-12 ? 0 : v)));
}

/** m · p for a point in homogeneous coordinates (w = 1 for points). */
export function apply(m: Mat4, p: Vec4): Vec4 {
	return m.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2] + row[3] * p[3]) as Vec4;
}

/** The 16 numbers row by row, the order three.js' Matrix4.set expects. */
export function flat(m: Mat4): number[] {
	return m.flat();
}

// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-22
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// 4x4 homogeneous matrices for the transformations and spaces pages (matrix panel,
// description and TransformScene.svelte), as plain numbers so the page shows exactly what
// the scene applies -- the model matrix (local -> world), the view matrix (world -> camera),
// the projections onto z = 0 and camera -> clip (with the clip test). Row-major:
// m[row][col], the translation in the last column, as written on paper (three.js'
// Matrix4.set takes the same order).
// The animation stage t runs from 0 (before) to 1 (after): M(t) goes t of the way from the
// identity to the full transformation (translation, scaling, rotation) or projection
// (orthographic, perspective), so the 0..1 bar sets only t. A perspective matrix has a
// bottom row other than 0 0 0 1: its result must be divided by w (applyPoint).
// The view matrix (world -> camera) turns t of the way with three.js' quaternion slerp.
import { Matrix4, Quaternion } from 'three';
import { cross, length, normalize, type Vec3 } from '$lib/vectorMath';

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

/** An object's placement in the world: where it is, how it is turned, how big it is. */
export interface Placement {
	position: Vec3;
	/** Euler angles in degrees, applied about x, then y, then z (as `rotation`). */
	rotation: Vec3;
	scale: Vec3;
}

/**
 * The model matrix (local -> world): M = T · R · S, read right to left -- the object is
 * scaled in its own space first, then turned, then moved to its place. At the stage t each
 * part goes t of the way (position t of the offset, angles t of their value, scale from 1).
 */
export function modelMatrix(placement: Placement, t = 1): Mat4 {
	return multiply(
		translation(placement.position, t),
		multiply(rotation(placement.rotation, t), scaling(placement.scale, t))
	);
}

/** Where a camera stands and what it looks at; its up is the world's y (WORLD_UP). */
export interface CameraLook {
	eye: Vec3;
	target: Vec3;
}

export const WORLD_UP: Vec3 = { x: 0, y: 1, z: 0 };

/**
 * The camera's own axes in world space (lookAt, right-handed as OpenGL / three.js): it looks
 * down its own -z, so its z axis `back` points away from the target. forward f = target - eye
 * (normalised), right = f x up, up' = right x f (the true up, at right angles to f).
 * Degenerate cases: eye = target looks down the world's -z; looking straight up or down
 * (f parallel to the world's up, so f x up = 0) takes the world's -z as the up instead.
 */
export function cameraBasis(look: CameraLook): { right: Vec3; up: Vec3; back: Vec3 } {
	let f = normalize(sub(look.target, look.eye));
	if (length(f) === 0) f = { x: 0, y: 0, z: -1 };
	let right = cross(f, WORLD_UP);
	if (length(right) < 1e-9) right = cross(f, { x: 0, y: 0, z: -1 });
	right = normalize(right);
	const up = cross(right, f);
	return { right, up, back: { x: -f.x, y: -f.y, z: -f.z } };
}

/** The camera's rotation: its axes as columns (right, up, back). */
function cameraRotation(look: CameraLook): Mat4 {
	const { right, up, back } = cameraBasis(look);
	return [
		[right.x, up.x, back.x, 0],
		[right.y, up.y, back.y, 0],
		[right.z, up.z, back.z, 0],
		[0, 0, 0, 1]
	];
}

/** The camera's placement in the world (its own local -> world): T(eye) · R, no scale. */
export function cameraMatrix(look: CameraLook): Mat4 {
	return clean(multiply(translation(look.eye), cameraRotation(look)));
}

/**
 * The view matrix (world -> camera): the inverse of the camera's placement,
 * V = (T(eye) R)^-1 = R^T T(-eye) -- move the world so the eye is at the origin, then turn it
 * so the camera's axes become x, y, z. R^T: a rotation's inverse is its transpose; its rows
 * are the camera's axes. At the stage t the world moves t of the way (T(-t eye)) and turns t
 * of the way (the same axis, t of the angle: a quaternion slerp from no turn), so V(0) = I
 * and V(1) = V; the camera arrives at the origin looking down -z.
 */
export function viewMatrix(look: CameraLook, t = 1): Mat4 {
	const r = cameraRotation(look);
	const q = new Quaternion().setFromRotationMatrix(new Matrix4().set(...(flat(r) as Matrix4Args)));
	const e = new Matrix4().makeRotationFromQuaternion(new Quaternion().slerp(q, t)).elements;
	const rt: Mat4 = [0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((c) => e[c * 4 + row]));
	return clean(multiply(transpose(rt), translation(scaled(look.eye, -1), t)));
}

export function transpose(m: Mat4): Mat4 {
	return m[0].map((_, c) => m.map((row) => row[c]));
}

/** Rounding noise (1e-17 for a 0) cleaned, so the page shows 0 and never "-0". */
function clean(m: Mat4): Mat4 {
	return m.map((row) => row.map((v) => (Math.abs(v) < 1e-12 ? 0 : v + 0)));
}

type Matrix4Args = Parameters<Matrix4['set']>;
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scaled = (v: Vec3, k: number): Vec3 => ({ x: v.x * k, y: v.y * k, z: v.z * k });

/** Orthographic projection onto the plane z = 0 (the "screen", facing +z), t of the way:
 *  the z row goes from 1 to 0, so depth shrinks to nothing; x and y stay. */
export function orthographic(_values: Vec3, t = 1): Mat4 {
	const m = identity();
	m[2][2] = 1 - t + 0;
	return m;
}

/**
 * Perspective projection onto the plane z = 0 from an eye at (0, 0, d), t of the way:
 * M(t) = I + t (P - I), so w = 1 - t z / d. After the divide by w a point moves along the
 * line from the eye through it, and lands where that line meets the plane at t = 1:
 * (x, y) * d / (d - z). Points nearer the eye get bigger, farther ones smaller.
 *
 * Args:
 *   values: values.z is the eye's distance d from the plane (must be beyond the object).
 */
export function perspective(values: Vec3, t = 1): Mat4 {
	const d = values.z;
	const m = identity();
	m[2][2] = 1 - t + 0;
	m[3][2] = -t / d + 0;
	return m;
}

// ---- camera space -> clip space ------------------------------------------------------------
// The step after world -> camera: from camera space (eye at the origin, looking down -z) a
// perspective camera's frustum -- its field of view between the near and the far plane --
// goes into clip space, where a point is inside exactly when -w <= x, y, z <= w; after the
// divide by w that volume is the cube -1..1 (NDC). OpenGL / three.js convention: near ->
// z = -1, far -> z = +1. The typed values are a Vec3: x = the field of view in degrees,
// y = near, z = far (distances in front of the eye).

/** Width / height of the screen; 1 for now: a square picture. */
export const SCREEN_ASPECT = 1;
const MIN_DEPTH = 0.1; // far is kept at least this far behind near (near = far: no volume)

/** near and far from the typed values, far kept behind near. */
function depths(values: Vec3): { n: number; f: number } {
	const n = values.y;
	return { n, f: Math.max(values.z, n + MIN_DEPTH) };
}

/** Half the width and height of the frustum at the near and the far plane. */
export function frustumHalfSizes(values: Vec3): {
	near: [number, number];
	far: [number, number];
	n: number;
	f: number;
} {
	const { n, f } = depths(values);
	const tan = Math.tan((values.x * Math.PI) / 360); // half the field of view
	const at = (d: number): [number, number] => [d * tan * SCREEN_ASPECT, d * tan];
	return { near: at(n), far: at(f), n, f };
}

/**
 * The squeeze S of camera -> clip, t of the way: the frustum goes into the cube with
 * w = -z, the depth in front of the eye (dividing by it, next, makes far things small);
 * k = 1 / tan(fov / 2) scales x and y so the frustum's sides land on +-w; the z row keeps
 * in front at -z: near -> +1, far -> -1. Nothing is flattened, depth stays: 3D -> 3D (in
 * homogeneous 4D). M(t) = I + t (S - I): w = 1 + t (-z - 1) stays positive in front of the
 * eye, and near and far never cross, so the frustum squeezes without turning inside out.
 */
export function clipSqueeze(values: Vec3, t = 1): Mat4 {
	const k = 1 / Math.tan((values.x * Math.PI) / 360);
	const { n, f } = depths(values);
	const S = [
		[k / SCREEN_ASPECT, 0, 0, 0],
		[0, k, 0, 0],
		[0, 0, (f + n) / (f - n), (2 * f * n) / (f - n)],
		[0, 0, -1, 0]
	];
	const I = identity();
	return clean(S.map((row, r) => row.map((v, c) => I[r][c] + t * (v - I[r][c]))));
}

/** The z mirror F = diag(1, 1, -1, 1). */
export function zMirror(): Mat4 {
	const m = identity();
	m[2][2] = -1;
	return m;
}

/**
 * The perspective camera's projection matrix P, camera -> clip, as three.js'
 * PerspectiveCamera.projectionMatrix (OpenGL): P = F S, the squeeze and then the z mirror
 * -- near -> -1, far -> +1, so in clip space (and NDC) a bigger z is farther, what the depth
 * test wants; NDC is left-handed. The mirror is a sign convention, not a change of shape.
 * At the stage t: I + t (P - I) -- camera -> clip shows it as numbers only (clip space has
 * no shape to draw); clip -> NDC's bar shows the squeeze (`clipSqueeze`) instead.
 */
export function clipPerspective(values: Vec3, t = 1): Mat4 {
	const P = multiply(zMirror(), clipSqueeze(values));
	const I = identity();
	return clean(P.map((row, r) => row.map((v, c) => I[r][c] + t * (v - I[r][c]))));
}

/** Whether a clip-space point is inside the view volume: -w <= x, y, z <= w per axis. */
export function clipTest(p: Vec4): { x: boolean; y: boolean; z: boolean; inside: boolean } {
	const w = p[3];
	const ok = (v: number) => w > 0 && -w - 1e-12 <= v && v <= w + 1e-12;
	const result = { x: ok(p[0]), y: ok(p[1]), z: ok(p[2]) };
	return { ...result, inside: result.x && result.y && result.z };
}

/** m · p for a point in homogeneous coordinates (w = 1 for points). */
export function apply(m: Mat4, p: Vec4): Vec4 {
	return m.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2] + row[3] * p[3]) as Vec4;
}

/** m · p, then divided by the result's w: the point a projective matrix (perspective) really
 *  means; for every affine matrix w stays 1 and this is just apply. */
export function applyPoint(m: Mat4, p: Vec4): Vec4 {
	const [x, y, z, w] = apply(m, p);
	return [x / w + 0, y / w + 0, z / w + 0, 1];
}

/** The 16 numbers row by row, the order three.js' Matrix4.set expects. */
export function flat(m: Mat4): number[] {
	return m.flat();
}

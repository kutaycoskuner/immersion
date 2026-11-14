// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// View math of the viewport gizmo (ViewGizmo.svelte, viewController.ts): the six axis
// handles, the keyboard shortcuts (Blender numpad layout), the orbit angles a view direction
// needs, the projection of the handles into the gizmo for the current camera orientation,
// eased transitions and gizmo drag orbiting.
// Taken from the project's own gizmo in Bauteilerstellung-2.0 (frontend/src/lib/preview/
// views.ts), which replaced the three-viewport-gizmo library there; adapted to three.js axes
// (Y up, front = +Z) instead of CAD axes (Z up), so no axis conversion is needed here.
// Pure functions, three.js only for its vector math (tested in views.spec.ts).
import { Quaternion, Vector3 } from 'three';

export type Vec3 = [number, number, number];
/** Quaternion [x, y, z, w] of the camera (three.js world). */
export type Quat = [number, number, number, number];

/** Orbit angles as three.js Spherical / OrbitControls: theta about Y from +Z towards +X,
 *  phi from +Y (0 = from above). */
export interface Angles {
	theta: number;
	phi: number;
}

export interface AxisHandle {
	id: string;
	/** Text on the bubble (negative axes show it on hover or when facing the viewer). */
	label: string;
	/** View name: the camera looks from this side. */
	view: string;
	/** Direction from the target to the camera (three.js axes). */
	dir: Vec3;
	color: string;
	positive: boolean;
}

/** Axis colours as Blender's viewport gizmo. */
export const AXIS_COLORS = { x: '#ff3352', y: '#8bdc00', z: '#2890ff' } as const;

export const AXIS_HANDLES: AxisHandle[] = [
	{ id: '+x', label: 'X', view: 'Right', dir: [1, 0, 0], color: AXIS_COLORS.x, positive: true },
	{ id: '-x', label: '-X', view: 'Left', dir: [-1, 0, 0], color: AXIS_COLORS.x, positive: false },
	{ id: '+y', label: 'Y', view: 'Top', dir: [0, 1, 0], color: AXIS_COLORS.y, positive: true },
	{ id: '-y', label: '-Y', view: 'Bottom', dir: [0, -1, 0], color: AXIS_COLORS.y, positive: false },
	{ id: '+z', label: 'Z', view: 'Front', dir: [0, 0, 1], color: AXIS_COLORS.z, positive: true },
	{ id: '-z', label: '-Z', view: 'Back', dir: [0, 0, -1], color: AXIS_COLORS.z, positive: false }
];

/** View keys (Blender numpad layout; the digits of both rows work). */
export type KeyAction = { view: string } | { action: 'opposite' | 'ortho' | 'home' };
export const KEY_ACTIONS: Record<string, KeyAction> = {
	'1': { view: '+z' },
	'3': { view: '+x' },
	'7': { view: '+y' },
	'9': { action: 'opposite' },
	'5': { action: 'ortho' },
	'.': { action: 'home' },
	Home: { action: 'home' }
};

/** Shortcut help shown as the gizmo's tooltip. */
export const KEY_HELP =
	'drag = orbit · click an axis = view from there (again = opposite side) · ' +
	'keys: 1 front, 3 right, 7 top, 9 opposite, 5 orthographic / perspective, . or Home reset view';

/** Keeps the camera just off the poles so "up" stays defined (top/bottom views). */
export const POLE_EPS = 1e-4;

/** Orbit angles that put the camera on the side of direction dir. Top view: X to the right,
 *  -Z (back) up on screen (theta 0), like Blender's top view. */
export function anglesFor([x, y, z]: Vec3): Angles {
	const length = Math.hypot(x, y, z) || 1;
	const phi = Math.min(Math.PI - POLE_EPS, Math.max(POLE_EPS, Math.acos(y / length)));
	const flat = Math.hypot(x, z) < 1e-9; // on a pole: theta free, keep the plan orientation
	return { theta: flat ? 0 : Math.atan2(x, z), phi };
}

/** Angles of an offset (camera position - target). */
export function anglesOf([x, y, z]: Vec3): Angles {
	const length = Math.hypot(x, y, z) || 1;
	return { theta: Math.atan2(x, z), phi: Math.acos(Math.min(1, Math.max(-1, y / length))) };
}

/** Offset of length radius for the angles. */
export function offsetFor({ theta, phi }: Angles, radius: number): Vec3 {
	const s = Math.sin(phi) * radius;
	return [s * Math.sin(theta), Math.cos(phi) * radius, s * Math.cos(theta)];
}

/** The handle the camera currently looks from (within ~2.5 deg), if any. */
export function facingHandle(offset: Vec3): AxisHandle | undefined {
	const length = Math.hypot(...offset) || 1;
	return AXIS_HANDLES.find(({ dir: d }) => {
		return (d[0] * offset[0] + d[1] * offset[1] + d[2] * offset[2]) / length > 0.999;
	});
}

/** Angles to go to when the handle is clicked: its side, or the opposite side when the camera
 *  already looks from there (Blender behaviour). */
export function targetFor(handle: AxisHandle, offset: Vec3): Angles {
	const flip = facingHandle(offset)?.id === handle.id;
	const dir = handle.dir.map((v) => (flip ? 0 - v : v)) as Vec3; // 0 - v: no -0 for atan2
	return anglesFor(dir);
}

/** Angles of the opposite side of the current view (key 9). */
export function oppositeOf(offset: Vec3): Angles {
	return anglesOf([-offset[0], -offset[1], -offset[2]]);
}

/** Eased step between two orbits at t in [0, 1]; theta takes the shorter way round. */
export function blend(from: Angles, to: Angles, t: number): Angles {
	const k = t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3); // ease-out cubic
	let dTheta = (to.theta - from.theta) % (2 * Math.PI);
	if (dTheta > Math.PI) dTheta -= 2 * Math.PI;
	if (dTheta < -Math.PI) dTheta += 2 * Math.PI;
	return { theta: from.theta + dTheta * k, phi: from.phi + (to.phi - from.phi) * k };
}

/** Orbit by a drag on the gizmo, same sense as dragging the scene (OrbitControls): a drag
 *  across the gizmo turns half a revolution. */
export function orbitBy(angles: Angles, dx: number, dy: number, size: number): Angles {
	const k = Math.PI / Math.max(size, 1);
	const phi = Math.min(Math.PI - POLE_EPS, Math.max(POLE_EPS, angles.phi - dy * k));
	return { theta: angles.theta - dx * k, phi };
}

/** Rotate v by the inverse of q (world -> camera space). */
function toCamera(v: Vec3, q: Quat): Vec3 {
	const inverse = new Quaternion(...q).invert();
	return new Vector3(...v).applyQuaternion(inverse).toArray() as Vec3;
}

export interface ProjectedHandle extends AxisHandle {
	/** Position in the gizmo, -1..1, screen orientation (y down). */
	x: number;
	y: number;
	/** Towards the viewer: +1 points at the camera, -1 away. */
	depth: number;
}

/** The handles as seen by a camera with orientation q, back to front (draw order). */
export function projectHandles(q: Quat): ProjectedHandle[] {
	return AXIS_HANDLES.map((handle) => {
		const [x, y, z] = toCamera(handle.dir, q);
		return { ...handle, x, y: -y, depth: z };
	}).sort((a, b) => a.depth - b.depth);
}

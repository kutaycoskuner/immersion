// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-25
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// State of the transformations and spaces pages: which transformation is shown (the switch
// at the top), the values typed into the matrix panel (TransformPanel.svelte) -- translation
// offset, scale factors, an object's placement, the camera, the point -- and the animation stage t (0 = before, 1 = after), read by the
// description and the scene (TransformScene.svelte). Kept in stores so leaving and coming
// back to the page, or switching the transformation, keeps them. What each transformation
// is (matrix, editable cells, texts) is in $lib/transformKinds.
import { derived, writable } from 'svelte/store';
import type { CameraLook, Placement } from '$lib/transformMath';
import type { Vec3 } from '$lib/vectorMath';

export type KindId =
	| 'translation'
	| 'scaling'
	| 'rotation'
	| 'local-to-world'
	| 'world-to-camera'
	| 'orthographic'
	| 'clip-space'
	| 'ndc'
	| 'perspective';
export const KIND = writable<KindId>('translation');

export const TRANSLATION = writable<Vec3>({ x: 3, y: 1, z: -2 });
export const SCALE = writable<Vec3>({ x: 2, y: 1, z: 0.5 });
// rotation: Euler angles in degrees, applied about x, then y, then z (no quaternions yet);
// starts as the simple case, 90 degrees about z, which turns the x axis onto the y axis
export const ROTATION = writable<Vec3>({ x: 0, y: 0, z: 90 });
// perspective: the eye's distance d from the plane z = 0, kept in z (x and y unused)
export const PERSPECTIVE = writable<Vec3>({ x: 0, y: 0, z: 4 });
// camera -> clip: the perspective camera's frustum, x = field of view in degrees, y = near,
// z = far. The boxes are about 4 and 10 in front of the starting camera: far = 12 keeps the
// frustum short enough to see whole, and the far box crosses it -- part inside, part clipped
export const CLIP_FRUSTUM = writable<Vec3>({ x: 60, y: 1, z: 12 });
// camera -> clip: two more boxes, placed in camera space, that the camera cannot show -- one
// beyond the far plane (its depth follows far: `fromFar`), one behind the eye -- so it is
// seen what does not appear. Unit boxes (2 wide), turned about y by `turn` degrees
export const CLIP_HIDDEN = [
	{
		label: 'beyond far',
		color: '#7fb069',
		position: { x: 2, y: 0, z: -3 },
		fromFar: true,
		turn: 25
	},
	{
		label: 'behind the eye',
		color: '#b48ead',
		position: { x: -1.5, y: 0, z: 4 },
		fromFar: false,
		turn: -20
	}
];
// camera -> clip's point, typed in camera space (in front of the eye: z < 0) -- its own
// store, because the other kinds' point (POINT) is local or world and starts behind it
export const CAMERA_POINT = writable<Vec3>({ x: 1, y: 0.5, z: -6 });
// local -> world: the object's placement, typed in three rows; PLACEMENT puts them together.
// The cube is 2 high in local space (corners at +-1), so at position y = scale y its bottom
// rests on the ground (the xz plane) once it is placed (t = 1). Both boxes start unscaled (1):
// the world keeps their modelled size, which keeps world -> camera simple; scale can be typed
export const MODEL_POSITION = writable<Vec3>({ x: 3, y: 1, z: -1 });
export const MODEL_ROTATION = writable<Vec3>({ x: 0, y: 45, z: 0 });
export const MODEL_SCALE = writable<Vec3>({ x: 1, y: 1, z: 1 });
// a second object in the world for local -> world: a fixed placement (not typed), so the
// world holds two objects, each with its own local space and its own model matrix; also
// standing on the ground (position y = scale y)
export const COMPANION_PLACEMENT: Placement = {
	position: { x: -3, y: 1, z: 2 },
	rotation: { x: 0, y: -30, z: 0 },
	scale: { x: 1, y: 1, z: 1 }
};
export const COMPANION_COLOR = '#c98a4b';
// 3D -> 2D (orthographic, perspective): the cube turned 45° about y before it is projected,
// so two of its faces show and the flattening is apparent (face on, it would look the same
// before and after); the point p stays where it is typed
export const PROJECTION_PLACEMENT: Placement = {
	position: { x: 0, y: 0, z: 0 },
	rotation: { x: 0, y: 45, z: 0 },
	scale: { x: 1, y: 1, z: 1 }
};

export const PLACEMENT = derived(
	[MODEL_POSITION, MODEL_ROTATION, MODEL_SCALE],
	([position, rotation, scale]): Placement => ({ position, rotation, scale })
);

// world -> camera: a camera in the world, typed as where it stands (eye) and what it looks
// at (target); LOOK puts them together. It starts to the side of the scene, a little above,
// looking between the two objects, so it is seen side on from the viewport's own view
export const CAMERA_EYE = writable<Vec3>({ x: -6, y: 3, z: 4 });
export const CAMERA_TARGET = writable<Vec3>({ x: 0, y: 1, z: 0 });
export const LOOK = derived(
	[CAMERA_EYE, CAMERA_TARGET],
	([eye, target]): CameraLook => ({ eye, target })
);
export const CAMERA_COLOR = '#e8e8e8';

// 0 = before the move, 1 = after it, anything between while the bar is dragged; every
// kind starts at 0, before (TransformPanel.svelte sets it back when the kind changes)
export const STAGE = writable<number>(0);
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

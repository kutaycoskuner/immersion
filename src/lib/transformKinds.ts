// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-22
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The transformations of the transformations and spaces pages, one entry each, so the
// switches, the matrix panel (TransformPanel.svelte) and the scene (TransformScene.svelte) work
// the same for all of them: its group (the transformations page, or a category of the spaces
// page: 3D -> 3D, 3D -> 2D, 2D -> 2D), name, matrix symbol, the store of its typed values,
// the matrix at the stage t, which values are typed (into matrix cells or their own rows),
// whether the result is divided by w (perspective), limits, and the point it follows
// (camera -> clip: its own, in camera space). A projection is a transformation too -- one
// that cannot be undone -- so it lives here with the others.
// Adding one = an entry here, its matrix function in transformMath.ts, a description data
// file and component (TransformView.svelte picks it by id).
import { error } from '@sveltejs/kit';
import type { Readable, Writable } from 'svelte/store';
import {
	CAMERA_EYE,
	CAMERA_POINT,
	CAMERA_TARGET,
	CLIP_FRUSTUM,
	LOOK,
	MODEL_POSITION,
	MODEL_ROTATION,
	MODEL_SCALE,
	PERSPECTIVE,
	PLACEMENT,
	POINT,
	ROTATION,
	SCALE,
	TRANSLATION,
	VALUE_LIMIT,
	type KindId
} from '$lib/stores/transform';
import {
	clipPerspective,
	clipSqueeze,
	modelMatrix,
	orthographic,
	perspective,
	rotation,
	scaling,
	translation,
	viewMatrix,
	type Mat4
} from '$lib/transformMath';
import type { Vec3 } from '$lib/vectorMath';

export type Axis = 'x' | 'y' | 'z';

// the transformations page, and the spaces page's categories (from which space to which)
export type KindGroup = 'transformations' | '3d-3d' | '3d-2d' | '2d-2d';

export interface Category {
	group: KindGroup;
	label: string;
	ready: boolean;
}

// the spaces page's upper switch, in order
export const SPACE_CATEGORIES: Category[] = [
	{ group: '3d-3d', label: '3D → 3D', ready: true },
	{ group: '3d-2d', label: '3D → 2D', ready: true },
	{ group: '2d-2d', label: '2D → 2D', ready: false }
];
export const SPACE_GROUPS = SPACE_CATEGORIES.map((c) => c.group);

// one row of typed values with its own store (local -> world: position, rotation, scale)
export interface InputRow {
	label: string;
	symbol: string;
	unit?: string;
	store: Writable<Vec3>;
	min: number;
	max: number;
	step: number;
}

export interface TransformKind {
	id: KindId;
	/** Where it is listed: the transformations page, or a category of the spaces page. */
	group: KindGroup;
	label: string;
	/** Matrix name in the formulas: T (translation), S (scaling), R (rotation). */
	symbol: string;
	/** Name of the typed values in the formulas: t_x ..., s_x ..., θ_x ... */
	valueSymbol: string;
	/** Unit shown after typed values, e.g. "°". */
	unit?: string;
	/**
	 * Values typed in their own row, not into matrix cells (rotation: the angles, whose
	 * cos / sin fill the matrix; perspective: d; camera -> clip: fov, near, far): which
	 * components, the name of each and, when it differs from the kind's, its own range.
	 * The matrix is then shown read-only.
	 */
	inputs?: { axis: Axis; symbol: string; min?: number; max?: number; step?: number }[];
	/** The typed `inputs` are not x, y, z (camera -> clip: fov, near, far): shown without
	 *  the axis colours. */
	plainInputs?: boolean;
	/** The point this kind follows when it is not the shared POINT (the projections: a
	 *  point in camera space, in front of the eye). */
	point?: Writable<Vec3>;
	/** Several rows of typed values, each with its own store (local -> world); the matrix
	 *  is then shown read-only and `values` is their combination. */
	inputRows?: InputRow[];
	/** A short note beside the input row. */
	inputsHint?: string;
	/** The result is divided by w (perspective: the matrix's bottom row is not 0 0 0 1). */
	divide?: boolean;
	/** false: shown in the switch but not chosen yet (later). */
	ready: boolean;
	/** The typed values: a Vec3 store (editable cells or `inputs`), or a read-only
	 *  combination of `inputRows` (a Placement for local -> world). */
	values?: Writable<Vec3> | Readable<unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each kind's own values
	matrix?: (values: any, t: number) => Mat4;
	/** The matrix at the stage t, when the bar shows something else than going t of the
	 *  way to `matrix` (camera -> clip: only the squeeze S; `matrix` is P = F S). */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each kind's own values
	stage?: (values: any, t: number) => Mat4;
	/** No stage row and no bar (camera -> clip: clip space is 4D, nothing to animate; the
	 *  panel shows only the full transformation). */
	noStage?: boolean;
	/** The axis whose value sits in this cell of the matrix, or null for a fixed cell. */
	editableAxis?: (row: number, col: number) => Axis | null;
	/** Range of the typed values. */
	min?: number;
	max?: number;
	step?: number;
}

const AXES: Axis[] = ['x', 'y', 'z'];

// camera -> clip and clip -> NDC: a perspective camera's frustum as field of view, near and
// far, each with its own range (one store, CLIP_FRUSTUM, so both steps share the camera)
const FRUSTUM_INPUTS: TransformKind['inputs'] = [
	{ axis: 'x', symbol: 'fov', min: 10, max: 150, step: 5 },
	{ axis: 'y', symbol: 'near', min: 0.5, max: 5, step: 0.5 },
	{ axis: 'z', symbol: 'far', min: 2, max: 30, step: 1 }
];

export const KINDS: TransformKind[] = [
	{
		id: 'translation',
		group: 'transformations',
		label: 'translation',
		symbol: 'T',
		valueSymbol: 't',
		ready: true,
		values: TRANSLATION,
		matrix: translation,
		// the offset sits in the last column
		editableAxis: (row, col) => (col === 3 && row < 3 ? AXES[row] : null),
		min: -VALUE_LIMIT,
		max: VALUE_LIMIT,
		step: 0.5
	},
	{
		id: 'scaling',
		group: 'transformations',
		label: 'scaling',
		symbol: 'S',
		valueSymbol: 's',
		ready: true,
		values: SCALE,
		matrix: scaling,
		// the factors sit on the diagonal
		editableAxis: (row, col) => (row === col && row < 3 ? AXES[row] : null),
		// the cube (2 wide) stays inside the grid; negative factors mirror it
		min: -4,
		max: 4,
		step: 0.25
	},
	{
		id: 'rotation',
		group: 'transformations',
		label: 'rotation',
		symbol: 'R',
		valueSymbol: 'θ',
		unit: '°',
		ready: true,
		values: ROTATION,
		matrix: rotation,
		// angles in degrees, typed into their own row; the matrix holds their cos / sin
		inputs: AXES.map((axis) => ({ axis, symbol: `θ_${axis}` })),
		inputsHint: 'about x, then y, then z',
		min: -180,
		max: 180,
		step: 5
	},
	{
		id: 'local-to-world',
		group: '3d-3d',
		label: 'local → world',
		symbol: 'M',
		valueSymbol: '',
		ready: true,
		values: PLACEMENT,
		matrix: modelMatrix,
		// the model matrix M = T · R · S from three rows of typed values
		inputRows: [
			{ label: 'position', symbol: 'pos', store: MODEL_POSITION, min: -6, max: 6, step: 0.5 },
			{
				label: 'rotation',
				symbol: 'θ',
				unit: '°',
				store: MODEL_ROTATION,
				min: -180,
				max: 180,
				step: 5
			},
			{ label: 'scale', symbol: 's', store: MODEL_SCALE, min: -3, max: 3, step: 0.25 }
		],
		inputsHint: 'M = T · R · S: scale, then rotate (x, y, z), then move'
	},
	{
		id: 'world-to-camera',
		group: '3d-3d',
		label: 'world → camera',
		symbol: 'V',
		valueSymbol: '',
		ready: true,
		values: LOOK,
		matrix: viewMatrix,
		// the view matrix V from where the camera stands and what it looks at (lookAt)
		inputRows: [
			{ label: 'eye', symbol: 'eye', store: CAMERA_EYE, min: -8, max: 8, step: 0.5 },
			{ label: 'target', symbol: 'target', store: CAMERA_TARGET, min: -6, max: 6, step: 0.5 }
		],
		inputsHint: 'V = Rᵀ · T(−eye): move the eye to the origin, then turn the camera onto x, y, z'
	},
	{
		// 3D -> 3D (in 4D): the matrix P and the clip test; the viewport stays in camera
		// space, clip space has no shape to draw
		id: 'clip-space',
		group: '3d-3d',
		label: 'camera → clip',
		symbol: 'P',
		valueSymbol: '',
		ready: true,
		values: CLIP_FRUSTUM,
		matrix: clipPerspective,
		point: CAMERA_POINT,
		inputs: FRUSTUM_INPUTS,
		inputsHint: 'frustum: fov (°), near, far; aspect 1',
		plainInputs: true, // not x, y, z
		noStage: true
	},
	{
		// 3D -> 3D: the divide by w -- the frustum squeezes into the cube, depth kept
		id: 'ndc',
		group: '3d-3d',
		label: 'clip → NDC',
		symbol: 'P',
		valueSymbol: '',
		ready: true,
		values: CLIP_FRUSTUM, // the same camera as camera -> clip
		matrix: clipPerspective,
		// the bar shows the squeeze only; P adds the z mirror, a sign convention
		stage: clipSqueeze,
		point: CAMERA_POINT,
		inputs: FRUSTUM_INPUTS,
		inputsHint: 'frustum: fov (°), near, far; aspect 1 -- then ÷ w',
		plainInputs: true,
		divide: true
	},
	{
		id: 'orthographic',
		group: '3d-2d',
		label: 'orthographic',
		symbol: 'P',
		valueSymbol: '',
		ready: true,
		// nothing to type: it always flattens onto the plane z = 0
		matrix: orthographic
	},
	{
		id: 'perspective',
		group: '3d-2d',
		label: 'perspective',
		symbol: 'P',
		valueSymbol: 'd',
		ready: true,
		values: PERSPECTIVE,
		matrix: perspective,
		// the eye's distance d from the plane, in its own row; beyond the cube (corners at 1)
		inputs: [{ axis: 'z', symbol: 'd' }],
		inputsHint: 'eye at (0, 0, d), looking at the plane z = 0',
		divide: true,
		min: 2,
		max: 12,
		step: 0.5
	}
];

/** The store of the point a kind follows: its own (camera -> clip: camera space) or the
 *  shared POINT (local or world). */
export function pointStoreOf(kind: TransformKind): Writable<Vec3> {
	return kind.point ?? POINT;
}

export function kindById(id: KindId): TransformKind {
	return KINDS.find((kind) => kind.id === id) ?? KINDS[0];
}

/** The kinds a page lists, in order. */
export function kindsOf(group: KindGroup): TransformKind[] {
	return KINDS.filter((kind) => kind.group === group);
}

/** Every kind of a page (its groups) that has a link, for its +page.ts `entries`. */
export function kindEntries(groups: KindGroup[]): { kind: KindId }[] {
	return groups
		.flatMap(kindsOf)
		.filter((kind) => kind.ready)
		.map((kind) => ({ kind: kind.id }));
}

/**
 * The kind named in a page's address; no name: the page's first kind. An unknown name, one
 * of another page or one not ready yet is the 404 page.
 */
export function loadKind(groups: KindGroup[], name: string | undefined): KindId {
	const kinds = groups.flatMap(kindsOf).filter((kind) => kind.ready);
	const kind = name === undefined ? kinds[0] : kinds.find((k) => k.id === name);
	if (!kind)
		error(
			404,
			`unknown ${groups.includes('transformations') ? 'transformation' : 'space'} "${name}"`
		);
	return kind.id;
}

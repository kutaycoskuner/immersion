// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The transformations of the transformations page, one entry each, so the switch at the top,
// the matrix panel (TransformPanel.svelte) and the scene (TransformScene.svelte) work the same
// for all of them: its name, the matrix symbol, the store of its typed values, the matrix at
// the stage t, which cells can be typed into and their limits. Adding one = an entry here,
// its matrix function in transformMath.ts, a description data file and component.
import type { Writable } from 'svelte/store';
import { ROTATION, SCALE, TRANSLATION, VALUE_LIMIT, type KindId } from '$lib/stores/transform';
import { rotation, scaling, translation, type Mat4 } from '$lib/transformMath';
import type { Vec3 } from '$lib/vectorMath';

export type Axis = 'x' | 'y' | 'z';

export interface TransformKind {
	id: KindId;
	label: string;
	/** Matrix name in the formulas: T (translation), S (scaling), R (rotation). */
	symbol: string;
	/** Name of the typed values in the formulas: t_x ..., s_x ..., θ_x ... */
	valueSymbol: string;
	/** Unit shown after typed values, e.g. "°". */
	unit?: string;
	/**
	 * The typed values are not cells of the matrix (rotation: angles, the cells are their
	 * cos / sin): the panel shows them as their own row vector and the matrix read-only.
	 */
	separateInputs?: boolean;
	/** false: shown in the switch but not chosen yet (later). */
	ready: boolean;
	values?: Writable<Vec3>;
	matrix?: (values: Vec3, t: number) => Mat4;
	/** The axis whose value sits in this cell of the matrix, or null for a fixed cell. */
	editableAxis?: (row: number, col: number) => Axis | null;
	/** Range of the typed values. */
	min?: number;
	max?: number;
	step?: number;
}

const AXES: Axis[] = ['x', 'y', 'z'];

export const KINDS: TransformKind[] = [
	{
		id: 'translation',
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
		label: 'rotation',
		symbol: 'R',
		valueSymbol: 'θ',
		unit: '°',
		ready: true,
		values: ROTATION,
		matrix: rotation,
		// angles in degrees, typed into their own row; the matrix holds their cos / sin
		separateInputs: true,
		min: -180,
		max: 180,
		step: 5
	}
];

export function kindById(id: KindId): TransformKind {
	return KINDS.find((kind) => kind.id === id) ?? KINDS[0];
}

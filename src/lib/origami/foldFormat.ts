// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The fold model file format ("immersion-fold", version 1, JSON) and its loader: a flat sheet
// as named 2D points and polygon faces, and the folds that turn it into a finished piece --
// each fold a line (two points), the face that stays and the face that turns, valley or
// mountain, the fold angle and the step it belongs to. parseFoldModel checks everything a
// broken file could get wrong and returns every problem it finds, never throwing, so a file
// dropped on the page explains itself. Format reference: documentation/origami-page.md;
// examples: static/origami/*.json. Building and folding the 3D model: foldModel.ts.

export type Point2 = [number, number];
export type FoldDirection = 'valley' | 'mountain';

/** hinge: rigid faces turn about a shared edge (polyhedra). flat: 180-degree folds through
 *  every layer of the folded stack (paper planes) -- in the format, not built yet. */
export type FoldType = 'hinge' | 'flat';
export const SUPPORTED_TYPES: FoldType[] = ['hinge'];

export interface FaceDef {
	/** Corner point names, counter-clockwise seen from the front of the sheet. */
	points: string[];
	/** The face that stays on the ground; exactly one. */
	base?: boolean;
}

export interface FoldDef {
	id: string;
	/** The fold line: two point names, an edge shared by `fixed` and `moving`. */
	line: [string, string];
	fixed: string;
	moving: string;
	/** valley: the moving face turns up, towards the front of the sheet; mountain: away. */
	direction: FoldDirection;
	/** How far the moving face turns, in degrees: 0 flat, 180 folded flat onto `fixed`. */
	angle: number;
	/** 1-based; folds of one step move together. */
	step: number;
	type: FoldType;
}

export interface StepDef {
	step: number;
	label?: string;
}

export interface FoldModel {
	format: 'immersion-fold';
	version: 1;
	name: string;
	unit?: string;
	points: Record<string, Point2>;
	faces: Record<string, FaceDef>;
	folds: FoldDef[];
	steps?: StepDef[];
}

export type ParseResult = { ok: true; model: FoldModel } | { ok: false; errors: string[] };

const isObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

/** Signed area of a polygon: positive when its corners run counter-clockwise. */
export function signedArea(points: Point2[]): number {
	let sum = 0;
	for (let i = 0; i < points.length; i++) {
		const [x1, y1] = points[i];
		const [x2, y2] = points[(i + 1) % points.length];
		sum += x1 * y2 - x2 * y1;
	}
	return sum / 2;
}

/** true when a and b are neighbouring corners of the face (either order). */
function isEdgeOf(face: FaceDef, a: string, b: string): boolean {
	const n = face.points.length;
	return face.points.some((p, i) => {
		const q = face.points[(i + 1) % n];
		return (p === a && q === b) || (p === b && q === a);
	});
}

/**
 * Checks a parsed JSON value against the format and returns the model or every problem.
 *
 * Args:
 *   data: the result of JSON.parse (anything).
 */
export function parseFoldModel(data: unknown): ParseResult {
	const errors: string[] = [];
	if (!isObject(data)) return { ok: false, errors: ['not a JSON object'] };
	if (data.format !== 'immersion-fold')
		errors.push(`format must be "immersion-fold", is ${JSON.stringify(data.format)}`);
	if (data.version !== 1)
		errors.push(`version ${JSON.stringify(data.version)} is not supported (only 1)`);
	if (typeof data.name !== 'string' || !data.name) errors.push('name is missing');

	// points
	const points: Record<string, Point2> = {};
	if (!isObject(data.points)) errors.push('points must be an object of name: [x, y]');
	else
		for (const [name, value] of Object.entries(data.points)) {
			if (Array.isArray(value) && value.length === 2 && value.every((v) => Number.isFinite(v)))
				points[name] = value as Point2;
			else errors.push(`point ${name}: must be [x, y] with two numbers`);
		}

	// faces
	const faces: Record<string, FaceDef> = {};
	if (!isObject(data.faces)) errors.push('faces must be an object of name: { points: [...] }');
	else
		for (const [name, value] of Object.entries(data.faces)) {
			if (!isObject(value) || !Array.isArray(value.points) || value.points.length < 3) {
				errors.push(`face ${name}: needs points, at least 3`);
				continue;
			}
			const missing = value.points.filter((p) => typeof p !== 'string' || !(p in points));
			if (missing.length) {
				errors.push(`face ${name}: unknown points ${missing.join(', ')}`);
				continue;
			}
			const corners = (value.points as string[]).map((p) => points[p]);
			if (signedArea(corners) <= 0)
				errors.push(`face ${name}: corners must run counter-clockwise (seen from the front)`);
			faces[name] = { points: value.points as string[], base: value.base === true };
		}
	const bases = Object.keys(faces).filter((name) => faces[name].base);
	if (Object.keys(faces).length && bases.length !== 1)
		errors.push(
			`exactly one face must be the base, found ${bases.length}${bases.length ? ` (${bases.join(', ')})` : ''}`
		);

	// folds
	const folds: FoldDef[] = [];
	if (!Array.isArray(data.folds)) errors.push('folds must be a list');
	else
		data.folds.forEach((value, index) => {
			const where =
				isObject(value) && typeof value.id === 'string' ? `fold ${value.id}` : `fold #${index + 1}`;
			if (!isObject(value)) return void errors.push(`${where}: must be an object`);
			const problems: string[] = [];
			const type = value.type ?? 'hinge';
			if (type !== 'hinge' && type !== 'flat')
				problems.push(`type must be hinge or flat, is ${JSON.stringify(type)}`);
			else if (!SUPPORTED_TYPES.includes(type as FoldType))
				problems.push(`type ${type} is not supported yet`);
			const line = value.line;
			if (
				!Array.isArray(line) ||
				line.length !== 2 ||
				!line.every((p) => typeof p === 'string' && p in points)
			)
				problems.push('line must be two known point names');
			for (const key of ['fixed', 'moving'] as const)
				if (typeof value[key] !== 'string' || !((value[key] as string) in faces))
					problems.push(`${key} must be a known face`);
			if (value.direction !== 'valley' && value.direction !== 'mountain')
				problems.push('direction must be valley or mountain');
			if (typeof value.angle !== 'number' || value.angle < 0 || value.angle > 180)
				problems.push('angle must be a number from 0 to 180');
			if (!Number.isInteger(value.step) || (value.step as number) < 1)
				problems.push('step must be a whole number, 1 or more');
			if (!problems.length) {
				const [a, b] = line as [string, string];
				for (const key of ['fixed', 'moving'] as const)
					if (!isEdgeOf(faces[value[key] as string], a, b))
						problems.push(`line ${a}-${b} is not an edge of the ${key} face ${value[key]}`);
			}
			if (problems.length) errors.push(...problems.map((p) => `${where}: ${p}`));
			else
				folds.push({
					id: typeof value.id === 'string' ? value.id : `fold-${index + 1}`,
					line: line as [string, string],
					fixed: value.fixed as string,
					moving: value.moving as string,
					direction: value.direction as FoldDirection,
					angle: value.angle as number,
					step: value.step as number,
					type: type as FoldType
				});
		});

	// the folds must form a tree from the base: every other face turns on exactly one fold
	if (bases.length === 1 && Array.isArray(data.folds) && !errors.length) {
		const parent = new Map<string, string>();
		for (const fold of folds) {
			if (fold.moving === bases[0]) errors.push(`fold ${fold.id}: the base face cannot move`);
			else if (parent.has(fold.moving))
				errors.push(`face ${fold.moving} moves on more than one fold`);
			else parent.set(fold.moving, fold.fixed);
		}
		for (const name of Object.keys(faces)) {
			if (name === bases[0]) continue;
			const seen = new Set<string>();
			let at: string | undefined = name;
			while (at && at !== bases[0] && !seen.has(at)) {
				seen.add(at);
				at = parent.get(at);
			}
			if (at !== bases[0]) errors.push(`face ${name} is not connected to the base by folds`);
		}
	}

	// steps: optional labels
	const steps: StepDef[] = [];
	if (data.steps !== undefined) {
		if (!Array.isArray(data.steps)) errors.push('steps must be a list');
		else
			for (const s of data.steps)
				if (isObject(s) && Number.isInteger(s.step))
					steps.push({
						step: s.step as number,
						label: typeof s.label === 'string' ? s.label : undefined
					});
	}

	if (errors.length) return { ok: false, errors };
	return {
		ok: true,
		model: {
			format: 'immersion-fold',
			version: 1,
			name: data.name as string,
			unit: typeof data.unit === 'string' ? data.unit : undefined,
			points,
			faces,
			folds,
			steps
		}
	};
}

/** Number of steps: the highest step of any fold. */
export function stepCount(model: FoldModel): number {
	return Math.max(1, ...model.folds.map((f) => f.step));
}

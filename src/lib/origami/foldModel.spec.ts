// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Tests for the fold format and the fold model with the bundled files (static/origami/, read through models.ts as the page does):
// both load without problems; flat at T = 0; folded, the cube closes to 8 corners and the
// dodecahedron to 20, with every face's front inside (valley folds) -- the solid is closed,
// not just folded somewhere. And a broken file lists its problems instead of throwing.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { bundledModel } from './models';
import { parseFoldModel, stepCount, type FoldModel } from './foldFormat';
import { buildFoldNet, setProgress } from './foldModel';

function load(name: string): FoldModel {
	const result = parseFoldModel(bundledModel(name)?.data);
	if (!result.ok) throw new Error(result.errors.join('\n'));
	return result.model;
}

/** Every corner of every face, in world space, at the stage T. */
function corners(model: FoldModel, T: number): THREE.Vector3[] {
	const net = buildFoldNet(model, () => ({
		front: new THREE.MeshBasicMaterial(),
		back: new THREE.MeshBasicMaterial()
	}));
	setProgress(net, T);
	net.root.updateMatrixWorld(true);
	const out: THREE.Vector3[] = [];
	for (const [name, parts] of Object.entries(net.faces))
		for (const p of model.faces[name].points) {
			const [x, y] = model.points[p];
			out.push(new THREE.Vector3(x, 0, -y).applyMatrix4(parts.frame.matrixWorld));
		}
	return out;
}

function distinct(points: THREE.Vector3[]): THREE.Vector3[] {
	const out: THREE.Vector3[] = [];
	for (const p of points) if (!out.some((q) => q.distanceTo(p) < 1e-4)) out.push(p);
	return out;
}

describe.each([
	['cube', 8],
	['dodecahedron', 20]
])('%s', (name, vertices) => {
	const model = load(name);

	it('lies flat at T = 0', () => {
		for (const p of corners(model, 0)) expect(Math.abs(p.y)).toBeLessThan(1e-9);
	});

	it(`closes to a solid with ${vertices} corners when every step is done`, () => {
		const folded = distinct(corners(model, stepCount(model)));
		expect(folded.length).toBe(vertices);
		// all corners of a regular solid are equally far from its centre
		const centre = folded
			.reduce((s, p) => s.add(p), new THREE.Vector3())
			.divideScalar(folded.length);
		const r = folded.map((p) => p.distanceTo(centre));
		expect(Math.max(...r) - Math.min(...r)).toBeLessThan(1e-6);
	});

	it('puts every face on its own place (no face on top of another, none missing)', () => {
		// 20 corners alone can be fooled: two faces on one spot still leave every corner there
		const places = [...faceCorners(model, stepCount(model)).values()].map((cs) =>
			cs.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(cs.length)
		);
		expect(distinct(places).length).toBe(Object.keys(model.faces).length);
	});

	it('is not closed half way through the steps', () => {
		expect(distinct(corners(model, stepCount(model) / 2)).length).toBeGreaterThan(vertices);
	});
});

/** Every face as its world corners at the stage T, by name. */
function faceCorners(model: FoldModel, T: number): Map<string, THREE.Vector3[]> {
	const net = buildFoldNet(model, () => ({
		front: new THREE.MeshBasicMaterial(),
		back: new THREE.MeshBasicMaterial()
	}));
	setProgress(net, T);
	net.root.updateMatrixWorld(true);
	const out = new Map<string, THREE.Vector3[]>();
	for (const [name, parts] of Object.entries(net.faces))
		out.set(
			name,
			model.faces[name].points.map((p) => {
				const [x, y] = model.points[p];
				return new THREE.Vector3(x, 0, -y).applyMatrix4(parts.frame.matrixWorld);
			})
		);
	return out;
}

/** true when the segment crosses the inside of the (convex, planar) polygon. */
function segmentHitsFace(p0: THREE.Vector3, p1: THREE.Vector3, face: THREE.Vector3[]): boolean {
	const n = new THREE.Vector3()
		.crossVectors(face[1].clone().sub(face[0]), face[2].clone().sub(face[0]))
		.normalize();
	const d0 = p0.clone().sub(face[0]).dot(n);
	const d1 = p1.clone().sub(face[0]).dot(n);
	if (d0 * d1 > -1e-12 || Math.abs(d0 - d1) < 1e-9) return false; // same side or touching
	const x = p0.clone().lerp(p1, d0 / (d0 - d1));
	return face.every((a, i) => {
		const b = face[(i + 1) % face.length];
		return new THREE.Vector3().crossVectors(b.clone().sub(a), x.clone().sub(a)).dot(n) > 1e-4;
	});
}

describe('the collision check itself', () => {
	it('sees two squares that cross, and not two that only share an edge', () => {
		const sq = (pts: number[][]) => pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
		const flat = sq([
			[0, 0, 0],
			[2, 0, 0],
			[2, 0, 2],
			[0, 0, 2]
		]);
		const crossing = sq([
			[1, -1, -1],
			[1, 1, -1],
			[1, 1, 3],
			[1, -1, 3]
		]);
		const hinged = sq([
			[2, 0, 0],
			[2, 2, 0],
			[2, 2, 2],
			[2, 0, 2]
		]);
		const hits = (A: THREE.Vector3[], B: THREE.Vector3[]) =>
			A.some((p, k) => segmentHitsFace(p, A[(k + 1) % A.length], B)) ||
			B.some((p, k) => segmentHitsFace(p, B[(k + 1) % B.length], A));
		expect(hits(flat, crossing)).toBe(true);
		expect(hits(flat, hinged)).toBe(false);
	});
});

describe.each(['cube', 'dodecahedron'])(
	'%s folds without faces passing through each other',
	(name) => {
		it('at every stage from flat to finished', () => {
			const model = load(name);
			const hits = new Set<string>();
			for (let s = 0; s <= 60; s++) {
				const faces = [...faceCorners(model, (stepCount(model) * s) / 60)];
				for (let i = 0; i < faces.length; i++)
					for (let j = i + 1; j < faces.length; j++) {
						const [[na, A], [nb, B]] = [faces[i], faces[j]];
						for (const [P, Q] of [
							[A, B],
							[B, A]
						])
							if (P.some((p, k) => segmentHitsFace(p, P[(k + 1) % P.length], Q)))
								hits.add(`${na} / ${nb}`);
					}
			}
			expect([...hits]).toEqual([]);
		});
	}
);

describe('parseFoldModel', () => {
	it('lists every problem of a broken file instead of throwing', () => {
		const result = parseFoldModel({
			format: 'immersion-fold',
			version: 1,
			name: 'broken',
			points: { a: [0, 0], b: [1, 0], c: [1, 1], d: [0, 1] },
			faces: {
				one: { points: ['a', 'b', 'c', 'd'], base: true },
				two: { points: ['d', 'c', 'b', 'a'] }
			},
			folds: [
				{
					id: 'f',
					line: ['a', 'x'],
					fixed: 'one',
					moving: 'two',
					direction: 'sideways',
					angle: 270,
					step: 0
				}
			]
		});
		expect(result.ok).toBe(false);
		const text = !result.ok ? result.errors.join('\n') : '';
		expect(text).toContain('face two: corners must run counter-clockwise');
		expect(text).toContain('line must be two known point names');
		expect(text).toContain('direction must be valley or mountain');
		expect(text).toContain('angle must be a number from 0 to 180');
		expect(text).toContain('step must be a whole number');
	});

	it('names the flat fold type as not supported yet', () => {
		const model = structuredClone(bundledModel('cube')!.data) as { folds: { type: string }[] };
		model.folds[0].type = 'flat';
		const result = parseFoldModel(model);
		expect(!result.ok && result.errors.join()).toContain('type flat is not supported yet');
	});
});

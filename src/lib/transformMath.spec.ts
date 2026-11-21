// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Unit tests for transformMath.ts: the matrices the transformations page shows and applies,
// checked against three.js so page and scene can't disagree.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';
import {
	apply,
	applyPoint,
	flat,
	identity,
	modelMatrix,
	orthographic,
	perspective,
	rotation,
	scaling,
	translation
} from './transformMath';

const offset = { x: 3, y: 1, z: -2 };

describe('translation', () => {
	it('is the identity at t = 0 and the full move at t = 1', () => {
		expect(translation(offset, 0)).toEqual(identity());
		expect(apply(translation(offset, 1), [1, 1, 1, 1])).toEqual([4, 2, -1, 1]);
	});
	it('moves part of the way in between (for the 0..1 slider)', () => {
		expect(apply(translation(offset, 0.5), [0, 0, 0, 1])).toEqual([1.5, 0.5, -1, 1]);
	});
	it('leaves directions (w = 0) unchanged', () => {
		expect(apply(translation(offset), [1, 0, 0, 0])).toEqual([1, 0, 0, 0]);
	});
	it('matches three.js Matrix4 with the same numbers', () => {
		const m = new Matrix4().set(...(flat(translation(offset)) as Parameters<Matrix4['set']>));
		const p = new Vector3(1, 1, 1).applyMatrix4(m);
		expect([p.x, p.y, p.z]).toEqual([4, 2, -1]);
	});
});

describe('scaling', () => {
	const factors = { x: 2, y: 1, z: 0.5 };
	it('is the identity at t = 0 and the full scale at t = 1', () => {
		expect(scaling(factors, 0)).toEqual(identity());
		expect(apply(scaling(factors, 1), [1, 1, 1, 1])).toEqual([2, 1, 0.5, 1]);
	});
	it('goes part of the way in between', () => {
		expect(apply(scaling(factors, 0.5), [1, 1, 1, 1])).toEqual([1.5, 1, 0.75, 1]);
	});
	it('scales about the origin: the origin stays, directions scale too', () => {
		expect(apply(scaling(factors), [0, 0, 0, 1])).toEqual([0, 0, 0, 1]);
		expect(apply(scaling(factors), [1, 0, 0, 0])).toEqual([2, 0, 0, 0]);
	});
	it('mirrors with a negative factor, never shows -0', () => {
		expect(apply(scaling({ x: -1, y: 1, z: 1 }), [1, 1, 1, 1])).toEqual([-1, 1, 1, 1]);
		expect(Object.is(scaling({ x: 1, y: 1, z: 1 }, 0)[0][0], 1)).toBe(true);
	});
	it('matches three.js Matrix4.makeScale', () => {
		const m = new Matrix4().set(...(flat(scaling(factors)) as Parameters<Matrix4['set']>));
		expect(m.equals(new Matrix4().makeScale(2, 1, 0.5))).toBe(true);
	});
});

describe('rotation', () => {
	const near = (a: number[], b: number[]) => a.forEach((v, k) => expect(v).toBeCloseTo(b[k], 10));
	it('turns x onto y by 90 degrees about z (right-handed)', () => {
		near(apply(rotation({ x: 0, y: 0, z: 90 }), [1, 0, 0, 1]), [0, 1, 0, 1]);
	});
	it('is the identity at t = 0 and turns part of the angle in between', () => {
		expect(rotation({ x: 30, y: 45, z: 60 }, 0)).toEqual(identity());
		near(apply(rotation({ x: 0, y: 0, z: 90 }, 0.5), [1, 0, 0, 1]), [
			Math.SQRT1_2,
			Math.SQRT1_2,
			0,
			1
		]);
	});
	it('keeps the distance to the origin (moves along an arc)', () => {
		const p = apply(rotation({ x: 30, y: 45, z: 60 }, 0.37), [1, 2, 3, 1]);
		expect(Math.hypot(p[0], p[1], p[2])).toBeCloseTo(Math.hypot(1, 2, 3), 10);
	});
	it('shows clean zeros, never 6e-17 or -0', () => {
		const m = rotation({ x: 90, y: 0, z: 0 });
		expect(m[1][1]).toBe(0);
		expect(Object.is(m[2][2], -0)).toBe(false);
	});
	it('matches three.js: x first, then y, then z (Euler order ZYX)', () => {
		const deg = { x: 30, y: -50, z: 120 };
		const r = MathUtils.degToRad;
		const expected = new Matrix4().makeRotationFromEuler(
			new Euler(r(deg.x), r(deg.y), r(deg.z), 'ZYX')
		);
		const m = new Matrix4().set(...(flat(rotation(deg)) as Parameters<Matrix4['set']>));
		near(m.elements, expected.elements);
	});
});

describe('projections', () => {
	const none = { x: 0, y: 0, z: 0 };
	const eye = { x: 0, y: 0, z: 4 }; // d = 4
	const near = (a: number[], b: number[]) => a.forEach((v, k) => expect(v).toBeCloseTo(b[k], 10));

	it('orthographic flattens z, keeps x and y, and is the identity at t = 0', () => {
		expect(orthographic(none, 0)).toEqual(identity());
		expect(apply(orthographic(none), [1, 2, 3, 1])).toEqual([1, 2, 0, 1]);
		near(apply(orthographic(none, 0.5), [1, 2, 3, 1]), [1, 2, 1.5, 1]);
	});

	it('orthographic cannot be undone: two points differing only in depth land on one', () => {
		expect(apply(orthographic(none), [1, 1, -1, 1])).toEqual(
			apply(orthographic(none), [1, 1, 1, 1])
		);
	});

	it('perspective lands a point where the line from the eye through it meets the plane', () => {
		// eye (0, 0, 4), point (1, 1, 2): the line reaches z = 0 at (1, 1) * 4 / (4 - 2) = (2, 2)
		near(applyPoint(perspective(eye), [1, 1, 2, 1]), [2, 2, 0, 1]);
		// a point behind the plane gets smaller: (1, 1, -4) -> (1, 1) * 4 / 8
		near(applyPoint(perspective(eye), [1, 1, -4, 1]), [0.5, 0.5, 0, 1]);
		expect(perspective(eye, 0)).toEqual(identity());
	});

	it('perspective: at every stage the point stays on the line from the eye through it', () => {
		const p = [1, -0.5, 1.5, 1] as [number, number, number, number];
		for (const t of [0.25, 0.5, 0.8]) {
			const q = applyPoint(perspective(eye, t), p);
			const a = new Vector3(q[0], q[1], q[2] - 4); // q - eye
			const b = new Vector3(p[0], p[1], p[2] - 4); // p - eye
			expect(a.clone().cross(b).length()).toBeCloseTo(0, 10);
		}
	});

	it('w stays 1 for every affine matrix, so applyPoint is apply there', () => {
		expect(applyPoint(translation({ x: 1, y: 2, z: 3 }), [1, 1, 1, 1])).toEqual([2, 3, 4, 1]);
	});
});

describe('model matrix (local -> world)', () => {
	const placement = {
		position: { x: 3, y: 1, z: -2 },
		rotation: { x: 0, y: 90, z: 0 },
		scale: { x: 2, y: 1, z: 1 }
	};
	const near = (a: number[], b: number[]) => a.forEach((v, k) => expect(v).toBeCloseTo(b[k], 10));

	it('is the identity at t = 0', () => {
		near(flat(modelMatrix(placement, 0)), flat(identity()));
	});

	it('scales first, then turns, then moves', () => {
		// local (1, 0, 0): scaled to (2, 0, 0), turned 90 about y to (0, 0, -2), moved by (3, 1, -2)
		near(apply(modelMatrix(placement), [1, 0, 0, 1]), [3, 1, -4, 1]);
		// the object's own origin lands on its position
		near(apply(modelMatrix(placement), [0, 0, 0, 1]), [3, 1, -2, 1]);
	});

	it('matches three.js Matrix4.compose (position, rotation x then y then z, scale)', () => {
		const p = {
			position: { x: 1, y: -2, z: 0.5 },
			rotation: { x: 20, y: -35, z: 70 },
			scale: { x: 1.5, y: 0.5, z: 2 }
		};
		const r = MathUtils.degToRad;
		const q = new Quaternion().setFromEuler(new Euler(r(20), r(-35), r(70), 'ZYX'));
		const expected = new Matrix4().compose(new Vector3(1, -2, 0.5), q, new Vector3(1.5, 0.5, 2));
		const m = new Matrix4().set(...(flat(modelMatrix(p)) as Parameters<Matrix4['set']>));
		near(m.elements, expected.elements);
	});

	it('can be undone, unlike a projection: the world point leads back to the local one', () => {
		const m = new Matrix4().set(...(flat(modelMatrix(placement)) as Parameters<Matrix4['set']>));
		const back = new Vector3(0.3, -0.7, 0.9).applyMatrix4(m).applyMatrix4(m.clone().invert());
		near(back.toArray(), [0.3, -0.7, 0.9]);
	});
});

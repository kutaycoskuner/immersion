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
import { Matrix4, Vector3 } from 'three';
import { apply, flat, identity, translation } from './transformMath';

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

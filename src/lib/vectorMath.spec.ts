// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Unit tests for vectorMath.ts: the numbers the vector page's overlays show.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { angleDeg, cross, dot, length, normalize } from './vectorMath';

const X = { x: 1, y: 0, z: 0 };
const Y = { x: 0, y: 1, z: 0 };
const Z = { x: 0, y: 0, z: 1 };
const ZERO = { x: 0, y: 0, z: 0 };

describe('cross', () => {
	it('is right-handed: x cross y = z', () => {
		expect(cross(X, Y)).toEqual(Z);
	});
	it('flips with the order', () => {
		const a = { x: 1, y: 1, z: 0 };
		const b = { x: 0.3, y: -0.5, z: 0.8 };
		const ab = cross(a, b);
		const ba = cross(b, a);
		expect([ab.x, ab.y, ab.z]).toEqual([-ba.x, -ba.y, -ba.z]);
	});
	it('is perpendicular to both inputs', () => {
		const a = { x: 1, y: 1, z: 0 };
		const b = { x: 0.3, y: -0.5, z: 0.8 };
		expect(dot(cross(a, b), a)).toBeCloseTo(0);
		expect(dot(cross(a, b), b)).toBeCloseTo(0);
	});
	it('has the length |a||b| sin angle', () => {
		const a = { x: 1, y: 1, z: 0 };
		const sin = Math.sin((angleDeg(a, X) * Math.PI) / 180);
		expect(length(cross(a, X))).toBeCloseTo(length(a) * sin);
	});
	it('is zero for parallel vectors', () => {
		expect(length(cross(X, { x: 2, y: 0, z: 0 }))).toBe(0);
	});
});

describe('normalize and angle', () => {
	it('keeps the zero vector at zero instead of NaN', () => {
		expect(normalize(ZERO)).toEqual(ZERO);
		expect(angleDeg(ZERO, X)).toBe(0);
	});
	it('gives unit length', () => {
		expect(length(normalize({ x: 3, y: 4, z: 0 }))).toBeCloseTo(1);
	});
	it('measures 45 degrees between (1, 1, 0) and x', () => {
		expect(angleDeg({ x: 1, y: 1, z: 0 }, X)).toBeCloseTo(45);
	});
});

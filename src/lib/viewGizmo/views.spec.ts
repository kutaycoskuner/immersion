// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Unit tests of views.ts, the viewport gizmo's view math (three.js axes, Y up, front = +Z):
// views land on the right orbit angles, the gizmo shows the axes where the camera sees them,
// clicking the current view flips it, transitions take the short way round.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import {
	AXIS_HANDLES,
	POLE_EPS,
	anglesFor,
	anglesOf,
	blend,
	offsetFor,
	orbitBy,
	projectHandles,
	targetFor,
	type Angles,
	type Quat,
	type Vec3
} from './views';

const handle = (id: string) => AXIS_HANDLES.find((h) => h.id === id)!;

/** Orientation of a camera placed by the angles, as viewController/OrbitControls place it. */
function cameraQuat(angles: Angles): Quat {
	const camera = new PerspectiveCamera();
	camera.position.set(...offsetFor(angles, 5));
	camera.lookAt(new Vector3(0, 0, 0));
	const q = camera.quaternion;
	return [q.x, q.y, q.z, q.w];
}

function at(q: Quat, id: string) {
	const p = projectHandles(q).find((h) => h.id === id)!;
	return [p.x, p.y, p.depth].map((n) => Math.round(n * 1000) / 1000 + 0);
}

describe('view angles', () => {
	it('puts the camera on the side of the direction', () => {
		expect(anglesFor([0, 0, 1])).toEqual({ theta: 0, phi: Math.PI / 2 }); // front
		expect(anglesFor([1, 0, 0]).theta).toBeCloseTo(Math.PI / 2); // right
		expect(Math.abs(anglesFor([0, 0, -1]).theta)).toBeCloseTo(Math.PI); // back
	});

	it('keeps top and bottom just off the pole, in plan orientation', () => {
		expect(anglesFor([0, 1, 0])).toEqual({ theta: 0, phi: POLE_EPS });
		expect(anglesFor([0, -1, 0])).toEqual({ theta: 0, phi: Math.PI - POLE_EPS });
	});

	it('round-trips through the offset', () => {
		const angles = { theta: 0.7, phi: 1.1 };
		const offset = offsetFor(angles, 3);
		expect(Math.hypot(...offset)).toBeCloseTo(3);
		expect(anglesOf(offset).theta).toBeCloseTo(0.7);
		expect(anglesOf(offset).phi).toBeCloseTo(1.1);
	});
});

describe('gizmo projection', () => {
	it('front view: X right, Y up, Z towards the viewer', () => {
		const q = cameraQuat(anglesFor([0, 0, 1]));
		expect(at(q, '+x')).toEqual([1, 0, 0]);
		expect(at(q, '+y')).toEqual([0, -1, 0]); // screen y points down
		expect(at(q, '+z')).toEqual([0, 0, 1]);
	});

	it('top view: X right, -Z (back) up, Y towards the viewer', () => {
		const q = cameraQuat(anglesFor([0, 1, 0]));
		expect(at(q, '+x')).toEqual([1, 0, 0]);
		expect(at(q, '-z')).toEqual([0, -1, 0]);
		expect(at(q, '+y')).toEqual([0, 0, 1]);
	});

	it('draws back to front', () => {
		const depths = projectHandles(cameraQuat({ theta: 0.6, phi: 1 })).map((h) => h.depth);
		expect(depths).toEqual([...depths].sort((a, b) => a - b));
	});
});

describe('clicks, transitions, drags', () => {
	it('clicking the current view goes to the opposite side', () => {
		const front: Vec3 = offsetFor(anglesFor([0, 0, 1]), 4);
		expect(targetFor(handle('+z'), front)).toEqual(anglesFor([0, 0, -1]));
		expect(targetFor(handle('+x'), front)).toEqual(anglesFor([1, 0, 0]));
	});

	it('turns the short way round and lands exactly', () => {
		const from = { theta: 3, phi: 1 };
		const to = { theta: -3, phi: 1.5 };
		expect(blend(from, to, 0.5).theta).toBeGreaterThan(3); // through PI, not through 0
		const end = blend(from, to, 1);
		expect(Math.cos(end.theta)).toBeCloseTo(Math.cos(-3));
		expect(end.phi).toBe(1.5);
	});

	it('drag orbits like the scene and stops at the poles', () => {
		const start = { theta: 0, phi: 1 };
		expect(orbitBy(start, 50, 0, 100).theta).toBeCloseTo(-Math.PI / 2);
		expect(orbitBy(start, 0, 1000, 100).phi).toBe(POLE_EPS);
	});
});

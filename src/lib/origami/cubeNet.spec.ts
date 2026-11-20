// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Unit tests for cubeNet.ts: closed, the six faces make a cube; open, they lie flat on the
// ground as a cross-shaped net without overlapping; colours are stable per face.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { FACES, buildCubeNet, randomColor, setFold, type FaceName } from './cubeNet';

function centres(p: number): Record<FaceName, THREE.Vector3> {
	const net = buildCubeNet(() => new THREE.MeshBasicMaterial());
	setFold(net, p);
	net.root.updateMatrixWorld(true);
	const out = {} as Record<FaceName, THREE.Vector3>;
	for (const spec of FACES) out[spec.name] = net.faces[spec.name].getWorldPosition(new THREE.Vector3());
	return out;
}

const round = (v: THREE.Vector3) => v.toArray().map((n) => Math.round(n * 1000) / 1000 + 0);

describe('cube net', () => {
	it('closed: each face centre sits on its side of the unit cube', () => {
		const c = centres(0);
		expect(round(c.bottom)).toEqual([0, -0.5, 0]);
		expect(round(c.top)).toEqual([0, 0.5, 0]);
		expect(round(c.front)).toEqual([0, 0, 0.5]);
		expect(round(c.back)).toEqual([0, 0, -0.5]);
		expect(round(c.left)).toEqual([-0.5, 0, 0]);
		expect(round(c.right)).toEqual([0.5, 0, 0]);
	});

	it('open: all faces lie flat on the ground as a cross, none on top of another', () => {
		const c = centres(1);
		for (const v of Object.values(c)) expect(v.y).toBeCloseTo(-0.5, 6);
		expect(round(c.front)).toEqual([0, -0.5, 1]);
		expect(round(c.back)).toEqual([0, -0.5, -1]);
		expect(round(c.left)).toEqual([-1, -0.5, 0]);
		expect(round(c.right)).toEqual([1, -0.5, 0]);
		expect(round(c.top)).toEqual([0, -0.5, -2]);
		const keys = Object.values(c).map((v) => round(v).join());
		expect(new Set(keys).size).toBe(6);
	});

	it('gives every face a stable colour of its own', () => {
		expect(randomColor('front').equals(randomColor('front'))).toBe(true);
		const hexes = FACES.map((f) => randomColor(f.name).getHexString());
		expect(new Set(hexes).size).toBe(6);
	});
});

describe('labels read the right way', () => {
	// a label reads correctly on a plane's front (+z); on the closed cube every face's front
	// must point away from the centre and its inside plane's front towards it
	it('closed: every face looks outward, its inside inward', () => {
		const net = buildCubeNet(() => new THREE.MeshBasicMaterial());
		setFold(net, 0);
		net.root.updateMatrixWorld(true);
		const front = (obj: THREE.Object3D) =>
			new THREE.Vector3(0, 0, 1).applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion()));
		for (const spec of FACES) {
			const mesh = net.faces[spec.name];
			const centre = mesh.getWorldPosition(new THREE.Vector3());
			const inside = mesh.children.find((c) => c.name.endsWith('-inside'))!;
			expect(front(mesh).dot(centre), spec.name).toBeGreaterThan(0.49);
			expect(front(inside).dot(centre), `${spec.name} inside`).toBeLessThan(-0.49);
		}
	});
});

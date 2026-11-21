// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Tests for hand.ts: the coloured fingers of the right hand reach out along +x (thumb, red),
// +y (index, green) and +z (middle, blue), and those three form a right-handed system
// (x cross y = z); the left hand's middle finger points along -z instead.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { AXIS_COLORS } from './views';
import { buildHand, type Handedness } from './hand';

/** The point of the finger in that colour farthest from the origin. */
function fingertip(handedness: Handedness, color: string): THREE.Vector3 {
	const hand = buildHand(handedness);
	hand.updateMatrixWorld(true);
	const target = new THREE.Color(color);
	let tip = new THREE.Vector3();
	hand.traverse((obj) => {
		const mesh = obj as THREE.Mesh;
		const material = mesh.material as THREE.MeshStandardMaterial | undefined;
		if (!mesh.isMesh || !material?.color?.equals(target)) return;
		const box = new THREE.Box3().setFromObject(mesh);
		for (const corner of [box.min, box.max])
			if (corner.length() > tip.length()) tip = corner.clone();
		// the far end of the capsule along its axis
		const centre = box.getCenter(new THREE.Vector3());
		const far = centre.clone().add(centre.clone().normalize().multiplyScalar(0.4));
		if (far.length() > tip.length()) tip = far;
	});
	return tip;
}

const mainAxis = (v: THREE.Vector3) => {
	const a = [Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)];
	const i = a.indexOf(Math.max(...a));
	return `${Math.sign(v.getComponent(i)) > 0 ? '+' : '-'}${'xyz'[i]}`;
};

describe('hand gizmo', () => {
	it('right hand: thumb +x, index +y, middle +z, in the axis colours', () => {
		expect(mainAxis(fingertip('right', AXIS_COLORS.x))).toBe('+x');
		expect(mainAxis(fingertip('right', AXIS_COLORS.y))).toBe('+y');
		expect(mainAxis(fingertip('right', AXIS_COLORS.z))).toBe('+z');
	});

	it('right hand is right-handed: thumb cross index points along the middle finger', () => {
		const x = fingertip('right', AXIS_COLORS.x).normalize();
		const y = fingertip('right', AXIS_COLORS.y).normalize();
		const z = fingertip('right', AXIS_COLORS.z).normalize();
		expect(new THREE.Vector3().crossVectors(x, y).dot(z)).toBeGreaterThan(0.5);
	});

	it('left hand is the mirror: its middle finger points along -z', () => {
		expect(mainAxis(fingertip('left', AXIS_COLORS.x))).toBe('+x');
		expect(mainAxis(fingertip('left', AXIS_COLORS.y))).toBe('+y');
		expect(mainAxis(fingertip('left', AXIS_COLORS.z))).toBe('-z');
	});
});

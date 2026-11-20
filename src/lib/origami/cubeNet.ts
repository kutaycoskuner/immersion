// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The unfolding cube as data and pure three.js building blocks: six faces, each hinged on an
// edge of the face it folds against (bottom stays on the ground, the four sides hinge on the
// bottom's edges, the top on the back's top edge), so the open cube lies flat as a cross-
// shaped net. setFold(net, p) puts every hinge at p of its open angle (0 = closed cube,
// 1 = flat net). Used by UnfoldingScene.svelte; the first step towards origami (a flat sheet
// with fold lines), where the same hinge idea applies. No rendering here: tested in Node
// (cubeNet.spec.ts).
import * as THREE from 'three';

export type FaceName = 'bottom' | 'front' | 'back' | 'left' | 'right' | 'top';

export interface FaceSpec {
	name: FaceName;
	/** The face it hinges on; null: fixed to the ground (the base of the net). */
	parent: FaceName | null;
	/** Hinge position, relative to the parent's hinge (or the cube's centre for the base). */
	hinge: [number, number, number];
	/** Hinge axis and the angle that opens it flat, in radians. */
	axis: 'x' | 'z';
	openAngle: number;
	/** The face square relative to its hinge: centre and rotation (closed cube). */
	position: [number, number, number];
	rotation: [number, number, number];
}

const H = Math.PI / 2;

// a unit cube centred at the origin; every face is a 1 x 1 square whose front (the plane's +z,
// where its label reads correctly) points out of the closed cube
export const FACES: FaceSpec[] = [
	{
		name: 'bottom',
		parent: null,
		hinge: [0, -0.5, 0],
		axis: 'x',
		openAngle: 0,
		position: [0, 0, 0],
		rotation: [H, 0, 0]
	},
	{
		name: 'front',
		parent: 'bottom',
		hinge: [0, 0, 0.5],
		axis: 'x',
		openAngle: H,
		position: [0, 0.5, 0],
		rotation: [0, 0, 0]
	},
	{
		name: 'back',
		parent: 'bottom',
		hinge: [0, 0, -0.5],
		axis: 'x',
		openAngle: -H,
		position: [0, 0.5, 0],
		rotation: [0, Math.PI, 0]
	},
	{
		name: 'left',
		parent: 'bottom',
		hinge: [-0.5, 0, 0],
		axis: 'z',
		openAngle: H,
		position: [0, 0.5, 0],
		rotation: [0, -H, 0]
	},
	{
		name: 'right',
		parent: 'bottom',
		hinge: [0.5, 0, 0],
		axis: 'z',
		openAngle: -H,
		position: [0, 0.5, 0],
		rotation: [0, H, 0]
	},
	// the top folds over the back's top edge, so the net is a cross with the top past the back
	{
		name: 'top',
		parent: 'back',
		hinge: [0, 1, 0],
		axis: 'x',
		openAngle: -H,
		position: [0, 0, 0.5],
		rotation: [-H, 0, 0]
	}
];

/** Blender-style random colour: stable per name (a hash, like Blender's per-object random
 *  colour), mid saturation and bright, so neighbours differ and labels stay readable. */
export function randomColor(name: string): THREE.Color {
	let hash = 2166136261;
	for (const char of name) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
	const unit = (shift: number) => ((hash >>> shift) & 0xff) / 255;
	return new THREE.Color().setHSL(unit(0), 0.45 + 0.2 * unit(8), 0.55 + 0.1 * unit(16));
}

export const NEUTRAL_COLOR = new THREE.Color('#b5b5b5'); // Blender's solid grey, colours off

/** Smooth start and stop for the fold animation. */
export function easeInOut(t: number): number {
	const c = Math.min(1, Math.max(0, t));
	return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

export interface CubeNet {
	root: THREE.Group;
	/** One hinge group per face; rotating it folds the face and everything hinged on it. */
	hinges: Record<FaceName, THREE.Group>;
	faces: Record<FaceName, THREE.Mesh>;
}

/**
 * Builds the cube's hinge tree with one plane mesh per face (plus its back-to-back inside).
 *
 * Args:
 *   makeMaterial: the material for a face, used on both sides (the scene sets colour and
 *     label texture on it); it must be single-sided (THREE.FrontSide, the default).
 */
export function buildCubeNet(makeMaterial: (face: FaceName) => THREE.Material): CubeNet {
	const root = new THREE.Group();
	const hinges = {} as Record<FaceName, THREE.Group>;
	const faces = {} as Record<FaceName, THREE.Mesh>;
	const geometry = new THREE.PlaneGeometry(1, 1);

	for (const spec of FACES) {
		const hinge = new THREE.Group();
		hinge.position.set(...spec.hinge);
		(spec.parent ? hinges[spec.parent] : root).add(hinge);

		const material = makeMaterial(spec.name);
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(...spec.position);
		mesh.rotation.set(...spec.rotation);
		mesh.name = spec.name;
		hinge.add(mesh);

		// the inside: a second plane back to back, turned half around, so the label reads
		// the right way from inside the cube and on the open net (where the inside faces up)
		// instead of mirrored; the material must draw front sides only (no z-fighting)
		const inside = new THREE.Mesh(geometry, material);
		inside.rotation.y = Math.PI;
		inside.name = `${spec.name}-inside`;
		mesh.add(inside);

		hinges[spec.name] = hinge;
		faces[spec.name] = mesh;
	}
	return { root, hinges, faces };
}

/** Puts every hinge at p of its open angle: 0 = closed cube, 1 = flat net. */
export function setFold(net: CubeNet, p: number) {
	const k = easeInOut(p);
	for (const spec of FACES) {
		const hinge = net.hinges[spec.name];
		hinge.rotation.set(0, 0, 0);
		hinge.rotation[spec.axis] = spec.openAngle * k;
	}
}

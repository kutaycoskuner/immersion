// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// A simple human hand for the hand gizmo: the overall shape only, no creases or nails, drawn
// flat -- unlit colours, so overlapping parts merge into one tone -- with one dark outline
// around the whole hand. A palm narrowing towards the wrist and five fingers, each a chain of block
// segments (phalanges) that get shorter and thinner towards the tip. Posed as the
// coordinate-system hand rule: palm towards the viewer, index finger up (+y), thumb out to
// the side (+x), middle finger bent forward at its knuckle (+z), ring and little finger
// folded towards the palm as an L. That is a right hand (three.js, OpenGL:
// right-handed); the left hand (Unity, Direct3D: left-handed) is its mirror image, middle
// finger along -z. The three open fingers carry the axis colours (x red, y green, z blue),
// the rest is grey. Pure three.js, no rendering; used by HandGizmo.svelte and shown
// big on the display model page to check it.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { AXIS_COLORS } from '$lib/viewGizmo/views';
import type { Handedness } from '$lib/viewGizmo/views';
export type { Handedness }; // defined once, with the gizmo's axes (views.ts)

// the hand without an axis: a mid grey, so only the three axis fingers carry colour
const BASE = '#a9adb2';
const OUTLINE = '#1c1c1c';

/** One finger: its knuckle, then per segment the direction and length; the radius thins
 *  from `radius` towards the tip. */
interface FingerSpec {
	knuckle: [number, number, number];
	segments: { dir: [number, number, number]; length: number }[];
	radius: number;
	color: THREE.ColorRepresentation;
}

// the hand in its own units: palm about 0.72 wide, 0.7 long and 0.2 thick, the knuckle row
// at y = 0.4; the palm side faces +z (the viewer)
// shortened from the wrist side: its top edge (y 0.445, behind the knuckles) stays put
const PALM = { width: 0.72, length: 0.7, thickness: 0.2, centre: [0, 0.095, -0.02] as const };
const TAPER = 0.78; // the palm's width at the wrist, of its width at the knuckles

const FINGERS: Record<string, FingerSpec> = {
	// index: straight up (+y)
	index: {
		knuckle: [0.25, 0.4, 0],
		segments: [
			{ dir: [0, 1, 0], length: 0.53 },
			{ dir: [0, 1, 0], length: 0.35 },
			{ dir: [0, 1, 0], length: 0.27 }
		],
		radius: 0.08,
		color: AXIS_COLORS.y
	},
	// middle: bent 90 degrees forward at the knuckle, then straight (+z)
	middle: {
		knuckle: [0.085, 0.42, 0.02],
		segments: [
			{ dir: [0, 0, 1], length: 0.3 },
			{ dir: [0, 0, 1], length: 0.19 },
			{ dir: [0, 0, 1], length: 0.15 }
		],
		radius: 0.082,
		color: AXIS_COLORS.z
	},
	// ring and little finger: folded as an L -- forward from the knuckle, then the other two
	// segments as one straight leg down, leaning towards the palm (no third bend: that made
	// a reversed C)
	ring: {
		knuckle: [-0.085, 0.4, 0.02],
		// an L: forward from the knuckle, then one straight leg down, leaning towards the palm
		segments: [
			{ dir: [0, -0.5, 1], length: 0.34 }, // first fold past 90 degrees, forward and down
			{ dir: [0, -0.84, -0.54], length: 0.24 }, // the leg back to the palm: the tip
			{ dir: [0, -0.84, -0.54], length: 0.17 } // touches its front face
		],
		radius: 0.077,
		color: BASE
	},
	little: {
		knuckle: [-0.245, 0.35, 0.02],
		segments: [
			{ dir: [-0.05, -0.5, 1], length: 0.27 },
			{ dir: [0, -0.85, -0.52], length: 0.18 },
			{ dir: [0, -0.85, -0.52], length: 0.13 }
		],
		radius: 0.066,
		color: BASE
	},
	// thumb: from the low side of the palm, angled out, then straight along +x
	thumb: {
		knuckle: [0.3, -0.2, 0.05],
		segments: [
			{ dir: [0.75, 0.45, 0.35], length: 0.28 },
			{ dir: [1, 0, 0], length: 0.19 }, // the straight part runs exactly along +x
			{ dir: [1, 0, 0], length: 0.15 }
		],
		radius: 0.09,
		color: AXIS_COLORS.x
	}
};

/** Flat, unlit colour: no shading, so overlapping parts merge into one tone. */
const flat = (color: THREE.ColorRepresentation) => new THREE.MeshBasicMaterial({ color });

/**
 * A finger's segments as blocks, each a little longer than its bone so it overlaps the next
 * one (the joint closes); flat colour, no edges of its own (the hand has one outline).
 */
function buildFinger(spec: FingerSpec): THREE.Group {
	const finger = new THREE.Group();
	const material = flat(spec.color);
	let at = new THREE.Vector3(...spec.knuckle);
	spec.segments.forEach(({ dir, length }, i) => {
		const radius = spec.radius * (1 - 0.12 * i); // thinner towards the tip
		const direction = new THREE.Vector3(...dir).normalize();
		const overlap = radius * 0.4; // just enough to close the joint
		const geometry = new THREE.BoxGeometry(radius * 2, length + overlap, radius * 1.6);
		const segment = new THREE.Mesh(geometry, material);
		segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction); // boxes run along y
		segment.position.copy(at).addScaledVector(direction, length / 2);
		finger.add(segment);
		at = at.clone().addScaledVector(direction, length);
	});
	return finger;
}

/**
 * Builds the hand; the open fingers' axis lines (fingerAxisLines) run along them.
 *
 * Args:
 *   handedness: 'right' (thumb x, index y, middle z) or 'left' (its mirror image).
 */
export function buildHand(handedness: Handedness = 'right'): THREE.Group {
	const hand = new THREE.Group();
	const base = flat(BASE);
	// blocks with only a hairline bevel
	const block = (w: number, h: number, d: number) => new RoundedBoxGeometry(w, h, d, 1, 0.012);

	// the palm, narrowing towards the wrist: its lower half squeezed in x down to TAPER
	const palmGeometry = block(PALM.width, PALM.length, PALM.thickness);
	const position = palmGeometry.getAttribute('position');
	for (let i = 0; i < position.count; i++) {
		const y = position.getY(i); // -length/2 (wrist side) .. +length/2 (knuckles)
		if (y < 0) position.setX(i, position.getX(i) * (1 - (1 - TAPER) * (-y / (PALM.length / 2))));
	}
	const palm = new THREE.Mesh(palmGeometry, base);
	palm.position.set(...PALM.centre);
	// the heel, as narrow as the palm's lower edge; the pad at the base of the thumb, a tilted
	// block, so the thumb grows out of the palm; the wrist
	const heel = new THREE.Mesh(block(PALM.width * TAPER - 0.04, 0.28, 0.19), base);
	heel.position.set(-0.02, -0.37, -0.025); // its top just inside the palm's lower edge
	const pad = new THREE.Mesh(block(0.24, 0.36, 0.2), base);
	pad.rotation.z = -0.5;
	pad.position.set(0.26, -0.2, 0.03);
	const wrist = new THREE.Mesh(block(0.42, 0.2, 0.22), base); // a short stub below the heel
	wrist.position.set(-0.02, -0.57, -0.025);
	hand.add(palm, heel, pad, wrist);

	for (const spec of Object.values(FINGERS)) hand.add(buildFinger(spec));

	// a left hand is the mirror image: flip one axis (z), so thumb x and index y stay and the
	// middle finger points the other way -- what a left-handed system calls +z
	addSilhouette(hand);

	if (handedness === 'left') hand.scale.z = -1;
	return hand;
}

const OUTLINE_WIDTH = 0.022; // in hand units

/**
 * One dark outline around the whole hand, none inside it: every part gets a copy a little
 * bigger in each direction, drawn first (renderOrder -1) in the outline colour without
 * writing depth; the hand drawn after it covers those copies everywhere inside its
 * silhouette, so only the ring around the outside stays -- and overlapping parts stay one
 * flat colour.
 */
function addSilhouette(hand: THREE.Group) {
	const outline = new THREE.MeshBasicMaterial({ color: OUTLINE, depthWrite: false });
	const parts: THREE.Mesh[] = [];
	hand.traverse((obj) => {
		if ((obj as THREE.Mesh).isMesh) parts.push(obj as THREE.Mesh);
	});
	for (const part of parts) {
		part.geometry.computeBoundingBox();
		const size = part.geometry.boundingBox!.getSize(new THREE.Vector3());
		const shell = new THREE.Mesh(part.geometry, outline);
		// grow by the same width on every side, whatever the part's size
		shell.scale.set(
			(size.x + 2 * OUTLINE_WIDTH) / size.x,
			(size.y + 2 * OUTLINE_WIDTH) / size.y,
			(size.z + 2 * OUTLINE_WIDTH) / size.z
		);
		// parts are centred on their own origin except the palm (centred too) -- the shell
		// grows around the geometry's centre
		const centre = part.geometry.boundingBox!.getCenter(new THREE.Vector3());
		shell.position.copy(centre).multiply(new THREE.Vector3(1, 1, 1).sub(shell.scale));
		shell.renderOrder = -1;
		part.add(shell);
	}
}

/** The direction each open finger points, in the hand's own space. */
export function fingerAxes(handedness: Handedness = 'right') {
	const z = handedness === 'right' ? 1 : -1;
	return {
		thumb: new THREE.Vector3(1, 0, 0),
		index: new THREE.Vector3(0, 1, 0),
		middle: new THREE.Vector3(0, 0, z)
	};
}

/**
 * Axis lines that run along the three open fingers -- each through its finger's straight
 * part in the finger's own axis direction, from inside the hand to beyond the tip, in the
 * axis colour -- so every axis lies on its finger. Add it to the hand (so it mirrors with a
 * left hand).
 */
export function fingerAxisLines(length = 2.2): THREE.Group {
	const lines = new THREE.Group();
	const axes: [FingerSpec, THREE.Vector3][] = [
		[FINGERS.thumb, new THREE.Vector3(1, 0, 0)],
		[FINGERS.index, new THREE.Vector3(0, 1, 0)],
		[FINGERS.middle, new THREE.Vector3(0, 0, 1)]
	];
	for (const [spec, axis] of axes) {
		// the last segment runs exactly along the axis: the line goes through its start (the
		// thumb's first segment angles up out of the palm, so its knuckle is not on the line)
		const tipStart = new THREE.Vector3(...spec.knuckle);
		for (const s of spec.segments.slice(0, -1))
			tipStart.addScaledVector(new THREE.Vector3(...s.dir).normalize(), s.length);
		const straight = spec.segments.reduce((sum, s) => sum + s.length, 0) * 0.8;
		const start = tipStart.clone().addScaledVector(axis, -straight);
		const line = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
				start,
				start.clone().addScaledVector(axis, length)
			]),
			new THREE.LineBasicMaterial({ color: spec.color, depthTest: false, transparent: true })
		);
		line.renderOrder = 1; // drawn over the hand, so the line shows inside the finger too
		lines.add(line);
	}
	return lines;
}

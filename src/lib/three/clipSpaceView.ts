// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-24
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The parts of the spaces page's camera -> clip viewport (TransformScene.svelte) that are
// about the camera's frustum: its 8 corners, its wire frame and see-through faces (the near
// face brighter: the screen the picture forms on), labels for eye / near / far / the clip
// cube, the 6 planes bounding it after any matrix (for "inside bright, outside grey"), and
// the camera for the corner inset that shows what this camera sees.
// Gotcha: the boxes are drawn with a projective matrix (bottom row not 0 0 0 1), and
// three.js' clipping planes compare the undivided position; `divideClipping` patches a
// material so the clipping uses the position divided by w, the point that is really drawn.
import * as THREE from 'three';
import { applyPoint, frustumHalfSizes, type Mat4 } from '$lib/transformMath';
import type { Vec3 } from '$lib/vectorMath';
import { textSprite } from '$lib/three/textSprite';

/** The frustum's corners in camera space: near (4, counter-clockwise), then far (4). */
export function frustumCorners(values: Vec3): THREE.Vector3[] {
	const { near, far, n, f } = frustumHalfSizes(values);
	const rect = ([w, h]: [number, number], z: number) =>
		[
			[-w, -h],
			[w, -h],
			[w, h],
			[-w, h]
		].map(([x, y]) => new THREE.Vector3(x, y, z));
	return [...rect(near, -n), ...rect(far, -f)];
}

// the 6 faces as corner indices (near, far, then the 4 sides)
const FACES = [
	[0, 1, 2, 3],
	[4, 5, 6, 7],
	[0, 1, 5, 4],
	[1, 2, 6, 5],
	[2, 3, 7, 6],
	[3, 0, 4, 7]
];

/** The frustum's edges as a wire frame (the matrix is set by the caller). */
export function frustumFrame(values: Vec3, color: string, opacity = 1): THREE.LineSegments {
	const c = frustumCorners(values);
	const points: THREE.Vector3[] = [];
	for (let i = 0; i < 4; i++) {
		const j = (i + 1) % 4;
		points.push(c[i], c[j], c[4 + i], c[4 + j], c[i], c[4 + i]);
	}
	const lines = new THREE.LineSegments(
		new THREE.BufferGeometry().setFromPoints(points),
		new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
	);
	lines.matrixAutoUpdate = false;
	return lines;
}

/** The pyramid's tip: faint lines from the eye (the origin) to the near corners -- the part
 *  between eye and near that the camera does not show, but that makes it one shape. */
export function frustumTip(values: Vec3, color: string, opacity: number): THREE.LineSegments {
	const eye = new THREE.Vector3();
	const points = frustumCorners(values)
		.slice(0, 4)
		.flatMap((c) => [eye, c]);
	const lines = new THREE.LineSegments(
		new THREE.BufferGeometry().setFromPoints(points),
		new THREE.LineBasicMaterial({ color, transparent: true, opacity })
	);
	lines.matrixAutoUpdate = false;
	return lines;
}

/** The frustum's faces, see-through: the near face (the screen) brighter than the rest. */
export function frustumFill(values: Vec3, color: string): THREE.Group {
	const c = frustumCorners(values);
	const group = new THREE.Group();
	FACES.forEach((face, k) => {
		const geometry = new THREE.BufferGeometry().setFromPoints(face.map((i) => c[i]));
		geometry.setIndex([0, 1, 2, 0, 2, 3]);
		group.add(
			new THREE.Mesh(
				geometry,
				new THREE.MeshBasicMaterial({
					color,
					transparent: true,
					opacity: k === 0 ? 0.16 : 0.05,
					side: THREE.DoubleSide,
					depthWrite: false
				})
			)
		);
	});
	group.matrixAutoUpdate = false;
	return group;
}

/** Where a camera-space point is drawn under m (divided by w). */
export function drawnAt(m: Mat4, p: THREE.Vector3): THREE.Vector3 {
	const [x, y, z] = applyPoint(m, [p.x, p.y, p.z, 1]);
	return new THREE.Vector3(x, y, z);
}

/**
 * The 6 planes bounding the frustum as it is drawn under m, facing inwards (three.js keeps
 * what is on a plane's positive side). A face flattened to a line (the mirror step half way)
 * gives no plane and is left out.
 */
export function insidePlanes(values: Vec3, m: Mat4): THREE.Plane[] {
	const c = frustumCorners(values).map((p) => drawnAt(m, p));
	const centre = c.reduce((sum, p) => sum.add(p), new THREE.Vector3()).divideScalar(8);
	const planes: THREE.Plane[] = [];
	for (const [a, b, d] of FACES) {
		const plane = new THREE.Plane().setFromCoplanarPoints(c[a], c[b], c[d]);
		if (!Number.isFinite(plane.constant) || plane.normal.lengthSq() < 0.5) continue;
		if (plane.distanceToPoint(centre) < 0) plane.negate();
		planes.push(plane);
	}
	return planes;
}

/** The planes turned around: with `clipIntersection` they keep only what is outside. */
export function outsidePlanes(planes: THREE.Plane[]): THREE.Plane[] {
	return planes.map((p) => p.clone().negate());
}

/**
 * Makes a material's clipping planes test the position divided by w -- the point really
 * drawn when the object's matrix is projective (camera -> clip). Without it three.js tests
 * the undivided position and cuts in the wrong place while the frustum is squeezed.
 */
export function divideClipping(material: THREE.Material): void {
	material.onBeforeCompile = (shader) => {
		shader.vertexShader = shader.vertexShader.replace(
			'#include <clipping_planes_vertex>',
			'#if NUM_CLIPPING_PLANES > 0\n\tvClipPosition = - mvPosition.xyz / mvPosition.w;\n#endif'
		);
	};
	material.customProgramCacheKey = () => 'divided-clipping';
}

/**
 * Labels for the frustum under m at the stage t: "eye" while the eye is still near (it goes
 * to infinity as the squeeze ends), "near (screen)" and "far" above their faces, and
 * "clip cube -1..1" once the frustum has become it.
 */
export function frustumLabels(values: Vec3, m: Mat4, t: number, color: string): THREE.Object3D[] {
	const { near, far, n, f } = frustumHalfSizes(values);
	const at = (text: string, p: THREE.Vector3) => {
		const label = textSprite(text, color);
		label.position.copy(drawnAt(m, p));
		return label;
	};
	const labels = [
		at('near (screen)', new THREE.Vector3(0, near[1] * 1.35 + 0.25, -n)),
		at('far', new THREE.Vector3(0, far[1] * 1.12, -f))
	];
	if (t < 0.3) labels.push(at('eye', new THREE.Vector3(0, 0.45, 0)));
	if (t > 0.5) {
		const cube = textSprite('clip cube -1..1', color, 0.35);
		cube.position.set(0, 1.45, 0);
		labels.push(cube);
	}
	return labels;
}

/** The camera that sees what the frustum holds: at the origin looking down -z, aspect 1. */
export function insetCamera(values: Vec3): THREE.PerspectiveCamera {
	const { n, f } = frustumHalfSizes(values);
	return new THREE.PerspectiveCamera(values.x, 1, n, f);
}

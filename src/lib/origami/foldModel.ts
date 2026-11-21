// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Builds a fold model (foldFormat.ts) in three.js and folds it: the sheet lies on the ground
// (2D (x, y) -> 3D (x, 0, -y), the front facing up), every face hangs in a frame that turns
// about its fold line inside its fixed face's frame -- a hinge tree as in cubeNet.ts, but read
// from the file. setProgress(net, T) runs the steps one after another: T = 0 flat, T = 1 step
// 1 done, ..., T = number of steps finished. Pure: no rendering, no DOM; the scene
// (OrigamiScene.svelte) gives the materials. Tested in foldModel.spec.ts (the cube and the
// dodecahedron close).
import * as THREE from 'three';
import { easeInOut } from '$lib/origami/cubeNet';
import { stepCount, type FoldDef, type FoldModel, type Point2 } from '$lib/origami/foldFormat';

/** A point of the flat sheet on the ground; the sheet's front faces up (+y). */
export function sheetToWorld([x, y]: Point2): THREE.Vector3 {
	return new THREE.Vector3(x, 0, -y);
}

export interface FaceParts {
	/** The face's frame: its transform folds the face and every face hinged on it. */
	frame: THREE.Object3D;
	/** The front (the sheet's upper side) and the back, each with its own material. */
	front: THREE.Mesh;
	back: THREE.Mesh;
	outline: THREE.LineLoop;
}

export interface FoldNet {
	model: FoldModel;
	root: THREE.Group;
	faces: Record<string, FaceParts>;
	steps: number;
	/** Each fold with its line in sheet coordinates and its signed full angle (radians). */
	hinges: {
		fold: FoldDef;
		frame: THREE.Object3D;
		a: THREE.Vector3;
		axis: THREE.Vector3;
		full: number;
	}[];
}

/**
 * A face's polygon as geometry on the ground, with UVs spanning the face's bounding square
 * (so a label texture sits centred on it); `mirror` flips U for the back side, so text on
 * the back reads the right way round too.
 */
function faceGeometry(corners: Point2[], mirror: boolean): THREE.BufferGeometry {
	const shape = new THREE.Shape(corners.map(([x, y]) => new THREE.Vector2(x, y)));
	const geometry = new THREE.ShapeGeometry(shape);
	const xs = corners.map((c) => c[0]);
	const ys = corners.map((c) => c[1]);
	const [cx, cy] = [
		(Math.min(...xs) + Math.max(...xs)) / 2,
		(Math.min(...ys) + Math.max(...ys)) / 2
	];
	const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
	const position = geometry.getAttribute('position');
	const uv = geometry.getAttribute('uv');
	for (let i = 0; i < position.count; i++) {
		const u = (position.getX(i) - cx) / size + 0.5;
		uv.setXY(i, mirror ? 1 - u : u, (position.getY(i) - cy) / size + 0.5);
	}
	geometry.rotateX(-Math.PI / 2); // (x, y, 0) -> (x, 0, -y), normal +z -> +y
	return geometry;
}

/**
 * Builds the model's hinge tree.
 *
 * Args:
 *   model: a checked model (parseFoldModel).
 *   makeMaterials: front and back material of a face; single-sided (the back mesh draws
 *     its material on BackSide).
 */
export function buildFoldNet(
	model: FoldModel,
	makeMaterials: (face: string) => { front: THREE.Material; back: THREE.Material }
): FoldNet {
	const root = new THREE.Group();
	const faces: Record<string, FaceParts> = {};
	const hinges: FoldNet['hinges'] = [];
	const foldOf = new Map(model.folds.map((f) => [f.moving, f]));
	const corners = (face: string) => model.faces[face].points.map((p) => model.points[p]);

	function addFace(name: string, parent: THREE.Object3D) {
		const frame = new THREE.Object3D();
		frame.matrixAutoUpdate = false; // set by setProgress
		parent.add(frame);

		const { front: frontMaterial, back: backMaterial } = makeMaterials(name);
		const front = new THREE.Mesh(faceGeometry(corners(name), false), frontMaterial);
		const back = new THREE.Mesh(faceGeometry(corners(name), true), backMaterial);
		backMaterial.side = THREE.BackSide;
		front.name = name;
		back.name = `${name}-back`;
		const outline = new THREE.LineLoop(
			new THREE.BufferGeometry().setFromPoints(corners(name).map(sheetToWorld)),
			new THREE.LineBasicMaterial({ color: '#1b1b1b' })
		);
		frame.add(front, back, outline);
		faces[name] = { frame, front, back, outline };

		const fold = foldOf.get(name);
		if (fold) {
			const a = sheetToWorld(model.points[fold.line[0]]);
			const axis = sheetToWorld(model.points[fold.line[1]]).sub(a).normalize();
			// valley turns the moving face up (+y): find which way round that is for this side
			const centre = corners(name)
				.map(sheetToWorld)
				.reduce((sum, p) => sum.add(p), new THREE.Vector3())
				.divideScalar(corners(name).length);
			const lifts = new THREE.Vector3().crossVectors(axis, centre.sub(a)).y > 0;
			const sign = (lifts ? 1 : -1) * (fold.direction === 'valley' ? 1 : -1);
			hinges.push({ fold, frame, a, axis, full: sign * THREE.MathUtils.degToRad(fold.angle) });
		}
		for (const child of model.folds.filter((f) => f.fixed === name)) addFace(child.moving, frame);
	}

	const base = Object.keys(model.faces).find((name) => model.faces[name].base)!;
	addFace(base, root);

	const net: FoldNet = { model, root, faces, steps: stepCount(model), hinges };
	setProgress(net, 0);
	return net;
}

/** Folds the net to T: 0 flat, k = the first k steps done; each step eased on its own. */
export function setProgress(net: FoldNet, T: number) {
	const toOrigin = new THREE.Matrix4();
	const rotate = new THREE.Matrix4();
	const back = new THREE.Matrix4();
	for (const { fold, frame, a, axis, full } of net.hinges) {
		const p = easeInOut(T - (fold.step - 1));
		// about the fold line: move the line to the origin, turn, move back
		toOrigin.makeTranslation(-a.x, -a.y, -a.z);
		rotate.makeRotationAxis(axis, full * p);
		back.makeTranslation(a.x, a.y, a.z);
		frame.matrix.copy(back).multiply(rotate).multiply(toOrigin);
		frame.matrixWorldNeedsUpdate = true;
	}
}

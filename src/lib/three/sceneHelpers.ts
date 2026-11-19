// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Building blocks shared by the framed-viewport scenes (ThreeScene.svelte on the vectors
// page, TransformScene.svelte on the transformations page): the fading ground grid with its
// x / z axes, the theme colours read from CSS, and freeing a group's GPU resources.
// Browser only (reads CSS variables of the document).
import * as THREE from 'three';
import { fadingGridLines, fadingXAxis, fadingYAxis } from '$lib/materials/gridLines.mat';

/** Removes every child of a group and frees its geometry, materials and textures. */
export function clearGroup(group: THREE.Group) {
	for (const child of [...group.children]) {
		group.remove(child);
		child.traverse((obj) => {
			const mesh = obj as THREE.Mesh;
			mesh.geometry?.dispose();
			const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
			for (const mat of materials) {
				if (!mat) continue;
				(mat as THREE.SpriteMaterial).map?.dispose();
				mat.dispose();
			}
		});
	}
}

/** A CSS colour variable as #rrggbb (the alpha of #rrggbbaa dropped); white if unreadable. */
export function cssHexColor(variableName: string): string {
	const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)) return value.substring(0, 7);
	console.warn(`CSS variable ${variableName} is "${value}", not a hex colour; using white.`);
	return '#ffffff';
}

function gridLine(halfSize: number, offset: number, alongX: boolean, material: THREE.Material) {
	const points = alongX
		? [new THREE.Vector3(-halfSize, 0, offset), new THREE.Vector3(halfSize, 0, offset)]
		: [new THREE.Vector3(offset, 0, -halfSize), new THREE.Vector3(offset, 0, halfSize)];
	return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

/**
 * The fading ground grid (one line per unit) with the x axis red and the z axis green.
 * The line materials are shared module objects: free the group with disposeGrid, not
 * clearGroup, which would dispose them for every scene.
 */
export function createGrid(halfSize = 10): THREE.Group {
	const group = new THREE.Group();
	for (let i = -halfSize; i < halfSize; i++) {
		if (i === 0) continue;
		group.add(gridLine(halfSize, i, false, fadingGridLines), gridLine(halfSize, i, true, fadingGridLines));
	}
	group.add(gridLine(halfSize, 0, true, fadingXAxis), gridLine(halfSize, 0, false, fadingYAxis));
	return group;
}

export function disposeGrid(group: THREE.Group) {
	group.traverse((obj) => (obj as THREE.Line).geometry?.dispose());
}

/** Scene background = the page background, grid lines = the theme's text colour. */
export function applyThemeColors(scene: THREE.Scene) {
	scene.background = new THREE.Color(cssHexColor('--bg'));
	fadingGridLines.uniforms.uColor.value.set(cssHexColor('--col'));
}

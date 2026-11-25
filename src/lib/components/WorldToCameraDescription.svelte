<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-22
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the spaces page's world -> camera: the live formulas for the typed eye
	// and target, the typed world point and the stage t -- the camera's axes by lookAt (cross
	// products), its placement T(eye) R, the view matrix V = R^T T(-eye) with the axes as its
	// rows, the point in camera space, the eye and target landing on the origin and on -z,
	// the model-view matrix V M of the blue box (its placement from local -> world) and the
	// stage; the words around them are WORLD_TO_CAMERA_SECTIONS in $lib/spaceDescriptions.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { WORLD_TO_CAMERA_SECTIONS } from '$lib/spaceDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import {
		apply,
		cameraBasis,
		cameraMatrix,
		modelMatrix,
		multiply,
		viewMatrix,
		type CameraLook,
		type Mat4,
		type Placement
	} from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let {
		look,
		placement,
		point,
		t
	}: { look: CameraLook; placement: Placement; point: Vec3; t: number } = $props();

	const col = (v: (string | number)[]) => `\\begin{bmatrix} ${v.join(' \\\\ ')} \\end{bmatrix}`;
	const vec = (v: Vec3) => col([v.x, v.y, v.z].map(num));
	const numeric = (m: Mat4) =>
		`\\begin{bmatrix} ${m.map((r) => r.map(num).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
	const pWorld = colored(POINT_COLOR, 'p_{world}');
	const pCamera = colored(POINT_COLOR, 'p_{camera}');
	const rx = colored(AXIS_COLORS.x, 'r');
	const uy = colored(AXIS_COLORS.y, 'u');
	const bz = colored(AXIS_COLORS.z, '-f');

	const formulas = $derived.by(() => {
		const { eye, target } = look;
		const { right, up, back } = cameraBasis(look);
		const f = { x: -back.x, y: -back.y, z: -back.z };
		const V = viewMatrix(look, 1);
		const world = homogeneous(point);
		const camera = apply(V, world);
		const M = modelMatrix(placement, 1);
		const corner: [number, number, number, number] = [1, 1, 1, 1];
		const p3 = (p: number[]) => col(p.slice(0, 3).map(num));
		return {
			look: `\\text{eye} = ${vec(eye)} \\quad \\text{target} = ${vec(target)} \\quad \\text{up}_{world} = ${col([0, 1, 0])}`,
			forward: `f = \\frac{\\text{target} - \\text{eye}}{\\lVert \\text{target} - \\text{eye} \\rVert} = ${vec(f)}`,
			right: `${rx} = \\frac{f \\times \\text{up}_{world}}{\\lVert f \\times \\text{up}_{world} \\rVert} = ${colored(AXIS_COLORS.x, vec(right))}`,
			up: `${uy} = ${rx} \\times f = ${colored(AXIS_COLORS.y, vec(up))}`,
			cameraModel: `M_{camera} = T(\\text{eye}) \\, R = T(\\text{eye}) \\Big[\\; ${rx} \\;\\; ${uy} \\;\\; ${bz} \\;\\Big] = ${numeric(cameraMatrix(look))}`,
			general: `V = M_{camera}^{-1} = R^{T} \\, T(-\\text{eye})`,
			view: `V = ${numeric(V)} \\quad \\text{rows: } ${rx}, \\; ${uy}, \\; ${bz}`,
			apply: `${pCamera} = V \\, ${pWorld} = ${numeric(V)} ${col(world.map(num))} = ${colored(POINT_COLOR, col(camera.map(num)))}`,
			eye: `V \\, \\text{eye} = ${p3(apply(V, homogeneous(eye)))}`,
			target: `V \\, \\text{target} = ${p3(apply(V, homogeneous(target)))}`,
			pipeline: `p_{camera} = V \\, M \\, p_{local} = ${numeric(multiply(V, M))} ${col(corner)} = ${col(apply(multiply(V, M), corner).map(num))}`,
			stage: `V(t) = R(t)^{T} \\, T(-t \\cdot \\text{eye}) \\qquad V(${num(t)}) = ${numeric(viewMatrix(look, t))}`
		};
	});
</script>

<DescriptionSections sections={WORLD_TO_CAMERA_SECTIONS} {formulas} />

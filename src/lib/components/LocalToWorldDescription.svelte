<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the spaces page's local -> world: the live formulas for the typed
	// placement (position, rotation, scale), the typed local point and the stage t -- the
	// parts S, R, T, the model matrix M = T R S, the point in world space, M's columns as the
	// object's axes, the stage and the way back with the inverse; the words around them are
	// LOCAL_TO_WORLD_SECTIONS in $lib/spaceDescriptions, laid out by DescriptionSections.
	import { Matrix4 } from 'three';
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { LOCAL_TO_WORLD_SECTIONS } from '$lib/spaceDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import {
		apply,
		flat,
		modelMatrix,
		rotation,
		scaling,
		translation,
		type Mat4,
		type Placement
	} from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let { placement, point, t }: { placement: Placement; point: Vec3; t: number } = $props();

	const col = (v: (string | number)[]) => `\\begin{bmatrix} ${v.join(' \\\\ ')} \\end{bmatrix}`;
	const numeric = (m: Mat4) =>
		`\\begin{bmatrix} ${m.map((r) => r.map(num).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
	const pLocal = colored(POINT_COLOR, 'p_{local}');
	const pWorld = colored(POINT_COLOR, 'p_{world}');
	const deg = (v: number) => `${v.toFixed(1)}^\\circ`;
	const axisColumn = (m: Mat4, c: number, color: string) =>
		colored(color, col(m.slice(0, 3).map((r) => num(r[c]))));

	const formulas = $derived.by(() => {
		const { position, rotation: angles, scale } = placement;
		const M = modelMatrix(placement, 1);
		const Mt = modelMatrix(placement, t);
		const local = homogeneous(point);
		const world = apply(M, local);
		const inverse = new Matrix4().set(...(flat(M) as Parameters<Matrix4['set']>));
		const invertible = Math.abs(inverse.determinant()) > 1e-12;
		inverse.invert();
		const e = inverse.elements; // column-major
		const inv: Mat4 = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => e[c * 4 + r]));
		const staged = (v: Vec3, k: number) => ({ x: v.x * k, y: v.y * k, z: v.z * k });
		return {
			local: `${pLocal} = ${col(local.map(num))}`,
			scale: `S = ${numeric(scaling(scale))}`,
			rotation: `R = R_z(${deg(angles.z)}) \\, R_y(${deg(angles.y)}) \\, R_x(${deg(angles.x)}) = ${numeric(rotation(angles))}`,
			translation: `T = ${numeric(translation(position))}`,
			general: `M = T \\, R \\, S`,
			model: `M = ${numeric(M)}`,
			apply: `${pWorld} = M \\, ${pLocal} = ${numeric(M)} ${col(local.map(num))} = ${colored(POINT_COLOR, col(world.map(num)))}`,
			columns: `M = \\Big[\\; ${axisColumn(M, 0, AXIS_COLORS.x)} \\; ${axisColumn(M, 1, AXIS_COLORS.y)} \\; ${axisColumn(M, 2, AXIS_COLORS.z)} \\; ${col(M.slice(0, 3).map((r) => num(r[3])))} \\;\\Big] \\quad \\text{(x, y, z axes, origin)}`,
			stageGeneral: `M(t) = T(t \\cdot \\text{pos}) \\; R(t \\cdot \\theta) \\; S(1 + t\\,(s - 1))`,
			stageValues: `M(${num(t)}) = T\\!${col(Object.values(staged(position, t)).map(num))} \\, R_z(${deg(angles.z * t)}) \\, R_y(${deg(angles.y * t)}) \\, R_x(${deg(angles.x * t)}) \\, S \\;=\\; ${numeric(Mt)}`,
			back: invertible
				? `M^{-1} \\, ${pWorld} = ${numeric(inv)} ${col(world.map(num))} = ${colored(POINT_COLOR, col(apply(inv, world).map(num)))} = ${pLocal}`
				: `\\text{a scale of 0: } M \\text{ has no inverse, the way back is lost}`
		};
	});
</script>

<DescriptionSections sections={LOCAL_TO_WORLD_SECTIONS} {formulas} />

<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the projections page (orthographic): the live formulas for the typed point
	// and the stage t -- the projection matrix, its stage, the projected point and two points
	// that land on the same spot (why it cannot be undone); the words around them are
	// ORTHOGRAPHIC_SECTIONS in $lib/projectionDescriptions, laid out by DescriptionSections.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { ORTHOGRAPHIC_SECTIONS } from '$lib/projectionDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, orthographic } from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let { point, t }: { point: Vec3; t: number } = $props();

	const NONE = { x: 0, y: 0, z: 0 };
	const cz = (s: string | number) => colored(AXIS_COLORS.z, s);
	const p = colored(POINT_COLOR, 'p');
	const pMoved = colored(POINT_COLOR, "p'");
	const col = (v: (string | number)[]) => `\\begin{bmatrix} ${v.join(' \\\\ ')} \\end{bmatrix}`;
	const matrix = (zz: string) =>
		`\\begin{bmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & ${cz(zz)} & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}`;

	const formulas = $derived.by(() => {
		const p4 = homogeneous(point);
		const moved = apply(orthographic(NONE, t), p4);
		const flat = apply(orthographic(NONE, 1), p4);
		const front = [point.x, point.y, point.z + 1, 1] as [number, number, number, number];
		return {
			point: `${p} = ${col(p4.map(num))}`,
			general: `P = ${matrix('0')}`,
			stageGeneral: `M(t) = ${matrix('1 - t')}`,
			stageValues: `M(${num(t)}) = ${matrix(num(1 - t))}`,
			apply: `${pMoved} = P \\, ${p} = ${matrix('0')} ${col(p4.map(num))} = ${colored(POINT_COLOR, col(flat.map(num)))}`,
			lost: `P ${col(p4.map(num))} = P ${col(front.map(num))} = ${col(apply(orthographic(NONE, 1), front).map(num))}`,
			stage: `${pMoved}(${num(t)}) = ${col(moved.map(num))}`
		};
	});
</script>

<DescriptionSections sections={ORTHOGRAPHIC_SECTIONS} {formulas} />

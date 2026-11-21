<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the projections page (perspective): the live formulas for the typed eye
	// distance d, the typed point and the stage t -- the projection matrix, the homogeneous
	// result with its w, the divide by w, and the stage; the words around them are
	// PERSPECTIVE_SECTIONS in $lib/projectionDescriptions, laid out by DescriptionSections.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { PERSPECTIVE_SECTIONS } from '$lib/projectionDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, applyPoint, perspective, type Mat4 } from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let { eye, point, t }: { eye: Vec3; point: Vec3; t: number } = $props();

	const cz = (s: string | number) => colored(AXIS_COLORS.z, s);
	const p = colored(POINT_COLOR, 'p');
	const pMoved = colored(POINT_COLOR, "p'");
	const col = (v: (string | number)[]) => `\\begin{bmatrix} ${v.join(' \\\\ ')} \\end{bmatrix}`;
	const rows = (m: (string | number)[][]) =>
		`\\begin{bmatrix} ${m.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
	const numeric = (m: Mat4) => rows(m.map((r) => r.map(num)));

	const formulas = $derived.by(() => {
		const d = eye.z;
		const p4 = homogeneous(point);
		const P = perspective(eye, 1);
		const h = apply(P, p4);
		const divided = applyPoint(P, p4);
		const M = perspective(eye, t);
		return {
			point: `${p} = ${col(p4.map(num))} \\qquad \\text{eye} = ${col([0, 0, num(d)])}`,
			general: `P = ${rows([
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, cz(0), 0],
				[0, 0, cz('-\\tfrac{1}{d}'), 1]
			])}`,
			values: `P = ${numeric(P)}`,
			homogeneous: `P \\, ${p} = ${col(['x', 'y', '0', '1 - z/d'])} = ${col(h.map(num))}`,
			divided: `${pMoved} = \\frac{1}{w} ${col(['x', 'y', '0'])} = ${col(['x \\cdot \\frac{d}{d - z}', 'y \\cdot \\frac{d}{d - z}', '0'])} = ${colored(POINT_COLOR, col(divided.slice(0, 3).map(num)))}`,
			stageValues: `M(${num(t)}) = ${numeric(M)}`,
			stagePoint: `${pMoved}(${num(t)}) = ${colored(POINT_COLOR, col(applyPoint(M, p4).slice(0, 3).map(num)))}`
		};
	});
</script>

<DescriptionSections sections={PERSPECTIVE_SECTIONS} {formulas} />

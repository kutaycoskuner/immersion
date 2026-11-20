<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the transformations page (scaling): the live formulas for the typed scale
	// factors, the typed point and the stage t; the words around them are SCALING_SECTIONS in
	// $lib/transformDescriptions, laid out by DescriptionSections.svelte. The counterpart of
	// TranslationDescription.svelte.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { SCALING_SECTIONS } from '$lib/transformDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, scaling } from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let { factors, point, t }: { factors: Vec3; point: Vec3; t: number } = $props();

	const cx = (s: string | number) => colored(AXIS_COLORS.x, s);
	const cy = (s: string | number) => colored(AXIS_COLORS.y, s);
	const cz = (s: string | number) => colored(AXIS_COLORS.z, s);

	/** A 4x4 matrix with the diagonal coloured per axis. */
	function matrixTex(sx: string, sy: string, sz: string): string {
		return `\\begin{bmatrix} ${cx(sx)} & 0 & 0 & 0 \\\\ 0 & ${cy(sy)} & 0 & 0 \\\\ 0 & 0 & ${cz(sz)} & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}`;
	}
	function columnTex(x: string, y: string, z: string, w: string): string {
		return `\\begin{bmatrix} ${x} \\\\ ${y} \\\\ ${z} \\\\ ${w} \\end{bmatrix}`;
	}

	const p = colored(POINT_COLOR, 'p');
	const pMoved = colored(POINT_COLOR, "p'");
	const stageFactor = (axis: 'x' | 'y' | 'z') => `1 + t \\, (s_${axis} - 1)`;

	const formulas = $derived.by(() => {
		const m = scaling(factors, t);
		const [px, py, pz, pw] = homogeneous(point).map(num);
		const moved = apply(m, homogeneous(point)).map(num);
		const [mx, my, mz] = [m[0][0], m[1][1], m[2][2]].map(num);
		return {
			point: `${p} = ${columnTex(px, py, pz, pw)}`,
			general: `S = ${matrixTex('s_x', 's_y', 's_z')}`,
			values: `S = ${matrixTex(num(factors.x), num(factors.y), num(factors.z))}`,
			stageGeneral: `M(t) = ${matrixTex(stageFactor('x'), stageFactor('y'), stageFactor('z'))}`,
			stageValues: `M(${num(t)}) = ${matrixTex(mx, my, mz)}`,
			applySymbols: `${pMoved} = M(t) \\, ${p} = ${columnTex(`${cx('m_x')} \\, x`, `${cy('m_y')} \\, y`, `${cz('m_z')} \\, z`, '1')}`,
			applyValues: `${pMoved} = ${columnTex(
				`${cx(mx)} \\cdot ${px}`,
				`${cy(my)} \\cdot ${py}`,
				`${cz(mz)} \\cdot ${pz}`,
				'1'
			)} = ${columnTex(...(moved.map((v) => colored(POINT_COLOR, v)) as [string, string, string, string]))}`
		};
	});
</script>

<DescriptionSections sections={SCALING_SECTIONS} {formulas} />

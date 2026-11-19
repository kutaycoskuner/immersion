<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-19
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the transformations page (translation): the live formulas for the typed
	// translation, the typed point and the stage t; the words around them are
	// TRANSLATION_SECTIONS in $lib/transformDescriptions, laid out by DescriptionSections.svelte.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { TRANSLATION_SECTIONS } from '$lib/transformDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, translation } from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let { offset, point, t }: { offset: Vec3; point: Vec3; t: number } = $props();

	const cx = (s: string | number) => colored(AXIS_COLORS.x, s);
	const cy = (s: string | number) => colored(AXIS_COLORS.y, s);
	const cz = (s: string | number) => colored(AXIS_COLORS.z, s);

	/** A 4x4 matrix with the translation column coloured per axis. */
	function matrixTex(tx: string, ty: string, tz: string): string {
		return `\\begin{bmatrix} 1 & 0 & 0 & ${cx(tx)} \\\\ 0 & 1 & 0 & ${cy(ty)} \\\\ 0 & 0 & 1 & ${cz(tz)} \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}`;
	}
	function columnTex(x: string, y: string, z: string, w: string): string {
		return `\\begin{bmatrix} ${x} \\\\ ${y} \\\\ ${z} \\\\ ${w} \\end{bmatrix}`;
	}

	const p = colored(POINT_COLOR, 'p');
	const pMoved = colored(POINT_COLOR, "p'");
	const formulas = $derived.by(() => {
		const [px, py, pz, pw] = homogeneous(point).map(num);
		const moved = apply(translation(offset, t), homogeneous(point)).map(num);
		const tNum = num(t);
		return {
			point: `${p} = ${columnTex(px, py, pz, pw)}`,
			general: `T = ${matrixTex('t_x', 't_y', 't_z')}`,
			values: `T = ${matrixTex(num(offset.x), num(offset.y), num(offset.z))}`,
			stageGeneral: `M(t) = ${matrixTex('t \\, t_x', 't \\, t_y', 't \\, t_z')}`,
			stageValues: `M(${tNum}) = ${matrixTex(num(offset.x * t), num(offset.y * t), num(offset.z * t))}`,
			applySymbols: `${pMoved} = M(t) \\, ${p} = ${columnTex(`x + ${cx('t \\, t_x')}`, `y + ${cy('t \\, t_y')}`, `z + ${cz('t \\, t_z')}`, '1')}`,
			applyValues: `${pMoved} = ${columnTex(
				`${px} + ${cx(num(offset.x * t))}`,
				`${py} + ${cy(num(offset.y * t))}`,
				`${pz} + ${cz(num(offset.z * t))}`,
				'1'
			)} = ${columnTex(...(moved.map((v) => colored(POINT_COLOR, v)) as [string, string, string, string]))}`
		};
	});
</script>

<DescriptionSections sections={TRANSLATION_SECTIONS} {formulas} />

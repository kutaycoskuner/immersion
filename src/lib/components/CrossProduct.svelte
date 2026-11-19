<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the vector page's "Vector Product" tab: the live formulas of the cross
	// product (component formula, values, length = |v1||v2| sin angle) for the current
	// vectors; the words around them are CROSS_SECTIONS in $lib/vectorDescriptions, laid out
	// by DescriptionSections.svelte. Shown by src/routes/(app)/+page.svelte; the scene draws the
	// result vector and its parallelogram in resultColors.cross.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { CROSS_SECTIONS } from '$lib/vectorDescriptions';
	import { labelColors, resultColors, v1Colors, v2Colors } from '$lib/config/config-vector_colors';
	import { columnVector, colored, num } from '$lib/vectorTex';
	import { angleDeg, cross, length, type Vec3 } from '$lib/vectorMath';

	let { v1, v2 }: { v1: Vec3; v2: Vec3 } = $props();

	type Axis = 'x' | 'y' | 'z';
	const a = (axis: Axis) => colored(v1Colors[axis], `v_{1${axis}}`);
	const b = (axis: Axis) => colored(v2Colors[axis], `v_{2${axis}}`);
	const lhs = `${colored(labelColors.v1, '\\vec{v}_1')} \\times ${colored(labelColors.v2, '\\vec{v}_2')}`;
	const c = colored(resultColors.cross, '\\vec{c}');

	const formulas = $derived.by(() => {
		const result = cross(v1, v2);
		const av = (axis: Axis) => colored(v1Colors[axis], num(v1[axis]));
		const bv = (axis: Axis) => colored(v2Colors[axis], num(v2[axis]));
		const cv = (axis: Axis) => colored(resultColors.cross, num(result[axis]));
		return {
			vectors: `${columnVector('\\vec{v}_1', labelColors.v1, v1, v1Colors)} \\quad ${columnVector('\\vec{v}_2', labelColors.v2, v2, v2Colors)}`,
			// each component leaves its own axis out: x uses y and z, y uses z and x, z uses x and y
			symbols: `${c} = ${lhs} = \\begin{bmatrix}
				${a('y')} ${b('z')} - ${a('z')} ${b('y')} \\\\
				${a('z')} ${b('x')} - ${a('x')} ${b('z')} \\\\
				${a('x')} ${b('y')} - ${a('y')} ${b('x')}
				\\end{bmatrix}`,
			values: `${c} = \\begin{bmatrix}
				${av('y')} \\cdot ${bv('z')} - ${av('z')} \\cdot ${bv('y')} \\\\
				${av('z')} \\cdot ${bv('x')} - ${av('x')} \\cdot ${bv('z')} \\\\
				${av('x')} \\cdot ${bv('y')} - ${av('y')} \\cdot ${bv('x')}
				\\end{bmatrix} = \\begin{bmatrix} ${cv('x')} \\\\ ${cv('y')} \\\\ ${cv('z')} \\end{bmatrix}`,
			length: `|${c}| = |${colored(labelColors.v1, '\\vec{v}_1')}| \\, |${colored(labelColors.v2, '\\vec{v}_2')}| \\, \\sin\\theta`,
			lengthValues: `|${c}| = ${num(length(v1))} \\cdot ${num(length(v2))} \\cdot \\sin(${angleDeg(v1, v2).toFixed(1)}^\\circ) = ${colored(resultColors.cross, num(length(result)))}`
		};
	});
</script>

<DescriptionSections sections={CROSS_SECTIONS} {formulas} />

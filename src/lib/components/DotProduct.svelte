<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the vector page's "Scalar Product" tab: the live formulas of the dot
	// product (normalize, multiply and add) for the current vectors; the words around them are
	// DOT_SECTIONS in $lib/vectorDescriptions, laid out by ProductDescription.svelte.
	// Shown by src/routes/(app)/+page.svelte; the scene draws the matching scalar projection.
	import ProductDescription from '$lib/components/ProductDescription.svelte';
	import { DOT_SECTIONS } from '$lib/vectorDescriptions';
	import { labelColors, v1Colors, v2Colors } from '$lib/config/config-vector_colors';
	import { columnVector, colored, num } from '$lib/vectorTex';
	import { dot, normalize, type Vec3 } from '$lib/vectorMath';

	let { v1, v2 }: { v1: Vec3; v2: Vec3 } = $props();

	const nv1 = $derived(normalize(v1));
	const nv2 = $derived(normalize(v2));
	const lhs = `${colored(labelColors.v1, '\\hat{v}_1')} \\cdot ${colored(labelColors.v2, '\\hat{v}_2')}`;

	const formulas = $derived({
		vectors: `${columnVector('\\vec{v}_1', labelColors.v1, v1, v1Colors)} \\quad ${columnVector('\\vec{v}_2', labelColors.v2, v2, v2Colors)}`,
		normalization: `\\hat{v} = \\frac{\\vec{v}}{|\\vec{v}|} = \\frac{\\vec{v}}{\\sqrt{v_x^2 + v_y^2 + v_z^2}}`,
		normalized: `${columnVector('\\hat{v}_1', labelColors.v1, nv1, v1Colors)} \\quad ${columnVector('\\hat{v}_2', labelColors.v2, nv2, v2Colors)}`,
		symbols: `${lhs} =
			${colored(v1Colors.x, '\\hat{v}_{1x}')} ${colored(v2Colors.x, '\\hat{v}_{2x}')} +
			${colored(v1Colors.y, '\\hat{v}_{1y}')} ${colored(v2Colors.y, '\\hat{v}_{2y}')} +
			${colored(v1Colors.z, '\\hat{v}_{1z}')} ${colored(v2Colors.z, '\\hat{v}_{2z}')}`,
		values: `${lhs} =
			${colored(v1Colors.x, num(nv1.x))} \\cdot ${colored(v2Colors.x, num(nv2.x))} +
			${colored(v1Colors.y, num(nv1.y))} \\cdot ${colored(v2Colors.y, num(nv2.y))} +
			${colored(v1Colors.z, num(nv1.z))} \\cdot ${colored(v2Colors.z, num(nv2.z))} =
			\\mathbf{${num(dot(nv1, nv2))}}`
	});
</script>

<ProductDescription sections={DOT_SECTIONS} {formulas} />

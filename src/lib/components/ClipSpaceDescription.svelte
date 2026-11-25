<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-25
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the spaces page's camera -> clip (a perspective camera): the live
	// formulas for the typed frustum (fov, near, far) and the typed camera-space point -- the
	// frustum, the matrix P in symbols and numbers, the point in clip space with its w and
	// the clip test (no stage: nothing to animate); the words around them are
	// CLIP_SPACE_SECTIONS in $lib/clipSpaceDescriptions, laid out by DescriptionSections.
	// The divide by w is the next step, NdcDescription.svelte.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { CLIP_SPACE_SECTIONS } from '$lib/clipSpaceDescriptions';
	import { apply, clipPerspective, frustumHalfSizes } from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';
	import { clipTestTex, col, numeric, rows } from '$lib/clipTex';

	let { frustum, point }: { frustum: Vec3; point: Vec3 } = $props();

	const p = colored(POINT_COLOR, 'p_{camera}');
	const pClip = colored(POINT_COLOR, 'p_{clip}');

	const formulas = $derived.by(() => {
		const { near, far, n, f } = frustumHalfSizes(frustum);
		const p4 = homogeneous(point);
		const P = clipPerspective(frustum);
		const clip = apply(P, p4);
		return {
			frustum: `\\text{fov} = ${num(frustum.x)}^\\circ \\quad \\text{near} = ${num(n)} \\quad \\text{far} = ${num(f)} \\qquad \\text{half height at near} = ${num(near[1])}, \\text{ at far} = ${num(far[1])}`,
			general: `P = ${rows([
				['\\frac{k}{\\text{aspect}}', 0, 0, 0],
				[0, 'k', 0, 0],
				[0, 0, '\\frac{f + n}{n - f}', '\\frac{2 f n}{n - f}'],
				[0, 0, -1, 0]
			])} \\qquad k = \\frac{1}{\\tan(\\text{fov} / 2)}`,
			values: `P = ${numeric(P)}`,
			apply: `${pClip} = P \\, ${p} = ${numeric(P)} ${col(p4.map(num))} = ${colored(POINT_COLOR, col(clip.map(num)))} \\qquad w = -z = ${num(clip[3])}`,
			test: clipTestTex(clip)
		};
	});
</script>

<DescriptionSections sections={CLIP_SPACE_SECTIONS} {formulas} />

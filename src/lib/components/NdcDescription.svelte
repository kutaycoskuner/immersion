<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-25
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the spaces page's clip -> NDC (the divide by w): the live formulas for
	// the typed frustum (fov, near, far), the typed camera-space point and the stage t -- the
	// point in clip space and divided (NDC), the frustum's corners landing on the cube's, how
	// depth spreads between near and far, P as squeeze then mirror (F S), and the stage (the
	// squeeze only); the words around them are NDC_SECTIONS in $lib/clipSpaceDescriptions,
	// laid out by DescriptionSections.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { NDC_SECTIONS } from '$lib/clipSpaceDescriptions';
	import {
		apply,
		applyPoint,
		clipPerspective,
		clipSqueeze,
		frustumHalfSizes,
		zMirror
	} from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';
	import { col, numeric } from '$lib/clipTex';

	let { frustum, point, t }: { frustum: Vec3; point: Vec3; t: number } = $props();

	const p = colored(POINT_COLOR, 'p_{camera}');
	const pClip = colored(POINT_COLOR, 'p_{clip}');
	const pNdc = colored(POINT_COLOR, 'p_{ndc}');

	const formulas = $derived.by(() => {
		const { near, far, n, f } = frustumHalfSizes(frustum);
		const p4 = homogeneous(point);
		const P = clipPerspective(frustum);
		const clip = apply(P, p4);
		const ndc = applyPoint(P, p4);
		const M = clipSqueeze(frustum, t); // the bar: the squeeze only
		const three = (v: number[]) => col(v.slice(0, 3).map(num));
		// z after the divide for points straight ahead at near, half way and far
		const zNdc = (d: number) => num(applyPoint(P, [0, 0, -d, 1])[2]);
		return {
			clip: `${pClip} = P \\, ${p} = ${colored(POINT_COLOR, col(clip.map(num)))}`,
			ndc: `${pNdc} = \\frac{1}{w} ${col(['x', 'y', 'z'])} = \\frac{1}{${num(clip[3])}} ${three(clip)} = ${colored(POINT_COLOR, three(ndc))}`,
			corners: `\\text{near corner } ${three([near[0], near[1], -n])} \\to ${three(applyPoint(P, [near[0], near[1], -n, 1]))} \\qquad \\text{far corner } ${three([far[0], far[1], -f])} \\to ${three(applyPoint(P, [far[0], far[1], -f, 1]))}`,
			depth: `z = -${num(n)} \\to ${zNdc(n)} \\qquad z = -${num((n + f) / 2)} \\to ${zNdc((n + f) / 2)} \\qquad z = -${num(f)} \\to ${zNdc(f)}`,
			mirror: `P = F \\, S = ${numeric(zMirror())} ${numeric(clipSqueeze(frustum))}`,
			stageGeneral: `M(t) = I + t\\,(S - I), \\text{ then } \\div w \\qquad M(1) = S, \\quad P = F \\, S`,
			stageValues: `M(${num(t)}) = ${numeric(M)}`,
			stagePoint: `${pNdc}(${num(t)}) = ${colored(POINT_COLOR, three(applyPoint(M, p4)))}`
		};
	});
</script>

<DescriptionSections sections={NDC_SECTIONS} {formulas} />

// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-25
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Renders the transformations and spaces pages' descriptions (texts and live formulas) on the
// server at several stages and checks that KaTeX reports no error: KaTeX shows a bad formula
// in red instead of throwing, so a typo in a formula would otherwise only be seen on the page.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TranslationDescription from '$lib/components/TranslationDescription.svelte';
import ScalingDescription from '$lib/components/ScalingDescription.svelte';
import RotationDescription from '$lib/components/RotationDescription.svelte';
import OrthographicDescription from '$lib/components/OrthographicDescription.svelte';
import PerspectiveDescription from '$lib/components/PerspectiveDescription.svelte';
import ClipSpaceDescription from '$lib/components/ClipSpaceDescription.svelte';
import NdcDescription from '$lib/components/NdcDescription.svelte';
import LocalToWorldDescription from '$lib/components/LocalToWorldDescription.svelte';
import WorldToCameraDescription from '$lib/components/WorldToCameraDescription.svelte';

const point = { x: 1, y: -2, z: 0.5 };
const inFront = { x: 1, y: 0.5, z: -6 }; // camera -> clip's point, in camera space
const frustum = { x: 60, y: 1, z: 15 }; // fov, near, far
const values = { x: 3, y: -1, z: 45 };
const placement = {
	position: { x: 3, y: 1, z: -1 },
	rotation: { x: 10, y: 45, z: -20 },
	scale: { x: 1, y: 1.5, z: 2 }
};

describe('transformation descriptions render without KaTeX errors', () => {
	for (const t of [0, 0.37, 1]) {
		it(`at t = ${t}`, () => {
			const pages = [
				render(TranslationDescription, { props: { offset: values, point, t } }),
				render(ScalingDescription, { props: { factors: values, point, t } }),
				render(RotationDescription, { props: { angles: values, point, t } }),
				render(OrthographicDescription, { props: { point, t } }),
				render(PerspectiveDescription, { props: { eye: { x: 0, y: 0, z: 4 }, point, t } }),
				render(ClipSpaceDescription, { props: { frustum, point: inFront } }),
				// behind the eye (w < 0): the clip test says so instead of a tick per axis
				render(ClipSpaceDescription, { props: { frustum, point } }),
				render(NdcDescription, { props: { frustum, point: inFront, t } }),
				render(NdcDescription, { props: { frustum, point, t } }),
				render(LocalToWorldDescription, { props: { placement, point, t } }),
				render(WorldToCameraDescription, {
					props: {
						look: { eye: { x: -6, y: 3, z: 4 }, target: { x: 0, y: 1, z: 0 } },
						placement,
						point,
						t
					}
				}),
				// a scale of 0: no inverse, the description says so instead of a formula
				render(LocalToWorldDescription, {
					props: { placement: { ...placement, scale: { x: 0, y: 1, z: 1 } }, point, t }
				})
			];
			for (const page of pages) {
				expect(page.body).toContain('class="katex"');
				expect(page.body).not.toContain('katex-error');
			}
		});
	}
});

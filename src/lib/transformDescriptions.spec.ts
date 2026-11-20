// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Renders the transformations page's three descriptions (texts and live formulas) on the
// server at several stages and checks that KaTeX reports no error: KaTeX shows a bad formula
// in red instead of throwing, so a typo in a formula would otherwise only be seen on the page.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TranslationDescription from '$lib/components/TranslationDescription.svelte';
import ScalingDescription from '$lib/components/ScalingDescription.svelte';
import RotationDescription from '$lib/components/RotationDescription.svelte';

const point = { x: 1, y: -2, z: 0.5 };
const values = { x: 3, y: -1, z: 45 };

describe('transformation descriptions render without KaTeX errors', () => {
	for (const t of [0, 0.37, 1]) {
		it(`at t = ${t}`, () => {
			const pages = [
				render(TranslationDescription, { props: { offset: values, point, t } }),
				render(ScalingDescription, { props: { factors: values, point, t } }),
				render(RotationDescription, { props: { angles: values, point, t } })
			];
			for (const page of pages) {
				expect(page.body).toContain('class="katex"');
				expect(page.body).not.toContain('katex-error');
			}
		});
	}
});

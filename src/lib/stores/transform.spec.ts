// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Tests for the spaces page's starting values (transform.ts): placed (t = 1), the cube and
// the second object stand on the ground -- their lowest corner exactly on the xz plane, not
// cutting through it or floating above it.
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { apply, modelMatrix, type Placement } from '$lib/transformMath';
import { COMPANION_PLACEMENT, PLACEMENT } from '$lib/stores/transform';

/** The lowest y of the cube's 8 local corners (+-1) after the placement. */
function lowest(placement: Placement): number {
	const m = modelMatrix(placement, 1);
	let min = Infinity;
	for (const x of [-1, 1])
		for (const y of [-1, 1])
			for (const z of [-1, 1]) min = Math.min(min, apply(m, [x, y, z, 1])[1]);
	return min;
}

describe('local -> world starting values', () => {
	it('the cube stands on the ground once placed', () => {
		expect(lowest(get(PLACEMENT))).toBeCloseTo(0, 10);
	});
	it('the second object stands on the ground too', () => {
		expect(lowest(COMPANION_PLACEMENT)).toBeCloseTo(0, 10);
	});
});

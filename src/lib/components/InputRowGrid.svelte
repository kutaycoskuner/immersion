<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// One row of typed values with its own store, as a bracketed row vector: "position
	// [x y z]", "rotation [θx θy θz] °", "scale [sx sy sz]" -- the input rows of local -> world
	// ($lib/transformKinds `inputRows`), placed by TransformPanel.svelte. Each value in its axis
	// colour; typing writes the row's store, which the matrix, the scene and the description
	// follow.
	import { untrack } from 'svelte';
	import MatrixGrid, { type MatrixCell } from '$lib/components/MatrixGrid.svelte';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import type { InputRow } from '$lib/transformKinds';

	let { row }: { row: InputRow } = $props();

	// a row's store never changes (the panel is rebuilt per kind)
	const store = untrack(() => row.store);
	const AXES = ['x', 'y', 'z'] as const;

	const cells = $derived<MatrixCell[][]>([
		AXES.map((axis) => ({
			value: $store[axis],
			color: AXIS_COLORS[axis],
			label: `${row.label} ${axis}`,
			edit: (v: number) => store.update((o) => ({ ...o, [axis]: v }))
		}))
	]);
</script>

<span class="label">{row.label}</span>
<MatrixGrid rows={cells} limit={row.max} step={row.step} label={row.label} />
{#if row.unit}<span class="unit">{row.unit}</span>{/if}

<style>
	.label {
		min-width: 4.5em;
		font-size: 0.85em;
		opacity: 0.85;
	}
	.unit {
		margin-left: -0.3em;
	}
</style>

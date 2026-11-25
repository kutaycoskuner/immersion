<script lang="ts" module>
	/** One cell: a fixed number, or an input when `edit` is given (called with the new value). */
	export interface MatrixCell {
		value: number;
		color?: string;
		label?: string; // name for screen readers and the hover title, e.g. "t_x"
		edit?: (value: number) => void;
		dim?: boolean; // the identity's fixed 0 / 1, shown quieter
		// an input's own range and step, when it differs from the grid's (+-limit, step)
		min?: number;
		max?: number;
		step?: number;
	}
</script>

<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-24
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// A matrix (or column vector) in square brackets as HTML, so cells can be inputs: used by
	// the transformations page's matrix panel (TransformPanel.svelte) for T, p and p'.
	// Sized in em, so the panel's fitWidth action can shrink a whole equation row to fit.
	// Typed values are clamped to +-limit (or a cell's own min / max); a half-typed value
	// ("", "-") waits until it is a number, because a number input reports it as "" and
	// Number("") would be 0.
	let {
		rows,
		limit = 8,
		step = 0.5,
		label
	}: { rows: MatrixCell[][]; limit?: number; step?: number; label: string } = $props();

	const columns = $derived(rows[0]?.length ?? 1);

	function format(value: number): string {
		const text = String(Math.round(value * 100) / 100);
		return text === '-0' ? '0' : text;
	}

	function typed(cell: MatrixCell, text: string) {
		if (text.trim() === '') return;
		const value = Number(text.replace(',', '.'));
		if (!Number.isFinite(value)) return;
		cell.edit?.(Math.min(hi(cell), Math.max(lo(cell), value)));
	}
	const lo = (cell: MatrixCell) => cell.min ?? -limit;
	const hi = (cell: MatrixCell) => cell.max ?? limit;
</script>

<div class="matrix" role="group" aria-label={label} style="--columns: {columns}">
	{#each rows as row, r (r)}
		{#each row as cell, c (c)}
			{#if cell.edit}
				<input
					type="number"
					step={cell.step ?? step}
					min={lo(cell)}
					max={hi(cell)}
					value={cell.value}
					style:color={cell.color}
					aria-label={cell.label}
					title="{cell.label ?? ''} ({lo(cell)} to {hi(cell)})"
					oninput={(e) => typed(cell, e.currentTarget.value)}
				/>
			{:else}
				<span class:dim={cell.dim} style:color={cell.color}>{format(cell.value)}</span>
			{/if}
		{/each}
	{/each}
</div>

<style>
	/* side lines with short top / bottom ticks: square brackets */
	.matrix {
		position: relative;
		display: inline-grid;
		grid-template-columns: repeat(var(--columns), auto);
		gap: 0.25em 0.9em;
		align-items: center;
		justify-items: end;
		padding: 0.3em 0.6em;
		border-left: 1px solid currentColor;
		border-right: 1px solid currentColor;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.matrix::before,
	.matrix::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 0.35em;
		pointer-events: none;
		border-top: 1px solid currentColor;
		border-bottom: 1px solid currentColor;
	}
	.matrix::before {
		left: 0;
	}
	.matrix::after {
		right: 0;
	}

	.dim {
		opacity: 0.55;
	}

	input {
		all: unset;
		width: 3.2em;
		text-align: right;
		font-weight: 700;
		border-bottom: 1px dashed currentColor;
		cursor: text;
		-moz-appearance: textfield;
		appearance: textfield;
	}
	input::-webkit-inner-spin-button,
	input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input:focus {
		border-bottom-style: solid;
	}
</style>

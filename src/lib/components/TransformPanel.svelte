<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Matrix panel of the transformations page, for the transformation chosen at the top
	// (translation T, scaling S, rotation R; $lib/transformKinds), two equation rows with the
	// matrices side by side, then the stage bar:
	//   0. θ = [θx θy θz]°    rotation only: the angles, typed in their own row (the matrix
	//                         cells are their cos / sin and are shown read-only)
	//   1. T · p = p'         the full transformation: the kind's cells (translation: last
	//                         column, scaling: diagonal; coloured per axis) and the point p are
	//                         typed in, p' is the result
	//   2. M(t) · p = p'(t)   the stage t: every number follows the bar
	//   bar                   drag t from 0 (before) to 1 (after); the end buttons jump there
	// Writes the kind's values store, POINT and STAGE ($lib/stores/transform); the scene and
	// the description follow them live. Each row shrinks to fit the panel instead of
	// scrolling (fitWidth).
	import { untrack } from 'svelte';
	import { readable } from 'svelte/store';
	import MatrixGrid, { type MatrixCell } from '$lib/components/MatrixGrid.svelte';
	import { fitWidth } from '$lib/actions/fitWidth';
	import { POINT, POINT_COLOR, STAGE, STAGES, VALUE_LIMIT, homogeneous } from '$lib/stores/transform';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, identity, type Mat4 } from '$lib/transformMath';
	import type { Axis, TransformKind } from '$lib/transformKinds';
	import type { Vec3 } from '$lib/vectorMath';

	let { kind }: { kind: TransformKind } = $props();

	const AXES: Axis[] = ['x', 'y', 'z'];
	const T_STEP = 0.01; // bar resolution
	const NO_VALUES: Vec3 = { x: 0, y: 0, z: 0 };

	// the kind's typed values (a store per kind); the page re-creates this panel when the kind
	// changes ({#key}), so taking the store once at the start is enough
	const valuesStore = untrack(() => kind.values) ?? readable(NO_VALUES);
	const values = $derived($valuesStore);

	const matrixAt = (t: number): Mat4 => (kind.matrix ? kind.matrix(values, t) : identity());

	/** The kind's matrix as cells; `editable`: its value cells become inputs. */
	function matrixCells(m: Mat4, editable: boolean): MatrixCell[][] {
		// rotation: the angles are typed in their own row; the matrix is all cos / sin, shown
		// plain (only the homogeneous last row and column dimmed)
		if (kind.separateInputs)
			return m.map((row, r) => row.map((value, c) => ({ value, dim: r === 3 || c === 3 })));
		return m.map((row, r) =>
			row.map((value, c) => {
				const axis = kind.editableAxis?.(r, c) ?? null;
				if (!axis) return { value, dim: true };
				return {
					value: editable ? values[axis] : value,
					color: AXIS_COLORS[axis],
					label: `${kind.valueSymbol}_${axis}`,
					edit: editable
						? (v: number) => kind.values?.update((o) => ({ ...o, [axis]: v }))
						: undefined
				};
			})
		);
	}

	/** A point column (x, y, z, w) in the point colour; w dimmed. */
	function pointCells(p: number[], editable: boolean): MatrixCell[][] {
		return p.map((value, r) =>
			r < 3
				? [
						{
							value,
							color: POINT_COLOR,
							label: `p_${AXES[r]}`,
							edit: editable
								? (v: number) => POINT.update((o) => ({ ...o, [AXES[r]]: v }))
								: undefined
						}
					]
				: [{ value, dim: true }]
		);
	}

	// rotation: the angles as an editable row vector θ = [θx θy θz]
	const inputs = $derived<MatrixCell[][]>([
		AXES.map((axis) => ({
			value: values[axis],
			color: AXIS_COLORS[axis],
			label: `${kind.valueSymbol}_${axis}`,
			edit: (v: number) => kind.values?.update((o) => ({ ...o, [axis]: v }))
		}))
	]);

	const point = $derived(homogeneous($POINT));
	const limit = $derived(kind.max ?? VALUE_LIMIT);

	// row 1: the full transformation, editable
	const full = $derived(matrixCells(matrixAt(1), true));
	const p = $derived(pointCells(point, true));
	const target = $derived(pointCells(apply(matrixAt(1), point), false));

	// row 2: the stage t, read-only, follows the bar
	const staged = $derived(matrixCells(matrixAt($STAGE), false));
	const pRead = $derived(pointCells(point, false));
	const current = $derived(pointCells(apply(matrixAt($STAGE), point), false));

	const tText = $derived($STAGE.toFixed(2));
</script>

<div class="panel">
	{#if kind.separateInputs}
		<div class="equation inputs" use:fitWidth={[kind.id, values]}>
			<span class="name">{kind.valueSymbol}</span>
			<MatrixGrid rows={inputs} {limit} step={kind.step} label="{kind.label} angles" />
			{#if kind.unit}<span class="unit">{kind.unit}</span>{/if}
			<span class="hint">about x, then y, then z</span>
		</div>
	{/if}

	<div class="equation" use:fitWidth={[kind.id, values, $POINT]}>
		<span class="name">{kind.symbol}</span>
		<MatrixGrid rows={full} {limit} step={kind.step} label="{kind.label} matrix {kind.symbol}" />
		<span class="op">·</span>
		<span class="name" style:color={POINT_COLOR}>p</span>
		<MatrixGrid rows={p} limit={VALUE_LIMIT} label="point p" />
		<span class="op">=</span>
		<span class="name" style:color={POINT_COLOR}>p′</span>
		<MatrixGrid rows={target} label="transformed point p′" />
	</div>

	<div class="equation live" use:fitWidth={[kind.id, values, $POINT, tText]}>
		<span class="name">M({tText})</span>
		<MatrixGrid rows={staged} label="matrix of the stage M(t)" />
		<span class="op">·</span>
		<span class="name" style:color={POINT_COLOR}>p</span>
		<MatrixGrid rows={pRead} label="point p" />
		<span class="op">=</span>
		<span class="name" style:color={POINT_COLOR}>p′({tText})</span>
		<MatrixGrid rows={current} label="point at the stage p′(t)" />
	</div>

	<div class="stage-bar">
		<button class="pixel-button" class:selected={$STAGE === STAGES[0].t} onclick={() => STAGE.set(STAGES[0].t)}>
			{STAGES[0].t} · {STAGES[0].label}
		</button>
		<input
			type="range"
			min={STAGES[0].t}
			max={STAGES[1].t}
			step={T_STEP}
			value={$STAGE}
			aria-label="stage t"
			aria-valuetext="t = {tText}"
			oninput={(e) => STAGE.set(Number(e.currentTarget.value))}
		/>
		<button class="pixel-button" class:selected={$STAGE === STAGES[1].t} onclick={() => STAGE.set(STAGES[1].t)}>
			{STAGES[1].t} · {STAGES[1].label}
		</button>
	</div>
</div>

<style>
	.panel {
		--track: color-mix(in srgb, currentColor 25%, transparent);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* one line, never wrapping: fitWidth shrinks the font when the panel is narrow */
	.equation {
		display: flex;
		align-items: center;
		gap: 0.5em;
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		font-size: 1rem;
	}
	/* the stage row: dashed line above it, as between the description's sections */
	.equation.live {
		padding-top: 1rem;
		border-top: 2px dashed var(--col-border, #626262);
	}
	.name {
		font-style: italic;
		margin-left: 0.2em;
		font-variant-numeric: tabular-nums;
	}
	.op {
		opacity: 0.8;
	}
	.unit {
		margin-left: -0.3em;
	}
	.hint {
		margin-left: 0.8em;
		font-size: 0.8em;
		opacity: 0.6;
	}

	.stage-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* the bar: a thin 1 px track and a square thumb, in the pixel style */
	input[type='range'] {
		flex: 1 1 auto;
		min-width: 4rem;
		margin: 0;
		height: 1.2rem;
		background: transparent;
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
	}
	input[type='range']::-webkit-slider-runnable-track {
		height: 1px;
		background: var(--track);
	}
	input[type='range']::-moz-range-track {
		height: 1px;
		background: var(--track);
	}
	input[type='range']::-moz-range-progress {
		height: 1px;
		background: currentColor;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 0.7rem;
		height: 0.7rem;
		margin-top: calc(-0.35rem + 0.5px);
		border-radius: 0;
		background: currentColor;
	}
	input[type='range']::-moz-range-thumb {
		width: 0.7rem;
		height: 0.7rem;
		border: none;
		border-radius: 0;
		background: currentColor;
	}
	input[type='range']:focus-visible {
		outline: 1px dashed currentColor;
		outline-offset: 2px;
	}

	/* square, 1 px, like imge's pixel buttons */
	.pixel-button {
		all: unset;
		flex: 0 0 auto;
		padding: 0.3rem 0.9rem;
		border: 1px solid currentColor;
		font-size: 0.8rem;
		cursor: pointer;
		opacity: 0.55;
		user-select: none;
		white-space: nowrap;
	}
	.pixel-button:hover,
	.pixel-button:focus-visible {
		opacity: 0.85;
	}
	.pixel-button.selected {
		opacity: 1;
		background: color-mix(in srgb, currentColor 12%, transparent);
	}
</style>

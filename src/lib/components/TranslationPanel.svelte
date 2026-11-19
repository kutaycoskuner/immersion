<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-19
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Matrix panel of the transformations page, two equation rows with the matrices side by
	// side, then the stage bar:
	//   1. T · p = p'         the full move: T's last column (t_x, t_y, t_z, coloured per axis)
	//                         and the point p are typed in, p' is the result
	//   2. M(t) · p = p'(t)   the stage t: every number follows the bar
	//   bar                   drag t from 0 (before) to 1 (after); the end buttons jump there
	// Writes TRANSLATION, POINT and STAGE ($lib/stores/transform); the scene and the
	// description follow them live. Each row shrinks to fit the panel instead of scrolling
	// (fitWidth).
	import MatrixGrid, { type MatrixCell } from '$lib/components/MatrixGrid.svelte';
	import { fitWidth } from '$lib/actions/fitWidth';
	import {
		POINT,
		POINT_COLOR,
		STAGE,
		STAGES,
		TRANSLATION,
		VALUE_LIMIT,
		homogeneous
	} from '$lib/stores/transform';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, translation } from '$lib/transformMath';

	const AXES = ['x', 'y', 'z'] as const;
	const T_STEP = 0.01; // bar resolution

	/** A 4x4 translation matrix as cells; `edit` makes the translation column typeable. */
	function translationCells(values: number[], edit?: (axis: 'x' | 'y' | 'z', v: number) => void): MatrixCell[][] {
		return [
			...AXES.map((axis, r) => [
				...[0, 1, 2].map((c) => ({ value: r === c ? 1 : 0, dim: true })),
				{
					value: values[r],
					color: AXIS_COLORS[axis],
					label: `t_${axis}`,
					edit: edit && ((v: number) => edit(axis, v))
				}
			]),
			[0, 0, 0, 1].map((value) => ({ value, dim: true }))
		];
	}

	/** A point column (x, y, z, w) in the point colour; w dimmed. */
	function pointCells(values: number[], edit?: (axis: 'x' | 'y' | 'z', v: number) => void): MatrixCell[][] {
		return values.map((value, r) =>
			r < 3
				? [{ value, color: POINT_COLOR, label: `p_${AXES[r]}`, edit: edit && ((v: number) => edit(AXES[r], v)) }]
				: [{ value, dim: true }]
		);
	}

	const setOffset = (axis: 'x' | 'y' | 'z', v: number) => TRANSLATION.update((o) => ({ ...o, [axis]: v }));
	const setPoint = (axis: 'x' | 'y' | 'z', v: number) => POINT.update((o) => ({ ...o, [axis]: v }));

	const offset = $derived([$TRANSLATION.x, $TRANSLATION.y, $TRANSLATION.z]);
	const point = $derived(homogeneous($POINT));

	// row 1: the full move, editable
	const T = $derived(translationCells(offset, setOffset));
	const p = $derived(pointCells(point, setPoint));
	const target = $derived(pointCells(apply(translation($TRANSLATION, 1), point)));

	// row 2: the stage t, read-only, follows the bar
	const M = $derived(translationCells(offset.map((v) => v * $STAGE + 0)));
	const pRead = $derived(pointCells(point));
	const current = $derived(pointCells(apply(translation($TRANSLATION, $STAGE), point)));

	const tText = $derived($STAGE.toFixed(2));
</script>

<div class="panel">
	<div class="equation" use:fitWidth={[$TRANSLATION, $POINT]}>
		<span class="name">T</span>
		<MatrixGrid rows={T} limit={VALUE_LIMIT} label="translation matrix T" />
		<span class="op">·</span>
		<span class="name" style:color={POINT_COLOR}>p</span>
		<MatrixGrid rows={p} limit={VALUE_LIMIT} label="point p" />
		<span class="op">=</span>
		<span class="name" style:color={POINT_COLOR}>p′</span>
		<MatrixGrid rows={target} label="moved point p′" />
	</div>

	<div class="equation live" use:fitWidth={[$TRANSLATION, $POINT, tText]}>
		<span class="name">M({tText})</span>
		<MatrixGrid rows={M} label="matrix of the stage M(t)" />
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

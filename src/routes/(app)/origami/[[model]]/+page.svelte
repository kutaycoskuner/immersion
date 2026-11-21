<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Origami page (/origami/<model>): a flat sheet folded into a finished piece, step by step.
	// One viewport over the whole window (OrigamiScene.svelte) with
	//   - top left: the bundled models as links ($lib/origami/models) and a hint that a
	//     model file can be dropped anywhere on the page
	//   - bottom left: the toolbar (face names, colours), as on the unfolding cube page
	//   - bottom centre: the step bar -- "▶ step" plays the next step and stops there, the
	//     buttons 0..n jump to a step, the bar (a tick per step, snapping onto a step close
	//     by) goes from 0 (flat) to n (finished); the current step's label
	// A dropped .json file is checked (parseFoldModel) and shown instead of the bundled model;
	// a broken one lists its problems. Format: documentation/origami-page.md.
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import OrigamiScene from '$lib/components/OrigamiScene.svelte';
	import ToolBar, { type Tool } from '$lib/components/ToolBar.svelte';
	import IconText from '$lib/icons/icon-text.svelte';
	import IconColors from '$lib/icons/icon-colors.svelte';
	import { MODELS, bundledModel } from '$lib/origami/models';
	import { parseFoldModel, stepCount, type FoldModel } from '$lib/origami/foldFormat';

	let { data } = $props();

	const PLAY_SECONDS_PER_STEP = 1.5;

	let labels = $state(true);
	let colors = $state(true);
	let progress = $state(0);
	let playing = $state(false);
	let dropped = $state<{ file: string; model: FoldModel }>();
	let problems = $state<{ file: string; errors: string[] }>();
	let dragging = $state(false);

	const bundled = $derived(parseFoldModel(bundledModel(data.id)?.data));
	const model = $derived(dropped?.model ?? (bundled.ok ? bundled.model : undefined));
	const steps = $derived(model ? stepCount(model) : 1);
	const stepNow = $derived(Math.min(steps, Math.max(1, Math.ceil(progress))));
	const stepText = $derived.by(() => {
		if (!model) return '';
		if (progress <= 0) return 'flat sheet';
		const label = model.steps?.find((s) => s.step === stepNow)?.label;
		const done = progress >= steps ? ' · finished' : '';
		return `step ${stepNow} of ${steps}${label ? ` · ${label}` : ''}${done}`;
	});

	// another bundled model (a link): start it flat, forget a dropped file
	$effect(() => {
		void data.id;
		dropped = undefined;
		problems = undefined;
		progress = 0;
		playing = false;
	});

	const tools = $derived<Tool[]>([
		{
			id: 'labels',
			label: 'face names on / off',
			icon: IconText,
			active: labels,
			onclick: () => (labels = !labels)
		},
		{
			id: 'colors',
			label: 'random colours on / off',
			icon: IconColors,
			active: colors,
			onclick: () => (colors = !colors)
		}
	]);

	// play: one step at a time -- from where the bar is to the next step, then it stops
	// (at the end it starts over from the flat sheet)
	let playTarget = 0;
	function togglePlay() {
		if (playing) return void (playing = false);
		if (progress >= steps) progress = 0;
		playTarget = Math.min(steps, Math.floor(progress + SNAP) + 1);
		playing = true;
	}
	$effect(() => {
		if (!playing) return;
		let last = performance.now();
		let frame = requestAnimationFrame(function tick(now) {
			progress = Math.min(playTarget, progress + (now - last) / 1000 / PLAY_SECONDS_PER_STEP);
			last = now;
			if (progress >= playTarget) playing = false;
			else frame = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frame);
	});

	// the bar snaps onto a step when it comes close, so a step is reached exactly (every
	// fold of it finished, the next not started yet)
	const SNAP = 0.06;
	function setFromBar(value: number) {
		playing = false;
		const nearest = Math.round(value);
		progress = Math.abs(value - nearest) < SNAP ? nearest : value;
	}
	const stops = $derived(Array.from({ length: steps + 1 }, (_, k) => k));

	// drag and drop a model file anywhere on the page
	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragging = true;
	}
	async function onDrop(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		const file = event.dataTransfer?.files[0];
		if (!file) return;
		let parsed: unknown;
		try {
			parsed = JSON.parse(await file.text());
		} catch (e) {
			problems = { file: file.name, errors: [`not valid JSON: ${(e as Error).message}`] };
			return;
		}
		const result = parseFoldModel(parsed);
		if (!result.ok) {
			problems = { file: file.name, errors: result.errors };
			return;
		}
		problems = undefined;
		dropped = { file: file.name, model: result.model };
		progress = 0;
		playing = false;
	}

	onMount(() => {
		// the viewport fills the window; no page scroll behind it
		document.body.classList.add('no-scroll');
		return () => document.body.classList.remove('no-scroll');
	});
</script>

<main
	class="origami-page"
	class:dragging
	ondragover={onDragOver}
	ondragleave={() => (dragging = false)}
	ondrop={onDrop}
	aria-label="origami: fold a flat sheet into a piece; drop a model file (.json) to load it"
>
	{#if model}
		<OrigamiScene {model} {progress} {labels} {colors}>
			<nav class="models" aria-label="fold models">
				{#each MODELS as m (m.id)}
					<a
						class="pixel-button"
						class:selected={!dropped && m.id === data.id}
						href="{base}/origami/{m.id}"
						aria-current={!dropped && m.id === data.id ? 'page' : undefined}
						data-sveltekit-noscroll
					>
						{m.id}
					</a>
				{/each}
				{#if dropped}<span class="pixel-button selected" title="dropped file">{dropped.file}</span
					>{/if}
				<span class="hint">or drop a model file (.json) on the page</span>
			</nav>

			<ToolBar {tools} label="sheet display" />

			<div class="step-bar">
				<button
					class="pixel-button"
					onclick={togglePlay}
					aria-label={playing ? 'pause' : 'play the next step'}
					title={playing ? 'pause' : 'play the next step'}
				>
					{playing ? '❚❚' : '▶ step'}
				</button>
				<!-- jump to a step: 0 is the flat sheet, the last the finished piece -->
				<div class="stops" role="group" aria-label="steps">
					{#each stops as k (k)}
						<button
							class="pixel-button stop"
							class:selected={progress === k}
							title={k === 0
								? 'flat sheet'
								: (model.steps?.find((s) => s.step === k)?.label ?? `step ${k}`)}
							onclick={() => {
								playing = false;
								progress = k;
							}}
						>
							{k}
						</button>
					{/each}
				</div>
				<!-- the bar with a tick at every step; it snaps onto a step close by -->
				<div class="track" style="--steps: {steps}">
					<input
						type="range"
						min="0"
						max={steps}
						step="0.01"
						value={progress}
						aria-label="fold progress, 0 flat to {steps} finished"
						aria-valuetext={stepText}
						oninput={(e) => setFromBar(Number(e.currentTarget.value))}
					/>
				</div>
				<span class="step-text">{stepText}</span>
			</div>
		</OrigamiScene>
	{/if}

	{#if problems || (!bundled.ok && !dropped)}
		{@const list = problems ?? {
			file: `${data.id}.json`,
			errors: bundled.ok ? [] : bundled.errors
		}}
		<aside class="problems" role="alert">
			<strong>{list.file} can't be folded:</strong>
			<ul>
				{#each list.errors as error, i (i)}<li>{error}</li>{/each}
			</ul>
			{#if problems}<button class="pixel-button" onclick={() => (problems = undefined)}
					>close</button
				>{/if}
		</aside>
	{/if}

	{#if dragging}<div class="drop-hint">drop the model file (.json)</div>{/if}
</main>

<style>
	/* the whole window; the top navigation and the bottom-left bar float over it */
	.origami-page {
		position: fixed;
		inset: 0;
		margin: 0;
		padding: 0;
	}

	.models {
		position: absolute;
		top: 2.2rem;
		left: 1rem;
		z-index: 10;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.hint {
		font-size: 0.75rem;
		opacity: 0.5;
	}

	.step-bar {
		position: absolute;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		z-index: 10;
		width: min(52rem, calc(100% - 20rem)); /* clear of the bottom-left bar and the gizmo */
		display: flex;
		align-items: center;
		gap: 0.75rem;
		--track: color-mix(in srgb, currentColor 25%, transparent);
	}
	.step-text {
		flex: 0 1 auto;
		min-width: 0;
		font-size: 0.8rem;
		opacity: 0.85;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* the bar: a thin 1 px track and a square thumb, as on the transformations page */
	.stops {
		display: flex;
		gap: 2px;
	}
	.pixel-button.stop {
		padding: 0.25rem 0.5rem;
	}

	/* the bar's box: a short tick at every step (the thumb's centre travels between half a
	   thumb from each end, so the ticks do too); the last tick is drawn separately */
	.track {
		position: relative;
		flex: 1 1 8rem;
		min-width: 6rem;
		display: flex;
		align-items: center;
	}
	.track::before,
	.track::after {
		content: '';
		position: absolute;
		top: 50%;
		height: 0.6rem;
		transform: translateY(-50%);
		pointer-events: none;
		opacity: 0.5;
	}
	.track::before {
		left: 0.35rem;
		right: 0.35rem;
		background: repeating-linear-gradient(
			to right,
			currentColor 0 1px,
			transparent 1px calc(100% / var(--steps))
		);
	}
	.track::after {
		right: 0.35rem;
		width: 1px;
		background: currentColor;
	}

	input[type='range'] {
		flex: 1 1 auto;
		width: 100%;
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

	/* square, 1 px, like imge's pixel buttons */
	.pixel-button {
		all: unset;
		flex: 0 0 auto;
		padding: 0.25rem 0.8rem;
		border: 1px solid currentColor;
		font-size: 0.8rem;
		cursor: pointer;
		opacity: 0.55;
		user-select: none;
		white-space: nowrap;
		background: var(--bg, #121212);
	}
	.pixel-button:hover,
	.pixel-button:focus-visible {
		opacity: 0.85;
	}
	.pixel-button.selected {
		opacity: 1;
		background: color-mix(in srgb, currentColor 12%, var(--bg, #121212));
	}

	.problems {
		position: absolute;
		top: 5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		max-width: min(40rem, calc(100% - 2rem));
		max-height: 60%;
		overflow: auto;
		padding: 1rem 1.2rem;
		background: var(--bg, #121212);
		border: 1px solid #ff3e00;
		font-size: 0.85rem;
	}
	.problems ul {
		margin: 0.5rem 0 0.8rem;
		padding-left: 1.2rem;
	}

	.drop-hint {
		position: absolute;
		inset: 1rem;
		z-index: 40;
		display: grid;
		place-items: center;
		border: 2px dashed currentColor;
		background: color-mix(in srgb, var(--bg, #121212) 70%, transparent);
		font-size: 1rem;
		pointer-events: none;
	}
</style>

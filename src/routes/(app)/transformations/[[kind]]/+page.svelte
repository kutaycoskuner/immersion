<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Transformations page (/transformations): an animation described with matrices, in the
	// style of imge's matrix calculator. Left column: the matrix frame with the switch for the
	// transformation (translation, scaling, rotation -- $lib/transformKinds) and the matrix
	// panel (TransformPanel.svelte, values typed in, stage bar), over the description
	// (Translation- / Scaling- / RotationDescription.svelte); right: the viewport with the cube
	// (TransformScene.svelte), full height. All follow $lib/stores/transform live; the gap
	// between left and right can be dragged (SplitAreas.svelte).
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import SplitAreas from '$lib/components/SplitAreas.svelte';
	import Area from '$lib/components/Area.svelte';
	import TransformPanel from '$lib/components/TransformPanel.svelte';
	import TranslationDescription from '$lib/components/TranslationDescription.svelte';
	import ScalingDescription from '$lib/components/ScalingDescription.svelte';
	import RotationDescription from '$lib/components/RotationDescription.svelte';
	import TransformScene from '$lib/components/TransformScene.svelte';
	import { KIND, POINT, ROTATION, SCALE, STAGE, TRANSLATION } from '$lib/stores/transform';
	import { KINDS, kindById } from '$lib/transformKinds';

	// the transformation comes from the address (+page.ts), so every one has its own link;
	// the KIND store passes it on to the viewport
	let { data } = $props();
	const kind = $derived(kindById(data.kind));
	$effect(() => KIND.set(data.kind));

	onMount(() => {
		// the areas fill the window; no page scroll behind them
		document.body.classList.add('no-scroll');
		return () => document.body.classList.remove('no-scroll');
	});
</script>

<main class="transform-page">
	<SplitAreas storageKey="immersion.transform-page.split" initial={0.4}>
		{#snippet first()}
			<div class="stack">
				<div class="matrix-slot">
					<Area title="I. matrix · {kind.label}" scroll>
						<!-- the switch: in the first column's frame, so the viewport keeps its height;
						     links, so each transformation has an address to share -->
						<nav class="kinds" aria-label="transformation">
							{#each KINDS as k (k.id)}
								{#if k.ready}
									<a
										class="pixel-button"
										class:selected={k.id === kind.id}
										href="{base}/transformations/{k.id}"
										aria-current={k.id === kind.id ? 'page' : undefined}
										data-sveltekit-noscroll
										data-sveltekit-keepfocus
									>
										{k.symbol} · {k.label}
									</a>
								{:else}
									<span class="pixel-button disabled" title="{k.label}: later">
										{k.symbol} · {k.label} (later)
									</span>
								{/if}
							{/each}
						</nav>
						<!-- re-created per kind: each kind has its own values store -->
						{#key kind.id}<TransformPanel {kind} />{/key}
					</Area>
				</div>
				<div class="description-slot">
					<Area title="II. description · {kind.label}" scroll>
						{#if kind.id === 'scaling'}
							<ScalingDescription factors={$SCALE} point={$POINT} t={$STAGE} />
						{:else if kind.id === 'rotation'}
							<RotationDescription angles={$ROTATION} point={$POINT} t={$STAGE} />
						{:else}
							<TranslationDescription offset={$TRANSLATION} point={$POINT} t={$STAGE} />
						{/if}
					</Area>
				</div>
			</div>
		{/snippet}
		{#snippet second()}
			<Area title="III. viewport">
				<TransformScene />
			</Area>
		{/snippet}
	</SplitAreas>
</main>

<style>
	/* between the top navigation links and the bottom-left bar, as on the vectors page */
	.transform-page {
		position: fixed;
		top: 2.5rem;
		bottom: 2.4rem;
		left: 1rem;
		right: 1rem;
		margin: 0;
		padding: 0;
	}

	/* the switch: first row inside the matrix frame, a dashed line under it as between the
	   panel's rows */
	.kinds {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 2px dashed var(--col-border, #626262);
	}

	/* square, 1 px, like imge's pixel buttons */
	.pixel-button {
		all: unset;
		padding: 0.25rem 0.8rem;
		border: 1px solid currentColor;
		font-size: 0.8rem;
		cursor: pointer;
		opacity: 0.55;
		user-select: none;
		white-space: nowrap;
	}
	.pixel-button:hover:not(.disabled),
	.pixel-button:focus-visible {
		opacity: 0.85;
	}
	.pixel-button.selected {
		opacity: 1;
		background: color-mix(in srgb, currentColor 12%, transparent);
	}
	/* not ready yet: no link, dashed */
	.pixel-button.disabled {
		opacity: 0.3;
		border-style: dashed;
		cursor: not-allowed;
	}

	/* matrix on top at its own height, the description takes the rest; the gap leaves room
	   for the description's title, which sits half above its frame */
	.stack {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: 100%;
		height: 100%;
		min-height: 0;
	}
	.matrix-slot {
		flex: 0 0 auto;
		max-height: 55%;
		display: flex;
	}
	.description-slot {
		flex: 1 1 0;
		min-height: 0;
		display: flex;
	}
</style>

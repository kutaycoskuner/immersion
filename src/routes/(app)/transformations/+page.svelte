<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-19
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Transformations page (/transformations): an animation described with matrices, in the
	// style of imge's matrix calculator. First transformation: translation. Left: the matrix
	// panel (TranslationPanel.svelte, values typed in, stage before / after) over the
	// description (TranslationDescription.svelte); right: the viewport with the cube
	// (TransformScene.svelte). All three follow $lib/stores/transform live; the gap between
	// left and right can be dragged (SplitAreas.svelte).
	import { onMount } from 'svelte';
	import SplitAreas from '$lib/components/SplitAreas.svelte';
	import Area from '$lib/components/Area.svelte';
	import TranslationPanel from '$lib/components/TranslationPanel.svelte';
	import TranslationDescription from '$lib/components/TranslationDescription.svelte';
	import TransformScene from '$lib/components/TransformScene.svelte';
	import { POINT, STAGE, TRANSLATION } from '$lib/stores/transform';

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
					<Area title="I. matrix · translation" scroll>
						<TranslationPanel />
					</Area>
				</div>
				<div class="description-slot">
					<Area title="II. description" scroll>
						<TranslationDescription offset={$TRANSLATION} point={$POINT} t={$STAGE} />
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
		max-height: 50%;
		display: flex;
	}
	.description-slot {
		flex: 1 1 0;
		min-height: 0;
		display: flex;
	}
</style>

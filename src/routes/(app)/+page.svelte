<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Vector page (home), laid out in two framed areas (Area.svelte, imge panel style) with a
	// draggable gap between them (SplitAreas.svelte): the scrolling description of the product
	// chosen in the scene's pane, dot (DotProduct.svelte) or cross (CrossProduct.svelte), and
	// the 3d viewport.
	import { onMount } from 'svelte';
	import ThreeScene from '$lib/components/ThreeScene.svelte';
	import DotProduct from '$lib/components/DotProduct.svelte';
	import CrossProduct from '$lib/components/CrossProduct.svelte';
	import SplitAreas from '$lib/components/SplitAreas.svelte';
	import Area from '$lib/components/Area.svelte';
	import { ACTIVE_PRODUCT, STOREVECTOR1, STOREVECTOR2 } from '$lib/stores/vectors';

	const TITLES = { dot: 'I. description · dot product', cross: 'I. description · cross product' };

	onMount(() => {
		// the areas fill the window; no page scroll behind them
		document.body.classList.add('no-scroll');
		return () => document.body.classList.remove('no-scroll');
	});
</script>

<main class="vector-page">
	<SplitAreas storageKey="immersion.vector-page.split">
		{#snippet first()}
			<Area title={TITLES[$ACTIVE_PRODUCT]} scroll>
				{#if $ACTIVE_PRODUCT === 'cross'}
					<CrossProduct v1={$STOREVECTOR1} v2={$STOREVECTOR2} />
				{:else}
					<DotProduct v1={$STOREVECTOR1} v2={$STOREVECTOR2} />
				{/if}
			</Area>
		{/snippet}
		{#snippet second()}
			<Area title="II. viewport">
				<ThreeScene />
			</Area>
		{/snippet}
	</SplitAreas>
</main>

<style>
	/* between the top navigation links and the bottom-left bar, which stay fixed on top;
	   room above for the frame titles, which sit half above the top line */
	.vector-page {
		position: fixed;
		top: 2.5rem;
		bottom: 2.4rem;
		left: 1rem;
		right: 1rem;
		margin: 0;
		padding: 0;
	}
</style>

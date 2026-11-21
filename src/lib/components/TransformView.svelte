<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// The page body of the transformations and spaces pages, in the style of imge's matrix
	// calculator: left column, the matrix frame with the switches -- the spaces page's upper
	// categories (3D -> 3D, 3D -> 2D, 2D -> 2D) when it has them, then the kinds of the chosen
	// category or page ($lib/transformKinds) -- and the matrix panel (TransformPanel.svelte: values
	// typed in, stage bar), over the description of the chosen kind; right, the viewport with
	// the cube (TransformScene.svelte), full height. All follow $lib/stores/transform live; the
	// gap between left and right can be dragged (SplitAreas.svelte). The kind comes from the
	// address (each page's +page.ts), so every kind has its own link; the KIND store passes it
	// on to the viewport.
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import SplitAreas from '$lib/components/SplitAreas.svelte';
	import Area from '$lib/components/Area.svelte';
	import TransformPanel from '$lib/components/TransformPanel.svelte';
	import TranslationDescription from '$lib/components/TranslationDescription.svelte';
	import ScalingDescription from '$lib/components/ScalingDescription.svelte';
	import RotationDescription from '$lib/components/RotationDescription.svelte';
	import LocalToWorldDescription from '$lib/components/LocalToWorldDescription.svelte';
	import OrthographicDescription from '$lib/components/OrthographicDescription.svelte';
	import PerspectiveDescription from '$lib/components/PerspectiveDescription.svelte';
	import TransformScene from '$lib/components/TransformScene.svelte';
	import {
		KIND,
		PERSPECTIVE,
		PLACEMENT,
		POINT,
		ROTATION,
		SCALE,
		STAGE,
		TRANSLATION,
		type KindId
	} from '$lib/stores/transform';
	import { kindById, kindsOf, type Category } from '$lib/transformKinds';

	let {
		page,
		categories,
		kindId
	}: {
		page: 'transformations' | 'spaces';
		categories?: Category[];
		kindId: KindId;
	} = $props();

	const kind = $derived(kindById(kindId));
	// the kinds of the chosen kind's category (spaces) or of the page (transformations)
	const kinds = $derived(kindsOf(kind.group));
	const firstOf = (c: Category) => kindsOf(c.group).find((k) => k.ready);
	$effect(() => KIND.set(kindId));

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
						     links, so each kind has an address to share -->
						{#if categories}
							<nav class="kinds categories" aria-label="from which space to which">
								{#each categories as c (c.group)}
									{@const first = firstOf(c)}
									{#if c.ready && first}
										<a
											class="pixel-button"
											class:selected={c.group === kind.group}
											href="{base}/{page}/{first.id}"
											aria-current={c.group === kind.group ? 'true' : undefined}
											data-sveltekit-noscroll
											data-sveltekit-keepfocus
										>
											{c.label}
										</a>
									{:else}
										<span class="pixel-button disabled" title="{c.label}: later">
											{c.label} (later)
										</span>
									{/if}
								{/each}
							</nav>
						{/if}
						<nav class="kinds" aria-label={page}>
							{#each kinds as k (k.id)}
								{#if k.ready}
									<a
										class="pixel-button"
										class:selected={k.id === kind.id}
										href="{base}/{page}/{k.id}"
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
						{:else if kind.id === 'local-to-world'}
							<LocalToWorldDescription placement={$PLACEMENT} point={$POINT} t={$STAGE} />
						{:else if kind.id === 'orthographic'}
							<OrthographicDescription point={$POINT} t={$STAGE} />
						{:else if kind.id === 'perspective'}
							<PerspectiveDescription eye={$PERSPECTIVE} point={$POINT} t={$STAGE} />
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
	/* the upper switch: the categories, set off a little from the kinds below it */
	.kinds.categories {
		padding-bottom: 0.6rem;
		margin-bottom: 0.6rem;
		border-bottom-style: dotted;
	}
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

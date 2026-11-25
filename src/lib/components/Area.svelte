<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// One framed area of a page, in the style of imge's matrix calculator panels: a faint 1 px
	// frame with pixelated corners (the corner pixel left empty), no shadow, and the title,
	// small and lower case, in a gap of the top line at the left. `scroll` makes the body
	// scroll on its own with a thin, faint scrollbar (text areas) -- but content that is only a
	// little too tall is scaled down to fit instead (fitHeight), so there is never a scrollbar
	// that moves a few pixels; without `scroll` the body is a plain box its content fills (the
	// 3d viewport). Placed inside SplitAreas.svelte.
	import type { Snippet } from 'svelte';
	import { fitHeight } from '$lib/actions/fitHeight';

	let {
		title,
		scroll = false,
		children
	}: { title: string; scroll?: boolean; children: Snippet } = $props();
</script>

<section class="area">
	<h2 class="title">{title}</h2>
	{#if scroll}
		<div class="body scroll" use:fitHeight>
			<div class="content">{@render children()}</div>
		</div>
	{:else}
		<div class="body">{@render children()}</div>
	{/if}
</section>

<style>
	.area {
		--pixel: 1px; /* frame line width */
		--frame: color-mix(in srgb, var(--col, #ebf4f1) 22%, transparent); /* frame lines: faint */

		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-height: 0;
		background: var(--bg, #121212);
		color: var(--col, #ebf4f1);
		/* the four edges are box-shadows of the box's own size moved out by one line each
		   way; they don't overlap at the corners, so each corner pixel stays empty */
		box-shadow:
			0 calc(-1 * var(--pixel)) 0 0 var(--frame),
			0 var(--pixel) 0 0 var(--frame),
			calc(-1 * var(--pixel)) 0 0 0 var(--frame),
			var(--pixel) 0 0 0 var(--frame);
	}

	/* in a gap of the top line: the page background behind the title cuts the line */
	.title {
		position: absolute;
		top: calc(-0.5 * var(--pixel));
		left: 1rem;
		transform: translateY(-50%);
		margin: 0;
		padding: 0 0.5em;
		background: var(--bg, #121212);
		font-size: 0.8rem;
		font-weight: 600;
		line-height: 1.4;
		text-transform: lowercase;
		opacity: 0.85;
		white-space: nowrap;
		user-select: none;
		z-index: 20; /* above the viewport's canvas, gizmo and pane */
	}

	.body {
		flex: 1 1 auto;
		min-height: 0;
		position: relative;
	}

	.scroll {
		overflow-x: hidden;
		overflow-y: auto;
		padding: 1.6rem 1rem 1.2rem;
	}

	/* scrollbars inside the area (also the formulas' sideways ones): thin, a faint thumb in
	   the frame colour, no track (Firefox: scrollbar-*, Chrome / Edge / Safari: ::-webkit-) */
	.area :global(*) {
		scrollbar-width: thin;
		scrollbar-color: var(--frame) transparent;
	}
	.area :global(*::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}
	.area :global(*::-webkit-scrollbar-track),
	.area :global(*::-webkit-scrollbar-corner) {
		background: transparent;
	}
	.area :global(*::-webkit-scrollbar-thumb) {
		background: var(--frame);
		border-radius: 0;
	}
	.area :global(*::-webkit-scrollbar-thumb:hover) {
		background: color-mix(in srgb, var(--col, #ebf4f1) 45%, transparent);
	}
</style>

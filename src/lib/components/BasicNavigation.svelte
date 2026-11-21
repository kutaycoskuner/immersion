<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-21), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// The top navigation of every app page (from src/routes/(app)/+layout.svelte), as a data
	// list: one entry per page. `active: false` shows a page as plain, dimmed text with a
	// "later" tooltip instead of a link -- the page itself still exists at its address, it is
	// only not offered while the work focuses elsewhere (spaces, origami for now).
	import { base } from '$app/paths';

	const PAGES = [
		{ path: '', label: 'vectors', active: true },
		{ path: 'transformations', label: 'transformations', active: true },
		{ path: 'spaces', label: 'spaces', active: false },
		{ path: 'unfolding', label: 'unfolding cube', active: true },
		{ path: 'origami', label: 'origami', active: false },
		{ path: 'import_gltf', label: 'display model', active: true },
		{ path: 'keyframe', label: 'motion animation', active: true },
		{ path: 'pixel', label: 'pixel shader', active: true }
	];
</script>

<nav>
	{#each PAGES as page (page.path)}
		{#if page.active}
			<a href="{base}/{page.path}">{page.label}</a>
		{:else}
			<span class="inactive" title="{page.label}: later">{page.label}</span>
		{/if}
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		margin: 0;
		margin-left: 0.5rem;
		padding: 0;
		top: 0;
		left: 0;
		z-index: 90;
		/* the links come from a loop without spaces between them: the gap separates them */
		display: flex;
		flex-wrap: wrap;
		column-gap: 0.6em;
	}
	/* a page that is not offered for now: no link, dimmed */
	.inactive {
		opacity: 0.35;
		cursor: default;
		user-select: none;
	}
</style>

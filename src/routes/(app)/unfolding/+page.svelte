<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-20), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Unfolding cube page (/unfolding), the reference for the coming origami page: one viewport
	// over the whole window (UnfoldingScene.svelte, with the gizmo) and a toolbar at its left:
	// face labels, Blender-style colours (both on at the start) and unfold / fold. No frame and
	// no instructions column: the buttons explain themselves (their tooltips name them).
	import { onMount } from 'svelte';
	import UnfoldingScene from '$lib/components/UnfoldingScene.svelte';
	import ToolBar, { type Tool } from '$lib/components/ToolBar.svelte';
	import IconText from '$lib/icons/icon-text.svelte';
	import IconColors from '$lib/icons/icon-colors.svelte';
	import IconUnfold from '$lib/icons/icon-unfold.svelte';

	let labels = $state(true);
	let colors = $state(true);
	let open = $state(false);

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
		},
		{
			id: 'unfold',
			label: open ? 'fold (or click the cube)' : 'unfold (or click the cube)',
			icon: IconUnfold,
			active: open,
			onclick: () => (open = !open)
		}
	]);

	onMount(() => {
		// the viewport fills the window; no page scroll behind it
		document.body.classList.add('no-scroll');
		return () => document.body.classList.remove('no-scroll');
	});
</script>

<main class="unfolding-page">
	<UnfoldingScene {labels} {colors} bind:open>
		<ToolBar {tools} label="cube display" />
	</UnfoldingScene>
</main>

<style>
	/* the whole window; the top navigation and the bottom-left bar float over it */
	.unfolding-page {
		position: fixed;
		inset: 0;
		margin: 0;
		padding: 0;
	}
</style>

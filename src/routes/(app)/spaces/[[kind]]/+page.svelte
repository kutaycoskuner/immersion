<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Spaces page (/spaces/<kind>): the steps between coordinate spaces, under an upper switch
	// of categories -- 3D -> 3D (local -> world), 3D -> 2D (the projections: orthographic,
	// perspective), 2D -> 2D (later) -- laid out by TransformView.svelte, as the
	// transformations page; the kind comes from +page.ts.
	import TransformView from '$lib/components/TransformView.svelte';
	import { SPACE_CATEGORIES } from '$lib/transformKinds';

	let { data } = $props();
</script>

<TransformView page="spaces" categories={SPACE_CATEGORIES} kindId={data.kind} />

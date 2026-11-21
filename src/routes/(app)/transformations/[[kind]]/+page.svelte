<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Transformations page (/transformations/<kind>): translation, scaling, rotation, laid out by
	// TransformView.svelte (shared with the spaces page); the kind comes from +page.ts.
	import TransformView from '$lib/components/TransformView.svelte';

	let { data } = $props();
</script>

<TransformView page="transformations" kindId={data.kind} />

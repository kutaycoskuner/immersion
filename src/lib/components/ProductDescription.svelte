<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// The vector page's description as one block of sections separated by dashed lines, in the
	// style of imge's matrix calculator description: a small title per section, text with
	// inline KaTeX math, and display formulas. Sections come from $lib/vectorDescriptions; the
	// live formulas (by name) from DotProduct.svelte / CrossProduct.svelte.
	import 'katex/dist/katex.min.css';
	import { rich, tex } from '$lib/vectorTex';
	import type { Section } from '$lib/vectorDescriptions';

	let { sections, formulas }: { sections: Section[]; formulas: Record<string, string> } = $props();
</script>

{#each sections as section (section.title)}
	<section class="desc-section">
		<h3>{section.title}</h3>
		{#each section.blocks as block, k (k)}
			{#if 'text' in block}
				<p>{@html rich(block.text)}</p>
			{:else}
				<!-- a wide formula scrolls sideways inside its own line, never the page -->
				<div class="formula">{@html tex(formulas[block.formula] ?? '', true)}</div>
			{/if}
		{/each}
	</section>
{/each}

<style>
	.desc-section {
		padding: 1rem 0;
		border-top: 2px dashed var(--col-border, #626262);
	}
	.desc-section:first-child {
		padding-top: 0;
		border-top: none;
	}
	.desc-section:last-child {
		padding-bottom: 0;
	}
	h3 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		font-weight: 600;
	}
	p {
		margin: 0.5rem 0;
		line-height: 1.6;
		font-size: 0.9rem;
		max-width: 75ch;
	}
	.formula {
		overflow-x: auto;
		overflow-y: hidden;
		font-size: 0.95rem;
	}
	.formula :global(.katex-display) {
		margin: 0.6rem 0;
		text-align: left;
	}
	.formula :global(.katex-display > .katex) {
		text-align: left;
	}
</style>

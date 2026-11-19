<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-19
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// A page description as one block of sections separated by dashed lines, in the style of
	// imge's matrix calculator description: a small title per section, text with inline KaTeX
	// math, and display formulas. Sections are page data ($lib/vectorDescriptions,
	// $lib/transformDescriptions); the live formulas (by name) come from the page's component
	// (DotProduct.svelte, CrossProduct.svelte, TranslationDescription.svelte).
	import 'katex/dist/katex.min.css';
	import { rich, tex } from '$lib/vectorTex';
	import { fitWidth } from '$lib/actions/fitWidth';
	import type { Section } from '$lib/description';

	let { sections, formulas }: { sections: Section[]; formulas: Record<string, string> } = $props();
</script>

{#each sections as section (section.title)}
	<section class="desc-section">
		<h3>{section.title}</h3>
		{#each section.blocks as block, k (k)}
			{#if 'text' in block}
				<p>{@html rich(block.text)}</p>
			{:else}
				<!-- a wide formula shrinks to the area's width (fitWidth), no sideways scrolling -->
				{@const source = formulas[block.formula] ?? ''}
				<div class="formula" use:fitWidth={source}>{@html tex(source, true)}</div>
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
		overflow: hidden;
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

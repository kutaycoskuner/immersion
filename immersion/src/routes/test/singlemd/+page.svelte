<script lang="ts">
	// 1. Import the pre-processed Markdown file using the clean alias
	import PostContent from '$content/test05-math_complex.md';
	import Katex from '$lib/components/Katex.svelte';
	const expr2: string = 'a + b^2';
	const expr: string = '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}';
</script>

<div class="post-container">
	<svelte:component this={PostContent} />
	<!-- <Katex expression={String.raw`\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}`} displayMode={true} /> -->
</div>

<style>
	.post-container {
		/* 1. Set Width Constraints */
		width: 50%;
		max-width: 1920px;

		/* 2. Center the block element horizontally */
		margin: 0 auto;
	}
</style>

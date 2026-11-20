<script lang="ts" module>
	import type { Component } from 'svelte';

	/** One toggle of the bar; `active` shows it pressed. */
	export interface Tool {
		id: string;
		label: string; // tooltip and screen-reader name, with its key if it has one
		icon: Component;
		active: boolean;
		onclick: () => void;
	}
</script>

<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// A vertical bar of small square icon toggles at the bottom left of a viewport, where and
	// how imge has its control bar (.access-wrapper / .access-function): above the bottom-left
	// bar, the active ones on a highlighted background.
	// The tools are a data list from the page; placed inside a positioned box (the viewport).
	let { tools, label }: { tools: Tool[]; label: string } = $props();
</script>

<div class="toolbar" role="toolbar" aria-label={label}>
	{#each tools as tool (tool.id)}
		<button
			class="tool"
			class:active={tool.active}
			aria-pressed={tool.active}
			aria-label={tool.label}
			title={tool.label}
			onclick={tool.onclick}
		>
			<tool.icon />
		</button>
	{/each}
</div>

<style>
	.toolbar {
		position: absolute;
		/* where imge's control bar sits: bottom left, just above the bottom-left bar */
		left: 1em;
		bottom: 4em;
		z-index: 10;
		display: grid;
		gap: 2px;
	}

	.tool {
		all: unset;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 1.2em;
		height: 1.2em;
		padding: 0.25em;
		border-radius: 4px;
		background: var(--bg, #121212);
		color: var(--col, #ebf4f1);
		cursor: pointer;
		user-select: none;
	}
	.tool :global(svg) {
		width: 100%;
		height: 100%;
		opacity: 0.55;
	}
	.tool:hover :global(svg),
	.tool:focus-visible :global(svg) {
		opacity: 0.85;
	}
	.tool.active {
		background: color-mix(in srgb, currentColor 16%, var(--bg, #121212));
	}
	.tool.active :global(svg) {
		opacity: 1;
	}
	.tool:focus-visible {
		outline: 1px solid currentColor;
	}

	/* touch screens: big enough for a finger */
	@media (pointer: coarse) {
		.tool {
			width: 1.6em;
			height: 1.6em;
		}
	}
</style>

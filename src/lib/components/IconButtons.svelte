<script lang="ts">
	import { base } from '$app/paths';
	import * as config from '$lib/config';

	import GithubIcon from '$lib/icons/icon-github.svelte';
	import ThreeIcon from '$lib/icons/icon-three.js.svelte';

	let tooltipText = '';
	let showTooltip = false;
</script>

<nav>
	<div class="icon-container">
		<div class="icon-group">
			<a
				href="https://github.com/kutaycoskuner/immersion"
				target="_blank"
				rel="noopener noreferrer"
				class="icon-button"
				on:mouseenter={() => {
					tooltipText = 'to github repository';
					showTooltip = true;
				}}
				on:mouseleave={() => {
					tooltipText = '';
					showTooltip = false;
				}}
			>
				<GithubIcon />
			</a>

			<a
				href="https://threejs.org/"
				target="_blank"
				rel="noopener noreferrer"
				class="icon-button"
				on:mouseenter={() => {
					tooltipText = 'three.js';
					showTooltip = true;
				}}
				on:mouseleave={() => {
					tooltipText = '';
					showTooltip = false;
				}}
			>
				<ThreeIcon />
			</a>

			{#if showTooltip}
				<div class="tooltip-text">
					{tooltipText}
				</div>
			{/if}
		</div>
	</div>
</nav>

<style>
	nav {
		position: fixed;
		margin: 0;
		bottom: 0;
		left: 0;
		z-index: 90;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.nav-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-links a {
		color: var(--col);
		text-decoration: none;
		font-size: 0.5rem;
	}

	.nav-links a:hover {
		text-decoration: underline;
	}

	.icon-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.icon-group {
		display: flex;
		flex-direction: row;
	}

	.icon-button {
		padding-left: .5rem;
		padding-bottom: .5rem;
		background: transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--col);
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
	}

	.icon-button:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	.icon-button :global(svg) {
		width: 1.2rem;
		height: 1.2rem;
	}

	.tooltip-text {
		padding-left: 1rem;
		position: relative;
		bottom: 0;
		/* ... */
		display: flex;
		align-items: center;
		z-index: 100; /* good */
	}
</style>

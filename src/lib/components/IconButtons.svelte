<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Bottom-left bar on every page (from src/routes/(app)/+layout.svelte): icon links with a
	// hover tooltip, then the site's version and last update in the tooltip's place.
	// The version comes from package.json and the last update is the build date, both set in
	// vite.config.ts (__APP_VERSION__, __BUILD_DATE__); bump package.json for a release.
	import type { Component } from 'svelte';
	import GithubIcon from '$lib/icons/icon-github.svelte';
	import ThreeIcon from '$lib/icons/icon-three.js.svelte';
	import FourCubesIcon from '$lib/icons/icon-four_cubes.svelte';

	type IconLink = { href: string; tooltip: string; icon: Component };

	// one entry per icon, in display order
	const links: IconLink[] = [
		{
			href: 'https://github.com/kutaycoskuner/immersion',
			tooltip: 'to github repository',
			icon: GithubIcon
		},
		{ href: 'https://threejs.org/', tooltip: 'three.js', icon: ThreeIcon },
		{
			href: 'https://kutaycoskuner.github.io/port/computer_science',
			tooltip: 'other projects',
			icon: FourCubesIcon
		}
	];

	const version = __APP_VERSION__;
	const lastUpdate = __BUILD_DATE__;

	let tooltipText = $state('');
</script>

<nav>
	<div class="icon-group">
		{#each links as link (link.href)}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				class="icon-button"
				aria-label={link.tooltip}
				onmouseenter={() => (tooltipText = link.tooltip)}
				onmouseleave={() => (tooltipText = '')}
			>
				<link.icon />
			</a>
		{/each}

		{#if tooltipText}
			<div class="label">{tooltipText}</div>
		{:else}
			<div class="label version">v{version} · last update {lastUpdate}</div>
		{/if}
	</div>
</nav>

<style>
	nav {
		position: fixed;
		margin: 0;
		bottom: 0;
		left: 0;
		z-index: 90;
	}

	.icon-group {
		display: flex;
		flex-direction: row;
	}

	.icon-button {
		padding-left: 0.5rem;
		padding-bottom: 0.5rem;
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

	.label {
		padding-left: 1rem;
		padding-bottom: 0.5rem;
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	/* in the tooltip's place while no icon is hovered, quieter than the icons */
	.version {
		font-size: 0.7rem;
		opacity: 0.5;
		user-select: none;
	}
</style>

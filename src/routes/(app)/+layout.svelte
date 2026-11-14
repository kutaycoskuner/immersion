<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Layout of the app pages: the bottom-left bar, the top navigation links and the settings
	// overlay (Esc) around every page. Math is rendered with KaTeX inside the components that
	// need it (no MathJax CDN script any more).
	import IconButtons from '$lib/components/IconButtons.svelte';
	import BasicNavigation from '$lib/components/BasicNavigation.svelte';
	import SettingsOverlay from '$lib/components/SettingsOverlay.svelte';
	// import LeftHoverNavigation from '$lib/components/LeftHoverNavigation.svelte';
	// import Toggle from '$lib/components/ThemeChanger.svelte';
	let { children } = $props();
</script>

<!-- <Toggle /> -->
<IconButtons />
<BasicNavigation />
<SettingsOverlay />
<!-- <LeftHoverNavigation /> -->

{@render children()}

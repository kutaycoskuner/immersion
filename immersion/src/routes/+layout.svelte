<script lang="ts">
	import { base } from '$app/paths';
	import BasicNavigation from '$lib/components/BasicNavigation.svelte';
	import SettingsOverlay from '$lib/components/SettingsOverlay.svelte';
	// import LeftHoverNavigation from '$lib/components/LeftHoverNavigation.svelte';
	import Toggle from '$lib/components/ThemeChanger.svelte';
	let { children } = $props();
</script>

<Toggle />
<BasicNavigation />
<SettingsOverlay />
<!-- <LeftHoverNavigation /> -->

{@render children()}

<script lang="ts">
    import { base } from '$app/paths';
	import LeftHoverNavigation from '$lib/LeftHoverNavigation.svelte';
	import Toggle from '$lib/ThemeChanger.svelte'
let { children } = $props();
</script>

<Toggle />
<LeftHoverNavigation />

{@render children()}


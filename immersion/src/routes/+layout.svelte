<script lang="ts">
    import { base } from '$app/paths';
	import LeftHoverNavigation from '$lib/LeftHoverNavigation.svelte';
	let { children } = $props();
</script>

<LeftHoverNavigation />

{@render children()}


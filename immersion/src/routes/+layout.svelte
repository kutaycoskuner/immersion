<script lang="ts">
	// export const prerender = true;
	import LeftHoverNavigation from '$lib/LeftHoverNavigation.svelte';	
	let { children } = $props();
</script>

<LeftHoverNavigation />


{@render children()}
<script lang="ts">
	import LeftHoverNavigation from '$lib/LeftHoverNavigation.svelte';	
	let { children } = $props();
</script>

<LeftHoverNavigation />


{@render children()}
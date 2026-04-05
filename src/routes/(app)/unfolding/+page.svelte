<script>
	import ThreeUnfolding from '$lib/components/ThreeUnfolding.svelte'; // Import the component
	import { onMount, onDestroy } from 'svelte';

	onMount(() => {
		// Add the no-scroll class to the body when the page is loaded
		document.body.classList.add('no-scroll');

		// Clean up: remove the class when the component is destroyed (if necessary)
		return () => {
			document.body.classList.remove('no-scroll');
		};
	});
</script>

<main style="margin: 0; padding: 0; overflow: hidden;">
	<!-- Include ThreeScene component inside the page -->
	<ThreeUnfolding />
</main>

<style>

</style>

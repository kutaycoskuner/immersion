<script lang="ts">
    import { base } from '$app/paths';
	import * as config from '$lib/config'
</script>


<!-- src/lib/components/Nav.svelte -->
<nav>
	<a href="{base}/">blog</a>
	<a href="{base}/about">about</a>
	<a href="{base}/blog">blog</a>
	<a href="{base}/api/posts">md_api</a>
	<a href="{base}/_test/deeply/nested/route">libs_test</a>
</nav>

<!-- <style>
	nav {
		background-color: #333;
		color: white;
		padding: 1rem;
	}
	ul {
		display: flex;
		list-style: none;
		gap: 1rem;
	}
	a {
		color: white;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style> -->

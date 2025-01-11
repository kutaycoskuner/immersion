<script lang="ts">
	import * as config from '$lib/config'
</script>


<!-- src/lib/components/Nav.svelte -->
<nav>
	<a href="/">home</a>
	<a href="/about">about</a>
	<a href="/blog">blog</a>
	<a href="/api/posts">md_render</a>
	<a href="/_test/deeply/nested/route">deep</a>
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

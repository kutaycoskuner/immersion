<script lang="ts">
    // 1. Import the pre-processed Markdown file using the clean alias
    import PostContent from '$lib/../content/test05_katex.md'; 
</script>

<div class="post-container">
    <svelte:component this={PostContent} />
</div>

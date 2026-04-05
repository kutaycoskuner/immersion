<script lang="ts">
  import { onMount } from 'svelte';
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  export let expression: string = '';
  export let displayMode: boolean = true;

  let container: HTMLDivElement;

  // Function to render the expression
  function renderMath() {
    if (!container) return;
    try {
      katex.render(expression, container, {
        throwOnError: false,
        displayMode
      });
    } catch (err) {
      container.innerText = 'Invalid math expression';
      console.error(err);
    }
  }

  onMount(renderMath);

  // Re-render if expression changes
  $: expression, renderMath();
</script>

<div bind:this={container}></div>

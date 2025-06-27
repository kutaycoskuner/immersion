<script lang="ts">
  import { tick } from 'svelte';

  export let formula: string;
  export let id: string = 'mathjax-formula';

  let container: HTMLDivElement;
  let currentFormula = '';

  async function updateFormula() {
    if (formula === currentFormula || !container) return;
    
    currentFormula = formula;
    container.innerHTML = `\\(${formula}\\)`;
    
    await tick();
    
    if (window.MathJax?.typesetPromise) {
      try {
        await window.MathJax.typesetPromise([container]);
      } catch (e) {
        // Ignore render errors
      }
    }
  }

  $: if (container && formula) {
    updateFormula();
  }
</script>

<div id={id} class="mathjax" bind:this={container}></div>
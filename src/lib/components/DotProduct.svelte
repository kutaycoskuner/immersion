<!-- <script lang="ts">
  import Math from '$lib/components/MathJax.svelte';
  export let a = [1, 2, 3]; // Vector a
  export let b = [4, 5, 6]; // Vector b

  // Compute dot product
  $: dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // Format the LaTeX formula
  $: dotFormula = `
    \\vec{a} \\cdot \\vec{b} = 
    ${a[0]} \\cdot ${b[0]} + 
    ${a[1]} \\cdot ${b[1]} + 
    ${a[2]} \\cdot ${b[2]} = 
    ${dot}
  `;
</script>

<Math {formula=dotFormula} /> -->

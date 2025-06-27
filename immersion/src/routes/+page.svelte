<script>
	import ThreeScene from '$lib/components/ThreeScene.svelte'; // Import the component
	import { STOREVECTOR1, STOREVECTOR2 } from '$lib/stores/vectors';
	import Math from '$lib/components/MathJax.svelte';
	import Dot from '$lib/components/DotProduct.svelte';
	import { onMount, onDestroy } from 'svelte';

	$: v1 = $STOREVECTOR1;
	$: v2 = $STOREVECTOR2;

	$: vectorsDisplay = `
	{\\color{cyan}\\vec{v_1}} = \\begin{pmatrix} 
	{\\color{red}${v1.x.toFixed(2)}} \\\\ 
	{\\color{blue}${v1.y.toFixed(2)}} \\\\ 
	{\\color{green}${v1.z.toFixed(2)}} 
	\\end{pmatrix}
	\\quad
	{\\color{magenta}\\vec{v_2}} = \\begin{pmatrix} 
	{\\color{orange}${v2.x.toFixed(2)}} \\\\ 
	{\\color{purple}${v2.y.toFixed(2)}} \\\\ 
	{\\color{brown}${v2.z.toFixed(2)}} 
	\\end{pmatrix}
	`;

	let vectorEq = `
    \\vec{v} = 
    {\\color{red}3}\\hat{i} + 
    {\\color{blue}4}\\hat{j} + 
    {\\color{green}5}\\hat{k}
  `;

	let normalizationFormula = `\\hat{v} = \\frac{\\vec{v}}{|\\vec{v}|} = \\frac{\\vec{v}}{\\sqrt{v_x^2 + v_y^2 + v_z^2}}`;

	let dotFormula = `{\\color{cyan}\\vec{v_1}} \\cdot {\\color{magenta}\\vec{v_2}} = {\\color{red}v_{1x}} \\cdot {\\color{orange}v_{2x}} + {\\color{blue}v_{1y}} \\cdot {\\color{purple}v_{2y}} + {\\color{green}v_{1z}} \\cdot {\\color{brown}v_{2z}}`;
	$: dotProduct = `
	{\\color{cyan}\\vec{v_1}} \\cdot {\\color{magenta}\\vec{v_2}} = 
	{\\color{red}${v1.x.toFixed(2)}} \\cdot {\\color{orange}${v2.x.toFixed(2)}} + 
	{\\color{blue}${v1.y.toFixed(2)}} \\cdot {\\color{purple}${v2.y.toFixed(2)}} + 
	{\\color{green}${v1.z.toFixed(2)}} \\cdot {\\color{brown}${v2.z.toFixed(2)}} =
	{\\color{white}${(v1.x * v2.x + v1.y * v2.y + v1.z * v2.z).toFixed(2)}}
	`;

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
	<ThreeScene />

	<!-- Math Overlay -->
	<!-- <Dot /> -->
	<div class="math-overlay">
		<h2>Base Vectors</h2>

		<h2>Step 1: Normalizing Vectors</h2>
		<Math formula={normalizationFormula} />
		<Math formula={vectorsDisplay} />

		<h2>Step 2: Calculation of dot product</h2>
		<Math formula={dotFormula} />

		<Math formula={dotProduct} />

		<h2>This value represents cos value of v1 to v2</h2>
	</div>
</main>

<style>
	.math-overlay {
		position: fixed; /* <- this is key */
		top: 6em;
		left: 1em;
		width: 100%;
		padding: 1rem;
		z-index: 1000;
		pointer-events: none; /* so mouse can pass through if needed */
	}

	h2 {
		font-size: 1rem;
	}
</style>

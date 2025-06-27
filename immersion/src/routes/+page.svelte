<script>
	import ThreeScene from '$lib/components/ThreeScene.svelte'; // Import the component
	import { STOREVECTOR1, STOREVECTOR2 } from '$lib/stores/vectors';
	import MathJax from '$lib/components/MathJax.svelte';
	import Dot from '$lib/components/DotProduct.svelte';
	import { onMount, onDestroy } from 'svelte';

	$: v1 = $STOREVECTOR1;
	$: v2 = $STOREVECTOR2;

	$: nv1 = normalize(v1);
	$: nv2 = normalize(v2);

	const labelColors = {
		v1: '#66cccc', // softer cyan
		v2: '#cc99cc' // softer ${labelColors.v2}
	};

	// Color definitions for vector 1 components (consistent)
	const v1Colors = {
		x: '#ff6666', // light red
		y: '#66cc66', // light green
		z: '#6699ff' // light blue
	};

	// Color definitions for vector 2 components (soft sea-like)
	const v2Colors = {
		x: '#ff9999', // soft coral (light red)
		y: '#66cc99', // seafoam green
		z: '#6699cc' // soft sky blue
	};

	$: display_raw_vectors = `
	{\\color{cyan}\\vec{v}_1} = \\begin{bmatrix}
	{\\color{${v1Colors.x}}${v1.x.toFixed(2)}} \\\\
	{\\color{${v1Colors.y}}${v1.y.toFixed(2)}} \\\\
	{\\color{${v1Colors.z}}${v1.z.toFixed(2)}}
	\\end{bmatrix}
	\\quad
	{\\color{${labelColors.v2}}\\vec{v}_2} = \\begin{bmatrix}
	{\\color{${v2Colors.x}}${v2.x.toFixed(2)}} \\\\
	{\\color{${v2Colors.y}}${v2.y.toFixed(2)}} \\\\
	{\\color{${v2Colors.z}}${v2.z.toFixed(2)}}
	\\end{bmatrix}
	`;

	$: display_normalized_vectors = `
	{\\color{${labelColors.v1}}\\hat{v}_1} = \\begin{bmatrix}
	{\\color{${v1Colors.x}}${nv1.x.toFixed(2)}} \\\\
	{\\color{${v1Colors.y}}${nv1.y.toFixed(2)}} \\\\
	{\\color{${v1Colors.z}}${nv1.z.toFixed(2)}}
	\\end{bmatrix}
	\\quad
	{\\color{${labelColors.v2}}\\hat{v}_2} = \\begin{bmatrix}
	{\\color{${v2Colors.x}}${nv2.x.toFixed(2)}} \\\\
	{\\color{${v2Colors.y}}${nv2.y.toFixed(2)}} \\\\
	{\\color{${v2Colors.z}}${nv2.z.toFixed(2)}}
	\\end{bmatrix}
	`;

	let normalizationFormula = `\\hat{v} = \\frac{\\vec{v}}{|\\vec{v}|} = \\frac{\\vec{v}}{\\sqrt{v_x^2 + v_y^2 + v_z^2}}`;

	let dotFormula = `
	{\\color{${labelColors.v1}}\\hat{v}_1} \\cdot {\\color{${labelColors.v2}}\\hat{v}_2} = 
	{\\color{${v1Colors.x}}\\hat{v}_{1x}} \\cdot {\\color{${v2Colors.x}}\\hat{v}_{2x}} + 
	{\\color{${v1Colors.y}}\\hat{v}_{1y}} \\cdot {\\color{${v2Colors.y}}\\hat{v}_{2y}} + 
	{\\color{${v1Colors.z}}\\hat{v}_{1z}} \\cdot {\\color{${v2Colors.z}}\\hat{v}_{2z}}`;

	$: dotProduct = `
	{\\color{${labelColors.v1}}\\hat{v}_1} \\cdot {\\color{${labelColors.v2}}\\hat{v}_2} = 
	{\\color{${v1Colors.x}}${nv1.x.toFixed(2)}} \\cdot {\\color{${v2Colors.x}}${nv2.x.toFixed(2)}} + 
	{\\color{${v1Colors.y}}${nv1.y.toFixed(2)}} \\cdot {\\color{${v2Colors.y}}${nv2.y.toFixed(2)}} + 
	{\\color{${v1Colors.z}}${nv1.z.toFixed(2)}} \\cdot {\\color{${v2Colors.z}}${nv2.z.toFixed(2)}} = 
	{\\color{white}${(nv1.x * nv2.x + nv1.y * nv2.y + nv1.z * nv2.z).toFixed(2)}}
	`;

	function normalize(v) {
		const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
		return {
			x: v.x / length,
			y: v.y / length,
			z: v.z / length
		};
	}

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
		<h2>Begin: Base Vectors</h2>
		<MathJax formula={display_raw_vectors} />

		<h2>Step 1: Normalize vectors by dividing its dimensions to its length</h2>
		<MathJax formula={normalizationFormula} />
		<MathJax formula={display_normalized_vectors} />

		<h2>Step 2: Calculation of dot product</h2>
		<MathJax formula={dotFormula} />

		<MathJax formula={dotProduct} />

		<h2>Step 3: What it represents?</h2>
		<p>This value represents perpendicular projection of v1 to v2
		<br> or cos angle between these two vectors</p>

		<h2>Step 4: Self experimentation and comprehension</h2>
		<p>
			you can test it by giving max min an mid point values.
			<br> for instance, 
			<br> when vectors are perpendicular to each other dot product is 0
			<br> when vectors are overlapping dot product is 1
			<br> this value will occilate between -1 and +1
			<br>if you do not normalize the values, then the value will be cos * length of v1 and length of v2.</p>
	</div>
</main>

<style>
	.math-overlay {
		position: fixed; /* <- this is key */
		top: 5em;
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

<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Hand gizmo: a small hand whose three open fingers point along the world axes as the
	// camera sees them -- thumb x, index y, middle z, in the axis colours -- so you can hold
	// your own hand the same way and know where the axes are. Shown by ViewGizmo.svelte in
	// place of the abstract axes when its hand button is on; a right hand (three.js is
	// right-handed) or, with the gizmo's L, a left hand: the mirror image, as left-handed
	// systems such as Unity name the axes ($lib/viewGizmo/hand.ts).
	// Its own small canvas and renderer; every frame its camera takes the scene camera's
	// orientation from the ViewController (as ViewGizmo.svelte does), at a fixed distance.
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import type { ViewController } from '$lib/viewGizmo/viewController';
	import { buildHand, type Handedness } from '$lib/viewGizmo/hand';

	let {
		controller,
		handedness = 'right'
	}: { controller: ViewController; handedness?: Handedness } = $props();

	const DISTANCE = 4.2; // camera distance from the hand
	const SIZE_PX = 100; // canvas size in CSS pixels (as the axis gizmo)

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(SIZE_PX, SIZE_PX);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
		const hand = buildHand(handedness);
		hand.position.set(0, 0.15, 0); // its middle, not its wrist, in the centre of the view
		const light = new THREE.DirectionalLight(0xffffff, 2);
		light.position.set(1, 2, 3);
		camera.add(light); // lit from the viewer, whichever way the camera turns
		scene.add(hand, camera, new THREE.HemisphereLight(0xffffff, 0x555555, 1.2));

		let frame = 0;
		const offset = new THREE.Vector3();
		function animate() {
			frame = requestAnimationFrame(animate);
			// same orientation as the scene camera, looking at the hand from DISTANCE
			camera.quaternion.copy(controller.camera.quaternion);
			camera.position.copy(offset.set(0, 0, DISTANCE).applyQuaternion(camera.quaternion));
			renderer.render(scene, camera);
		}
		animate();

		return () => {
			cancelAnimationFrame(frame);
			hand.traverse((obj) => {
				const mesh = obj as THREE.Mesh;
				mesh.geometry?.dispose();
				(mesh.material as THREE.Material | undefined)?.dispose();
			});
			renderer.dispose();
		};
	});
</script>

<canvas
	bind:this={canvas}
	width={SIZE_PX}
	height={SIZE_PX}
	aria-label="{handedness} hand: thumb x, index y, middle finger z"
></canvas>

<style>
	/* fills the square the gizmo gives it; only shows, the gizmo's SVG on top does the turning */
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>

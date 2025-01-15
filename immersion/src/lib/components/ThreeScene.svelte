<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { fadingGridLines } from '$lib/shaders/FadingGridLines.ts';
	// import { infiniteAxes } from '$lib/shaders/InfiniteAxes.ts';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

	let canvas: HTMLCanvasElement;
	let keyStates: { [key: string]: boolean } = {};

	function getSimpleLine(
		half_size: number,
		offset: number,
		axis: string,
		material: THREE.Material
	) {
		let points;
		if (axis == 'z')
			points = [new THREE.Vector3(-half_size, 0, 0), new THREE.Vector3(half_size, 0, 0)];
		else points = [new THREE.Vector3(0, 0, -half_size), new THREE.Vector3(0, 0, half_size)];

		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(geometry, material);
		if (axis == 'z') line.position.z = offset;
		else line.position.x = offset;

		return line;
	}

	onMount(() => {
		// Set up the scene
		// -------------------------------------------------------------------------------
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);

		// Set up the camera
		// -------------------------------------------------------------------------------
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(-7.3, 5, 6.9);
		camera.lookAt(0, 0, 0);

		// Set up the renderer
		// -------------------------------------------------------------------------------
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		const controls = new OrbitControls(camera, renderer.domElement);

		// Handle window resize
		const resize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', resize);

		// Add scene nodes
		// -------------------------------------------------------------------------------
		for (let i = -10; i < 10; i++) {
			scene.add(getSimpleLine(10, i, 'x', fadingGridLines));
			scene.add(getSimpleLine(10, i, 'z', fadingGridLines));
		}

		// scene.add(getSimpleLine(10, 0, 'x', infiniteAxes));

		// add controls
		// -------------------------------------------------------------------------------
		const movementSpeed = 0.1;
		const rotationSpeed = 0.02;

		function updateCamera() {
			if (keyStates['w']) {
				// Move forward
				camera.position.add(
					camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(movementSpeed)
				);
			}
			if (keyStates['s']) {
				// Move backward
				camera.position.add(
					camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-movementSpeed)
				);
			}
			if (keyStates['a']) {
				// Strafe left
				const left = new THREE.Vector3(-1, 0, 0);
				left.applyQuaternion(camera.quaternion);
				camera.position.add(left.multiplyScalar(movementSpeed));
			}
			if (keyStates['d']) {
				// Strafe right
				const right = new THREE.Vector3(1, 0, 0);
				right.applyQuaternion(camera.quaternion);
				camera.position.add(right.multiplyScalar(movementSpeed));
			}
		}

		// Track key states
		window.addEventListener('keydown', (event) => (keyStates[event.key.toLowerCase()] = true));
		window.addEventListener('keyup', (event) => (keyStates[event.key.toLowerCase()] = false));

		// Animation loop
		function animate() {
			requestAnimationFrame(animate);
			updateCamera(); // Update camera movement
			renderer.render(scene, camera);
		}
		animate();

		// Clean up on unmount
		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', (event) => (keyStates[event.key.toLowerCase()] = true));
			window.removeEventListener('keyup', (event) => (keyStates[event.key.toLowerCase()] = false));
		};
	});
</script>

<canvas bind:this={canvas} style="display: block; margin: 0; padding: 0; overflow: hidden;"
></canvas>

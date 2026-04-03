<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import { InstancedMesh, Object3D } from 'three';
	import { InstancedBufferAttribute } from 'three';
	import { Pane } from 'tweakpane';
	import { fadingGridLines, fadingXAxis, fadingYAxis } from '$lib/materials/gridLines.mat';
	import { groundMaterial } from '$lib/materials/ground.mat.ts';
	import { instancedMaterial } from '$lib/materials/instanceQuad.mat.ts';
	import { ViewportGizmo } from 'three-viewport-gizmo';
	import { ViewportGizmoOptions } from '$lib/config/config-navigation_gizmo.ts';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { modelStore } from '../../store/model_store';
	import { theme } from '$lib/ColorTheme.svelte';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	let canvas: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let keyStates: { [key: string]: boolean } = {};
	let model: THREE.Object3D | null = null;

	const loader = new GLTFLoader();

	let currentTheme: string;
	theme.themeStore.subscribe((value) => {
		currentTheme = value;
	});

	// Reactive statement to call the function whenever `currentTheme` changes
	$: if (typeof window !== 'undefined' && currentTheme) {
		updateSceneBackground();
	}

	modelStore.subscribe((value) => {
		if (model) {
			scene.remove(model); // Remove the previous model if it exists
		}
		model = value; // Update the local model reference
		if (model) {
			scene.add(model); // Add the new model to the scene

			// Optionally, adjust the camera to focus on the model
			const box = new THREE.Box3().setFromObject(model);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);
			const fov = camera.fov * (Math.PI / 180);

			let cameraZ = Math.abs((maxDim / 2) * Math.tan(fov / 2));
			cameraZ *= 1.5; // Adjust for a better view

			camera.position.set(center.x, center.y, center.z + cameraZ);
			camera.lookAt(center.x, center.y, center.z);
		}
	});

	function updateSceneBackground(backgroundColor: string = '#ffffff') {
		if (backgroundColor == '#ffffff') {
			backgroundColor = adaptCSSColor(getCSSVariable('--bg'));
		}
		if (!scene) return;
		// scene.background = new THREE.Color(backgroundColor);
		scene.background = new THREE.Color('#363636');
		updateGridColor(currentTheme);
	}

	// function getCSSVariable(variableName: string): string {
	// 	if (!browser) return '';
	// 	return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	// }

	function getCSSVariable(variableName: string): string {
		if (!browser) return '';
		return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	}

	function adaptCSSColor(color: string): string {
		// Check if the color is empty or invalid
		if (!color || typeof color !== 'string') {
			console.warn(`Invalid color input: "${color}". Defaulting to white.`);
			return '#ffffff';
		}

		// Handle 8-character hex colors (e.g., #f6f6f6ff)
		if (color.startsWith('#') && color.length === 9) {
			// Remove the alpha channel and return the 6-character hex
			return color.substring(0, 7);
		}

		// Validate and return valid 6-character hex colors
		if (color.startsWith('#') && color.length === 7) {
			return color;
		}

		// Default to white if invalid color
		console.warn(`Invalid color input: "${color}". Defaulting to white.`);
		return '#ffffff';
	}

	function updateGridColor(theme: string) {
		const gridColor = adaptCSSColor(getCSSVariable('--col'));
		fadingGridLines.uniforms.uColor.value.set(gridColor);
	}

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
		scene = new THREE.Scene();
		const clock = new THREE.Clock();
		// scene.background = new THREE.Color(0xffffff);

		// setting up color theme on init
		// -------------------------------------------------------------------------------
		const getCSSVariable = (variableName: string): string => {
			if (typeof window !== 'undefined' && typeof document !== 'undefined') {
				return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
			}
			console.warn('window or document not found, returning default value');
			return ''; // Fallback for non-browser environments
		};
		let backgroundColor = getCSSVariable('--bg');
		backgroundColor = adaptCSSColor(backgroundColor);
		updateSceneBackground(backgroundColor);

		// Set up the camera
		// -------------------------------------------------------------------------------
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		// Set up the renderer
		// -------------------------------------------------------------------------------
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		// viewport gizmo or navigation gizmo
		const controls = new OrbitControls(camera, renderer.domElement);
		const gizmo = new ViewportGizmo(camera, renderer, ViewportGizmoOptions);
		gizmo.attachControls(controls);

		// camera.position.set(-7.3, 5, 6.9);
		// camera.position.set(0.0, 10.0, 9.0);
		camera.position.set(0.0, 8.0, 16.0);
		// camera.up.set(0, 0, 1);
		camera.lookAt(0, 2.0, 0);

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
			if (i != 0) {
				scene.add(getSimpleLine(10, i, 'x', fadingGridLines));
				scene.add(getSimpleLine(10, i, 'z', fadingGridLines));
			}
		}

		scene.add(getSimpleLine(10, 0, 'z', fadingXAxis));
		scene.add(getSimpleLine(10, 0, 'x', fadingYAxis));

		const material = new THREE.MeshStandardMaterial({
			color: 0x888888,
			roughness: 0.5,
			metalness: 0
		});

		// -------------------------------------------------------------------------------
		// test
		// -------------------------------------------------------------------------------

		const loader = new THREE.TextureLoader();
		const texture = loader.load('/textures/grassblades02-alpha-128.png');
		instancedMaterial.uniforms.uMap.value = texture;

		// step 1: create ground
		const groundGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = 0;
		scene.add(ground);

		// step 2: create the instance quad
		const quadSize = 0.5;
		const quadGeometry = new THREE.PlaneGeometry(quadSize, quadSize);

		// step 3: generate points on ground to spawn quads
		const groundSize = 20;
		const quadCount = 1000; // adjust how many small quads you want
		const instancePositions: THREE.Vector3[] = [];

		for (let i = 0; i < quadCount; i++) {
			const x = (Math.random() - 0.5) * groundSize; // -10 .. 10
			const z = (Math.random() - 0.5) * groundSize;
			instancePositions.push(new THREE.Vector3(x, quadSize / 3.0, z)); // slightly above ground
		}
		// debug: print first 10 positions
		// console.log('Random frame positions (first 10):');
		// framePositions.slice(0, 10).forEach((p, idx) => {
		// 	console.log(`Frame ${idx}: x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)}, z=${p.z.toFixed(2)}`);
		// });

		// step 4: instance mesh
		const instancedMesh = new InstancedMesh(quadGeometry, instancedMaterial, quadCount);
		const offsets: number[] = [];
		instancePositions.forEach((pos, i) => {
			offsets.push(pos.x, pos.y, pos.z);
		});
		instancedMesh.geometry.setAttribute(
			'instancePos',
			new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3)
		);
		// if you modify the array later, mark it as needing update
		(
			instancedMesh.geometry.getAttribute('instancePos') as THREE.InstancedBufferAttribute
		).needsUpdate = true;

		scene.add(instancedMesh);

		// -------------------------------------------------------------------------------
		// test end
		// -------------------------------------------------------------------------------

		// Add ambient and directional lights for better visibility of models
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Adjust intensity as needed
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(10, 10, 10);
		scene.add(directionalLight);

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

			instancedMaterial.uniforms.uTime.value = clock.getElapsedTime();

			renderer.render(scene, camera);
			controls.update();
			gizmo.render();

			updateCamera(); // Update camera movement
		}
		animate();

		window.onresize = () => {
			//... Scene's resize logic

			gizmo.update();
		};

		// Clean up on unmount
		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', (event) => (keyStates[event.key.toLowerCase()] = true));
			window.removeEventListener('keyup', (event) => (keyStates[event.key.toLowerCase()] = false));
		};
	});

	onDestroy(() => {});
</script>

<canvas bind:this={canvas} style="display: block; margin: 0; padding: 0; overflow: hidden;"
></canvas>

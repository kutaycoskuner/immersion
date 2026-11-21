<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-21), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Display model page's scene: a test scene (outliner-testscene.gltf) on the fading grid,
	// lit, with orbit controls, W A S D and the axis gizmo; a model loaded in the settings
	// overlay is shown too. (The hand of the gizmo's hand button was checked here for a while,
	// big, with a toolbar toggle; taken out for now, see git history to bring it back.)
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import * as THREE from 'three';
	import { Pane } from 'tweakpane';
	import { fadingGridLines, fadingXAxis, fadingYAxis } from '$lib/materials/gridLines.mat';
	// import { infiniteAxes } from '$lib/shaders/InfiniteAxes.ts';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { modelStore } from '../../store/model_store';
	import { theme } from '$lib/ColorTheme.svelte';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	let canvas: HTMLCanvasElement;
	let view: ViewController | undefined; // set in onMount, read by the gizmo
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let keyStates: { [key: string]: boolean } = {};
	let model: THREE.Object3D | null = null;

	const loader = new GLTFLoader();



	let currentTheme: string;
	const unsubscribeTheme = theme.themeStore.subscribe((value) => {
		currentTheme = value;
	});

	// Reactive statement to call the function whenever `currentTheme` changes
	$: currentTheme && updateSceneBackground();


	function showModel(value: THREE.Object3D | null) {
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
	}

	function updateSceneBackground(backgroundColor: string = '#ffffff') {
		if (backgroundColor == '#ffffff') {
			backgroundColor = adaptCSSColor(getCSSVariable('--bg'));
		}
		if (!scene) return;
		// scene.background = new THREE.Color(backgroundColor);
		scene.background = new THREE.Color('#363636');
		updateGridColor(currentTheme);
	}

	function getCSSVariable(variableName: string): string {
		if (typeof window !== 'undefined') {
			return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
		}
		console.log('window not found.');
		return ''; // Fallback for non-browser environments
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
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		// viewport gizmo or navigation gizmo
		const controls = new OrbitControls(camera, renderer.domElement);

		// camera.position.set(-7.3, 5, 6.9);
		camera.position.set(9.0, 10.0, 9.0);
		// camera.up.set(0, 0, 1);
		camera.lookAt(0, 2.0, 0);

		// Handle window resize
		const resize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			// both cameras (perspective and orthographic) follow the new shape
			views.resize(window.innerWidth, window.innerHeight);
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
		loader.load(
			`${base}/scenes/outliner-testscene/gltf/outliner-testscene.gltf`,
			(gltf) => {
				scene.add(gltf.scene);
			},
			undefined,
			(error) => {
				console.error('Error loading GLTF:', error);
			}
		);
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
			const camera = views.camera; // the active one: perspective or orthographic
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
		const onKeyDown = (event: KeyboardEvent) => (keyStates[event.key.toLowerCase()] = true);
		const onKeyUp = (event: KeyboardEvent) => (keyStates[event.key.toLowerCase()] = false);
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		// the gizmo's views, drag orbit, keys and the perspective / orthographic switch; made
		// after the start position is set, which becomes its reset view
		const views = new ViewController(camera, controls, { ortho: true });
		view = views;

		let frame = 0; // requestAnimationFrame id, cancelled on unmount
		// Animation loop
		function animate() {
			frame = requestAnimationFrame(animate);

			renderer.render(scene, views.camera); // the active camera (ortho or perspective)
			views.update();
			controls.update();

			updateCamera(); // Update camera movement
		}
		animate();

		// subscribed here, after the scene and camera exist: a model already in the store
		// (loaded on another page) would otherwise be added to a scene that is not built yet
		const unsubscribeModel = modelStore.subscribe(showModel);

		// leaving the page stops the loop, the listeners and the subscriptions
		return () => {
			cancelAnimationFrame(frame);
			views.dispose();
			view = undefined;
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			unsubscribeModel();
			unsubscribeTheme();
			if (model) scene.remove(model); // the model belongs to the store, not to this scene
			renderer.dispose();
		};
	});

	onDestroy(() => {

	});
</script>

<!-- positioned box so the gizmo sits in the canvas' bottom-right corner -->
<div style="position: relative;">
	<canvas bind:this={canvas} style="display: block; margin: 0; padding: 0; overflow: hidden;"
	></canvas>
	{#if view}<ViewGizmo controller={view} />{/if}

</div>

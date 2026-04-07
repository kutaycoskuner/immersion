<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import { InstancedMesh, Object3D } from 'three';
	import { fadingGridLines, fadingXAxis, fadingYAxis } from '$lib/materials/gridLines.mat';
	import { groundMaterial } from '$lib/materials/ground.mat.ts';
	import { instancedMaterial } from '$lib/materials/instanceQuad.mat.ts';
	import { PixelMaterial } from '$lib/materials/pixel.mat.ts';
	import { PostProcessMaterial } from '$lib/materials/pp.mat';
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

	// todo: remove sometime
	const isProd = import.meta.env.MODE === 'production';
	console.log('Running in production?', isProd);

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

		// rendertarget
		const fullscreenPassScene = new THREE.Scene();
		const fullscreenPassCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const fullscreenPass = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), PostProcessMaterial);
		fullscreenPassScene.add(fullscreenPass);

		// -----
		const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

		renderTarget.depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
		renderTarget.depthTexture.type = THREE.UnsignedShortType;
		renderTarget.depthBuffer = true;

		// Set up the camera
		// -------------------------------------------------------------------------------
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		
		// After creating renderTarget and fullscreenPass
		PostProcessMaterial.uniforms.uTexDepth.value = renderTarget.depthTexture;
		// optional if you want color
		PostProcessMaterial.uniforms.uCameraNear.value = camera.near;
		PostProcessMaterial.uniforms.uCameraFar.value = camera.far;
		
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
		// test start
		// -------------------------------------------------------------------------------

		const loader = new THREE.TextureLoader();
		const tex_instancedQuad = loader.load(`${base}/textures/grassblades02-alpha-128.png`);
		const tex_ground = loader.load(`${base}/textures/heightmap01-1k.png`);
		tex_instancedQuad.anisotropy = renderer.capabilities.getMaxAnisotropy();
		// const tex_ground = loader.load('/textures/test01-4color-128.png');
		instancedMaterial.uniforms.uMap.value = tex_instancedQuad;
		instancedMaterial.uniforms.uGroundTex.value = tex_ground;
		groundMaterial.uniforms.uMap.value = tex_ground;

		// step 0: add point light
		// point light
		const pointLight = new THREE.PointLight(0xffffff, 2, 30);
		pointLight.position.set(3, 3, 0);
		pointLight.intensity = 8;
		scene.add(pointLight);

		// Add ambient and directional lights for better visibility of models
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
		scene.add(ambientLight);

		// optional visual helper
		const lightSphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 8, 8),
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);
		pointLight.add(lightSphere);

		// step 1: create ground
		const groundGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = 0;
		scene.add(ground);

		// step 2: create the instance quad
		const quadSize = 0.6;
		const quadGeometry = new THREE.PlaneGeometry(quadSize, quadSize);

		// step 3: generate points on ground to spawn quads
		const groundSize: number = 20.0;
		// instancedMaterial.uniforms.uGroundHalfSize.value = groundSize / 2.0;
		const quadCount = 2800; // adjust how many small quads you want
		const instancePositions: THREE.Vector3[] = [];

		for (let i = 0; i < quadCount; i++) {
			const x = (Math.random() - 0.5) * groundSize; // -10 .. 10
			const z = (Math.random() - 0.5) * groundSize;
			// slightly above ground
			instancePositions.push(new THREE.Vector3(x, quadSize / 6.0, z));
			// instancePositions.push(new THREE.Vector3(x, 0.0, z));
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

		// step 5: more objects
		const centerObjects = new THREE.Group();
		scene.add(centerObjects);

		const primitiveMaterial = new THREE.MeshStandardMaterial({
			color: 0xaaaaaa,
			roughness: 0.4,
			metalness: 0.1
		});

		// cube
		const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), PixelMaterial);
		cube.position.set(-2, 0.5, 0);
		cube.rotateY(64);
		centerObjects.add(cube);

		// cylinder
		const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.5, 32), PixelMaterial);
		cylinder.position.set(0, 0.75, -2);
		centerObjects.add(cylinder);

		// box
		// const box = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.6), primitiveMaterial);
		// box.position.set(2, 1, 0);
		// centerObjects.add(box);

		// dodecahedron
		// const dodecahedron = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8), primitiveMaterial);
		// dodecahedron.position.set(0, 0.8, 2);
		// centerObjects.add(dodecahedron);

		// -------------------------------------------------------------------------------
		// test end
		// -------------------------------------------------------------------------------

		// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		// directionalLight.position.set(10, 10, 10);
		// scene.add(directionalLight);

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
			const time = clock.getElapsedTime();
			requestAnimationFrame(animate);

			groundMaterial.uniforms.uPointLightPos.value.copy(pointLight.position);
			groundMaterial.uniforms.uPointLightColor.value.copy(pointLight.color);

			instancedMaterial.uniforms.uPointLightPos.value.copy(pointLight.position);
			instancedMaterial.uniforms.uPointLightColor.value.copy(pointLight.color);
			// groundMaterial.uniforms.uAmbient.value.copy(ambientLight.color);
			instancedMaterial.uniforms.uTime.value = clock.getElapsedTime();

			PixelMaterial.uniforms.uPointLightPos.value.copy(pointLight.position);
			PixelMaterial.uniforms.uPointLightColor.value.copy(pointLight.color);
			// PixelMaterial.uniforms.uAmbient.value.copy(ambientLight.color);
			PixelMaterial.uniforms.uTime.value = clock.getElapsedTime();

			// rotate point light
			const radius = 3;
			pointLight.position.x = Math.cos(time) * radius;
			pointLight.position.z = Math.sin(time) * radius;
			pointLight.position.y = 3 + Math.sin(time * 1.0);

			// renderer.render(scene, camera);
			// pass 1: render scene to render target (with depth)
			renderer.setRenderTarget(renderTarget);
			renderer.render(scene, camera);

			// pass 2: render fullscreen quad showing depth
			renderer.setRenderTarget(null);
			renderer.render(fullscreenPassScene, fullscreenPassCamera);

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

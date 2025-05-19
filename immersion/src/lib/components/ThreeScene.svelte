<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { Pane } from 'tweakpane';
	import { fadingGridLines, fadingXAxis, fadingYAxis } from '$lib/shaders/FadingGridLines.ts';
	// import { infiniteAxes } from '$lib/shaders/InfiniteAxes.ts';
	import { ViewportGizmo } from 'three-viewport-gizmo';
	import { ViewportGizmoOptions } from '$lib/config/config-navigation_gizmo.ts';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { modelStore } from '../../store/model_store';
	import { theme } from '$lib/ColorTheme.svelte';
	import { writable } from 'svelte/store';

	let canvas: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let keyStates: { [key: string]: boolean } = {};
	let model: THREE.Object3D | null = null;

	let pane: Pane;
	let vectorScale = 5;
	export const STOREVECTOR1 = writable({ x: 1, y: 1, z: 1 });
	export const STOREVECTOR2 = writable({ x: 0, y: 0, z: 0 });

	let paneVector1 = { x: 1, y: 1, z: 1 };
	let threeVector1: THREE.Line = drawVector(1, 1, 1, vectorScale);
	let threeVectorTip1: THREE.Mesh;
	let threeVectorText1: THREE.Sprite;
	let threeVectorUpRef1: THREE.Line;

	let paneVector2 = { x: 0, y: 0, z: 0 };
	let threeVector2: THREE.Line = drawVector(0, 0, 0, vectorScale);
	let threeVectorTip2: THREE.Mesh;
	let threeVectorText2: THREE.Sprite;
	let threeVectorUpRef2: THREE.Line;

	let currentTheme: string;
	theme.themeStore.subscribe((value) => {
		currentTheme = value;
	});

	// Reactive statement to call the function whenever `currentTheme` changes
	$: currentTheme && updateSceneBackground();

	$: STOREVECTOR1.subscribe((vector) => {
		updateVector(vector.x, vector.y, vector.z, 1);
	});
	$: STOREVECTOR2.subscribe((vector) => {
		updateVector(vector.x, vector.y, vector.z, 2);
	});

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

	function updateVector(x: number, y: number, z: number, vectorIndex: number) {
		if (typeof window === 'undefined') return;
		if (typeof document === 'undefined') return;
		if (vectorIndex == 1) {
			if (threeVector1 && scene) {
				scene.remove(threeVector1);
				scene.remove(threeVectorTip1);
				scene.remove(threeVectorUpRef1);
				scene.remove(threeVectorText1);
			}
			threeVector1 = drawVector(x, y, z, vectorScale);
			threeVectorTip1 = drawTipOfVector(threeVector1);
			threeVectorUpRef1 = drawReferenceLineToGroundPlane(threeVectorTip1.position);
			threeVectorText1 = addVectorLabelAtTip(threeVectorTip1.position);
			if (scene) {
				scene.add(threeVector1);
				scene.add(threeVectorTip1);
				scene.add(threeVectorUpRef1);
				if (threeVectorTip1.position.length() > 0) scene.add(threeVectorText1);
			}
		} else if (vectorIndex == 2) {
			if (threeVector2 && scene) {
				scene.remove(threeVector2);
				scene.remove(threeVectorTip2);
				scene.remove(threeVectorUpRef2);
				scene.remove(threeVectorText2);
			}
			threeVector2 = drawVector(x, y, z, vectorScale);
			threeVectorTip2 = drawTipOfVector(threeVector2);
			threeVectorUpRef2 = drawReferenceLineToGroundPlane(threeVectorTip2.position);
			threeVectorText2 = addVectorLabelAtTip(threeVectorTip2.position);

			if (scene) {
				scene.add(threeVector2);
				scene.add(threeVectorTip2);
				scene.add(threeVectorUpRef2);
				if (threeVectorTip2.position.length() > 0) scene.add(threeVectorText2);
			}
		}
	}

	function drawReferenceLineToGroundPlane(tipPosition: THREE.Vector3): THREE.Line {
		// Create points for the reference line (from tip to y=0 plane)
		const start = tipPosition.clone();
		const end = new THREE.Vector3(tipPosition.x, 0, tipPosition.z); // Project to y=0 plane

		// Create geometry
		const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

		// Create material (dashed line for better visual distinction)
		const material = new THREE.LineDashedMaterial({
			color: 0x444444, // Gray color
			dashSize: 0.1,
			gapSize: 0.05,
			linewidth: 1
		});

		// Create the line
		const line = new THREE.Line(geometry, material);
		line.computeLineDistances(); // Required for dashed lines

		return line;
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

	function createTextSprite(message: string, color = 'white', fontSize = 48): THREE.Sprite {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d')!;
		canvas.width = 512;
		canvas.height = 256;

		context.font = `${fontSize}px Arial`;
		context.fillStyle = color;
		context.textAlign = 'center';
		context.fillText(message, canvas.width / 2, canvas.height / 2 + fontSize / 2);

		const texture = new THREE.CanvasTexture(canvas);
		const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
		const sprite = new THREE.Sprite(material);
		sprite.scale.set(2, 1, 1); // Adjust based on font size and canvas ratio
		return sprite;
	}

	function addVectorLabelAtTip(
		tipPosition: THREE.Vector3,
		// scene: THREE.Scene,
		offsetScalar = 0.6
	): THREE.Sprite {
		// Format the coordinates as a string
		const posx = tipPosition.x / vectorScale;
		const posy = tipPosition.y / vectorScale;
		const posz = tipPosition.z / vectorScale;
		const text = `(${posx.toFixed(2)}, ${posy.toFixed(2)}, ${posz.toFixed(2)})`;

		// Create the text sprite with the formatted coordinates
		const textSprite = createTextSprite(text, 'white', 64); // You can adjust color and size as needed

		// Calculate direction and offset
		const direction = tipPosition.clone().normalize();
		const offset = direction.multiplyScalar(offsetScalar);

		// Set the position of the text sprite
		textSprite.position.copy(tipPosition.clone().add(offset));

		// Add the sprite to the scene
		// scene.add(textSprite);

		return textSprite;
	}

	function drawVector(x: number, y: number, z: number, scale: number = 1): THREE.Line {
		// Scale the vector
		const scaledX = x * scale;
		const scaledY = y * scale;
		const scaledZ = z * scale;

		// Create the points for the vector
		const start = new THREE.Vector3(0, 0, 0); // Start at the origin
		const end = new THREE.Vector3(scaledX, scaledY, scaledZ); // End at (x, y, z)

		// Create geometry from points
		const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

		// Create material with color based on RGB values
		const material = new THREE.LineBasicMaterial({
			color: new THREE.Color(scaledX / scale, scaledY / scale, scaledZ / scale) // Normalize RGB values
		});

		// Create the line (vector) and return it
		const line = new THREE.Line(geometry, material);
		return line;
	}

	// Function to create the cone tip based on the vector
	function drawTipOfVector(vectorLine: THREE.Line, scale: number = 1): THREE.Mesh {
		// Extract the start and end points of the vector from the line's geometry
		const start = vectorLine.geometry.attributes.position.array.slice(0, 3); // First 3 values are start point
		const end = vectorLine.geometry.attributes.position.array.slice(3, 6); // Next 3 values are end point

		// Create the vector direction from start to end
		const vector = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);

		// Scale the vector
		const scaledLength = vector.length() * scale;

		// Create geometry for the cone
		const coneHeight = scaledLength * 0.05; // Height of the cone is 5% of the vector length
		const coneRadius = coneHeight * 0.2; // Radius of the cone, adjust this for size preference
		const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 3);

		// Extract the color from the vector's material
		const material = vectorLine.material as THREE.LineBasicMaterial;
		const color = material.color;

		// Create material for the cone with the same color as the vector
		const coneMaterial = new THREE.MeshBasicMaterial({ color: color });

		// Create the cone mesh
		const cone = new THREE.Mesh(coneGeometry, coneMaterial);

		// // Position the cone at the tip of the vector (end)
		const conePosition = new THREE.Vector3(end[0], end[1], end[2]);
		cone.position.copy(conePosition);

		// Align the cone's height axis (z-axis) with the direction of the vector
		const direction = vector.clone().normalize();

		// Rotate the cone to point along the vector's direction
		cone.lookAt(cone.position.clone().add(direction));
		cone.rotateX(Math.PI / 2); // Rotate 90 degrees around the X-axis

		// Return only the cone (tip of the vector)
		return cone;
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
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		// viewport gizmo or navigation gizmo
		const controls = new OrbitControls(camera, renderer.domElement);
		const gizmo = new ViewportGizmo(camera, renderer, ViewportGizmoOptions);
		gizmo.attachControls(controls);

		// camera.position.set(-7.3, 5, 6.9);
		camera.position.set(0.0, 4.0, 16.0);
		// camera.up.set(0, 0, 1);
		camera.lookAt(0, 0, 0);

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

		// Parameters for vector drawing
		const length = 0.2; // Length of each vector
		const angleIncrement = 45; // Angle increment between vectors in degrees
		const numVectors = 360 / angleIncrement; // Number of vectors (360 degrees / angleinc)

		// 				vector 1
		scene.add(threeVector1);

		threeVectorTip1 = drawTipOfVector(threeVector1);
		scene.add(threeVectorTip1);

		threeVectorUpRef1 = drawReferenceLineToGroundPlane(threeVectorTip1.position);
		scene.add(threeVectorUpRef1);

		threeVectorText1 = addVectorLabelAtTip(threeVectorTip1.position);
		if (threeVectorTip1.position.length() > 0) scene.add(threeVectorText1);

		// 				vector 2
		scene.add(threeVector2);

		threeVectorTip2 = drawTipOfVector(threeVector2);
		scene.add(threeVectorTip2);

		threeVectorUpRef2 = drawReferenceLineToGroundPlane(threeVectorTip2.position);
		scene.add(threeVectorUpRef2);

		threeVectorText2 = addVectorLabelAtTip(threeVectorTip2.position);
		if (threeVectorTip2.position.length() > 0) scene.add(threeVectorText2);

		// Add ambient and directional lights for better visibility of models
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Adjust intensity as needed
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(10, 10, 10);
		scene.add(directionalLight);

		// add ui
		// -------------------------------------------------------------------------------
		pane = new Pane({ title: 'Controls' });
		const tab = pane.addTab({
			pages: [{ title: 'Scalar Product' }, { title: 'Vector Product' }]
		});
		// Vector 1 bindings with custom labels
		tab.pages[0]
			.addBinding(paneVector1, 'x', { min: -1, max: 1, label: 'Vec 1 X' })
			.on('change', () => {
				STOREVECTOR1.set({ ...paneVector1 });
			});
		tab.pages[0]
			.addBinding(paneVector1, 'y', { min: -1, max: 1, label: 'Vec 1 Y' })
			.on('change', () => {
				STOREVECTOR1.set({ ...paneVector1 });
			});
		tab.pages[0]
			.addBinding(paneVector1, 'z', { min: -1, max: 1, label: 'Vec 1 Z' })
			.on('change', () => {
				STOREVECTOR1.set({ ...paneVector1 });
			});

		// Vector 2 bindings with custom labels
		tab.pages[0]
			.addBinding(paneVector2, 'x', { min: -1, max: 1, label: 'Vec 2 X' })
			.on('change', () => {
				STOREVECTOR2.set({ ...paneVector2 });
			});
		tab.pages[0]
			.addBinding(paneVector2, 'y', { min: -1, max: 1, label: 'Vec 2 Y' })
			.on('change', () => {
				STOREVECTOR2.set({ ...paneVector2 });
			});
		tab.pages[0]
			.addBinding(paneVector2, 'z', { min: -1, max: 1, label: 'Vec 2 Z' })
			.on('change', () => {
				STOREVECTOR2.set({ ...paneVector2 });
			});

		const btn = tab.pages[0]
			.addButton({
				title: 'Animate Scaler Product',
				// label: 'counter' // optional
			});

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
</script>

<canvas bind:this={canvas} style="display: block; margin: 0; padding: 0; overflow: hidden;"
></canvas>

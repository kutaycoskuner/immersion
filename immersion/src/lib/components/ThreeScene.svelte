<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let canvas;
	let keyStates = {}; // Track pressed keys

	const material = new THREE.ShaderMaterial({
		vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }`,
		fragmentShader: `
        varying vec3 vWorldPosition;

        void main() {
            float distanceFromOrigin = length(vWorldPosition);
            float opacity = 0.9 - distanceFromOrigin / 10.0;
			opacity = clamp(opacity, 0.0, 0.5);
            gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
        }`,
		transparent: true,
		vertexColors: false,
	});

	function getSimpleLine(offset, dimension) {
		const end_value = 10.0;
		let points;
		if (dimension == 'z')
			points = [new THREE.Vector3(-end_value, 0, 0), new THREE.Vector3(end_value, 0, 0)];
		else points = [new THREE.Vector3(0, 0, -end_value), new THREE.Vector3(0, 0, end_value)];

		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(geometry, material);
		if (dimension == 'z') line.position.z = offset;
		else line.position.x = offset;

		return line;
	}

	onMount(() => {
		// Set up the scene
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);

		// Set up the camera
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(-7.3, 5, 6.9);
		camera.lookAt(0, 0, 0);

		// Set up the renderer
		const renderer = new THREE.WebGLRenderer({ canvas });
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Handle window resize
		const resize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', resize);

		// Add grid lines
		for (let i = -10; i < 10; i++) {
			scene.add(getSimpleLine(i, 'x'));
			scene.add(getSimpleLine(i, 'z'));
		}

		// Camera movement
		const movementSpeed = 0.1;
		const rotationSpeed = 0.02;

		function updateCamera() {
			if (keyStates['w']) {
				// Move forward
				camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(movementSpeed));
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

<canvas
	bind:this={canvas}
	style="display: block; margin: 0; padding: 0; overflow: hidden;"
></canvas>

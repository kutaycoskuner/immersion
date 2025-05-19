<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type FaceName = 'front' | 'back' | 'left' | 'right' | 'top';

	let canvas: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;

	let root: THREE.Group;
	let unfolded = false;

	const faceSize = 1;

	let pivots: Record<FaceName, THREE.Group> = {};

	const rotationTargets: Record<FaceName, number> = {
		front: 0,
		back: 0,
		left: 0,
		right: 0,
		top: 0
	};

	const faceOrder: FaceName[] = ['front', 'left', 'right', 'back', 'top'];

	function easeInOutQuad(t: number): number {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	let unfoldProgress: Record<FaceName, number> = {
		front: 0,
		left: 0,
		right: 0,
		back: 0,
		top: 0
	};

	let unfolding = false;
	let unfoldTimer = 0;

	onMount(() => {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		root = new THREE.Group();
		scene.add(root);

		const geom = new THREE.PlaneGeometry(faceSize, faceSize);

		function addLabel(mesh: THREE.Mesh, text: string) {
			const canvas = document.createElement('canvas');
			canvas.width = 256;
			canvas.height = 256;
			const ctx = canvas.getContext('2d')!;
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'black';
			ctx.font = '48px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, canvas.width / 2, canvas.height / 2);
			const texture = new THREE.CanvasTexture(canvas);
			(mesh.material as THREE.MeshBasicMaterial).map = texture;
			(mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
		}

		function makeFace(color: string, label: string) {
			const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
			const mesh = new THREE.Mesh(geom, mat);
			addLabel(mesh, label);
			return mesh;
		}

		const bottom = makeFace('#cccccc', 'bottom');
		bottom.rotation.x = -Math.PI / 2;
		bottom.position.y = -0.5;
		root.add(bottom);

		const createFace = (
			name: FaceName,
			pivotOffset: [number, number, number],
			faceOffset: [number, number, number],
			initialRotation: [number, number, number],
			color: string,
			label: string
		) => {
			const pivot = new THREE.Group();
			pivot.position.set(...pivotOffset);
			const face = makeFace(color, label);
			face.position.set(...faceOffset);
			face.rotation.set(...initialRotation);
			pivot.add(face);
			root.add(pivot);
			pivots[name] = pivot;
		};

		// Create front, back, left, and right faces
		createFace('front', [0, -0.5, 0.5], [0, 0.5, 0], [0, 0, 0], '#0000ff', 'front');
		createFace('back', [0, -0.5, -0.5], [0, 0.5, 0], [0, Math.PI, 0], '#aaccff', 'back');
		createFace('left', [-0.5, -0.5, 0], [0, 0.5, 0], [0, Math.PI / 2, 0], '#ff0000', 'left');
		createFace('right', [0.5, -0.5, 0], [0, 0.5, 0], [0, -Math.PI / 2, 0], '#ffaaaa', 'right');

		const topHinge = new THREE.Group();
		topHinge.position.set(0, 0.5, -0.5); // Back-top edge position
		pivots.back.add(topHinge); // Hinge follows back face

		// Create actual top pivot and face
		const topPivot = new THREE.Group();
		topPivot.position.set(0, 0, 1); // Offset forward one face unit
		const topFace = makeFace('#00ff00', 'top');
		topFace.rotation.set(-Math.PI / 2, 0, 0); // Face pointing up
		topFace.position.set(0, 0.5, 0); // Lift it above its own pivot
		topPivot.add(topFace);
		topHinge.add(topPivot);

		// Store for later animation
		pivots.top = topHinge;

		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});

		animate();
	});

	function animate() {
		requestAnimationFrame(animate);

		if (!unfolded) {
			root.rotation.y += 0.005;
			root.rotation.x += 0.002;
		}

		if (unfolded && !unfolding) {
			unfolding = true;
			unfoldTimer = 0;
		}

		if (!unfolded && unfolding) {
			unfolding = false;
			faceOrder.forEach((name) => {
				rotationTargets[name] = 0;
				unfoldProgress[name] = 0;
			});
		}

		if (unfolding) {
			unfoldTimer += 1;
			faceOrder.forEach((name, index) => {
				const delay = index * 40;
				if (unfoldTimer > delay) {
					const p = Math.min((unfoldTimer - delay) / 40, 1);
					unfoldProgress[name] = p;
					rotationTargets[name] = (Math.PI / 2) * easeInOutQuad(p);
				}
			});
		}

		pivots.front.rotation.x = rotationTargets.front;
		pivots.back.rotation.x = -rotationTargets.back;
		pivots.left.rotation.z = rotationTargets.left;
		pivots.right.rotation.z = -rotationTargets.right;

		// Update the top face rotation when all movements are finished
		if (unfolding && unfoldTimer > faceOrder.length * 40) {
			const p = Math.min((unfoldTimer - faceOrder.length * 40) / 40, 1);
			const eased = easeInOutQuad(p);
			rotationTargets.top = -(Math.PI / 2) * eased;
		}
		pivots.top.rotation.x = rotationTargets.top;

		renderer.render(scene, camera);
	}

	function handlePointerEnter() {
		unfolded = true;
	}

	function handlePointerLeave() {
		unfolded = false;
	}
</script>

<canvas
	bind:this={canvas}
	on:pointerenter={handlePointerEnter}
	on:pointerleave={handlePointerLeave}
	style="display: block; width: 100%; height: 100vh"
/>

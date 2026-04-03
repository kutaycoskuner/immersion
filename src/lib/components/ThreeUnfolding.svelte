<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	// === Types & Constants ===

	type FaceName = 'front' | 'back' | 'left' | 'right' | 'top';

	const faceSize = 1;
	const orbitSensitivity = 0.005;

	// === Variables ===

	let canvas: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;

	let root: THREE.Group;
	let pivots: Record<FaceName, THREE.Group> = {};

	let unfolded = false;
	let unfolding = false;
	let unfoldTimer = 0;

	let isDragging = false;
	let previousMousePos = { x: 0, y: 0 };

	const rotationTargets: Record<FaceName, number> = {
		front: 0,
		back: 0,
		left: 0,
		right: 0,
		top: 0
	};

	const unfoldProgress: Record<FaceName, number> = {
		front: 0,
		left: 0,
		right: 0,
		back: 0,
		top: 0
	};

	const faceOrder: FaceName[] = ['front', 'left', 'right', 'back', 'top'];

	// === Utility Functions ===

	/** Easing function for smooth animation */
	function easeInOutQuad(t: number): number {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	// === Event Handlers: Mouse Drag for Orbit Controls ===

	function onMouseDown(event: MouseEvent) {
		isDragging = true;
		previousMousePos.x = event.clientX;
		previousMousePos.y = event.clientY;
	}

	function onMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		const deltaX = event.clientX - previousMousePos.x;
		const deltaY = event.clientY - previousMousePos.y;

		previousMousePos.x = event.clientX;
		previousMousePos.y = event.clientY;

		// Convert camera position to spherical coordinates relative to origin
		const offset = new THREE.Vector3().copy(camera.position);
		const spherical = new THREE.Spherical().setFromVector3(offset);

		// Adjust angles by mouse movement with sensitivity
		spherical.theta -= deltaX * orbitSensitivity;
		spherical.phi -= deltaY * orbitSensitivity;

		// Clamp vertical angle to avoid flipping
		const EPS = 0.01;
		spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.phi));

		// Convert back to Cartesian coordinates
		offset.setFromSpherical(spherical);

		camera.position.copy(offset);
		camera.lookAt(0, 0, 0);
	}

	function onMouseUp() {
		isDragging = false;
	}

	// === Initialization & Scene Setup ===

	onMount(() => {
		// Scene and camera setup
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		root = new THREE.Group();
		scene.add(root);

		// Geometry for cube faces
		const geom = new THREE.PlaneGeometry(faceSize, faceSize);

		// Helper: Create a hinge marker sphere (unused but available)
		function createHingeMarker() {
			const geometry = new THREE.SphereGeometry(0.05, 12, 12);
			const material = new THREE.MeshBasicMaterial({ color: 'yellow' });
			return new THREE.Mesh(geometry, material);
		}

		// Helper: Add a canvas-based text label texture to a mesh
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
			const material = mesh.material as THREE.MeshBasicMaterial;
			material.map = texture;
			material.needsUpdate = true;
		}

		// Helper: Create a colored face mesh with label
		function makeFace(color: string, label: string) {
			const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
			const mesh = new THREE.Mesh(geom, mat);
			addLabel(mesh, label);
			return mesh;
		}

		// === Face Data Definitions ===

		interface FaceData {
			name: FaceName;
			color: string;
			label: string;
			pivotPosition: THREE.Vector3;
			facePosition: THREE.Vector3;
			faceRotation: THREE.Euler;
			parent: THREE.Group | null;
		}

		// Bottom face is fixed, not unfolded
		const bottomFaceData = {
			color: '#cccccc',
			label: 'bottom',
			rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
			position: new THREE.Vector3(0, -0.5, 0),
			parent: root
		};

		const facesData: FaceData[] = [
			{
				name: 'front',
				color: '#a0c4ff', // pastel blue
				label: 'front',
				pivotPosition: new THREE.Vector3(0, -0.5, 0.5),
				facePosition: new THREE.Vector3(0, 0.5, 0),
				faceRotation: new THREE.Euler(0, 0, 0),
				parent: root
			},
			{
				name: 'back',
				color: '#d0e7ff', // very light pastel blue
				label: 'back',
				pivotPosition: new THREE.Vector3(0, -0.5, -0.5),
				facePosition: new THREE.Vector3(0, 0.5, 0),
				faceRotation: new THREE.Euler(0, Math.PI, 0),
				parent: root
			},
			{
				name: 'left',
				color: '#ff9a9a', // pastel red / light pink
				label: 'left',
				pivotPosition: new THREE.Vector3(-0.5, -0.5, 0),
				facePosition: new THREE.Vector3(0, 0.5, 0),
				faceRotation: new THREE.Euler(0, Math.PI / 2, 0),
				parent: root
			},
			{
				name: 'right',
				color: '#ffd6d6', // very light pastel pink
				label: 'right',
				pivotPosition: new THREE.Vector3(0.5, -0.5, 0),
				facePosition: new THREE.Vector3(0, 0.5, 0),
				faceRotation: new THREE.Euler(0, -Math.PI / 2, 0),
				parent: root
			},
			{
				name: 'top',
				color: '#b9f6ca', // pastel green
				label: 'top',
				pivotPosition: new THREE.Vector3(0, 1.0, 0),
				facePosition: new THREE.Vector3(0, 0, 0.5),
				faceRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
				parent: null // assigned dynamically later to back pivot
			}
		];

		// === Create Bottom Face (Fixed) ===

		const bottomGeom = new THREE.PlaneGeometry(faceSize, faceSize);
		const bottomMat = new THREE.MeshBasicMaterial({
			color: bottomFaceData.color,
			side: THREE.DoubleSide
		});
		const bottomMesh = new THREE.Mesh(bottomGeom, bottomMat);
		addLabel(bottomMesh, bottomFaceData.label);
		bottomMesh.rotation.copy(bottomFaceData.rotation);
		bottomMesh.position.copy(bottomFaceData.position);
		bottomFaceData.parent.add(bottomMesh);

		// === Create Faces with Hinge Pivots ===

		for (const face of facesData) {
			const pivot = new THREE.Group();
			pivot.position.copy(face.pivotPosition);
			// pivot.add(createHingeMarker()); // Uncomment for debugging hinge points

			const mesh = makeFace(face.color, face.label);
			mesh.position.copy(face.facePosition);
			mesh.rotation.copy(face.faceRotation);

			pivot.add(mesh);

			// Attach top face pivot to back face pivot, else directly to parent/root
			if (face.name === 'top') {
				if (pivots.back) {
					pivots.back.add(pivot);
				} else {
					root.add(pivot);
				}
			} else {
				(face.parent ?? root).add(pivot);
			}

			if (face.name !== 'bottom') {
				pivots[face.name] = pivot;
			}
		}

		// === Window & Input Event Listeners ===

		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});

		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		animate();
	});

	// === Animation Loop ===

	function animate() {
		requestAnimationFrame(animate);

		// Slowly rotate cube when folded
		if (!unfolded) {
			root.rotation.y += 0.01;
			root.rotation.x += 0.004;
		}

		// Start unfolding animation when unfolded flag is true
		if (unfolded && !unfolding) {
			unfolding = true;
			unfoldTimer = 0;
		}

		// Reset animation when folding back
		if (!unfolded && unfolding) {
			unfolding = false;
			faceOrder.forEach((name) => {
				rotationTargets[name] = 0;
				unfoldProgress[name] = 0;
			});
		}

		// Animate unfolding progress
		if (unfolding) {
			unfoldTimer++;
			const progress = Math.min(unfoldTimer / 40, 1);

			faceOrder.forEach((name) => {
				unfoldProgress[name] = progress;

				// Top face folds differently
				if (name === 'top') {
					rotationTargets[name] = -(Math.PI / 2) * easeInOutQuad(progress);
				} else {
					rotationTargets[name] = (Math.PI / 2) * easeInOutQuad(progress);
				}
			});
		}

		// Apply rotations to pivots for unfolding effect

		pivots.front.rotation.x = rotationTargets.front;
		pivots.back.rotation.x = -rotationTargets.back;
		pivots.left.rotation.z = rotationTargets.left;
		pivots.right.rotation.z = -rotationTargets.right;
		pivots.top.rotation.x = rotationTargets.top;

		renderer.render(scene, camera);
	}

	// === Pointer Event Handlers for Unfold Trigger ===

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

<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Viewport of the origami page: a fold model ($lib/origami/foldFormat, built by foldModel)
	// on the ground, folded to `progress` (0 = flat sheet, k = the first k steps done). A new
	// model is built when `model` changes, and the camera is framed on it (flat and folded) --
	// that framing is also the gizmo's reset view. `labels` writes each face's name on both
	// sides, `colors` gives every face a Blender-style random colour (off: plain grey). The
	// page places its overlays (toolbar, step bar) inside through `children`.
	import { onMount, untrack, type Snippet } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import { applyThemeColors, createGrid, disposeGrid, labelTexture } from '$lib/three/sceneHelpers';
	import { theme } from '$lib/ColorTheme.svelte';
	import { NEUTRAL_COLOR, randomColor } from '$lib/origami/cubeNet';
	import { buildFoldNet, setProgress, type FoldNet } from '$lib/origami/foldModel';
	import type { FoldModel } from '$lib/origami/foldFormat';

	let {
		model,
		progress = 0,
		labels = true,
		colors = true,
		children
	}: {
		model: FoldModel;
		progress?: number;
		labels?: boolean;
		colors?: boolean;
		children?: Snippet;
	} = $props();

	let viewport: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let view = $state<ViewController>();

	// the built model and its per-face materials / label textures (rebuilt with the model)
	let net = $state<FoldNet>();
	let materials: Record<
		string,
		{ front: THREE.MeshStandardMaterial; back: THREE.MeshStandardMaterial }
	> = {};
	let textures: Record<string, THREE.CanvasTexture> = {};
	let scene: THREE.Scene | undefined;

	// the back of the sheet (the outside of a folded solid) is a darker shade of the face's
	// colour, so a wall seen from outside reads as a wall, not as a missing face
	const BACK_SHADE = 0.55;

	function styleFaces(showLabels: boolean, showColors: boolean) {
		for (const [name, pair] of Object.entries(materials)) {
			const colour = showColors ? randomColor(name) : NEUTRAL_COLOR;
			pair.front.color.copy(colour);
			pair.back.color.copy(colour).multiplyScalar(BACK_SHADE);
			for (const material of [pair.front, pair.back]) {
				material.map = showLabels ? textures[name] : null;
				material.needsUpdate = true; // a map added or removed changes the shader
			}
		}
	}

	function disposeNet() {
		if (!net || !scene) return;
		scene.remove(net.root);
		net.root.traverse((obj) => {
			(obj as THREE.Mesh).geometry?.dispose();
			if (obj instanceof THREE.LineLoop) (obj.material as THREE.Material).dispose();
		});
		for (const pair of Object.values(materials)) {
			pair.front.dispose();
			pair.back.dispose();
		}
		for (const texture of Object.values(textures)) texture.dispose();
		materials = {};
		textures = {};
		net = undefined;
	}

	/** Builds the model, centres it on the origin and frames the camera on flat + folded. */
	function show(next: FoldModel) {
		if (!scene || !view) return;
		disposeNet();
		for (const name of Object.keys(next.faces)) {
			textures[name] = labelTexture(name);
			materials[name] = {
				front: new THREE.MeshStandardMaterial({ roughness: 0.85 }),
				back: new THREE.MeshStandardMaterial({ roughness: 0.85 })
			};
		}
		const built = buildFoldNet(next, (name) => materials[name]);

		// the space it needs: flat and folded together, so neither leaves the view
		const box = new THREE.Box3().setFromObject(built.root);
		setProgress(built, built.steps);
		built.root.updateMatrixWorld(true);
		box.union(new THREE.Box3().setFromObject(built.root));
		const centre = box.getCenter(new THREE.Vector3());
		built.root.position.set(-centre.x, 0, -centre.z); // centred over the origin, on the ground
		setProgress(built, progress);

		scene.add(built.root);
		net = built;
		styleFaces(labels, colors);

		const size = box.getSize(new THREE.Vector3()).length();
		const target = new THREE.Vector3(0, (box.max.y - box.min.y) / 3, 0);
		view.controls.target.copy(target);
		view.camera.position.copy(target).add(new THREE.Vector3(0.55, 0.65, 0.75).multiplyScalar(size));
		view.controls.update();
		view.setHome();
	}

	$effect(() => styleFaces(labels, colors));
	$effect(() => {
		if (net) setProgress(net, progress);
	});
	$effect(() => {
		// only a new model (or the scene becoming ready) rebuilds; show() also reads progress
		// and the toggles, which must not rebuild the model on every move of the bar
		const next = model;
		if (view) untrack(() => show(next));
	});

	onMount(() => {
		const width = () => Math.max(1, viewport.clientWidth);
		const height = () => Math.max(1, viewport.clientHeight);

		scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.05, 500);
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width(), height());

		const controls = new OrbitControls(camera, renderer.domElement);
		const grid = createGrid(10);
		grid.position.y = -0.001; // just under the sheet, so the sheet never flickers with it
		const sun = new THREE.DirectionalLight(0xffffff, 1.8);
		sun.position.set(3, 8, 4);
		scene.add(grid, new THREE.HemisphereLight(0xffffff, 0x444444, 1.4), sun);
		const unsubscribeTheme = theme.themeStore.subscribe(() => applyThemeColors(scene!));

		const views = new ViewController(camera, controls, { ortho: true });
		view = views; // the $effect above builds the model now

		const resizeObserver = new ResizeObserver(() => {
			renderer.setSize(width(), height());
			views.resize(width(), height());
		});
		resizeObserver.observe(viewport);

		let frame = 0;
		function animate() {
			frame = requestAnimationFrame(animate);
			views.update();
			controls.update();
			renderer.render(scene!, views.camera);
		}
		animate();

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			unsubscribeTheme();
			disposeNet();
			views.dispose();
			view = undefined;
			controls.dispose();
			disposeGrid(grid);
			renderer.dispose();
		};
	});
</script>

<div class="viewport" bind:this={viewport}>
	<canvas bind:this={canvas}></canvas>
	{#if view}<ViewGizmo controller={view} />{/if}
	<!-- overlays from the page (toolbar, step bar, messages) -->
	{@render children?.()}
</div>

<style>
	.viewport {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	canvas {
		display: block;
	}
	canvas:active {
		cursor: grabbing;
	}
</style>

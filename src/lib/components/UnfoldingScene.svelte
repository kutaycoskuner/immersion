<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-20), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Viewport of the unfolding cube page (the reference for the coming origami page):
	//   - any input (mouse movement, click, wheel, key) stops the cube; after 4 s without input
	//     the closed cube turns slowly by itself again (the unfolded net never turns)
	//   - the camera controls always work (drag orbit, wheel zoom, right drag pan, the gizmo
	//     and its keys)
	//   - click (without dragging): the cube unfolds into its flat net, or folds back
	// `labels` writes each face's name on it, `colors` gives every face a Blender-style random
	// colour (off: Blender's solid grey); `open` is the folded state, bindable so the page's
	// toolbar and the click share it. The cube's geometry and folding is $lib/origami/cubeNet.
	// Replaces ThreeUnfolding.svelte, which unfolded on hover and had its own mouse orbit.
	import { onMount, type Snippet } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import { applyThemeColors, createGrid, disposeGrid, labelTexture } from '$lib/three/sceneHelpers';
	import { theme } from '$lib/ColorTheme.svelte';
	import {
		FACES,
		NEUTRAL_COLOR,
		buildCubeNet,
		randomColor,
		setFold,
		type CubeNet,
		type FaceName
	} from '$lib/origami/cubeNet';

	let {
		labels = true,
		colors = true,
		open = $bindable(false),
		children
	}: { labels?: boolean; colors?: boolean; open?: boolean; children?: Snippet } = $props();

	const SPIN_SPEED = 0.5; // rad/s while idle
	const IDLE_SECONDS = 4; // without input this long, the cube starts turning
	const FOLD_SECONDS = 0.8; // closed <-> flat
	const CLICK_SLOP = 4; // px a press may move and still count as a click, not a drag
	const EDGE_COLOR = '#1b1b1b';

	let viewport: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let view = $state<ViewController>();

	// set in onMount; the $effects below re-style the faces when the toggles change
	let net: CubeNet | undefined;
	const materials = {} as Record<FaceName, THREE.MeshStandardMaterial>;
	const labelTextures = {} as Record<FaceName, THREE.CanvasTexture>;

	function styleFaces(showLabels: boolean, showColors: boolean) {
		for (const { name } of FACES) {
			const material = materials[name];
			if (!material) continue;
			material.color.copy(showColors ? randomColor(name) : NEUTRAL_COLOR);
			material.map = showLabels ? labelTextures[name] : null;
			material.needsUpdate = true; // a map added or removed changes the shader
		}
	}

	$effect(() => styleFaces(labels, colors));

	onMount(() => {
		const width = () => Math.max(1, viewport.clientWidth);
		const height = () => Math.max(1, viewport.clientHeight);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.05, 200);
		camera.position.set(2.6, 2.2, 3.2);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width(), height());

		const controls = new OrbitControls(camera, renderer.domElement);
		const views = new ViewController(camera, controls, { ortho: true });
		view = views;

		// any input counts as activity: the cube stops, and turns again after IDLE_SECONDS
		let lastInput = -Infinity; // idle from the start: the cube turns until you move
		const onInput = () => (lastInput = performance.now());
		const INPUTS = ['pointermove', 'pointerdown', 'wheel', 'keydown'] as const;
		for (const type of INPUTS) window.addEventListener(type, onInput, { passive: true });

		const grid = createGrid(6);
		grid.position.y = -0.501; // the cube stands on it (just above, so no flicker)
		const sun = new THREE.DirectionalLight(0xffffff, 1.8);
		sun.position.set(3, 6, 4);
		scene.add(grid, new THREE.HemisphereLight(0xffffff, 0x444444, 1.4), sun);

		for (const { name } of FACES) {
			labelTextures[name] = labelTexture(name);
			// single-sided: each face has a back-to-back inside plane (cubeNet), so the label
			// reads the right way from both sides instead of mirrored
			materials[name] = new THREE.MeshStandardMaterial({ roughness: 0.85 });
		}
		net = buildCubeNet((name) => materials[name]);
		for (const mesh of Object.values(net.faces)) {
			const edges = new THREE.LineSegments(
				new THREE.EdgesGeometry(mesh.geometry),
				new THREE.LineBasicMaterial({ color: EDGE_COLOR })
			);
			mesh.add(edges);
		}
		scene.add(net.root);
		styleFaces(labels, colors);

		const unsubscribeTheme = theme.themeStore.subscribe(() => applyThemeColors(scene));

		const resizeObserver = new ResizeObserver(() => {
			renderer.setSize(width(), height());
			views.resize(width(), height());
		});
		resizeObserver.observe(viewport);

		// a click (not a drag) on the canvas unfolds / folds
		let press: { x: number; y: number } | undefined;
		const onDown = (e: PointerEvent) => (press = { x: e.clientX, y: e.clientY });
		const onUp = (e: PointerEvent) => {
			if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) < CLICK_SLOP) open = !open;
			press = undefined;
		};
		canvas.addEventListener('pointerdown', onDown);
		canvas.addEventListener('pointerup', onUp);

		let fold = open ? 1 : 0; // animated towards open
		let last = performance.now();
		let frame = 0;
		function animate(now: number) {
			frame = requestAnimationFrame(animate);
			const dt = Math.min(0.1, (now - last) / 1000); // a background tab must not jump
			last = now;

			// idle spin: only the closed cube, never the net (unfolded or unfolding)
			if (!open && now - lastInput > IDLE_SECONDS * 1000) net!.root.rotation.y += SPIN_SPEED * dt;
			const target = open ? 1 : 0;
			if (fold !== target) {
				const step = dt / FOLD_SECONDS;
				fold = target > fold ? Math.min(target, fold + step) : Math.max(target, fold - step);
				setFold(net!, fold);
			}

			views.update();
			controls.update();
			renderer.render(scene, views.camera);
		}
		setFold(net, fold);
		frame = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			unsubscribeTheme();
			canvas.removeEventListener('pointerdown', onDown);
			canvas.removeEventListener('pointerup', onUp);
			for (const type of INPUTS) window.removeEventListener(type, onInput);
			views.dispose();
			view = undefined;
			controls.dispose();
			net!.root.traverse((obj) => {
				(obj as THREE.Mesh).geometry?.dispose();
				if (obj instanceof THREE.LineSegments) (obj.material as THREE.Material).dispose();
			});
			for (const { name } of FACES) {
				materials[name].dispose();
				labelTextures[name].dispose();
			}
			disposeGrid(grid);
			renderer.dispose();
		};
	});
</script>

<div class="viewport" bind:this={viewport}>
	<canvas bind:this={canvas}></canvas>
	{#if view}<ViewGizmo controller={view} />{/if}
	<!-- overlays from the page (the toolbar) -->
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
		cursor: pointer; /* a click unfolds */
	}
	canvas:active {
		cursor: grabbing;
	}
</style>

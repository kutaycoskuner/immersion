<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-19
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// 3d viewport of the transformations page: a cube at the origin moved by exactly the matrix
	// the page shows -- M(t) from $lib/transformMath is copied into the cube's matrix (no
	// position / rotation properties), so what is written is what is drawn. At t > 0 the
	// starting cube stays as a faint outline, and the typed point p is marked at both ends
	// with a dashed line for its path. Follows TRANSLATION, POINT and STAGE ($lib/stores/transform)
	// live. Fills its area (Area.svelte); gizmo, keys and the orthographic switch through a
	// ViewController.
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import { applyThemeColors, clearGroup, createGrid, disposeGrid } from '$lib/three/sceneHelpers';
	import { theme } from '$lib/ColorTheme.svelte';
	import { apply, flat, translation } from '$lib/transformMath';
	import {
		CUBE_SIZE,
		POINT,
		POINT_COLOR,
		STAGE,
		TRANSLATION,
		homogeneous
	} from '$lib/stores/transform';

	const CUBE_COLOR = '#4f7cac';
	const EDGE_COLOR = '#d9e6f2';

	let viewport: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let view: ViewController | undefined; // set in onMount, read by the gizmo

	type Matrix4Args = Parameters<THREE.Matrix4['set']>;

	function makeCube(): THREE.Mesh {
		const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
		const cube = new THREE.Mesh(
			geometry,
			new THREE.MeshStandardMaterial({ color: CUBE_COLOR, roughness: 0.8 })
		);
		cube.add(
			new THREE.LineSegments(
				new THREE.EdgesGeometry(geometry),
				new THREE.LineBasicMaterial({ color: EDGE_COLOR })
			)
		);
		// the page's matrix is the whole transform: three.js must not rebuild it from
		// position / rotation / scale every frame
		cube.matrixAutoUpdate = false;
		return cube;
	}

	function dot(position: THREE.Vector3, opacity = 1): THREE.Mesh {
		const mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.09, 16, 12),
			new THREE.MeshBasicMaterial({ color: POINT_COLOR, transparent: opacity < 1, opacity })
		);
		mesh.position.copy(position);
		return mesh;
	}

	onMount(() => {
		const width = () => Math.max(1, viewport.clientWidth);
		const height = () => Math.max(1, viewport.clientHeight);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(50, width() / height(), 0.1, 1000);
		camera.position.set(7, 6, 11);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width(), height());

		const controls = new OrbitControls(camera, renderer.domElement);
		const views = new ViewController(camera, controls, { ortho: true });
		view = views;

		const grid = createGrid();
		const sun = new THREE.DirectionalLight(0xffffff, 1.6);
		sun.position.set(4, 8, 6);
		scene.add(grid, new THREE.AmbientLight(0xffffff, 0.6), sun);

		const cube = makeCube();
		scene.add(cube);

		// the starting cube as an outline and the typed point's path; rebuilt on change
		const helpers = new THREE.Group();
		scene.add(helpers);

		// the typed values; each store writes its part and redraws
		const state = { offset: get(TRANSLATION), point: get(POINT), t: get(STAGE) };

		function update() {
			const m = translation(state.offset, state.t);
			cube.matrix.set(...(flat(m) as Matrix4Args));
			cube.matrixWorldNeedsUpdate = true;

			clearGroup(helpers);
			const start = new THREE.Vector3(state.point.x, state.point.y, state.point.z);
			const [x, y, z] = apply(m, homogeneous(state.point));
			const end = new THREE.Vector3(x, y, z);
			helpers.add(dot(end));
			if (end.distanceToSquared(start) === 0) return; // not moved: nothing to compare with

			const box = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
			const ghost = new THREE.LineSegments(
				new THREE.EdgesGeometry(box),
				new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: 0.25 })
			);
			box.dispose(); // only its edges are kept
			helpers.add(ghost, dot(start, 0.4));

			const path = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([start, end]),
				new THREE.LineDashedMaterial({ color: POINT_COLOR, dashSize: 0.15, gapSize: 0.1 })
			);
			path.computeLineDistances();
			helpers.add(path);
		}

		// subscribe calls each handler once right away, which draws the first state
		const unsubscribers = [
			TRANSLATION.subscribe((o) => ((state.offset = o), update())),
			POINT.subscribe((point) => ((state.point = point), update())),
			STAGE.subscribe((t) => ((state.t = t), update())),
			theme.themeStore.subscribe(() => applyThemeColors(scene))
		];

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
			renderer.render(scene, views.camera);
		}
		animate();

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			for (const unsubscribe of unsubscribers) unsubscribe();
			views.dispose();
			view = undefined;
			controls.dispose();
			clearGroup(helpers);
			cube.traverse((obj) => {
				const mesh = obj as THREE.Mesh;
				mesh.geometry?.dispose();
				(mesh.material as THREE.Material | undefined)?.dispose();
			});
			disposeGrid(grid);
			renderer.dispose();
		};
	});
</script>

<div class="viewport" bind:this={viewport}>
	<canvas bind:this={canvas}></canvas>
	{#if view}<ViewGizmo controller={view} />{/if}
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
</style>

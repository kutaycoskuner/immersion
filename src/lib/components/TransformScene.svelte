<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// 3d viewport of the transformations and spaces pages: a cube at the origin transformed by
	// exactly the matrix the page shows -- M(t) of the chosen kind ($lib/transformKinds:
	// translation, scaling, rotation, local -> world, the projections) is copied into the
	// cube's matrix (no position / scale / rotation properties), so what is written is what is
	// drawn. Once M(t) is not the identity the starting cube stays as a faint outline, and the
	// typed point p is marked at both ends with a dashed path through every stage from 0 to t
	// (a line, or an arc when something turns). Local -> world also shows the cube's own axes
	// (riding on it) and the world's; the projections show the screen z = 0 and, for
	// perspective, the eye with its ray.
	// Follows KIND, every kind's values, POINT and STAGE ($lib/stores/transform) live. Fills
	// its area (Area.svelte); gizmo, keys and the orthographic switch through a ViewController.
	import { onMount } from 'svelte';
	import type { Vec3 } from '$lib/vectorMath';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import { applyThemeColors, clearGroup, createGrid, disposeGrid } from '$lib/three/sceneHelpers';
	import { theme } from '$lib/ColorTheme.svelte';
	import { applyPoint, flat, identity, type Mat4 } from '$lib/transformMath';
	import { KINDS, kindById } from '$lib/transformKinds';
	import {
		CUBE_SIZE,
		KIND,
		POINT,
		POINT_COLOR,
		STAGE,
		homogeneous,
		type KindId
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

	function dot(position: THREE.Vector3, opacity = 1, color: string = POINT_COLOR): THREE.Mesh {
		const mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.09, 16, 12),
			new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity })
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

		// local -> world: the cube's own axes ride on it (children follow its matrix, so they
		// move, turn and stretch with M), the world's axes stay at the origin, fainter
		const localAxes = new THREE.AxesHelper(1.7);
		cube.add(localAxes);
		const worldAxes = new THREE.AxesHelper(3);
		(worldAxes.material as THREE.LineBasicMaterial).transparent = true;
		(worldAxes.material as THREE.LineBasicMaterial).opacity = 0.35;
		scene.add(worldAxes);

		// the starting cube as an outline and the typed point's path; rebuilt on change
		const helpers = new THREE.Group();
		scene.add(helpers);

		// the typed values; each store writes its part and redraws
		const state = {
			kind: get(KIND),
			// each kind's own values: a Vec3, or a Placement for local -> world
			values: {} as Partial<Record<KindId, unknown>>,
			point: get(POINT),
			t: get(STAGE)
		};
		const IDENTITY = flat(identity());

		const PATH_SEGMENTS = 48;

		const NO_VALUES: Vec3 = { x: 0, y: 0, z: 0 };
		const SCREEN_SIZE = 7; // the projection plane z = 0 drawn as a square this wide

		/** M(t) of the chosen transformation (identity for one that isn't ready yet); a kind
		 *  with nothing to type (orthographic) gets zeros. */
		function stageMatrix(t = state.t): Mat4 {
			const kind = kindById(state.kind);
			if (!kind.matrix) return identity();
			if (kind.values && !state.values[kind.id]) return identity(); // not subscribed yet
			return kind.matrix(state.values[kind.id] ?? NO_VALUES, t);
		}

		/** A projection's own helpers: the screen it projects onto (the plane z = 0) and, for
		 *  perspective, the eye with a faint ray from it through the point to the screen. */
		function addProjectionHelpers() {
			const kind = kindById(state.kind);
			if (kind.group !== '3d-2d') return;
			const screen = new THREE.Mesh(
				new THREE.PlaneGeometry(SCREEN_SIZE, SCREEN_SIZE),
				new THREE.MeshBasicMaterial({
					color: EDGE_COLOR,
					transparent: true,
					opacity: 0.08,
					side: THREE.DoubleSide,
					depthWrite: false
				})
			);
			const border = new THREE.LineSegments(
				new THREE.EdgesGeometry(new THREE.PlaneGeometry(SCREEN_SIZE, SCREEN_SIZE)),
				new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: 0.35 })
			);
			helpers.add(screen, border);
			if (!kind.divide) return;
			const d = ((state.values[kind.id] as Vec3 | undefined) ?? NO_VALUES).z; // perspective: eye distance
			const eye = new THREE.Vector3(0, 0, d);
			helpers.add(dot(eye, 1, '#ffffff'));
			const [x, y] = applyPoint(
				kind.matrix!(state.values[kind.id] ?? NO_VALUES, 1),
				homogeneous(state.point)
			);
			const ray = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([eye, new THREE.Vector3(x, y, 0)]),
				new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 })
			);
			helpers.add(ray);
		}

		/** Where the point is at every stage from 0 to t: a line for translation / scaling /
		 *  the projections, an arc for rotation (divided by w: perspective's points are
		 *  homogeneous). */
		function pathPoints(): THREE.Vector3[] {
			const p = homogeneous(state.point);
			return Array.from({ length: PATH_SEGMENTS + 1 }, (_, i) => {
				const [x, y, z] = applyPoint(stageMatrix((state.t * i) / PATH_SEGMENTS), p);
				return new THREE.Vector3(x, y, z);
			});
		}

		function update() {
			const m = stageMatrix();
			cube.matrix.set(...(flat(m) as Matrix4Args));
			cube.matrixWorldNeedsUpdate = true;

			clearGroup(helpers);
			addProjectionHelpers();
			localAxes.visible = worldAxes.visible = kindById(state.kind).group === '3d-3d';
			const start = new THREE.Vector3(state.point.x, state.point.y, state.point.z);
			const [x, y, z] = applyPoint(m, homogeneous(state.point));
			const end = new THREE.Vector3(x, y, z);
			helpers.add(dot(end));
			if (flat(m).every((v, k) => v === IDENTITY[k])) return; // unchanged: nothing to compare

			const box = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
			const ghost = new THREE.LineSegments(
				new THREE.EdgesGeometry(box),
				new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: 0.25 })
			);
			box.dispose(); // only its edges are kept
			helpers.add(ghost);
			if (end.distanceToSquared(start) === 0) return; // this point stays (e.g. a factor of 1)
			helpers.add(dot(start, 0.4));

			const path = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints(pathPoints()),
				new THREE.LineDashedMaterial({ color: POINT_COLOR, dashSize: 0.15, gapSize: 0.1 })
			);
			path.computeLineDistances();
			helpers.add(path);
		}

		// subscribe calls each handler once right away, which draws the first state
		const unsubscribers = [
			...KINDS.filter((kind) => kind.values).map((kind) =>
				kind.values!.subscribe((v) => ((state.values[kind.id] = v), update()))
			),
			KIND.subscribe((id) => ((state.kind = id), update())),
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
			worldAxes.dispose(); // the local axes went with the cube above
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

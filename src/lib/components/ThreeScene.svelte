<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// 3d scene of the vector page (src/routes/(app)/+page.svelte): a fading grid, two input
	// vectors with tips, ground references and coordinate labels, the angle between them, and
	// the product chosen in the Tweakpane tab:
	//   - Scalar Product: the scalar projection of v1 onto v2 and its projection line
	//   - Vector Product: v1 x v2 and the parallelogram whose area is its length
	// The sliders write STOREVECTOR1 / STOREVECTOR2 and the tab writes ACTIVE_PRODUCT
	// ($lib/stores/vectors), which the math overlay reads too.
	// The viewport gizmo (ViewGizmo.svelte, bottom right) and the view keys move the camera
	// through a ViewController, here with the orthographic switch, so the scene renders with
	// views.camera.
	// Each part of the scene lives in its own THREE.Group that is cleared and rebuilt on every
	// change; everything (loop, listeners, store subscriptions, pane, GPU resources) is released
	// when the page is left, otherwise every visit would add another render loop.
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { Pane } from 'tweakpane';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { applyThemeColors, clearGroup, createGrid, disposeGrid } from '$lib/three/sceneHelpers';
	import { helperColor, resultColors } from '$lib/config/config-vector_colors';
	import { modelStore } from '../../store/model_store';
	import { theme } from '$lib/ColorTheme.svelte';
	import { ACTIVE_PRODUCT, PRODUCTS, STOREVECTOR1, STOREVECTOR2 } from '$lib/stores/vectors';
	import type { Vec3 } from '$lib/vectorMath';

	//				settings
	//  --------------------------------------------------------------------------------------
	const VECTOR_SCALE = 5; // a unit vector is drawn 5 grid squares long
	const ARC_RADIUS = 1.5;
	const LABEL_OFFSET = 0.6;
	const MOVE_SPEED = 0.1; // WASD camera movement per frame

	let canvas: HTMLCanvasElement;
	let viewport: HTMLDivElement; // the scene fills this box (an area of the page), not the window
	let paneHost: HTMLDivElement; // the Tweakpane controls sit in the viewport's top-right corner
	let view: ViewController | undefined; // camera moves of the gizmo and the view keys (set in onMount)

	//				drawing helpers (pure: they build objects, the caller adds them)
	//  --------------------------------------------------------------------------------------
	function toThree(v: Vec3): THREE.Vector3 {
		return new THREE.Vector3(v.x, v.y, v.z);
	}

	function createTextSprite(message: string, color = 'white', fontSize = 64): THREE.Sprite {
		const textCanvas = document.createElement('canvas');
		textCanvas.width = 512;
		textCanvas.height = 256;
		const context = textCanvas.getContext('2d')!;
		context.font = `${fontSize}px Arial`;
		context.fillStyle = color;
		context.textAlign = 'center';
		context.fillText(message, textCanvas.width / 2, textCanvas.height / 2 + fontSize / 2);

		const material = new THREE.SpriteMaterial({
			map: new THREE.CanvasTexture(textCanvas),
			transparent: true,
			// the canvas is mostly empty; writing depth for it would cut a label-sized hole
			// into the transparent parallelogram behind (it then fails the depth test there)
			depthWrite: false
		});
		const sprite = new THREE.Sprite(material);
		sprite.scale.set(2, 1, 1); // the canvas' 2:1 ratio
		return sprite;
	}

	function dashedLine(start: THREE.Vector3, end: THREE.Vector3, color: THREE.ColorRepresentation, opacity = 1) {
		const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
		const material = new THREE.LineDashedMaterial({
			color,
			dashSize: 0.1,
			gapSize: 0.05,
			transparent: opacity < 1,
			opacity
		});
		const line = new THREE.Line(geometry, material);
		line.computeLineDistances(); // dashed lines need the distances along the line
		return line;
	}

	/**
	 * An arrow from the origin to `end`: line, cone tip, dashed line down to the ground plane
	 * and a label beyond the tip.
	 *
	 * Args:
	 *   end: tip position in scene units (already multiplied by VECTOR_SCALE).
	 *   color: arrow colour.
	 *   label: label text; null shows the vector's own coordinates (in input units).
	 */
	function makeArrow(end: THREE.Vector3, color: THREE.Color, label: string | null): THREE.Group {
		const group = new THREE.Group();
		const length = end.length();
		if (length === 0) return group; // the zero vector has no direction to draw

		const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), end]);
		group.add(new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color })));

		// tip: 5% of the arrow's length, a 3-sided cone turned from +y onto the arrow
		const coneHeight = length * 0.05;
		const cone = new THREE.Mesh(
			new THREE.ConeGeometry(coneHeight * 0.2, coneHeight, 3),
			new THREE.MeshBasicMaterial({ color })
		);
		cone.position.copy(end);
		cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().normalize());
		group.add(cone);

		group.add(dashedLine(end, new THREE.Vector3(end.x, 0, end.z), 0x444444));

		const text =
			label ?? [end.x, end.y, end.z].map((c) => (c / VECTOR_SCALE).toFixed(2)).join(', ');
		const sprite = createTextSprite(text, helperColor);
		sprite.position.copy(end.clone().add(end.clone().normalize().multiplyScalar(LABEL_OFFSET)));
		group.add(sprite);
		return group;
	}

	/** The input vector's colour: its x, y, z read as r, g, b (negative parts stay dark). */
	function vectorColor(v: Vec3): THREE.Color {
		const clamp = (c: number) => Math.max(0, c);
		return new THREE.Color(clamp(v.x), clamp(v.y), clamp(v.z));
	}

	/** Arc between a and b (radius ARC_RADIUS) with the angle in degrees at its middle. */
	function drawAngle(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3) {
		const angle = a.angleTo(b);
		const normal = new THREE.Vector3().crossVectors(a, b);
		if (angle === 0 || isNaN(angle) || normal.lengthSq() === 0) return; // parallel or zero
		normal.normalize();

		const segments = 32;
		const points: THREE.Vector3[] = [];
		for (let i = 0; i <= segments; i++) {
			points.push(
				a.clone().applyAxisAngle(normal, (angle * i) / segments).normalize().multiplyScalar(ARC_RADIUS)
			);
		}
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		group.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: helperColor })));

		const middle = a.clone().applyAxisAngle(normal, angle / 2).normalize();
		const label = createTextSprite(`${THREE.MathUtils.radToDeg(angle).toFixed(1)}°`, helperColor);
		label.position.copy(middle.multiplyScalar(ARC_RADIUS + 0.3));
		group.add(label);
	}

	/** Scalar projection of a onto b (both normalized) and the dashed line from a's tip to it. */
	function drawDot(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3) {
		if (a.lengthSq() === 0 || b.lengthSq() === 0) return;
		const na = a.clone().normalize();
		const nb = b.clone().normalize();
		const projected = nb.clone().multiplyScalar(na.dot(nb) * VECTOR_SCALE);

		group.add(makeArrow(projected, new THREE.Color(resultColors.dot), 'Scalar Projection'));
		group.add(dashedLine(na.multiplyScalar(VECTOR_SCALE), projected, 0x39ff14, 0.1));
	}

	/** a x b as an arrow and the parallelogram a and b span (its area is the arrow's length). */
	function drawCross(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, showArea: boolean) {
		const color = new THREE.Color(resultColors.cross);
		const result = new THREE.Vector3().crossVectors(a, b);
		group.add(makeArrow(result.clone().multiplyScalar(VECTOR_SCALE), color, 'Cross Product'));
		if (!showArea || result.lengthSq() === 0) return;

		const sa = a.clone().multiplyScalar(VECTOR_SCALE);
		const sb = b.clone().multiplyScalar(VECTOR_SCALE);
		const corner = sa.clone().add(sb);
		const geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(), sa, corner,
			new THREE.Vector3(), corner, sb
		]);
		const material = new THREE.MeshBasicMaterial({
			color,
			transparent: true,
			opacity: 0.2,
			side: THREE.DoubleSide,
			depthWrite: false // so the vectors behind it stay visible
		});
		group.add(new THREE.Mesh(geometry, material));
		group.add(dashedLine(sa, corner, color, 0.5));
		group.add(dashedLine(sb, corner, color, 0.5));
	}

	//				scene
	//  --------------------------------------------------------------------------------------
	onMount(() => {
		const scene = new THREE.Scene();

		const width = () => Math.max(1, viewport.clientWidth);
		const height = () => Math.max(1, viewport.clientHeight);

		const camera = new THREE.PerspectiveCamera(75, width() / height(), 0.1, 1000);
		camera.position.set(0.0, 4.0, 16.0);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width(), height());

		const controls = new OrbitControls(camera, renderer.domElement);
		// the gizmo's views, drag orbit, keys and the orthographic switch (renders with views.camera)
		const views = new ViewController(camera, controls, { ortho: true });
		view = views;

		// grid and the x / z axes
		const gridGroup = createGrid();
		scene.add(gridGroup);

		// lights for imported models (the vectors use unlit materials)
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(10, 10, 10);
		scene.add(new THREE.AmbientLight(0xffffff, 0.3), directionalLight);

		// one group per part of the picture, rebuilt from the current state on every change
		const vectorsGroup = new THREE.Group();
		const angleGroup = new THREE.Group();
		const dotGroup = new THREE.Group();
		const crossGroup = new THREE.Group();
		scene.add(vectorsGroup, angleGroup, dotGroup, crossGroup);

		const options = { showProjection: true, showArea: true };
		let v1 = get(STOREVECTOR1);
		let v2 = get(STOREVECTOR2);
		let product = get(ACTIVE_PRODUCT);

		function redraw() {
			for (const group of [vectorsGroup, angleGroup, dotGroup, crossGroup]) clearGroup(group);
			const a = toThree(v1);
			const b = toThree(v2);
			vectorsGroup.add(
				makeArrow(a.clone().multiplyScalar(VECTOR_SCALE), vectorColor(v1), null),
				makeArrow(b.clone().multiplyScalar(VECTOR_SCALE), vectorColor(v2), null)
			);
			drawAngle(angleGroup, a, b);
			if (product === 'dot' && options.showProjection) drawDot(dotGroup, a, b);
			if (product === 'cross') drawCross(crossGroup, a, b, options.showArea);
		}

		// the grid follows the theme's text colour
		// the viewport takes the page background (the same as the description's frame) and the
		// grid the theme's text colour
		const updateThemeColors = () => applyThemeColors(scene);

		// a model loaded in the settings overlay is shown here too, with the camera on it
		let model: THREE.Object3D | null = null;
		function showModel(value: THREE.Object3D | null) {
			if (model) scene.remove(model);
			model = value;
			if (!model) return;
			scene.add(model);
			const box = new THREE.Box3().setFromObject(model);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);
			const fov = THREE.MathUtils.degToRad(camera.fov);
			const distance = Math.abs((maxDim / 2) * Math.tan(fov / 2)) * 1.5;
			views.camera.position.set(center.x, center.y, center.z + distance);
			controls.target.copy(center);
		}

		// subscribe calls each handler once right away, which draws the first frame's state
		const unsubscribers = [
			STOREVECTOR1.subscribe((v) => ((v1 = v), redraw())),
			STOREVECTOR2.subscribe((v) => ((v2 = v), redraw())),
			ACTIVE_PRODUCT.subscribe((p) => ((product = p), redraw())),
			theme.themeStore.subscribe(updateThemeColors),
			modelStore.subscribe(showModel)
		];

		//				ui
		//  ----------------------------------------------------------------------------------
		// the sliders start from the stores, so coming back to the page keeps the last vectors
		const paneVector1 = { ...v1 };
		const paneVector2 = { ...v2 };
		const pane = new Pane({ title: 'Controls', container: paneHost });
		for (const axis of ['x', 'y', 'z'] as const) {
			pane
				.addBinding(paneVector1, axis, { min: -1, max: 1, label: `Vec 1 ${axis.toUpperCase()}` })
				.on('change', () => STOREVECTOR1.set({ ...paneVector1 }));
		}
		for (const axis of ['x', 'y', 'z'] as const) {
			pane
				.addBinding(paneVector2, axis, { min: -1, max: 1, label: `Vec 2 ${axis.toUpperCase()}` })
				.on('change', () => STOREVECTOR2.set({ ...paneVector2 }));
		}

		// tab order = PRODUCTS order ($lib/stores/vectors)
		const tab = pane.addTab({ pages: [{ title: 'Scalar Product' }, { title: 'Vector Product' }] });
		tab.pages[PRODUCTS.indexOf(product)].selected = true;
		tab.on('select', (ev) => ACTIVE_PRODUCT.set(PRODUCTS[ev.index]));
		tab.pages[0]
			.addBinding(options, 'showProjection', { label: 'Projection' })
			.on('change', redraw);
		tab.pages[1].addBinding(options, 'showArea', { label: 'Parallelogram' }).on('change', redraw);

		//				input and loop
		//  ----------------------------------------------------------------------------------
		const keyStates: Record<string, boolean> = {};
		const onKeyDown = (event: KeyboardEvent) => {
			// typing a value into the pane must not move the camera
			if (event.target instanceof HTMLInputElement) return;
			keyStates[event.key.toLowerCase()] = true;
		};
		const onKeyUp = (event: KeyboardEvent) => (keyStates[event.key.toLowerCase()] = false);
		// follows the area's size: window resizes and dragging the divider between the areas
		const resizeObserver = new ResizeObserver(() => {
			renderer.setSize(width(), height());
			views.resize(width(), height());
		});
		resizeObserver.observe(viewport);
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		function moveCamera() {
			const camera = views.camera; // the active one, perspective or orthographic
			const forward = camera.getWorldDirection(new THREE.Vector3());
			const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
			if (keyStates['w']) camera.position.addScaledVector(forward, MOVE_SPEED);
			if (keyStates['s']) camera.position.addScaledVector(forward, -MOVE_SPEED);
			if (keyStates['a']) camera.position.addScaledVector(right, -MOVE_SPEED);
			if (keyStates['d']) camera.position.addScaledVector(right, MOVE_SPEED);
		}

		let frame = 0;
		function animate() {
			frame = requestAnimationFrame(animate);
			moveCamera();
			views.update();
			controls.update();
			renderer.render(scene, views.camera);
		}
		animate();

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			resizeObserver.disconnect();
			for (const unsubscribe of unsubscribers) unsubscribe();
			if (model) scene.remove(model); // the model belongs to the store, not to this scene
			pane.dispose();
			views.dispose();
			view = undefined;
			controls.dispose();
			for (const group of [vectorsGroup, angleGroup, dotGroup, crossGroup]) clearGroup(group);
			// grid lines: free their geometry only, the fading materials are shared module objects
			disposeGrid(gridGroup);
			renderer.dispose();
		};
	});
</script>

<div class="viewport" bind:this={viewport}>
	<canvas bind:this={canvas}></canvas>
	<div class="pane-host" bind:this={paneHost}></div>
	{#if view}<ViewGizmo controller={view} />{/if}
</div>

<style>
	/* fills its area; the gizmo and the pane are placed inside it, relative to this box */
	.viewport {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	canvas {
		display: block;
	}
	.pane-host {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 256px; /* Tweakpane's default width */
		max-width: calc(100% - 1rem);
		max-height: calc(100% - 1rem);
		/* only a short viewport scrolls the pane, vertically: a vertical scrollbar takes width
		   from the 256px, which made Tweakpane's rows overflow sideways and added a horizontal one */
		overflow-x: hidden;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
		z-index: 10;
	}
</style>

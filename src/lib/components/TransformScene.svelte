<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-25
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// 3d viewport of the transformations and spaces pages: a cube at the origin transformed by
	// exactly the matrix the page shows -- M(t) of the chosen kind ($lib/transformKinds:
	// translation, scaling, rotation, local -> world, world -> camera, the projections) is
	// copied into the cube's matrix (no position / scale / rotation properties), so what is
	// written is what is drawn. Once M(t) is not the identity the starting cube stays as a
	// faint outline, and the typed point p is marked at both ends with a dashed path through
	// every stage from 0 to t (a line, or an arc when something turns). 3D -> 3D also shows
	// the cube's own axes (riding on it), the world's, and a second, fixed box. World ->
	// camera adds the camera (a frame with its own axes and a faint line to its target) and
	// draws the whole world through V(t): every object with V(t) times its own placement, so
	// at t = 1 the camera stands at the origin looking down -z and the grid is camera space.
	// The projections onto z = 0 show that screen and, for perspective, the eye with its ray.
	// Camera -> clip and clip -> NDC take the scene as world -> camera left it (both boxes
	// through V, in camera space, plus two boxes the camera cannot show): the camera as its
	// frustum -- a see-through pyramid from the eye at the origin (with the camera's axes)
	// through near (the screen) to far, labelled -- the parts of the boxes inside it bright
	// and outside grey. Camera -> clip keeps it still (clip space is 4D, its bar changes only
	// numbers); clip -> NDC draws it through the squeeze S(t), divided by w by the GPU, so
	// the frustum becomes the cube -1..1, and adds a corner picture of what the camera sees
	// ($lib/three/clipSpaceView has the frustum parts).
	// Follows KIND, every kind's values, POINT, CAMERA_POINT (the frustum steps' point) and
	// STAGE ($lib/stores/transform) live. Fills its area (Area.svelte); gizmo, keys and the
	// orthographic switch through a ViewController.
	import { onMount } from 'svelte';
	import type { Vec3 } from '$lib/vectorMath';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import ViewGizmo from '$lib/components/ViewGizmo.svelte';
	import { ViewController } from '$lib/viewGizmo/viewController';
	import { applyThemeColors, clearGroup, createGrid, disposeGrid } from '$lib/three/sceneHelpers';
	import { theme } from '$lib/ColorTheme.svelte';
	import {
		divideClipping,
		frustumFill,
		frustumFrame,
		frustumLabels,
		frustumTip,
		insetCamera,
		insidePlanes,
		outsidePlanes
	} from '$lib/three/clipSpaceView';
	import { textSprite } from '$lib/three/textSprite';
	import {
		apply,
		applyPoint,
		cameraMatrix,
		flat,
		frustumHalfSizes,
		identity,
		modelMatrix,
		multiply,
		viewMatrix,
		type CameraLook,
		type Mat4,
		type Placement,
		type Vec4
	} from '$lib/transformMath';
	import { KINDS, kindById } from '$lib/transformKinds';
	import {
		CAMERA_COLOR,
		CAMERA_POINT,
		CLIP_HIDDEN,
		COMPANION_COLOR,
		COMPANION_PLACEMENT,
		CUBE_SIZE,
		PROJECTION_PLACEMENT,
		KIND,
		POINT,
		POINT_COLOR,
		STAGE,
		homogeneous,
		type KindId
	} from '$lib/stores/transform';

	const CUBE_COLOR = '#4f7cac';
	const EDGE_COLOR = '#d9e6f2';
	// axis lengths: an object's own axes, the world's, the camera's (their ghosts match them)
	const LOCAL_AXES = 1.7;
	const WORLD_AXES = 3;
	const CAMERA_AXES = 1.2;
	const OUTSIDE_COLOR = '#6b6b6b'; // camera -> clip: the part of a box the camera cannot see
	const OUTSIDE = 'outside'; // name of that grey twin
	// camera -> clip's corner picture: what the camera sees, bottom left, this share of the
	// viewport's smaller side
	const INSET_SHARE = 0.32;
	const INSET_MARGIN = 12;

	let viewport: HTMLDivElement;
	let inset = $state({ visible: false, size: 0 });
	let canvas: HTMLCanvasElement;
	let view = $state<ViewController | undefined>(); // set in onMount, read by the gizmo

	type Matrix4Args = Parameters<THREE.Matrix4['set']>;

	function makeCube(color: string = CUBE_COLOR): THREE.Mesh {
		const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
		const cube = new THREE.Mesh(
			geometry,
			new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
		);
		cube.add(
			new THREE.LineSegments(
				new THREE.EdgesGeometry(geometry),
				new THREE.LineBasicMaterial({ color: EDGE_COLOR })
			)
		);
		// camera -> clip: a grey twin shows the part outside the frustum, the box itself only
		// the part inside (setClipping); both test the drawn point, divided by w
		const outside = new THREE.Mesh(
			geometry,
			new THREE.MeshStandardMaterial({
				color: OUTSIDE_COLOR,
				roughness: 0.9,
				transparent: true,
				opacity: 0.55
			})
		);
		outside.name = OUTSIDE;
		outside.visible = false;
		cube.add(outside);
		divideClipping(cube.material as THREE.Material);
		divideClipping(outside.material);
		// the page's matrix is the whole transform: three.js must not rebuild it from
		// position / rotation / scale every frame
		cube.matrixAutoUpdate = false;
		return cube;
	}

	/** Camera -> clip: the box only inside the planes, its grey twin only outside them;
	 *  null: no clipping, the twin hidden (every other kind). */
	function setClipping(box: THREE.Mesh, planes: THREE.Plane[] | null) {
		(box.material as THREE.Material).clippingPlanes = planes;
		const outside = box.getObjectByName(OUTSIDE) as THREE.Mesh;
		const material = outside.material as THREE.Material;
		material.clippingPlanes = planes ? outsidePlanes(planes) : null;
		material.clipIntersection = true; // cut only what is inside all of them
		outside.visible = !!planes;
	}

	/** Sets every material of an object to the opacity o (the camera fading out). */
	function fade(object: THREE.Object3D, o: number) {
		object.traverse((obj) => {
			const material = (obj as THREE.Mesh).material as THREE.Material | undefined;
			if (!material) return;
			material.transparent = o < 1;
			material.opacity = o;
		});
	}

	/** A camera as a wire frame in its own space: the eye at the origin, a frustum opening
	 *  down -z (where it looks), a small triangle on top for its up; with its own axes. */
	function makeCamera(): THREE.Group {
		const group = new THREE.Group();
		group.add(cameraFrame(), new THREE.AxesHelper(CAMERA_AXES));
		group.matrixAutoUpdate = false;
		return group;
	}

	/** The camera's wire frame alone; faint (opacity < 1) for its ghost at the start. */
	function cameraFrame(opacity = 1): THREE.LineSegments {
		const [w, h, d] = [0.6, 0.4, 1.2];
		const corners = [
			[-w, -h],
			[w, -h],
			[w, h],
			[-w, h]
		].map(([x, y]) => new THREE.Vector3(x, y, -d));
		const eye = new THREE.Vector3(0, 0, 0);
		const points: THREE.Vector3[] = [];
		corners.forEach((c, i) => points.push(eye, c, c, corners[(i + 1) % 4]));
		const top = [
			new THREE.Vector3(-0.25, h + 0.1, -d),
			new THREE.Vector3(0.25, h + 0.1, -d),
			new THREE.Vector3(0, h + 0.4, -d)
		];
		top.forEach((p, i) => points.push(p, top[(i + 1) % 3]));
		return new THREE.LineSegments(
			new THREE.BufferGeometry().setFromPoints(points),
			new THREE.LineBasicMaterial({ color: CAMERA_COLOR, transparent: opacity < 1, opacity })
		);
	}

	/** Axes x, y, z of length `size` under the matrix m, grey and faint like a ghost box: where
	 *  a set of coloured axes started before it moved. */
	function ghostAxes(m: Mat4, size: number): THREE.LineSegments {
		const o = new THREE.Vector3();
		const axes = new THREE.LineSegments(
			new THREE.BufferGeometry().setFromPoints([
				o,
				new THREE.Vector3(size, 0, 0),
				o,
				new THREE.Vector3(0, size, 0),
				o,
				new THREE.Vector3(0, 0, size)
			]),
			new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: 0.3 })
		);
		axes.matrixAutoUpdate = false;
		place(axes, m);
		return axes;
	}

	/** A box's edges, faint: where a box started (or, in another colour, the clip cube). */
	function ghostBox(m: Mat4, color = EDGE_COLOR, opacity = 0.25): THREE.LineSegments {
		const box = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
		const ghost = new THREE.LineSegments(
			new THREE.EdgesGeometry(box),
			new THREE.LineBasicMaterial({ color, transparent: true, opacity })
		);
		box.dispose(); // only its edges are kept
		ghost.matrixAutoUpdate = false;
		place(ghost, m);
		return ghost;
	}

	/** Sets an object's whole transform to the page's matrix m. */
	function place(object: THREE.Object3D, m: Mat4) {
		object.matrix.set(...(flat(m) as Matrix4Args));
		object.matrixWorldNeedsUpdate = true;
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
		renderer.localClippingEnabled = true; // camera -> clip: inside / outside the frustum
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
		const localAxes = new THREE.AxesHelper(LOCAL_AXES);
		cube.add(localAxes);
		const worldAxes = new THREE.AxesHelper(WORLD_AXES);
		(worldAxes.material as THREE.LineBasicMaterial).transparent = true;
		(worldAxes.material as THREE.LineBasicMaterial).opacity = 0.35;
		worldAxes.matrixAutoUpdate = false; // world -> camera moves the world's axes too
		scene.add(worldAxes);

		// 3D -> 3D: a second object, placed by its own fixed model matrix, with its own local
		// axes -- the world is shared, every object brings its own local space
		const companion = makeCube(COMPANION_COLOR);
		const COMPANION_MATRIX = modelMatrix(COMPANION_PLACEMENT);
		const PROJECTION_MATRIX = modelMatrix(PROJECTION_PLACEMENT); // 3D -> 2D: turned 45° about y
		companion.add(new THREE.AxesHelper(LOCAL_AXES));
		scene.add(companion);

		// world -> camera: the camera, placed by its own matrix T(eye) R
		const viewCamera = makeCamera();
		scene.add(viewCamera);

		// the starting cube as an outline and the typed point's path; rebuilt on change
		const helpers = new THREE.Group();
		scene.add(helpers);

		// the typed values; each store writes its part and redraws
		const state = {
			kind: get(KIND),
			// each kind's own values: a Vec3, or a Placement for local -> world
			values: {} as Partial<Record<KindId, unknown>>,
			point: get(POINT),
			cameraPoint: get(CAMERA_POINT), // camera -> clip's point, in camera space
			t: get(STAGE)
		};
		const IDENTITY = flat(identity());

		const PATH_SEGMENTS = 48;

		const NO_VALUES: Vec3 = { x: 0, y: 0, z: 0 };
		const SCREEN_SIZE = 7; // the projection plane z = 0 drawn as a square this wide

		/** Orthographic and perspective (onto z = 0): the screen they project onto and, for
		 *  perspective, the eye with a faint ray from it through the point to the screen. */
		function addProjectionHelpers() {
			const kind = kindById(state.kind);
			if (kind.id !== 'orthographic' && kind.id !== 'perspective') return;
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
			const d = ((state.values[kind.id] as Vec3 | undefined) ?? NO_VALUES).z; // eye distance
			const eye = new THREE.Vector3(0, 0, d);
			helpers.add(dot(eye, 1, '#ffffff'));
			const [x, y] = applyPoint(
				kind.matrix!(state.values[kind.id] ?? NO_VALUES, 1),
				homogeneous(point())
			);
			const ray = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([eye, new THREE.Vector3(x, y, 0)]),
				new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 })
			);
			helpers.add(ray);
		}

		/** M(t) of the chosen transformation (identity for one that isn't ready yet); a kind
		 *  with nothing to type (orthographic) gets zeros. */
		function stageMatrix(t = state.t): Mat4 {
			const kind = kindById(state.kind);
			if (!kind.matrix) return identity();
			if (kind.values && !state.values[kind.id]) return identity(); // not subscribed yet
			// camera -> clip moves nothing: clip space is 4D, its bar changes only numbers
			if (kind.id === 'clip-space') return identity();
			// the bar's own stage when the kind has one (clip -> NDC: the squeeze only)
			return (kind.stage ?? kind.matrix)(state.values[kind.id] ?? NO_VALUES, t);
		}

		/** The stage the frustum view is drawn at: camera -> clip stays at 0 (nothing moves),
		 *  clip -> NDC follows the bar. */
		const shownT = () => (state.kind === 'clip-space' ? 0 : state.t);

		/** The point the chosen kind follows: camera -> clip's own (camera space) or POINT. */
		const point = (): Vec3 => (kindById(state.kind).point ? state.cameraPoint : state.point);

		/**
		 * Camera -> clip: the frustum (wire frame and see-through faces, the near face as the
		 * screen) drawn through M(t), so it squeezes into the cube -1..1 (the GPU divides by
		 * w, as the screen will), with its labels; the cube as a target that appears while
		 * the bar moves; once t > 0 the frustum's and both boxes' grey ghosts in camera space,
		 * where they started.
		 */
		function addClipHelpers(m: Mat4, values: Vec3, companionStart: Mat4, moved: boolean) {
			const frame = frustumFrame(values, CAMERA_COLOR);
			const fill = frustumFill(values, CAMERA_COLOR);
			place(frame, m);
			place(fill, m);
			helpers.add(frame, fill, ...frustumLabels(values, m, shownT(), CAMERA_COLOR));
			// the tip back to the eye, fading with the camera (the eye goes to infinity)
			if (shownT() < CAMERA_FADE_END) {
				const tip = frustumTip(values, CAMERA_COLOR, 0.45 * cameraOpacity());
				place(tip, m);
				helpers.add(tip);
			}
			if (!moved) return;
			const start = frustumFrame(values, CAMERA_COLOR, 0.25);
			place(start, identity());
			helpers.add(start, ghostBox(companionStart));
		}

		// camera -> clip: the boxes the camera cannot show (beyond far, behind the eye)
		const hidden = CLIP_HIDDEN.map((data) => {
			const mesh = makeCube(data.color);
			mesh.visible = false;
			scene.add(mesh);
			return { data, mesh, start: identity() };
		});

		/** Where a hidden box stands in camera space: beyond far follows the typed far. */
		function hiddenStart(data: (typeof CLIP_HIDDEN)[number], values: Vec3): Mat4 {
			const { f } = frustumHalfSizes(values);
			const z = data.fromFar ? -f + data.position.z : data.position.z;
			return modelMatrix({
				position: { ...data.position, z },
				rotation: { x: 0, y: data.turn, z: 0 },
				scale: { x: 1, y: 1, z: 1 }
			});
		}

		/** Whether every corner of a box at `start` keeps w > 0 under m -- drawable. Behind
		 *  the eye w turns negative during the squeeze; a GPU clips such points away, here
		 *  the box disappears and its ghost stays. */
		function drawable(m: Mat4, start: Mat4): boolean {
			const corners = [-1, 1].flatMap((x) =>
				[-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z, 1] as Vec4))
			);
			const both = multiply(m, start);
			return corners.every((c) => apply(both, c)[3] > 0.05);
		}

		/** Camera -> clip's hidden boxes under m: drawn (grey: outside) while they can be,
		 *  labelled at their camera-space place, with their ghosts once t > 0. */
		function updateHidden(m: Mat4, values: Vec3 | undefined, planes: THREE.Plane[] | null) {
			for (const box of hidden) {
				box.mesh.visible = !!values;
				if (!values) continue;
				box.start = hiddenStart(box.data, values);
				box.mesh.visible = drawable(m, box.start);
				place(box.mesh, multiply(m, box.start));
				setClipping(box.mesh, planes);
				const label = textSprite(box.data.label, box.data.color);
				const [x, y, z] = apply(box.start, [0, 1.6, 0, 1]);
				label.position.set(x, y, z);
				helpers.add(label);
				if (shownT() > 0) helpers.add(ghostBox(box.start));
			}
		}

		// camera -> clip: the eye goes to infinity during the squeeze, so the camera's axes and
		// the frustum's tip fade out by this stage
		const CAMERA_FADE_END = 0.4;
		const cameraOpacity = () => Math.max(0, 1 - shownT() / CAMERA_FADE_END);

		// the corner picture's camera and the point as it sees it (shown only for that picture)
		const camView = new THREE.PerspectiveCamera();
		const insetPoint = dot(new THREE.Vector3(), 1);
		insetPoint.visible = false;
		scene.add(insetPoint);
		// camera -> clip: both boxes in camera space, the state the corner picture shows
		const cameraSpace = { cube: identity(), companion: identity() };

		/**
		 * Camera -> clip's corner picture (bottom left): the scene in camera space -- before
		 * P -- seen through a camera with the typed fov, near and far, so it is exactly what
		 * the frustum holds. Only the boxes and the point; three.js' camera does the clipping.
		 */
		function renderInset() {
			const values = state.values['clip-space'] as Vec3 | undefined;
			if (!inset.visible || !values) return;
			const cam = insetCamera(values);
			camView.copy(cam);
			camView.updateProjectionMatrix();
			const boxes = [cube, companion, ...hidden.map((h) => h.mesh)];
			const saved = boxes.map((b) => b.matrix.clone());
			const others = [helpers, grid, viewCamera, worldAxes];
			const shown = [...boxes, ...others].map((o) => o.visible);
			place(cube, cameraSpace.cube);
			place(companion, cameraSpace.companion);
			// the hidden boxes too: the camera itself leaves them out, as it should
			for (const h of hidden) (place(h.mesh, h.start), (h.mesh.visible = true));
			for (const o of others) o.visible = false;
			for (const box of boxes) setClipping(box, null);
			insetPoint.visible = true;
			renderer.localClippingEnabled = false;

			const size = inset.size;
			renderer.setScissorTest(true);
			renderer.setScissor(INSET_MARGIN, INSET_MARGIN, size, size);
			renderer.setViewport(INSET_MARGIN, INSET_MARGIN, size, size);
			renderer.render(scene, camView);

			renderer.setScissorTest(false);
			renderer.setViewport(0, 0, width(), height());
			renderer.localClippingEnabled = true;
			insetPoint.visible = false;
			boxes.forEach((b, k) => b.matrix.copy(saved[k]));
			[...boxes, ...others].forEach((o, k) => (o.visible = shown[k]));
			for (const box of boxes) setClipping(box, clipPlanes);
		}
		let clipPlanes: THREE.Plane[] | null = null; // camera -> clip's frustum planes, drawn

		/** Where the point is at every stage from 0 to t: a line for translation / scaling /
		 *  the projections, an arc for rotation (divided by w: perspective's points are
		 *  homogeneous). */
		function pathPoints(p = homogeneous(point())): THREE.Vector3[] {
			return Array.from({ length: PATH_SEGMENTS + 1 }, (_, i) => {
				const [x, y, z] = applyPoint(stageMatrix((state.t * i) / PATH_SEGMENTS), p);
				return new THREE.Vector3(x, y, z);
			});
		}

		/** World -> camera: a faint line from the camera to its target, both moved by V(t). */
		function addLookLine(m: Mat4, look: CameraLook) {
			const [a, b] = [look.eye, look.target].map((p) => {
				const [x, y, z] = apply(m, homogeneous(p));
				return new THREE.Vector3(x, y, z);
			});
			helpers.add(
				new THREE.Line(
					new THREE.BufferGeometry().setFromPoints([a, b]),
					new THREE.LineBasicMaterial({ color: CAMERA_COLOR, transparent: true, opacity: 0.3 })
				),
				dot(b, 0.5, CAMERA_COLOR)
			);
		}

		/** A dashed path through every stage from 0 to t of a point p (homogeneous). */
		function dashedPath(p: [number, number, number, number], color: string, opacity = 1) {
			const path = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints(pathPoints(p)),
				new THREE.LineDashedMaterial({
					color,
					dashSize: 0.15,
					gapSize: 0.1,
					transparent: opacity < 1,
					opacity
				})
			);
			path.computeLineDistances();
			return path;
		}

		/**
		 * World -> camera: where everything started, to show the camera becoming the origin --
		 * the camera's ghost (frame and axes) and the orange box's ghost at their world places,
		 * the eye's dashed path from its world position to the origin (reached at t = 1), and
		 * a fainter one of the world's origin moving away.
		 */
		function addViewGhosts(look: CameraLook) {
			const start = cameraMatrix(look);
			const camera = cameraFrame(0.3);
			camera.matrixAutoUpdate = false;
			place(camera, start);
			const eye = homogeneous(look.eye);
			helpers.add(
				camera,
				ghostAxes(start, CAMERA_AXES),
				ghostAxes(identity(), WORLD_AXES),
				ghostBox(COMPANION_MATRIX),
				ghostAxes(COMPANION_MATRIX, LOCAL_AXES),
				dot(new THREE.Vector3(look.eye.x, look.eye.y, look.eye.z), 0.4, CAMERA_COLOR),
				dashedPath(eye, CAMERA_COLOR),
				dashedPath([0, 0, 0, 1], EDGE_COLOR, 0.35)
			);
		}

		function update() {
			const m = stageMatrix();
			const look = state.values['world-to-camera'] as CameraLook | undefined;
			const placement = state.values['local-to-world'] as Placement | undefined;
			// camera -> clip and clip -> NDC: the frustum view (also 3D -> 3D)
			const frustumKind = state.kind === 'clip-space' || state.kind === 'ndc';
			// local -> world and world -> camera
			const spaces3d = kindById(state.kind).group === '3d-3d' && !frustumKind;
			// the pipeline so far decides what M(t) is applied to: the transformations and
			// local -> world, the cube at the origin; world -> camera, every object at its world
			// place; camera -> clip and clip -> NDC, every object in camera space (V times its
			// placement, as world -> camera left it)
			const viewing = state.kind === 'world-to-camera' && !!look;
			const projecting = frustumKind && !!look;
			const before = projecting ? viewMatrix(look) : identity(); // world -> camera first
			// 3D -> 2D: the cube turned so its depth shows
			const flattening = kindById(state.kind).group === '3d-2d';
			const object =
				(viewing || projecting) && placement
					? multiply(before, modelMatrix(placement))
					: flattening
						? PROJECTION_MATRIX
						: identity();
			const world = viewing || projecting ? multiply(m, before) : identity();
			place(cube, multiply(m, object));
			place(worldAxes, world);
			place(companion, multiply(world, COMPANION_MATRIX));
			if (viewing) place(viewCamera, multiply(m, cameraMatrix(look)));

			clearGroup(helpers);
			const moved = !flat(m).every((v, k) => v === IDENTITY[k]);
			addProjectionHelpers();
			if (viewing) addLookLine(m, look);
			localAxes.visible = worldAxes.visible = spaces3d;
			companion.visible = spaces3d || projecting;
			viewCamera.visible = viewing;
			viewCamera.children[0].visible = !projecting; // the body (world -> camera only)
			fade(viewCamera, 1);

			// camera -> clip: the camera's axes at the eye (fading out while the eye goes to
			// infinity), the frustum, inside bright / outside grey, the corner picture
			const values = state.values['clip-space'] as Vec3 | undefined;
			clipPlanes = projecting && values ? insidePlanes(values, m) : null;
			for (const box of [cube, companion]) setClipping(box, clipPlanes);
			updateHidden(m, projecting ? values : undefined, clipPlanes);
			inset.visible = state.kind === 'ndc' && !!values; // the picture: after the divide
			if (projecting && values) {
				const companionStart = multiply(before, COMPANION_MATRIX);
				addClipHelpers(m, values, companionStart, moved);
				// the camera is its frustum here: only its axes at the eye, no separate body
				place(viewCamera, identity());
				viewCamera.visible = shownT() < CAMERA_FADE_END;
				fade(viewCamera, cameraOpacity());
				cameraSpace.cube = object;
				cameraSpace.companion = companionStart;
				const p = state.cameraPoint;
				insetPoint.position.set(p.x, p.y, p.z);
			}
			const p = point();
			const start = new THREE.Vector3(p.x, p.y, p.z);
			const [x, y, z] = applyPoint(m, homogeneous(p));
			const end = new THREE.Vector3(x, y, z);
			helpers.add(dot(end));
			if (!moved) return; // unchanged: nothing to compare

			// where the cube started: the origin, its world place, or its place in camera space
			helpers.add(ghostBox(object));
			if (spaces3d) helpers.add(ghostAxes(object, LOCAL_AXES)); // and its axes, greyed
			if (viewing) addViewGhosts(look);
			if (end.distanceToSquared(start) === 0) return; // this point stays (e.g. a factor of 1)
			helpers.add(dot(start, 0.4), dashedPath(homogeneous(p), POINT_COLOR));
		}

		// subscribe calls each handler once right away, which draws the first state
		const unsubscribers = [
			...KINDS.filter((kind) => kind.values).map((kind) =>
				kind.values!.subscribe((v) => ((state.values[kind.id] = v), update()))
			),
			KIND.subscribe((id) => ((state.kind = id), update())),
			POINT.subscribe((p) => ((state.point = p), update())),
			CAMERA_POINT.subscribe((p) => ((state.cameraPoint = p), update())),
			STAGE.subscribe((t) => ((state.t = t), update())),
			theme.themeStore.subscribe(() => applyThemeColors(scene))
		];

		const insetSize = () => Math.round(Math.min(width(), height()) * INSET_SHARE);
		inset.size = insetSize();
		const resizeObserver = new ResizeObserver(() => {
			renderer.setSize(width(), height());
			views.resize(width(), height());
			inset.size = insetSize();
		});
		resizeObserver.observe(viewport);

		let frame = 0;
		function animate() {
			frame = requestAnimationFrame(animate);
			views.update();
			controls.update();
			renderer.render(scene, views.camera);
			renderInset();
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
			for (const object of [companion, viewCamera, ...hidden.map((h) => h.mesh)])
				object.traverse((obj) => {
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
	{#if inset.visible}
		<!-- the frame of camera -> clip's corner picture; the picture is drawn into the canvas -->
		<div
			class="inset"
			style:width="{inset.size}px"
			style:height="{inset.size}px"
			style:left="{INSET_MARGIN}px"
			style:bottom="{INSET_MARGIN}px"
		>
			<span>camera view</span>
		</div>
	{/if}
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
	.inset {
		position: absolute;
		box-sizing: border-box;
		border: 1px solid currentColor;
		opacity: 0.7;
		pointer-events: none; /* the orbit controls stay usable over it */
	}
	.inset span {
		position: absolute;
		top: -1.4em;
		left: 0;
		font-size: 0.75em;
	}
</style>

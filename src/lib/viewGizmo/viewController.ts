// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Moves a scene's camera for the viewport gizmo (ViewGizmo.svelte) and the view keys: eased
// turns to an axis view, orbiting by a drag on the gizmo, the opposite view, reset to the
// starting view, and (when enabled) switching perspective <-> orthographic. One instance per
// scene, made in its onMount after the camera and OrbitControls exist; the gizmo only draws
// and reports, this class does the moving (math in views.ts).
// The camera logic follows Preview3D.svelte of Bauteilerstellung-2.0.
//
// Scene contract:
//   - call update(time) once per frame before controls.update() (advances a running turn)
//   - render with view.camera when ortho is enabled (it is then one of two cameras)
//   - call resize(width, height) when the canvas size changes
//   - call dispose() on unmount (removes the key listener and the controls listener)
import { OrthographicCamera, PerspectiveCamera, Vector3, MathUtils } from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
	AXIS_HANDLES,
	KEY_ACTIONS,
	anglesOf,
	blend,
	offsetFor,
	oppositeOf,
	orbitBy,
	targetFor,
	type Angles,
	type AxisHandle,
	type Quat,
	type Vec3
} from './views';

const TURN_MS = 350; // duration of a gizmo / key view change
const ORTHO_DEPTH = 1000; // near / far of the orthographic camera (the camera may sit inside)

export interface ViewControllerOptions {
	/** Offer the perspective / orthographic switch (the scene must render view.camera). */
	ortho?: boolean;
	/** Element whose key presses trigger views; default window. */
	keyTarget?: Window | HTMLElement;
}

export class ViewController {
	readonly perspective: PerspectiveCamera;
	readonly controls: OrbitControls;
	readonly canOrtho: boolean;
	/** The camera to render with: the perspective one, or the orthographic one while ortho. */
	camera: PerspectiveCamera | OrthographicCamera;
	ortho = false;
	/** false: the view keys are ignored (e.g. while the cursor is outside the viewport). */
	keysEnabled = true;

	private readonly orthographic: OrthographicCamera | null;
	private readonly keyTarget: Window | HTMLElement;
	private readonly listeners = new Set<() => void>();
	private turn: { from: Angles; to: Angles; start: number } | undefined;
	private home = { position: new Vector3(), target: new Vector3() };
	private aspect = 1;

	constructor(perspective: PerspectiveCamera, controls: OrbitControls, options: ViewControllerOptions = {}) {
		this.perspective = perspective;
		this.controls = controls;
		this.camera = perspective;
		this.canOrtho = options.ortho ?? false;
		this.orthographic = this.canOrtho
			? new OrthographicCamera(-1, 1, 1, -1, -ORTHO_DEPTH, ORTHO_DEPTH)
			: null;
		this.aspect = perspective.aspect;
		this.keyTarget = options.keyTarget ?? window;
		this.keyTarget.addEventListener('keydown', this.onKey as EventListener);
		controls.addEventListener('start', this.endTurn); // the user's own drag cancels a turn
		this.setHome();
	}

	/** Remembers the current camera position and target as the reset view (key . / Home). */
	setHome() {
		this.home = { position: this.camera.position.clone(), target: this.controls.target.clone() };
	}

	/** Called by the gizmo to redraw when ortho changes. */
	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	orientation(): Quat {
		const q = this.camera.quaternion;
		return [q.x, q.y, q.z, q.w];
	}

	/** Advances a running turn; call once per frame before controls.update(). */
	update(time: number = performance.now()) {
		if (!this.turn) return;
		const t = (time - this.turn.start) / TURN_MS;
		this.place(blend(this.turn.from, this.turn.to, t));
		if (t >= 1) this.endTurn();
	}

	resize(width: number, height: number) {
		if (!width || !height) return;
		this.aspect = width / height;
		this.perspective.aspect = this.aspect;
		this.perspective.updateProjectionMatrix();
		if (this.orthographic) this.frameOrtho(this.orthographic.top);
	}

	view(handle: AxisHandle) {
		this.turnTo(targetFor(handle, this.offset()));
	}

	orbit(dx: number, dy: number, size: number) {
		this.endTurn();
		this.place(orbitBy(anglesOf(this.offset()), dx, dy, size));
	}

	opposite() {
		this.turnTo(oppositeOf(this.offset()));
	}

	/** Back to the view the scene started with (or the last setHome()). */
	goHome() {
		this.endTurn();
		this.controls.target.copy(this.home.target);
		this.camera.position.copy(this.home.position);
		if (this.orthographic && this.camera === this.orthographic) {
			this.orthographic.zoom = 1;
			this.frameOrtho(this.halfHeightAt(this.home.position.distanceTo(this.home.target)));
		}
		this.controls.update();
	}

	/** Switches perspective <-> orthographic keeping what is seen: same direction, target and
	 *  visible height at the target. */
	toggleOrtho() {
		const ortho = this.orthographic;
		if (!ortho) return;
		const target = this.controls.target;
		if (!this.ortho) {
			ortho.position.copy(this.perspective.position);
			ortho.quaternion.copy(this.perspective.quaternion);
			ortho.zoom = 1;
			this.frameOrtho(this.halfHeightAt(this.perspective.position.distanceTo(target)));
			this.camera = ortho;
		} else {
			const visible = ortho.top / ortho.zoom;
			const distance = visible / Math.tan(MathUtils.degToRad(this.perspective.fov / 2));
			const direction = ortho.position.clone().sub(target).normalize();
			this.perspective.position.copy(target).addScaledVector(direction, distance);
			this.perspective.quaternion.copy(ortho.quaternion);
			this.camera = this.perspective;
		}
		this.ortho = !this.ortho;
		this.controls.object = this.camera;
		this.controls.update();
		this.listeners.forEach((listener) => listener());
	}

	dispose() {
		this.keyTarget.removeEventListener('keydown', this.onKey as EventListener);
		this.controls.removeEventListener('start', this.endTurn);
		this.listeners.clear();
	}

	//				internals
	//  --------------------------------------------------------------------------------------
	private readonly onKey = (event: KeyboardEvent) => {
		if (!this.keysEnabled) return;
		if (event.ctrlKey || event.metaKey || event.altKey) return; // leave browser shortcuts alone
		const target = event.target as HTMLElement | null;
		if (target?.closest?.('input, textarea, select, [contenteditable="true"]')) return; // typing
		const action = KEY_ACTIONS[event.key];
		if (!action) return;
		if ('action' in action && action.action === 'ortho' && !this.canOrtho) return;
		event.preventDefault();
		if ('view' in action) this.view(AXIS_HANDLES.find((h) => h.id === action.view)!);
		else if (action.action === 'opposite') this.opposite();
		else if (action.action === 'ortho') this.toggleOrtho();
		else this.goHome();
	};

	private readonly endTurn = () => {
		this.turn = undefined;
	};

	private offset(): Vec3 {
		return this.camera.position.clone().sub(this.controls.target).toArray() as Vec3;
	}

	/** Puts the active camera on the orbit angles, same distance and target. */
	private place(angles: Angles) {
		const radius = this.camera.position.distanceTo(this.controls.target);
		this.camera.position.copy(this.controls.target).add(new Vector3(...offsetFor(angles, radius)));
		this.camera.lookAt(this.controls.target);
	}

	private turnTo(to: Angles) {
		this.turn = { from: anglesOf(this.offset()), to, start: performance.now() };
	}

	/** Visible half height of the perspective camera at distance d from the target. */
	private halfHeightAt(d: number) {
		return d * Math.tan(MathUtils.degToRad(this.perspective.fov / 2));
	}

	/** Orthographic frustum for a visible half height h at the current aspect ratio. */
	private frameOrtho(h: number) {
		if (!this.orthographic) return;
		Object.assign(this.orthographic, { top: h, bottom: -h, left: -h * this.aspect, right: h * this.aspect });
		this.orthographic.updateProjectionMatrix();
	}
}

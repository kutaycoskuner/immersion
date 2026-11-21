<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-21
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Viewport gizmo (Blender style), drawn as SVG over a scene's canvas: the axes X / Y / Z
	// (red / green / blue, Y up) turn with the camera; a click on an axis bubble turns to that
	// view (on the current one: the opposite side), a drag on the gizmo orbits; buttons below:
	// perspective / orthographic (where the scene allows it), the hand instead of the abstract
	// axes (HandGizmo.svelte: thumb x, index y, middle z), R / L -- which hand the axes follow
	// (right-handed as three.js, or left-handed as Unity: +z the other way) -- and reset view.
	// The hand and R / L are shared by every scene's gizmo ($lib/viewGizmo/gizmoSettings).
	// Only draws and reports -- the camera is moved by the scene's ViewController
	// ($lib/viewGizmo/viewController.ts); the math is in $lib/viewGizmo/views.ts.
	// Taken from Bauteilerstellung-2.0 (frontend/src/lib/components/ViewGizmo.svelte), with
	// English texts and the dark scene colours; replaces the three-viewport-gizmo library.
	// Placed in the scene's positioned wrapper (bottom-right corner).
	import { onMount } from 'svelte';
	import { KEY_HELP, projectHandles, type Quat } from '$lib/viewGizmo/views';
	import { HANDEDNESS, SHOW_HAND } from '$lib/viewGizmo/gizmoSettings';
	import HandGizmo from '$lib/components/HandGizmo.svelte';
	import IconHand from '$lib/icons/icon-hand.svelte';
	import type { ViewController } from '$lib/viewGizmo/viewController';
	import IconFit from '$lib/icons/icon-fit.svelte';
	import IconOrthographic from '$lib/icons/icon-orthographic.svelte';
	import IconPerspective from '$lib/icons/icon-perspective.svelte';

	let { controller }: { controller: ViewController } = $props();

	const SIZE = 100; // viewBox -50..50
	const REACH = 34; // centre to bubble
	const DRAG_START = 3; // px before a press becomes a drag, so clicks stay clicks
	const FACING = 0.9; // depth from which a negative axis points at the viewer and shows its label

	let orientation = $state<Quat>([0, 0, 0, 1]);
	let ortho = $state(false);
	let handles = $derived(projectHandles(orientation, $HANDEDNESS));
	let hovered = $state('');
	let active = $state(false);
	let press: { id: string; x: number; y: number; dragging: boolean } | undefined;

	// follows the camera every frame; only a real change re-renders the SVG
	onMount(() => {
		let frame = 0;
		const follow = () => {
			const q = controller.orientation();
			const [x, y, z, w] = orientation;
			if (q[0] !== x || q[1] !== y || q[2] !== z || q[3] !== w) orientation = q;
			frame = requestAnimationFrame(follow);
		};
		follow();
		const unsubscribe = controller.subscribe(() => (ortho = controller.ortho));
		return () => {
			cancelAnimationFrame(frame);
			unsubscribe();
		};
	});

	function handleAt(target: EventTarget | null): string {
		return (target as Element | null)?.closest?.('[data-id]')?.getAttribute('data-id') ?? '';
	}

	function down(event: PointerEvent) {
		if (event.button !== 0) return;
		(event.currentTarget as Element).setPointerCapture(event.pointerId);
		press = { id: handleAt(event.target), x: event.clientX, y: event.clientY, dragging: false };
		active = true;
	}

	function move(event: PointerEvent) {
		if (!press) {
			hovered = handleAt(event.target);
			return;
		}
		const dx = event.clientX - press.x;
		const dy = event.clientY - press.y;
		if (!press.dragging && Math.hypot(dx, dy) < DRAG_START) return;
		press.dragging = true;
		hovered = '';
		controller.orbit(dx, dy, (event.currentTarget as Element).getBoundingClientRect().width);
		press.x = event.clientX;
		press.y = event.clientY;
	}

	function up() {
		const handle = press && !press.dragging ? handles.find((h) => h.id === press!.id) : undefined;
		press = undefined;
		active = false;
		if (handle) controller.view(handle);
	}
</script>

<div class="gizmo">
	<!-- the hand in place of the axes; the SVG stays on top (transparent) for dragging -->
	{#if $SHOW_HAND}
		{#key $HANDEDNESS}<div class="hand">
				<HandGizmo {controller} handedness={$HANDEDNESS} />
			</div>{/key}
	{/if}
	<svg
		viewBox="{-SIZE / 2} {-SIZE / 2} {SIZE} {SIZE}"
		class:active
		role="application"
		aria-label="Axis gizmo: click an axis or drag"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onpointerleave={() => (hovered = press ? hovered : '')}
	>
		<title>{KEY_HELP}</title>
		<circle class="disc" r={SIZE / 2 - 1} />
		{#each $SHOW_HAND ? [] : handles as h (h.id)}
			{@const x = h.x * REACH}
			{@const y = h.y * REACH}
			{@const dim = 0.55 + (0.45 * (h.depth + 1)) / 2}
			<g data-id={h.id} class="handle" class:hovered={hovered === h.id} opacity={dim}>
				<title>{h.view}</title>
				{#if h.positive}
					<line x1="0" y1="0" x2={x} y2={y} stroke={h.color} />
					<circle cx={x} cy={y} r="9" fill={h.color} />
					<text {x} {y}>{h.label}</text>
				{:else}
					<circle cx={x} cy={y} r="7.5" fill={h.color} fill-opacity="0.3" stroke={h.color} />
					{#if hovered === h.id || h.depth > FACING}<text class="neg" {x} {y}>{h.label}</text>{/if}
				{/if}
			</g>
		{/each}
	</svg>
	<div class="buttons">
		{#if controller.canOrtho}
			<button
				onclick={() => controller.toggleOrtho()}
				title={ortho ? 'Perspective (key 5)' : 'Orthographic (key 5)'}
				aria-label={ortho ? 'Perspective' : 'Orthographic'}
			>
				{#if ortho}<IconOrthographic />{:else}<IconPerspective />{/if}
			</button>
		{/if}
		<button
			class:on={$SHOW_HAND}
			onclick={() => SHOW_HAND.update((v) => !v)}
			title={$SHOW_HAND ? 'Show the axes' : 'Show the hand: thumb x, index y, middle finger z'}
			aria-label={$SHOW_HAND ? 'Show the axes' : 'Show the hand'}
			aria-pressed={$SHOW_HAND}
		>
			<IconHand />
		</button>
		<button
			class="letter"
			onclick={() => HANDEDNESS.update((h) => (h === 'right' ? 'left' : 'right'))}
			title={$HANDEDNESS === 'right'
				? 'Right-handed axes (three.js, OpenGL): click for left-handed (Unity, Direct3D: +z the other way)'
				: 'Left-handed axes (Unity, Direct3D): click for right-handed (three.js, OpenGL)'}
			aria-label="{$HANDEDNESS}-handed axes"
		>
			{$HANDEDNESS === 'right' ? 'R' : 'L'}
		</button>
		<button
			onclick={() => controller.goHome()}
			title="Reset view (key . or Home)"
			aria-label="Reset view"
		>
			<IconFit />
		</button>
	</div>
</div>

<style>
	.gizmo {
		--gizmo-col: #e6e6e6;
		--gizmo-button-bg: rgba(0, 0, 0, 0.35);
		--gizmo-button-border: rgba(255, 255, 255, 0.15);

		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		user-select: none;
	}

	svg {
		position: relative; /* above the hand, which it lets show through */
		width: 6.25rem;
		height: 6.25rem;
		cursor: grab;
		touch-action: none;
		overflow: visible;
	}

	/* the hand in the same square as the axes, under the (then empty) SVG */
	.hand {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 6.25rem;
		height: 6.25rem;
		pointer-events: none;
	}

	button.on {
		background: color-mix(in srgb, var(--gizmo-col) 22%, var(--gizmo-button-bg));
		opacity: 1;
	}
	/* R / L: a letter instead of an icon */
	button.letter {
		font-size: 0.75rem;
		font-weight: 700;
		text-align: center;
	}

	svg.active {
		cursor: grabbing;
	}

	.disc {
		fill: var(--gizmo-col);
		fill-opacity: 0;
		transition: fill-opacity 0.15s;
	}

	svg:hover .disc,
	svg.active .disc {
		fill-opacity: 0.08;
	}

	.handle {
		cursor: pointer;
	}

	line {
		stroke-width: 2.5;
		stroke-linecap: round;
	}

	.handle circle {
		stroke-width: 1.5;
	}

	.handle.hovered circle {
		stroke: var(--gizmo-col);
		stroke-width: 2;
	}

	text {
		font-size: 10px;
		font-weight: 700;
		text-anchor: middle;
		dominant-baseline: central;
		fill: #1b1b1b;
		pointer-events: none;
	}

	text.neg {
		font-size: 8px;
		fill: var(--gizmo-col);
	}

	.buttons {
		display: flex;
		gap: 0.3rem;
	}

	button {
		all: unset;
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 50%;
		background: var(--gizmo-button-bg);
		border: 1px solid var(--gizmo-button-border);
		color: var(--gizmo-col);
		cursor: pointer;
		opacity: 0.75;
	}

	button :global(svg) {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	button:hover {
		opacity: 1;
	}

	button:focus-visible {
		outline: 1px solid var(--gizmo-col);
	}
</style>

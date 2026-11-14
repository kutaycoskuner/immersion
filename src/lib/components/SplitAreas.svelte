<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-14
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Two areas side by side with a draggable divider between them, like Blender's editor
	// areas: drag the divider to resize, double-click it to reset, or focus it (Tab) and use
	// the arrow keys. Narrow screens stack the areas (first on top). The split is remembered
	// per storageKey in localStorage. Used by src/routes/(app)/+page.svelte with an
	// Area.svelte in each side.
	import { onMount, type Snippet } from 'svelte';

	let {
		first,
		second,
		storageKey,
		initial = 0.38, // share of the first area
		minPx = 180, // smallest size of either area while dragging
		stackBelowPx = 720 // container width below which the areas stack
	}: {
		first: Snippet;
		second: Snippet;
		storageKey: string;
		initial?: number;
		minPx?: number;
		stackBelowPx?: number;
	} = $props();

	const KEY_STEP = 0.02; // share moved per arrow key press

	let container: HTMLDivElement;
	let ratio = $state(initial);
	let stacked = $state(false);
	let dragging = $state(false);

	function clampRatio(value: number): number {
		const rect = container.getBoundingClientRect();
		const size = stacked ? rect.height : rect.width;
		if (size <= 0) return value;
		const min = Math.min(minPx, size / 2) / size;
		return Math.min(1 - min, Math.max(min, value));
	}

	// a blocked or private storage must not break the layout: it then just isn't remembered
	function save() {
		try {
			localStorage.setItem(storageKey, String(ratio));
		} catch {
			/* not remembered */
		}
	}

	function onPointerDown(event: PointerEvent) {
		dragging = true;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging) return;
		const rect = container.getBoundingClientRect();
		ratio = stacked
			? clampRatio((event.clientY - rect.top) / rect.height)
			: clampRatio((event.clientX - rect.left) / rect.width);
	}

	function onPointerUp() {
		if (!dragging) return;
		dragging = false;
		save();
	}

	function onKeyDown(event: KeyboardEvent) {
		const back = stacked ? 'ArrowUp' : 'ArrowLeft';
		const forward = stacked ? 'ArrowDown' : 'ArrowRight';
		if (event.key !== back && event.key !== forward) return;
		event.preventDefault();
		ratio = clampRatio(ratio + (event.key === forward ? KEY_STEP : -KEY_STEP));
		save();
	}

	function reset() {
		ratio = clampRatio(initial);
		save();
	}

	onMount(() => {
		try {
			const stored = Number(localStorage.getItem(storageKey));
			if (stored > 0 && stored < 1) ratio = stored;
		} catch {
			/* start from initial */
		}
		const observer = new ResizeObserver(() => {
			stacked = container.clientWidth < stackBelowPx;
			ratio = clampRatio(ratio);
		});
		observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<div class="split" class:stacked class:dragging bind:this={container} style="--ratio: {ratio}">
	<div class="area first">{@render first()}</div>
	<!-- a focusable separator is the WAI-ARIA "window splitter" pattern; Svelte's a11y check
	     counts separator as non-interactive, so its two warnings are silenced here -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="divider"
		role="separator"
		tabindex="0"
		aria-orientation={stacked ? 'horizontal' : 'vertical'}
		aria-valuenow={Math.round(ratio * 100)}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label="Resize areas"
		title="drag to resize, double-click to reset"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		ondblclick={reset}
		onkeydown={onKeyDown}
	></div>
	<div class="area second">{@render second()}</div>
</div>

<style>
	.split {
		--divider: 0.5rem; /* the gap between the framed areas is the drag handle */
		display: flex;
		width: 100%;
		height: 100%;
	}
	.stacked {
		flex-direction: column;
	}
	.dragging {
		user-select: none;
		cursor: col-resize;
	}
	.stacked.dragging {
		cursor: row-resize;
	}

	.area {
		min-width: 0;
		min-height: 0;
		display: flex;
	}
	.first {
		flex: 0 0 calc((100% - var(--divider)) * var(--ratio));
	}
	.second {
		flex: 1 1 0;
	}

	/* invisible gap between the areas; a short grip line shows on hover and while dragging */
	.divider {
		flex: 0 0 var(--divider);
		position: relative;
		cursor: col-resize;
		touch-action: none; /* a touch drag resizes instead of scrolling the page */
		outline: none;
	}
	.stacked .divider {
		cursor: row-resize;
	}
	.divider::after {
		content: '';
		position: absolute;
		inset: 50% auto auto 50%;
		width: 2px;
		height: 2rem;
		transform: translate(-50%, -50%);
		border-radius: 1px;
		background: rgba(255, 255, 255, 0.35);
		opacity: 0;
		transition: opacity 0.15s ease;
	}
	.stacked .divider::after {
		width: 2rem;
		height: 2px;
	}
	.divider:hover::after,
	.divider:focus-visible::after,
	.dragging .divider::after {
		opacity: 1;
	}
</style>

// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Svelte action `use:fitHeight` on a scrolling box (Area.svelte's body): when its content is
// only a little too tall, the content is scaled down to fit instead of showing a scrollbar
// that moves just a few pixels; content much taller than the box (a long description) keeps
// its size and scrolls as before. Re-fits when the box or the content changes size.
// Scales with CSS `zoom` on the content (the box's first child), not transform: zoom shrinks
// the layout too (rem-sized buttons and gaps included), so the box really stops overflowing.
// Width overflow inside rows is fitWidth's job (fitWidth.ts).

const MAX_SHRINK = 0.75; // shrink to at most 75 %; content needing more than that scrolls

export function fitHeight(node: HTMLElement) {
	const content = () => node.firstElementChild as HTMLElement | null;

	function fit() {
		const inner = content();
		if (!inner) return;
		inner.style.zoom = ''; // measure at full size
		const style = getComputedStyle(node);
		const available =
			node.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
		const needed = inner.getBoundingClientRect().height;
		if (available <= 0 || needed <= available) return;
		const scale = available / needed;
		// slightly too tall: shrink to fit (1 % less for rounding); far too tall: scroll
		if (scale >= MAX_SHRINK) inner.style.zoom = String(scale * 0.99);
	}

	const observer = new ResizeObserver(fit);
	observer.observe(node);
	const inner = content();
	if (inner) observer.observe(inner);
	fit();

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

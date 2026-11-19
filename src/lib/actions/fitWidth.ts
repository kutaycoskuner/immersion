// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Svelte action `use:fitWidth={content}`: shrinks the element's font size until its content
// fits its width, so a wide formula or matrix row stays on one line, side by side, without
// a horizontal scrollbar; it grows back (up to the inherited size) when there is room again.
// Re-fits when the element is resized and when `content` changes (pass what is rendered, e.g.
// the formula string). Everything inside must be sized in em to scale with it (KaTeX is).
// Used by DescriptionSections.svelte and TranslationPanel.svelte.

const MIN_SCALE = 0.45; // smaller than this is unreadable; it may then be cut at the edge

export function fitWidth(node: HTMLElement, _content?: unknown) {
	function fit() {
		node.style.fontSize = ''; // measure at the inherited size
		const available = node.clientWidth;
		const needed = node.scrollWidth;
		if (needed <= available || available === 0) return;
		const base = parseFloat(getComputedStyle(node).fontSize);
		const scale = Math.max(MIN_SCALE, (available / needed) * 0.98); // 2 % for rounding
		node.style.fontSize = `${base * scale}px`;
	}

	const observer = new ResizeObserver(fit);
	observer.observe(node);
	fit();

	return {
		update() {
			fit();
		},
		destroy() {
			observer.disconnect();
		}
	};
}

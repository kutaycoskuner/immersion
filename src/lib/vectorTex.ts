// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// TeX for the vector page's description (ProductDescription.svelte and the formulas of
// DotProduct.svelte / CrossProduct.svelte): rendering with KaTeX, text with inline $...$
// math (the way imge's matrix calculator writes its descriptions), coloured numbers and
// column vectors. KaTeX renders synchronously and is bundled, unlike the MathJax CDN script
// used before, so formulas never flash as raw TeX.
import katex from 'katex';
import type { Vec3 } from '$lib/vectorMath';

type AxisColors = { x: string; y: string; z: string };

/** TeX as KaTeX HTML; a formula with an error shows in red instead of throwing. */
export function tex(source: string, display = false): string {
	return katex.renderToString(source, { displayMode: display, throwOnError: false });
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Text with inline math between $ signs, as HTML: "the angle $\theta$ between". */
export function rich(text: string): string {
	return text
		.split('$')
		.map((part, k) => (k % 2 ? tex(part) : escapeHtml(part)))
		.join('');
}

/** A TeX term in a colour, e.g. a number or a symbol. */
export function colored(color: string, source: string | number): string {
	return `{\\color{${color}}${source}}`;
}

/** A number with 2 decimals; -0.00 is shown as 0.00. */
export function num(value: number): string {
	const text = value.toFixed(2);
	return text === '-0.00' ? '0.00' : text;
}

/** A column vector, `label = [x y z]`, each component in its axis colour. */
export function columnVector(label: string, labelColor: string, v: Vec3, colors: AxisColors): string {
	return `${colored(labelColor, label)} = \\begin{bmatrix}
	${colored(colors.x, num(v.x))} \\\\
	${colored(colors.y, num(v.y))} \\\\
	${colored(colors.z, num(v.z))}
	\\end{bmatrix}`;
}

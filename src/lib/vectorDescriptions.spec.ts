// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Checks that every text of the vector page's description and the shared TeX helpers render
// in KaTeX without errors (KaTeX shows a bad formula in red instead of throwing, so this
// is the only place a typo in vectorDescriptions.ts is caught).
// Run: pnpm test:unit --run
import { describe, expect, it } from 'vitest';
import { CROSS_SECTIONS, DOT_SECTIONS } from './vectorDescriptions';
import { SCALING_SECTIONS, TRANSLATION_SECTIONS } from './transformDescriptions';
import { columnVector, rich, tex } from './vectorTex';

const ok = (html: string) => expect(html).not.toContain('katex-error');

describe('description texts', () => {
	const pages = [
		['dot', DOT_SECTIONS],
		['cross', CROSS_SECTIONS],
		['translation', TRANSLATION_SECTIONS],
		['scaling', SCALING_SECTIONS]
	] as const;
	for (const [name, sections] of pages) {
		it(`${name}: every inline formula renders`, () => {
			for (const section of sections)
				for (const block of section.blocks) if ('text' in block) ok(rich(block.text));
		});
	}
});

describe('tex helpers', () => {
	it('renders a coloured column vector and the cross product layout', () => {
		const colors = { x: '#ff6666', y: '#66cc66', z: '#6699ff' };
		ok(tex(columnVector('\\vec{v}_1', '#66cccc', { x: 1, y: -0.5, z: 0 }, colors), true));
		ok(tex('|\\vec{c}| = 1.00 \\cdot 1.41 \\cdot \\sin(45.0^\\circ) = \\mathbf{1.00}', true));
	});
	it('escapes html outside the math', () => {
		expect(rich('a <b> $x$')).toContain('a &lt;b&gt; ');
	});
});

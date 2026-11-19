// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the transformations page's description, rendered by DescriptionSections.svelte
// (shape in $lib/description). { formula } blocks are computed live by
// TranslationDescription.svelte from the typed translation and the stage t.
import type { Section } from '$lib/description';

export const TRANSLATION_SECTIONS: Section[] = [
	{
		title: 'Begin: the cube and a point',
		blocks: [
			{
				text: 'The cube is centred at the origin, 2 units wide. We follow a point $p$ (the dot in the viewport), at first one of its corners; type another one into the matrix panel.'
			},
			{ formula: 'point' },
			{
				text: 'The 4th coordinate $w = 1$ marks it as a point. These homogeneous coordinates are what lets a $4 \\times 4$ matrix move it.'
			}
		]
	},
	{
		title: 'Step 1: the translation matrix',
		blocks: [
			{
				text: 'The offset sits in the last column; the rest is the identity, so nothing turns or scales.'
			},
			{ formula: 'general' },
			{ formula: 'values' }
		]
	},
	{
		title: 'Step 2: the stage t',
		blocks: [
			{
				text: '$t = 0$ is before the move, $t = 1$ after it. Drag the bar in the matrix panel between them: the matrix of a stage moves $t$ of the way.'
			},
			{ formula: 'stageGeneral' },
			{ formula: 'stageValues' }
		]
	},
	{
		title: 'Step 3: moving the point',
		blocks: [
			{ text: 'Multiplying gives each coordinate plus its part of the offset:' },
			{ formula: 'applySymbols' },
			{ formula: 'applyValues' }
		]
	},
	{
		title: 'Step 4: self experimentation and comprehension',
		blocks: [
			{ text: 'Change $t_x$, $t_y$, $t_z$ in the matrix and switch between before and after.' },
			{
				text: 'every corner moves by the same offset, so the cube keeps its shape and size'
			},
			{
				text: 'a direction has $w = 0$: the last column is multiplied by $0$, so a translation does not change directions'
			},
			{ text: 'at $t = 0.5$ the point is half way: every value of $M(t)$ grows in step with $t$' }
		]
	}
];

// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the vector page's description, one list of sections per product, rendered by
// DescriptionSections.svelte (shape in $lib/description). A { formula } block names a live
// formula the product's component computes from the current vectors (DotProduct.svelte /
// CrossProduct.svelte), so the words can change here without touching the code.
import type { Section } from '$lib/description';

export const DOT_SECTIONS: Section[] = [
	{
		title: 'Begin: base vectors',
		blocks: [{ formula: 'vectors' }]
	},
	{
		title: 'Step 1: normalize the vectors',
		blocks: [
			{ text: 'Divide each dimension of a vector by its length.' },
			{ formula: 'normalization' },
			{ formula: 'normalized' },
			{
				text: "Note: this step is to eliminate the length of the vectors from the calculation. It's not applied regularly."
			}
		]
	},
	{
		title: 'Step 2: calculation of the dot product',
		blocks: [{ formula: 'symbols' }, { formula: 'values' }]
	},
	{
		title: 'Step 3: what it represents',
		blocks: [
			{
				text: 'This value represents the perpendicular projection of $v_1$ onto $v_2$, or the $\\cos$ of the angle between these two vectors.'
			},
			{ text: 'If the value is negative, the projection is in the reverse direction.' }
		]
	},
	{
		title: 'Step 4: self experimentation and comprehension',
		blocks: [
			{ text: 'You can test it by giving max, min and mid point values. For instance:' },
			{ text: 'when the vectors are perpendicular to each other the dot product is $0$' },
			{ text: 'when the vectors are overlapping the dot product is $1$' },
			{ text: 'this value will oscillate between $-1$ and $+1$' },
			{
				text: 'if you do not normalize the values, the value will be $\\cos\\theta \\cdot |v_1| \\cdot |v_2|$.'
			}
		]
	}
];

export const CROSS_SECTIONS: Section[] = [
	{
		title: 'Begin: base vectors',
		blocks: [{ formula: 'vectors' }]
	},
	{
		title: 'Step 1: cross product formula',
		blocks: [
			{
				text: 'Each component of the result leaves its own axis out: $x$ is built from $y$ and $z$, $y$ from $z$ and $x$, $z$ from $x$ and $y$.'
			},
			{ formula: 'symbols' },
			{ text: 'The vectors are not normalized here: their lengths are part of the result.' }
		]
	},
	{
		title: 'Step 2: calculation of the cross product',
		blocks: [{ formula: 'values' }]
	},
	{
		title: 'Step 3: what it represents',
		blocks: [
			{ text: 'The result $\\vec{c}$ is a vector perpendicular to both $v_1$ and $v_2$.' },
			{
				text: 'Its length is the area of the parallelogram the two vectors span (shaded in the viewport):'
			},
			{ formula: 'length' },
			{ formula: 'lengthValues' },
			{
				text: 'Its direction follows the right-hand rule: fingers from $v_1$ towards $v_2$, the thumb points along $\\vec{c}$.'
			}
		]
	},
	{
		title: 'Step 4: self experimentation and comprehension',
		blocks: [
			{ text: 'You can test it by giving max, min and mid point values. For instance:' },
			{ text: 'when the vectors are parallel (or one is zero) the cross product is the zero vector' },
			{
				text: 'when the vectors are perpendicular its length is the largest: $|v_1| \\cdot |v_2|$'
			},
			{
				text: 'swapping $v_1$ and $v_2$ flips the result to the opposite direction: $v_1 \\times v_2 = -(v_2 \\times v_1)$'
			},
			{ text: 'with unit vectors its length is $\\sin\\theta$, between $0$ and $1$' }
		]
	}
];

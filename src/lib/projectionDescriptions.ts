// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-25
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the projections page's descriptions (orthographic, perspective), rendered by
// DescriptionSections.svelte (shape in $lib/description). { formula } blocks are computed
// live by OrthographicDescription.svelte / PerspectiveDescription.svelte. Both start with
// what a projection is: a transformation too, but one that cannot be undone.
import type { Section } from '$lib/description';

const WHAT_IT_IS: Section = {
	title: 'A projection is a transformation too',
	blocks: [
		{
			text: 'Like translation, scaling and rotation, a projection is a transformation: a $4 \\times 4$ matrix that takes every point somewhere, here onto the screen, the plane $z = 0$ (shaded in the viewport).'
		},
		{
			text: 'The difference: it throws a direction away. Every point along that direction lands on the same spot, so the result cannot be undone -- the matrix has no inverse. A translation only moves things; a projection flattens them.'
		},
		{
			text: 'In graphics this is the step from 3D to 2D: local to world and world to camera are transformations that can be undone, the projection to the screen is the one that cannot.'
		}
	]
};

export const ORTHOGRAPHIC_SECTIONS: Section[] = [
	WHAT_IT_IS,
	{
		title: 'Begin: the cube and a point',
		blocks: [
			{
				text: 'The cube is centred at the origin, 2 units wide. We follow a point $p$ (the dot in the viewport); type another one into the matrix panel.'
			},
			{ formula: 'point' }
		]
	},
	{
		title: 'Step 1: the orthographic projection matrix',
		blocks: [
			{
				text: 'It keeps $x$ and $y$ and sets $z$ to $0$: the $z$ row of the identity becomes zeros. Every point goes straight back to the screen, along parallel lines.'
			},
			{ formula: 'general' }
		]
	},
	{
		title: 'Step 2: the stage t',
		blocks: [
			{
				text: 'Drag the bar: the $z$ row goes from $1$ to $0$, so the cube flattens towards the screen until it is flat: turned 45° about $y$, its two faces become one rectangle.'
			},
			{ formula: 'stageGeneral' },
			{ formula: 'stageValues' }
		]
	},
	{
		title: 'Step 3: projecting the point',
		blocks: [{ formula: 'apply' }]
	},
	{
		title: 'Why it cannot be undone',
		blocks: [
			{ text: 'A point straight in front of $p$ or behind it lands on the very same spot:' },
			{ formula: 'lost' },
			{
				text: 'From the result alone nobody can tell which of them it was: the depth is gone. That is why a camera image needs a depth buffer to know what is in front.'
			}
		]
	},
	{
		title: 'Self experimentation and comprehension',
		blocks: [
			{ text: 'change $p_z$: the projected point does not move' },
			{ text: 'every edge of the cube along $z$ shrinks to a single point' },
			{
				text: 'parallel lines stay parallel and sizes do not depend on distance: the look of technical drawings and of the orthographic camera (key 5 in the viewport)'
			}
		]
	}
];

export const PERSPECTIVE_SECTIONS: Section[] = [
	WHAT_IT_IS,
	{
		title: 'Begin: the cube, a point and the eye',
		blocks: [
			{
				text: 'The cube is centred at the origin. The eye sits at $(0, 0, d)$ in front of the screen (the white dot); type $d$ in the matrix panel. We follow a point $p$.'
			},
			{ formula: 'point' }
		]
	},
	{
		title: 'Step 1: the perspective projection matrix',
		blocks: [
			{
				text: 'Its $z$ row is zeros, like the orthographic one, and its bottom row is not $0\\;0\\;0\\;1$: it writes $-z/d$ into $w$.'
			},
			{ formula: 'general' },
			{ formula: 'values' }
		]
	},
	{
		title: 'Step 2: the divide by w',
		blocks: [
			{
				text: 'Multiplying gives a point whose $w$ is not $1$. The point it means is found by dividing by $w$ -- this divide is what makes far things small:'
			},
			{ formula: 'homogeneous' },
			{ formula: 'divided' },
			{
				text: 'That is where the line from the eye through $p$ meets the screen (the faint white ray in the viewport).'
			}
		]
	},
	{
		title: 'Step 3: the stage t',
		blocks: [
			{
				text: 'Drag the bar: $M(t)$ goes from the identity to $P$. After the divide by $w$ the point travels along that ray from the eye, and the cube flattens into what the eye sees.'
			},
			{ formula: 'stageValues' },
			{ formula: 'stagePoint' }
		]
	},
	{
		title: 'Self experimentation and comprehension',
		blocks: [
			{
				text: 'the near face of the cube ($z = 1$) becomes bigger than the far one ($z = -1$): the projected cube looks like a box seen from the front'
			},
			{
				text: 'move the eye away (bigger $d$): the difference shrinks, it looks more and more orthographic'
			},
			{
				text: 'parallel lines along $z$ meet at the centre (the vanishing point) instead of staying parallel'
			}
		]
	}
];

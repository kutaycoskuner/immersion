// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the transformations page's descriptions (translation, scaling, rotation), rendered by
// DescriptionSections.svelte (shape in $lib/description). { formula } blocks are computed
// live by Translation- / Scaling- / RotationDescription.svelte from the typed values,
// the point and the stage t.
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

export const SCALING_SECTIONS: Section[] = [
	{
		title: 'Begin: the cube and a point',
		blocks: [
			{
				text: 'The cube is centred at the origin, 2 units wide. We follow a point $p$ (the dot in the viewport), at first one of its corners; type another one into the matrix panel.'
			},
			{ formula: 'point' }
		]
	},
	{
		title: 'Step 1: the scaling matrix',
		blocks: [
			{
				text: 'The factors sit on the diagonal; every other entry is $0$, so each axis is only stretched, never mixed with another. The last column is $0$: the scaling is about the origin.'
			},
			{ formula: 'general' },
			{ formula: 'values' }
		]
	},
	{
		title: 'Step 2: the stage t',
		blocks: [
			{
				text: 'Drag the bar in the matrix panel: each factor goes from $1$ (no change, $t = 0$) to its value ($t = 1$), as $1 + t\,(s - 1)$.'
			},
			{ formula: 'stageGeneral' },
			{ formula: 'stageValues' }
		]
	},
	{
		title: 'Step 3: scaling the point',
		blocks: [
			{
				text: 'Multiplying gives each coordinate times the diagonal value $m$ of $M(t)$ on its row (at $t = 1$ that is its factor $s$):'
			},
			{ formula: 'applySymbols' },
			{ formula: 'applyValues' }
		]
	},
	{
		title: 'Step 4: self experimentation and comprehension',
		blocks: [
			{ text: 'Change $s_x$, $s_y$, $s_z$ on the diagonal and drag the bar.' },
			{
				text: 'a factor of $1$ changes nothing; between $0$ and $1$ the cube shrinks, above $1$ it grows'
			},
			{ text: 'a factor of $0$ flattens the cube onto a plane; a negative factor mirrors it' },
			{
				text: 'the scaling is about the origin: the origin stays, and a point twice as far from it moves twice as much'
			},
			{
				text: 'unlike a translation it also changes directions ($w = 0$): the diagonal multiplies them as well'
			}
		]
	}
];

export const ROTATION_SECTIONS: Section[] = [
	{
		title: 'Begin: the cube and a point',
		blocks: [
			{
				text: 'The cube is centred at the origin, 2 units wide. We follow a point $p$ (the dot in the viewport), at first one of its corners; type another one into the matrix panel.'
			},
			{ formula: 'point' }
		]
	},
	{
		title: 'Step 1: rotation about one axis',
		blocks: [
			{
				text: 'A rotation about one axis keeps that coordinate and turns the other two by the angle $\theta$, with $\cos\theta$ and $\sin\theta$ (counter-clockwise, looking from the positive axis to the origin):'
			},
			{ formula: 'rx' },
			{ formula: 'ry' },
			{ formula: 'rz' }
		]
	},
	{
		title: 'Step 2: one after the other',
		blocks: [
			{
				text: 'The three angles are applied about $x$ first, then $y$, then $z$. Matrices act right to left, so the product is written the other way round:'
			},
			{ formula: 'values' },
			{ text: 'The order matters: the same angles in another order give another rotation.' }
		]
	},
	{
		title: 'Step 3: the stage t',
		blocks: [
			{
				text: 'Here the angles grow with $t$, not the matrix entries: they are $\cos$ and $\sin$ of the angles, so the point moves on an arc around the origin (the dashed path in the viewport).'
			},
			{ formula: 'stageGeneral' },
			{ formula: 'stageValues' }
		]
	},
	{
		title: 'Step 4: rotating the point',
		blocks: [
			{ formula: 'apply' },
			{ text: 'A rotation keeps the distance to the origin:' },
			{ formula: 'lengths' }
		]
	},
	{
		title: 'Step 5: self experimentation and comprehension',
		blocks: [
			{ text: 'Change $\theta_x$, $\theta_y$, $\theta_z$ and drag the bar.' },
			{
				text: '$90°$ about $z$ turns the $x$ axis onto the $y$ axis; $360°$ comes back to the start'
			},
			{ text: 'the last column is $0$: the rotation is about the origin, the cube turns in place' },
			{
				text: 'lengths and angles stay: the cube never stretches; directions ($w = 0$) turn as well'
			},
			{
				text: 'try $\theta_x = 90°$ with $\theta_z = 90°$, then think what the other order would give'
			}
		]
	}
];

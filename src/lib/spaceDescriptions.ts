// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the spaces page's 3D -> 3D descriptions (local -> world so far), rendered by
// DescriptionSections.svelte (shape in $lib/description). { formula } blocks are computed
// live by LocalToWorldDescription.svelte from the typed placement, point and stage t. The
// 3D -> 2D texts (projections) are projectionDescriptions.ts.
import type { Section } from '$lib/description';

export const LOCAL_TO_WORLD_SECTIONS: Section[] = [
	{
		title: 'Coordinate spaces',
		blocks: [
			{
				text: 'A space is an origin and three axes. The same point has different numbers in different spaces: what changes is where you measure from and along which directions.'
			},
			{
				text: 'Local space (object space): the object as it was modelled, around its own origin. The cube is always 2 wide here, its corners at $(\\pm 1, \\pm 1, \\pm 1)$ -- whatever happens to it in the scene.'
			},
			{
				text: 'World space: the space the whole scene shares (the grid and the faint world axes in the viewport). Every object is placed into it by its own model matrix.'
			},
			{
				text: 'Local to world is a 3D to 3D transformation, and it can be undone: world to local is its inverse. That is the difference from a projection (3D to 2D).'
			}
		]
	},
	{
		title: 'Begin: a point in local space',
		blocks: [
			{
				text: "We follow a point $p$ given in the cube's own coordinates (type it in the matrix panel): at first one of its corners."
			},
			{ formula: 'local' }
		]
	},
	{
		title: 'Step 1: the three parts of the placement',
		blocks: [
			{
				text: "Scale $S$ (along the object's own axes), rotation $R$ (about $x$, then $y$, then $z$) and position $T$:"
			},
			{ formula: 'scale' },
			{ formula: 'rotation' },
			{ formula: 'translation' }
		]
	},
	{
		title: 'Step 2: the model matrix',
		blocks: [
			{
				text: 'They make one matrix, read right to left: first scale, then turn, then move.'
			},
			{ formula: 'general' },
			{ formula: 'model' },
			{
				text: 'The order matters: moving first and turning after would swing the object around the world origin, and scaling after moving would scale its position too.'
			}
		]
	},
	{
		title: 'Step 3: local to world',
		blocks: [{ formula: 'apply' }]
	},
	{
		title: "Step 4: the columns are the object's own axes",
		blocks: [
			{
				text: "The first three columns of $M$ are the cube's $x$, $y$, $z$ axes as seen in world space (turned and scaled, the coloured axes riding on the cube); the last column is its origin, the position:"
			},
			{ formula: 'columns' }
		]
	},
	{
		title: 'Step 5: the stage t',
		blocks: [
			{
				text: 'Drag the bar: every part goes $t$ of the way -- the position $t$ of its offset, the angles $t$ of their value, the scale from $1$ to its factor:'
			},
			{ formula: 'stageGeneral' },
			{ formula: 'stageValues' }
		]
	},
	{
		title: 'Step 6: back from world to local',
		blocks: [
			{
				text: 'The inverse undoes it, in the opposite order (move back, turn back, scale back): $M^{-1} = S^{-1} R^{-1} T^{-1}$. It exists as long as no scale is $0$.'
			},
			{ formula: 'back' }
		]
	},
	{
		title: 'Self experimentation and comprehension',
		blocks: [
			{
				text: "only change the position: the cube moves, its local axes stay parallel to the world's"
			},
			{
				text: "turn it $90^\\circ$ about $y$: its local $x$ axis now points along the world's $-z$"
			},
			{
				text: "the point's local numbers never change while the cube moves: only its world numbers do"
			},
			{
				text: 'a scale of $0$ flattens the cube and the way back is lost: no inverse, like a projection'
			}
		]
	}
];

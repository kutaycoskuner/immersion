// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-25
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the spaces page's camera -> clip and clip -> NDC descriptions (3D -> 3D category,
// after world -> camera: nothing is flattened, depth is kept), rendered by
// DescriptionSections.svelte (shape in $lib/description). { formula } blocks are computed
// live by ClipSpaceDescription.svelte / NdcDescription.svelte from the typed frustum (fov,
// near, far), the point in camera space and the stage t. Camera -> clip is the matrix P and
// the clip test (nothing moves in the viewport: clip space is 4D); clip -> NDC is the divide
// by w, the squeeze into the cube.
import type { Section } from '$lib/description';

const NOT_YET_2D: Section = {
	title: 'Not yet 2D',
	blocks: [
		{
			text: 'Depth goes along in every step so far: $P$ has an inverse, and the divide keeps $z$. The picture becomes 2D only when the screen reads $x$ and $y$ as the place in the picture; $z$ goes to the depth test (what is in front).'
		}
	]
};

export const CLIP_SPACE_SECTIONS: Section[] = [
	{
		title: 'Camera space to clip space',
		blocks: [
			{
				text: 'The step after world to camera: the input is camera space -- the eye at the origin, looking down $-z$, as world to camera left it. The point $p$ is typed in camera space here (in front of the eye: $z < 0$).'
			},
			{
				text: 'The camera sees only a part of it, its view volume: between a near and a far plane, and only so far to the sides. fov, near and far are settings of the camera itself; they make the see-through pyramid in the viewport, from the eye (its tip) through near (the screen) to far.'
			},
			{
				text: 'The projection matrix $P$ takes every point into clip space: four numbers $(x, y, z, w)$. Clip space is 4D, it has no shape to draw -- so the viewport stays in camera space and shows what clip space is for: the clip test. What the camera can see is bright, what it cannot is grey, like the two boxes beyond far and behind the eye.'
			}
		]
	},
	{
		title: 'Step 1: the frustum',
		blocks: [
			{
				text: 'A perspective camera sees a frustum: a pyramid with its tip at the eye, cut off at near and far. Its opening is the field of view (fov); the aspect (width / height) is $1$ for now.'
			},
			{ formula: 'frustum' }
		]
	},
	{
		title: 'Step 2: the perspective matrix',
		blocks: [
			{
				text: "$k = 1 / \\tan(\\text{fov} / 2)$ scales $x$ and $y$ so the frustum's sides land on $\\pm w$; the $z$ row puts near on $-w$ and far on $+w$; the bottom row writes the depth $-z$ into $w$:"
			},
			{ formula: 'general' },
			{ formula: 'values' }
		]
	},
	{
		title: 'Step 3: camera to clip',
		blocks: [{ formula: 'apply' }, { text: '$w$ is now the distance in front of the eye.' }]
	},
	{
		title: 'Step 4: the clip test',
		blocks: [
			{
				text: "Inside the view volume means every coordinate lies between $-w$ and $w$ -- one test against the point's own $w$, no divide needed. Clipping uses it to throw away or cut what the camera cannot see:"
			},
			{ formula: 'test' },
			{
				text: 'Behind the eye $w$ is negative: such points fail before anything is divided -- that is why the test comes before the divide.'
			}
		]
	},
	{
		title: 'No animation here',
		blocks: [
			{
				text: 'Clip space is 4D and cannot be drawn, so there is nothing to animate: the viewport stays in camera space and the panel shows only $P\\,p$. The squeeze into a cube is the next step, the divide by $w$ (clip to NDC), which has the bar.'
			}
		]
	},
	NOT_YET_2D,
	{
		title: 'Self experimentation and comprehension',
		blocks: [
			{ text: 'put $p$ behind the eye ($z > 0$): $w$ turns negative, outside' },
			{ text: 'put $p$ beyond far: its $z$ grows past $w$' },
			{ text: 'move $p$ to the side until $x > w$: it leaves the frustum through its side' },
			{ text: 'narrow the fov: more of the boxes turns grey' }
		]
	}
];

export const NDC_SECTIONS: Section[] = [
	{
		title: 'Clip space to NDC: the divide by w',
		blocks: [
			{
				text: 'The step after camera to clip: every clip-space point is divided by its own $w$. The result is the normalized device coordinates (NDC): everything the camera can see lands in the cube from $-1$ to $1$.'
			},
			{
				text: 'Not a matrix: each point gets its own divisor, its depth $w$. That is what makes far things small -- the perspective -- and what squeezes the frustum (the pyramid in the viewport) into the cube.'
			},
			{
				text: "The corner picture is what this camera sees: the cube's $x$ and $y$ are exactly the place in that picture. What lies outside the frustum (grey, the boxes beyond far and behind the eye) never appears in it."
			}
		]
	},
	{
		title: 'Step 1: from clip to NDC',
		blocks: [{ formula: 'clip' }, { formula: 'ndc' }]
	},
	{
		title: 'Step 2: the frustum becomes the cube',
		blocks: [
			{
				text: "The frustum's sides are where $x = \\pm w$ and $y = \\pm w$, near and far where $z = \\mp w$: divided by $w$, all of them land on $\\pm 1$. The pyramid becomes the cube, and what was inside it is inside the cube:"
			},
			{ formula: 'corners' }
		]
	},
	{
		title: 'Depth between near and far',
		blocks: [
			{ text: 'Near lands on $-1$, far on $+1$ -- but not evenly:' },
			{ formula: 'depth' },
			{
				text: 'Half way between near and far is already close to $+1$: most of the depth range goes to what is near the eye.'
			}
		]
	},
	{
		title: 'Squeeze, then mirror',
		blocks: [
			{
				text: 'In camera space in front is $-z$; in NDC a bigger $z$ is farther (near $-1$, far $+1$), so the depth test can ask "smaller $z$ wins". So $P$ holds two things: $S$ squeezes and keeps in front at $-z$, $F$ mirrors $z$. NDC is left-handed. The mirror is a sign convention, not a change of shape:'
			},
			{ formula: 'mirror' }
		]
	},
	{
		title: 'The stage t',
		blocks: [
			{
				text: 'Drag the bar: the frustum and the boxes in it squeeze into the cube, the far end most (the viewport divides by $w$ as the screen does). The bar leaves out the mirror, so at $t = 1$ the second matrix row shows $S$ divided, the first row $P$ divided: they differ only in the sign of $z$.'
			},
			{ formula: 'stageGeneral' },
			{ formula: 'stageValues' },
			{ formula: 'stagePoint' }
		]
	},
	NOT_YET_2D,
	{
		title: 'Self experimentation and comprehension',
		blocks: [
			{ text: 'put $p$ on the near plane, $z = -\\text{near}$: its $z$ in NDC is exactly $-1$' },
			{ text: 'move $p$ farther away: its $x$ and $y$ in NDC shrink -- the perspective' },
			{ text: 'widen the fov: the boxes in the cube get smaller, more fits in' },
			{ text: 'move near closer to $0$: the depth range crowds even more towards $+1$' }
		]
	}
];

// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-22
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Texts of the spaces page's 3D -> 3D descriptions (local -> world, world -> camera),
// rendered by DescriptionSections.svelte (shape in $lib/description). { formula } blocks are
// computed live by LocalToWorldDescription.svelte (from the typed placement, point and stage
// t) and WorldToCameraDescription.svelte (from the typed eye and target). The
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
				text: 'The orange box is a second object: modelled the same way around its own origin, with its own local axes, but placed by its own model matrix (fixed here). Both meet in one world -- that is what world space is for.'
			},
			{
				text: 'The ground is the $xz$ plane ($y = 0$). The cube is 2 high in local space, so with its position $y$ equal to its scale $y$ it stands on the ground once it is placed ($t = 1$).'
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

export const WORLD_TO_CAMERA_SECTIONS: Section[] = [
	{
		title: 'Camera space',
		blocks: [
			{
				text: 'The camera is one more object in the world (the white frame in the viewport), placed like the boxes, with its own axes: $x$ to its right, $y$ up, $z$ backwards. It looks down its own $-z$.'
			},
			{
				text: "Camera space (view space) is the camera's local space: every point measured from the eye, along the camera's own axes. A point straight ahead has $x = y = 0$ and a negative $z$."
			},
			{
				text: 'World to camera is again 3D to 3D: nothing is flattened, depth is kept, and the way back exists. It is the step before the projection, which then only has to look along $-z$ from the origin.'
			},
			{
				text: 'Right-handed (OpenGL, three.js), the camera looks down $-z$; left-handed (DirectX) it looks down $+z$ -- the R / L switch of the hand in the gizmo.'
			}
		]
	},
	{
		title: 'Step 1: where it stands, where it looks',
		blocks: [
			{
				text: 'Type the eye (where the camera stands) and the target (what it looks at); its up is the world $y$.'
			},
			{ formula: 'look' }
		]
	},
	{
		title: "Step 2: the camera's axes (lookAt)",
		blocks: [
			{
				text: 'Forward points from the eye to the target; the cross products give the two axes at right angles to it:'
			},
			{ formula: 'forward' },
			{ formula: 'right' },
			{ formula: 'up' },
			{
				text: "The camera's $z$ axis is backwards, $-f$. Looking straight up or down, $f \times y$ is $0$: there the world's $-z$ stands in for up."
			}
		]
	},
	{
		title: "Step 3: the camera's own placement",
		blocks: [
			{
				text: 'Placed like any object (local to world), with its axes as the columns of $R$ and no scale:'
			},
			{ formula: 'cameraModel' }
		]
	},
	{
		title: 'Step 4: the view matrix is its inverse',
		blocks: [
			{
				text: "World to camera undoes that placement: move the eye back to the origin, then turn the camera back onto $x$, $y$, $z$. The inverse of a rotation is its transpose, so the camera's axes become the rows:"
			},
			{ formula: 'general' },
			{ formula: 'view' }
		]
	},
	{
		title: 'Step 5: world to camera',
		blocks: [
			{ text: 'The point $p$ is typed in world coordinates here:' },
			{ formula: 'apply' },
			{ text: 'The eye itself lands on the origin, the target straight ahead on $-z$:' },
			{ formula: 'eye' },
			{ formula: 'target' }
		]
	},
	{
		title: 'Step 6: the pipeline so far',
		blocks: [
			{
				text: 'A corner of the blue box, $(1, 1, 1)$ in its local space (placed by local to world), reaches camera space through both matrices, read right to left -- first $M$ (local to world), then $V$. Together $V M$ is the model-view matrix:'
			},
			{ formula: 'pipeline' }
		]
	},
	{
		title: 'Step 7: the stage t',
		blocks: [
			{
				text: 'Drag the bar: the world moves $t$ of the way and turns $t$ of the angle, until the camera stands at the origin looking down $-z$. The camera does not move -- everything else does, and the grid of the viewport now stands for camera space.'
			},
			{ formula: 'stage' }
		]
	},
	{
		title: 'Self experimentation and comprehension',
		blocks: [
			{
				text: "only move the eye and target by the same offset: $R$ stays, only $V$'s last column changes"
			},
			{
				text: 'put the target straight in front: eye $(0, 0, 5)$, target $(0, 0, 0)$ -- $V$ is just a move by $-5$ along $z$'
			},
			{
				text: 'a point behind the camera gets a positive $z$: the projection will have to throw it away'
			},
			{ text: 'put the eye right above the target: the up is replaced, the picture turns' }
		]
	}
];

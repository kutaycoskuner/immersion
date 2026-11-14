// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Colours of the vector page, in one place: the math overlays (DotProduct.svelte,
// CrossProduct.svelte) colour the formulas with them and the 3d scene (ThreeScene.svelte)
// draws the result vectors in the same colours, so formula and picture match.

// labels of the two input vectors in the formulas
export const labelColors = {
	v1: '#66cccc', // soft cyan
	v2: '#cc99cc' // soft pink
};

// components of vector 1
export const v1Colors = {
	x: '#ff6666', // light red
	y: '#66cc66', // light green
	z: '#6699ff' // light blue
};

// components of vector 2 (sea-like, so they read apart from vector 1's)
export const v2Colors = {
	x: '#ff9999', // soft coral
	y: '#66cc99', // seafoam green
	z: '#6699cc' // soft sky blue
};

// results: the scalar projection (dot product) and the cross product vector / its parallelogram
export const resultColors = {
	dot: '#c300ff',
	cross: '#ffb347'
};

// helper lines and labels in the scene (angle arc, ground references)
export const helperColor = '#666666';

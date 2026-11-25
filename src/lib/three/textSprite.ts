// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-24
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// A short text label in a three.js scene that always faces the viewer (a sprite with the
// text drawn on a canvas): used by TransformScene.svelte to name the parts of camera ->
// clip (eye, near, far, the clip cube). Same look as the vectors page's labels
// (ThreeScene.svelte). Dispose its material's map and the material when it is removed
// (clearGroup in sceneHelpers does).
import * as THREE from 'three';

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 128;
const FONT_SIZE = 56;

/**
 * A label sprite.
 *
 * Args:
 *   text: what it says.
 *   color: CSS colour of the text.
 *   height: its height in scene units (the width follows the canvas' 4:1 ratio).
 */
export function textSprite(text: string, color = '#ffffff', height = 0.45): THREE.Sprite {
	const canvas = document.createElement('canvas');
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	const context = canvas.getContext('2d')!;
	context.font = `${FONT_SIZE}px monospace`;
	context.fillStyle = color;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
	const sprite = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: new THREE.CanvasTexture(canvas),
			transparent: true,
			depthWrite: false, // mostly empty canvas: must not cut holes into what is behind
			depthTest: false // always readable, also inside the frustum's faces
		})
	);
	sprite.scale.set(height * (CANVAS_WIDTH / CANVAS_HEIGHT), height, 1);
	return sprite;
}

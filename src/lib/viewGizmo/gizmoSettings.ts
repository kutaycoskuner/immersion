// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The viewport gizmo's choices, shared by every scene's gizmo (ViewGizmo.svelte), so they
// stay as set when another page is opened: show the hand instead of the abstract axes, and
// which handedness the axes (and the hand) follow -- right (three.js, OpenGL) or left
// (Unity, Direct3D).
import { writable } from 'svelte/store';
import type { Handedness } from '$lib/viewGizmo/views';

export const SHOW_HAND = writable(false);
export const HANDEDNESS = writable<Handedness>('right');

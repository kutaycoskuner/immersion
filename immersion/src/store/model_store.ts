import { writable } from 'svelte/store';
import type { Object3D } from 'three';

// Create a writable store to hold the loaded GLTF model
export const modelStore = writable<Object3D | null>(null);
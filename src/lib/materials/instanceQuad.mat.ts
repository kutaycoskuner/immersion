// instanced.mat.ts
import { TextureLoader, ShaderMaterial, Color } from 'three';
import vertexShader from '$lib/shaders/instanced-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/instanced-frag.glsl?raw';
// const texture = new TextureLoader().load("/textures/grassblades02-alpha-128.png");

export const instancedMaterial = new ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	transparent: false,
	// depthWrite: false,
	uniforms: {
		uMap: { value: null },
		uTime: { value: 0 }
		// uColor: { value: new Color(0x00ff00) } // light gray default
	},
	side: 1 // Single / Double Side
});

// instanced.mat.ts
import { ShaderMaterial, Color } from 'three';
import vertexShader from '$lib/shaders/instanced-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/instanced-frag.glsl?raw';

export const instancedMaterial = new ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: `
        precision highp float;
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // red
        }
    `,
	// transparent: false,
	uniforms: {
		uColor: { value: new Color(0x00ff00) } // light gray default
	},
	side: 2 // DoubleSide
});

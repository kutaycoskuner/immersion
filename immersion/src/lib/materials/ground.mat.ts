import { ShaderMaterial, Color } from 'three';
import vertexShader from '$lib/shaders/ground-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/ground-frag.glsl?raw';

export const groundMaterial: ShaderMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: false,
    vertexColors: false,
    uniforms: {
        uColor: { value: new Color(0xbabfbb) } // default pink
    },
    side: 2 // DoubleSide
});
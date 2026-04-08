import { ShaderMaterial, DoubleSide } from 'three';
import vertexShader from '$lib/shaders/normal-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/normal-frag.glsl?raw';

export const normalMaterial = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: DoubleSide
});
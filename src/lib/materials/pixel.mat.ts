// instanced.mat.ts
import { Color, Vector3, ShaderMaterial } from 'three';
import vertexShader from '$lib/shaders/pixel-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/pixel-frag.glsl?raw';

export const PixelMaterial = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: false,
    side: 2,
    // depthWrite: false,
    uniforms: {
        uMap: { value: null }, 						// leaf texture

        uTime: { value: 0 },

        uPointLightPos: { value: new Vector3(0, 10, 0) },   
        uPointLightColor: { value: new Color(1, 1, 1) },
        uAmbient: { value: new Color(0.1, 0.1, 0.1) },
        uBaseColor: { value: new Color(0.8, 0.8, 0.8) }, 
    }
});

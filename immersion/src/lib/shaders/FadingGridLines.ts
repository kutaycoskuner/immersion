import {ShaderMaterial, Color } from 'three';
import vertexShader from '$lib/shaders/_vrtx.glsl';
import fragmentShader from '$lib/shaders/_frag.glsl';

// Define the material using Three.js ShaderMaterial
export const fadingGridLines: ShaderMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    vertexColors: false,
    uniforms: {
        uColor: { value: new Color(0x000000) } // Default color (black)
    }
});

export const fadingXAxis: ShaderMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    vertexColors: false,
    uniforms: {
        uColor: { value: new Color(0xff0000) } // Default color (black)
    }
});

export const fadingYAxis: ShaderMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    vertexColors: false,
    uniforms: {
        uColor: { value: new Color(0x00ff00) } // Default color (black)
    }
});
import { ShaderMaterial, Color, BackSide } from 'three';
import vertexShader from '$lib/shaders/pp-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/pp-frag.glsl?raw';

export const PostProcessMaterial = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTexDepth   : { value: null }, // <-- assign later
        uCameraFar  : { value: null }, 
        uCameraNear : { value: null }
    }
});
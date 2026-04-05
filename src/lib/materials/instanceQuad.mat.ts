// instanced.mat.ts
import { Color, Vector3, ShaderMaterial } from 'three';
import vertexShader from '$lib/shaders/instanced-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/instanced-frag.glsl?raw';

export const instancedMaterial = new ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	transparent: false,
	side: 1,
	// depthWrite: false,
	uniforms: {
		uMap: { value: null }, 						// leaf texture
		uGroundTex: { value: null }, 				// ground/cloud texture

		uGroundHalfSize: {value: 10},
		uTime: { value: 0 },

		uPointLightPos: { value: new Vector3(0, 10, 0) },   
		uPointLightColor: { value: new Color(1, 1, 1) },
		uAmbient: { value: new Color(0.1, 0.1, 0.1) },
		
		uGrassTint: { value: new Color(0.4, 1.0, 0.4) }
	}
});
